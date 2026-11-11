import crypto from "node:crypto"
import { OtpRepository, otpRepository } from "../repositories/otp.repository.js"
import { getOtpTransport } from "../transports/resend-email.transport.js"
import type {
  SendOtpOptions,
  VerifyOtpOptions,
  SendOtpResult,
  VerifyOtpResult,
  OtpTransport,
  OtpErrorDetails,
} from "../types/otp.types.js"

const OTP_PEPPER =
  process.env.JWT_SECRET || "forginity_default_otp_pepper_development_only"

export class OtpServiceError extends Error {
  public statusCode: number
  public details?: OtpErrorDetails

  constructor(
    message: string,
    statusCode: number = 400,
    details?: OtpErrorDetails
  ) {
    super(message)
    this.name = "OtpServiceError"
    this.statusCode = statusCode
    this.details = details
  }

  toJSON() {
    return {
      error: this.message,
      ...(this.details?.code ? { code: this.details.code } : {}),
      ...(this.details?.remainingAttempts !== undefined
        ? { remainingAttempts: this.details.remainingAttempts }
        : {}),
      ...(this.details?.maxAttempts !== undefined
        ? { maxAttempts: this.details.maxAttempts }
        : {}),
    }
  }
}

/**
 * Generates a cryptographically secure 6-digit numeric OTP string (100000 to 999999).
 */
export function generateNumericOtp(): string {
  return crypto.randomInt(100000, 1000000).toString()
}

/**
 * Computes a timing-safe HMAC-SHA-256 hash for a given code, identifier, and pepper.
 */
export function hashOtpCode(code: string, identifier: string): string {
  return crypto
    .createHmac("sha256", OTP_PEPPER)
    .update(`${code}:${identifier.toLowerCase().trim()}`)
    .digest("hex")
}

/**
 * Verifies a candidate code against a stored hash using timing-safe comparison.
 */
export function verifyOtpTimingSafe(
  candidateCode: string,
  identifier: string,
  storedHash: string
): boolean {
  if (!candidateCode || !storedHash) {
    return false
  }

  const computedHash = hashOtpCode(candidateCode, identifier)
  const computedBuffer = Buffer.from(computedHash, "hex")
  const storedBuffer = Buffer.from(storedHash, "hex")

  if (computedBuffer.length !== storedBuffer.length) {
    return false
  }

  return crypto.timingSafeEqual(computedBuffer, storedBuffer)
}

export class OtpService {
  private repository: OtpRepository
  private transport: OtpTransport

  constructor(
    repository: OtpRepository = otpRepository,
    transport: OtpTransport = getOtpTransport()
  ) {
    this.repository = repository
    this.transport = transport
  }

  /**
   * Generates and dispatches an OTP, returning an opaque requestId.
   */
  async sendOtp(options: SendOtpOptions): Promise<SendOtpResult> {
    const normalizedIdentifier = options.identifier.toLowerCase().trim()
    const purpose = options.purpose || "authentication"
    const expiresInSeconds = options.expiresInSeconds || 600 // 10 minutes

    // 1. Rate limiting: Cooldown check (60 seconds)
    const latestActive = await this.repository.findLatestActiveOtpByIdentifier(
      normalizedIdentifier,
      purpose
    )

    if (latestActive && !latestActive.verifiedAt) {
      const secondsSinceLast =
        (Date.now() - new Date(latestActive.createdAt).getTime()) / 1000
      if (secondsSinceLast < 60) {
        const waitSeconds = Math.ceil(60 - secondsSinceLast)
        throw new OtpServiceError(
          `Please wait ${waitSeconds} seconds before requesting another verification code.`,
          429,
          { code: "RATE_LIMITED" }
        )
      }
    }

    // 2. Generate 6-digit numeric OTP and hash it
    const rawOtp = generateNumericOtp()
    const otpHash = hashOtpCode(rawOtp, normalizedIdentifier)
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000)

    // 3. Persist in database (generates UUID id which is requestId)
    const record = await this.repository.createOtp({
      identifier: normalizedIdentifier,
      identifierType: options.identifierType,
      otpHash,
      purpose,
      expiresAt,
      maxAttempts: 3,
    })

    // 4. Dispatch via pluggable transport
    const dispatchResult = await this.transport.send({
      identifier: normalizedIdentifier,
      identifierType: options.identifierType,
      otp: rawOtp,
      purpose,
      expiresInSeconds,
    })

    if (!dispatchResult.success) {
      throw new OtpServiceError(
        dispatchResult.error || "Failed to dispatch verification code",
        500,
        { code: "DISPATCH_FAILED" }
      )
    }

    return {
      success: true,
      requestId: record.id,
      expiresInSeconds,
      cooldownSeconds: 60,
      ...(process.env.NODE_ENV !== "production" ? { debugOtp: rawOtp } : {}),
    }
  }

  /**
   * Verifies an OTP code against its opaque requestId.
   */
  async verifyOtp(options: VerifyOtpOptions): Promise<VerifyOtpResult> {
    const { requestId, code } = options

    // 1. Fetch OTP record by requestId
    const record = await this.repository.findOtpById(requestId)

    if (!record) {
      throw new OtpServiceError(
        "Verification request not found. Invalid request ID.",
        400,
        { code: "REQUEST_NOT_FOUND" }
      )
    }

    if (record.verifiedAt) {
      throw new OtpServiceError(
        "This verification code has already been used.",
        400,
        { code: "ALREADY_VERIFIED" }
      )
    }

    if (new Date() > new Date(record.expiresAt)) {
      const remainingAttempts = Math.max(
        0,
        record.maxAttempts - record.attempts
      )
      throw new OtpServiceError(
        "Verification code has expired. Please request a new code.",
        400,
        {
          code: "OTP_EXPIRED",
          remainingAttempts,
          maxAttempts: record.maxAttempts,
        }
      )
    }

    if (record.attempts >= record.maxAttempts) {
      throw new OtpServiceError(
        "Maximum verification attempts exceeded. Please request a new code.",
        400,
        {
          code: "MAX_ATTEMPTS_EXCEEDED",
          remainingAttempts: 0,
          maxAttempts: record.maxAttempts,
        }
      )
    }

    // 2. Timing-safe comparison
    const isValid = verifyOtpTimingSafe(code, record.identifier, record.otpHash)

    if (!isValid) {
      const updated = await this.repository.incrementOtpAttempts(record.id)
      const currentAttempts = updated ? updated.attempts : record.attempts + 1
      const remainingAttempts = Math.max(
        0,
        record.maxAttempts - currentAttempts
      )

      if (remainingAttempts <= 0) {
        throw new OtpServiceError(
          "Maximum verification attempts exceeded. Please request a new code.",
          400,
          {
            code: "MAX_ATTEMPTS_EXCEEDED",
            remainingAttempts: 0,
            maxAttempts: record.maxAttempts,
          }
        )
      }

      throw new OtpServiceError("Invalid verification code.", 400, {
        code: "INVALID_CODE",
        remainingAttempts,
        maxAttempts: record.maxAttempts,
      })
    }

    // 3. Mark OTP as verified
    await this.repository.markOtpVerified(record.id)

    return {
      verified: true,
      requestId: record.id,
      identifier: record.identifier,
      identifierType: record.identifierType as "email" | "phone",
      purpose: record.purpose,
    }
  }
}

export const otpService = new OtpService()
