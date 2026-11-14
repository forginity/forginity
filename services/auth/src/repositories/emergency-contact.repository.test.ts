import { describe, it, expect, beforeAll, afterAll } from "vitest"
import { emergencyContactRepository } from "./emergency-contact.repository.js"
import { userRepository } from "./user.repository.js"

describe("EmergencyContactRepository Database Operations", () => {
  let isDbAvailable = false
  const testEmail = `test-emergency-repo-${Date.now()}@forginity.com`
  let testUserId: string | null = null
  let testContactId: string | null = null

  beforeAll(async () => {
    try {
      await emergencyContactRepository.checkConnection()
      isDbAvailable = true

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
      await userRepository.deleteUserById(testUserId).catch(() => {})
    }
  })

  it("should create, read, update, and delete emergency contacts", async () => {
    if (!isDbAvailable || !testUserId) {
      console.warn("Skipping real DB tests because database is not connected in this context")
      return
    }

    // 1. Create first contact (primary)
    const contact1 = await emergencyContactRepository.createContact(testUserId, {
      contactName: "Sarah Connor",
      contactPhone: "+14155552671",
      relationship: "Spouse",
      isPrimary: true,
    })
    expect(contact1.id).toBeDefined()
    expect(contact1.userId).toBe(testUserId)
    expect(contact1.contactName).toBe("Sarah Connor")
    expect(contact1.contactPhone).toBe("+14155552671")
    expect(contact1.isPrimary).toBe(true)
    testContactId = contact1.id

    // 2. Create second contact with isPrimary = true (should demote contact1)
    const contact2 = await emergencyContactRepository.createContact(testUserId, {
      contactName: "John Connor",
      contactPhone: "+14155552672",
      relationship: "Child",
      isPrimary: true,
    })
    expect(contact2.isPrimary).toBe(true)

    // Verify contact1 was demoted to isPrimary = false
    const reloadedContact1 = await emergencyContactRepository.findContactById(
      testUserId,
      contact1.id
    )
    expect(reloadedContact1?.isPrimary).toBe(false)

    // 3. List contacts for user
    const list = await emergencyContactRepository.findContactsByUserId(testUserId)
    expect(list.length).toBe(2)
    expect(list[0].id).toBe(contact2.id) // Primary contact first

    // 4. Update contact details
    const updated = await emergencyContactRepository.updateContact(
      testUserId,
      contact1.id,
      {
        relationship: "Partner",
        isPrimary: true,
      }
    )
    expect(updated?.relationship).toBe("Partner")
    expect(updated?.isPrimary).toBe(true)

    // Contact2 should now be demoted
    const reloadedContact2 = await emergencyContactRepository.findContactById(
      testUserId,
      contact2.id
    )
    expect(reloadedContact2?.isPrimary).toBe(false)

    // 5. Test IDOR prevention (cannot find contact with wrong userId)
    const otherUserId = "550e8400-e29b-41d4-a716-446655440000"
    const idorCheck = await emergencyContactRepository.findContactById(
      otherUserId,
      contact1.id
    )
    expect(idorCheck).toBeNull()

    // 6. Delete contact
    const deleted = await emergencyContactRepository.deleteContact(
      testUserId,
      contact1.id
    )
    expect(deleted).toBe(true)

    const postDelete = await emergencyContactRepository.findContactById(
      testUserId,
      contact1.id
    )
    expect(postDelete).toBeNull()
  })
})
