import { describe, it, expect, beforeAll, afterAll } from "vitest"
import { otpRepository } from "./otp.repository.js"
import { checkDatabaseConnection } from "../db/connection.js"
import { hashOtpCode } from "../services/otp.service.js"

describe("OtpRepository Real Database Operations", () => {
  let isDbAvailable = false
  const testEmail = `test-otp-repo-${Date.now()}@forginity.com`
  let createdOtpId: string | null = null

  beforeAll(async () => {
    try {
      await otpRepository.checkConnection()
      isDbAvailable = true
    } catch {
      isDbAvailable = false
    }
  })

  afterAll(async () => {
    if (isDbAvailable && createdOtpId) {
      await otpRepository.deleteOtpById(createdOtpId).catch(() => {})
    }
  })

  it("should validate database connectivity helper", async () => {
    const invalidDb = {
      execute: async () => {
        throw new Error("Connection refused at port 5432")
      },
    }

    await expect(checkDatabaseConnection(invalidDb)).rejects.toThrow(
      "Database connection failed: Connection refused at port 5432"
    )
  })

  it("should execute OTP lifecycle in the database", async () => {
    if (!isDbAvailable) {
      console.warn("Skipping real DB tests because DATABASE_URL is not connected in this test context")
      return
    }

    // 1. Create OTP Record
    const rawOtp = "654321"
    const otpHash = hashOtpCode(rawOtp, testEmail)
    const expiresAt = new Date(Date.now() + 600000)

    const createdOtp = await otpRepository.createOtp({
      identifier: testEmail,
      identifierType: "email",
      otpHash,
      purpose: "authentication",
      expiresAt,
      maxAttempts: 3,
    })

    expect(createdOtp).toBeDefined()
    expect(createdOtp.id).toBeDefined()
    createdOtpId = createdOtp.id
    expect(createdOtp.identifier).toBe(testEmail)
    expect(createdOtp.attempts).toBe(0)

    // 2. Fetch OTP by requestId (UUID)
    const foundOtp = await otpRepository.findOtpById(createdOtp.id)
    expect(foundOtp).toBeDefined()
    expect(foundOtp?.id).toBe(createdOtp.id)
    expect(foundOtp?.identifier).toBe(testEmail)

    // 3. Find Latest Active by Identifier
    const latest = await otpRepository.findLatestActiveOtpByIdentifier(testEmail, "authentication")
    expect(latest).toBeDefined()
    expect(latest?.id).toBe(createdOtp.id)

    // 4. Increment Attempts
    const incremented = await otpRepository.incrementOtpAttempts(createdOtp.id)
    expect(incremented?.attempts).toBe(1)

    // 5. Mark Verified
    const verified = await otpRepository.markOtpVerified(createdOtp.id)
    expect(verified?.verifiedAt).not.toBeNull()
  })
})
