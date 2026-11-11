import { describe, it, expect, beforeAll, afterAll } from "vitest"
import { sessionRepository } from "./session.repository.js"
import { userRepository } from "./user.repository.js"

describe("SessionRepository Database Operations", () => {
  let isDbAvailable = false
  const testEmail = `test-session-repo-${Date.now()}@forginity.com`
  let testUserId: string | null = null
  let createdSessionId: string | null = null
  const testTokenHash = `hash-${Date.now()}`

  beforeAll(async () => {
    try {
      await sessionRepository.checkConnection()
      isDbAvailable = true

      // Create a test user for foreign key constraint
      const user = await userRepository.createUser({
        email: testEmail,
        isVerified: true,
        isEmailVerified: true,
        isOnboarded: true,
      })
      testUserId = user.id
    } catch {
      isDbAvailable = false
    }
  })

  afterAll(async () => {
    if (isDbAvailable && testUserId) {
      await sessionRepository.deleteSessionsByUserId(testUserId).catch(() => {})
      await userRepository.deleteUserById(testUserId).catch(() => {})
    }
  })

  it("should create, read, update, and delete session records in database", async () => {
    if (!isDbAvailable || !testUserId) {
      console.warn("Skipping real DB tests because database is not connected in this context")
      return
    }

    // 1. Create Session
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    const session = await sessionRepository.createSession({
      userId: testUserId,
      sessionTokenHash: testTokenHash,
      expiresAt,
      currentSection: "dashboard",
      ipAddress: "127.0.0.1",
      userAgent: "Vitest/1.0",
      deviceType: "desktop",
    })

    expect(session).toBeDefined()
    expect(session.id).toBeDefined()
    expect(session.userId).toBe(testUserId)
    expect(session.sessionTokenHash).toBe(testTokenHash)
    expect(session.currentSection).toBe("dashboard")
    createdSessionId = session.id

    // 2. Find by ID
    const foundById = await sessionRepository.findSessionById(session.id)
    expect(foundById).toBeDefined()
    expect(foundById?.id).toBe(session.id)

    // 3. Find by Token Hash
    const foundByHash = await sessionRepository.findSessionByTokenHash(testTokenHash)
    expect(foundByHash).toBeDefined()
    expect(foundByHash?.id).toBe(session.id)

    // 4. Find sessions by User ID
    const userSessions = await sessionRepository.findSessionsByUserId(testUserId)
    expect(userSessions.length).toBeGreaterThanOrEqual(1)
    expect(userSessions[0].userId).toBe(testUserId)

    // 5. Update Session
    const updated = await sessionRepository.updateSession(session.id, {
      currentSection: "settings",
    })
    expect(updated).toBeDefined()
    expect(updated?.currentSection).toBe("settings")

    // 6. Delete single session
    const deleted = await sessionRepository.deleteSession(session.id)
    expect(deleted).toBe(true)

    const missing = await sessionRepository.findSessionById(session.id)
    expect(missing).toBeNull()
    createdSessionId = null
  })
})
