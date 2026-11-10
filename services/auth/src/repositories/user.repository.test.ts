import { describe, it, expect, beforeAll, afterAll } from "vitest"
import { userRepository } from "./user.repository.js"

describe("UserRepository Database Operations", () => {
  let isDbAvailable = false
  const testEmail = `test-user-repo-${Date.now()}@forginity.com`
  let createdUserId: string | null = null

  beforeAll(async () => {
    try {
      await userRepository.checkConnection()
      isDbAvailable = true
    } catch {
      isDbAvailable = false
    }
  })

  afterAll(async () => {
    if (isDbAvailable && createdUserId) {
      await userRepository.deleteUserById(createdUserId).catch(() => {})
    }
  })

  it("should create, read, update, and delete a user in database", async () => {
    if (!isDbAvailable) {
      console.warn("Skipping real DB tests because database is not connected in this context")
      return
    }

    // 1. Create User
    const created = await userRepository.createUser({
      email: testEmail,
      authProvider: "email_otp",
      isVerified: true,
      isEmailVerified: true,
      isPhoneVerified: false,
      isOnboarded: false,
      status: "active",
    })

    expect(created).toBeDefined()
    expect(created.id).toBeDefined()
    expect(created.email).toBe(testEmail)
    expect(created.isVerified).toBe(true)
    expect(created.isEmailVerified).toBe(true)
    expect(created.isPhoneVerified).toBe(false)
    expect(created.isOnboarded).toBe(false)
    createdUserId = created.id

    // 2. Find by Email
    const foundByEmail = await userRepository.findUserByEmail(testEmail)
    expect(foundByEmail).toBeDefined()
    expect(foundByEmail?.id).toBe(created.id)

    // 3. Find by ID
    const foundById = await userRepository.findUserById(created.id)
    expect(foundById).toBeDefined()
    expect(foundById?.email).toBe(testEmail)

    // 4. Update User
    const updated = await userRepository.updateUser(created.id, {
      firstName: "Alex",
      lastName: "Rider",
      isOnboarded: true,
    })
    expect(updated).toBeDefined()
    expect(updated?.firstName).toBe("Alex")
    expect(updated?.lastName).toBe("Rider")
    expect(updated?.isOnboarded).toBe(true)

    // 5. Clean up
    const deleted = await userRepository.deleteUserById(created.id)
    expect(deleted).toBe(true)
    createdUserId = null

    // 6. Confirm deleted
    const missing = await userRepository.findUserById(created.id)
    expect(missing).toBeNull()
  })
})
