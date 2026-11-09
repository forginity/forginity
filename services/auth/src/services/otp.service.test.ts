import { describe, it, expect, beforeEach } from "vitest"
import { OtpService, hashOtpCode } from "./otp.service.js"
import { OtpRepository } from "../repositories/otp.repository.js"
import { ConsoleOtpTransport } from "../transports/console-otp.transport.js"

describe("OtpService Unit Tests", () => {
  let mockOtps: Map<string, any>
  let mockRepo: OtpRepository
  let transport: ConsoleOtpTransport
  let otpService: OtpService

  beforeEach(() => {
    mockOtps = new Map()
    transport = new ConsoleOtpTransport()

    mockRepo = {
      async createOtp(input: any) {
        const record = {
          id: `550e8400-e29b-41d4-a716-${Math.random().toString(16).slice(2, 14).padEnd(12, "0")}`,
          identifier: input.identifier.toLowerCase(),
          identifierType: input.identifierType,
          otpHash: input.otpHash,
          purpose: input.purpose,
          expiresAt: input.expiresAt,
          maxAttempts: input.maxAttempts ?? 3,
          attempts: 0,
          verifiedAt: null,
          createdAt: new Date(),
        }
        mockOtps.set(record.id, record)
        return record
      },
      async findOtpById(requestId: string) {
        return mockOtps.get(requestId) || null
      },
      async findLatestActiveOtpByIdentifier(identifier: string, purpose: string) {
        const records = Array.from(mockOtps.values())
          .filter(
            (o) =>
              o.identifier === identifier.toLowerCase() &&
              o.purpose === purpose
          )
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        return records[0] || null
      },
      async incrementOtpAttempts(requestId: string) {
        const record = mockOtps.get(requestId)
        if (record) {
          record.attempts += 1
          return { ...record }
        }
        return null
      },
      async markOtpVerified(requestId: string) {
        const record = mockOtps.get(requestId)
        if (record) {
          record.verifiedAt = new Date()
          return { ...record }
        }
        return null
      },
    } as unknown as OtpRepository

    otpService = new OtpService(mockRepo, transport)
  })

  describe("sendOtp", () => {
    it("should successfully generate and dispatch an OTP returning an opaque requestId", async () => {
      const email = "user@forginity.com"
      const res = await otpService.sendOtp({
        identifier: email,
        identifierType: "email",
        purpose: "authentication",
      })

      expect(res.success).toBe(true)
      expect(res.requestId).toBeDefined()
      expect(res.expiresInSeconds).toBe(600)
      expect(res.cooldownSeconds).toBe(60)
      expect(transport.lastSentOtp).toBeDefined()
      expect(transport.lastSentOtp?.identifier).toBe(email)
      expect(transport.lastSentOtp?.otp).toMatch(/^\d{6}$/)
    })

    it("should enforce a 60-second cooldown rate limit for the same identifier and purpose", async () => {
      const email = "cooldown@forginity.com"
      await otpService.sendOtp({
        identifier: email,
        identifierType: "email",
        purpose: "authentication",
      })

      await expect(
        otpService.sendOtp({
          identifier: email,
          identifierType: "email",
          purpose: "authentication",
        })
      ).rejects.toThrow(/Please wait \d+ seconds before requesting another verification code/)
    })
  })

  describe("verifyOtp", () => {
    it("should verify code successfully against requestId", async () => {
      const email = "verify@forginity.com"
      const sendRes = await otpService.sendOtp({
        identifier: email,
        identifierType: "email",
        purpose: "authentication",
      })

      const rawCode = transport.lastSentOtp!.otp
      const verifyRes = await otpService.verifyOtp({
        requestId: sendRes.requestId,
        code: rawCode,
      })

      expect(verifyRes.verified).toBe(true)
      expect(verifyRes.requestId).toBe(sendRes.requestId)
      expect(verifyRes.identifier).toBe(email)
      expect(verifyRes.purpose).toBe("authentication")
    })

    it("should decrement attempts and throw on wrong code", async () => {
      const email = "wrongcode@forginity.com"
      const sendRes = await otpService.sendOtp({
        identifier: email,
        identifierType: "email",
      })

      try {
        await otpService.verifyOtp({
          requestId: sendRes.requestId,
          code: "000000",
        })
        expect.unreachable("should have thrown")
      } catch (err: any) {
        expect(err.message).toBe("Invalid verification code.")
        expect(err.details).toEqual({
          code: "INVALID_CODE",
          remainingAttempts: 2,
          maxAttempts: 3,
        })
        expect(err.toJSON()).toEqual({
          error: "Invalid verification code.",
          code: "INVALID_CODE",
          remainingAttempts: 2,
          maxAttempts: 3,
        })
      }

      try {
        await otpService.verifyOtp({
          requestId: sendRes.requestId,
          code: "000000",
        })
        expect.unreachable("should have thrown")
      } catch (err: any) {
        expect(err.message).toBe("Invalid verification code.")
        expect(err.details).toEqual({
          code: "INVALID_CODE",
          remainingAttempts: 1,
          maxAttempts: 3,
        })
      }

      try {
        await otpService.verifyOtp({
          requestId: sendRes.requestId,
          code: "000000",
        })
        expect.unreachable("should have thrown")
      } catch (err: any) {
        expect(err.message).toBe("Maximum verification attempts exceeded. Please request a new code.")
        expect(err.details).toEqual({
          code: "MAX_ATTEMPTS_EXCEEDED",
          remainingAttempts: 0,
          maxAttempts: 3,
        })
      }
    })

    it("should reject expired OTPs", async () => {
      const email = "expired@forginity.com"
      const expiredRecord = {
        id: "550e8400-e29b-41d4-a716-446655440001",
        identifier: email,
        identifierType: "email",
        otpHash: hashOtpCode("123456", email),
        purpose: "authentication",
        expiresAt: new Date(Date.now() - 5000), // in the past
        maxAttempts: 3,
        attempts: 0,
        verifiedAt: null,
        createdAt: new Date(Date.now() - 700000),
      }
      mockOtps.set(expiredRecord.id, expiredRecord)

      try {
        await otpService.verifyOtp({
          requestId: expiredRecord.id,
          code: "123456",
        })
        expect.unreachable("should have thrown")
      } catch (err: any) {
        expect(err.message).toBe("Verification code has expired. Please request a new code.")
        expect(err.details).toEqual({
          code: "OTP_EXPIRED",
          remainingAttempts: 3,
          maxAttempts: 3,
        })
      }
    })

    it("should reject already used verification codes", async () => {
      const email = "alreadyused@forginity.com"
      const sendRes = await otpService.sendOtp({
        identifier: email,
        identifierType: "email",
      })
      const code = transport.lastSentOtp!.otp

      // First verification succeeds
      await otpService.verifyOtp({ requestId: sendRes.requestId, code })

      // Second verification fails
      try {
        await otpService.verifyOtp({ requestId: sendRes.requestId, code })
        expect.unreachable("should have thrown")
      } catch (err: any) {
        expect(err.message).toBe("This verification code has already been used.")
        expect(err.details).toEqual({
          code: "ALREADY_VERIFIED",
        })
      }
    })

    it("should throw on unknown requestId", async () => {
      try {
        await otpService.verifyOtp({
          requestId: "550e8400-e29b-41d4-a716-000000000000",
          code: "123456",
        })
        expect.unreachable("should have thrown")
      } catch (err: any) {
        expect(err.message).toBe("Verification request not found. Invalid request ID.")
        expect(err.details).toEqual({
          code: "REQUEST_NOT_FOUND",
        })
      }
    })
  })
})
