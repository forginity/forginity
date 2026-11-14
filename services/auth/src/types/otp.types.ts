import type {
  OtpIdentifierType,
  OtpPurpose,
  VerifyOtpRequestInput,
} from "../db/auth.validator.js"
import type { Otp } from "../db/auth.schema.js"

/**
 * 1. Service Layer Contracts & Options
 */
export interface SendOtpOptions {
  identifier: string
  identifierType: OtpIdentifierType
  purpose?: string
  expiresInSeconds?: number
  productName?: string
}

export type VerifyOtpOptions = VerifyOtpRequestInput

export interface SendOtpResult {
  success: boolean
  requestId: string
  expiresInSeconds: number
  cooldownSeconds: number
  debugOtp?: string
}

export interface VerifyOtpResult {
  verified: boolean
  requestId: string
  identifier: string
  identifierType: OtpIdentifierType
  purpose: string
}

export type OtpErrorCode =
  | "REQUEST_NOT_FOUND"
  | "OTP_EXPIRED"
  | "ALREADY_VERIFIED"
  | "MAX_ATTEMPTS_EXCEEDED"
  | "INVALID_CODE"
  | "RATE_LIMITED"
  | "DISPATCH_FAILED"
  | "PHONE_VERIFICATION_DEFERRED"

export interface OtpErrorDetails {
  code: OtpErrorCode
  remainingAttempts?: number
  maxAttempts?: number
}

/**
 * 2. Repository Layer Contracts
 */
export interface CreateOtpRecordInput {
  identifier: string
  identifierType: OtpIdentifierType
  otpHash: string
  purpose: string
  expiresAt: Date
  maxAttempts?: number
}

export type OtpRecord = Otp

/**
 * 3. Transport Layer Contracts
 */
export interface OtpDeliveryOptions {
  identifier: string
  identifierType: OtpIdentifierType
  otp: string
  purpose: string
  expiresInSeconds: number
  productName?: string
}

export interface OtpDeliveryResult {
  success: boolean
  messageId?: string
  error?: string
}

export interface SentOtpRecord {
  identifier: string
  identifierType: OtpIdentifierType
  otp: string
  purpose: string
  timestamp: Date
  productName?: string
}

export interface OtpTransport {
  readonly name: string
  send(options: OtpDeliveryOptions): Promise<OtpDeliveryResult>
}

export interface ResendEmailTransportConfig {
  host?: string
  port?: number
  secure?: boolean
  user?: string
  pass?: string
  from?: string
}

/**
 * 4. Template Layer Contracts
 */
export interface GenerateOtpEmailOptions {
  otp: string
  purpose?: string
  expiresInMinutes?: number
  productName?: string
}

export interface GeneratedEmail {
  subject: string
  html: string
  text: string
}
