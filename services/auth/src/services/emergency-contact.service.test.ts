import { describe, it, expect, beforeEach } from "vitest"
import {
  EmergencyContactService,
  EmergencyContactServiceError,
} from "./emergency-contact.service.js"
import type { EmergencyContactRepository } from "../repositories/emergency-contact.repository.js"
import type { UserRepository } from "../repositories/user.repository.js"
import type { UserEmergencyContact, User } from "../db/auth.schema.js"

describe("EmergencyContactService Unit Tests", () => {
  let mockUsers: Map<string, User>
  let mockContacts: Map<string, UserEmergencyContact>
  let mockUserRepo: UserRepository
  let mockEmergencyRepo: EmergencyContactRepository
  let emergencyService: EmergencyContactService

  const testUserId = "550e8400-e29b-41d4-a716-446655440001"
  const otherUserId = "550e8400-e29b-41d4-a716-446655440099"

  beforeEach(() => {
    mockUsers = new Map()
    mockContacts = new Map()

    const activeUser: User = {
      id: testUserId,
      email: "rider@forginity.com",
      phone: "+14155552671",
      name: "Alex Rider",
      passwordHash: null,
      firstName: "Alex",
      lastName: "Rider",
      gender: "male",
      country: "US",
      avatarUrl: null,
      googleId: null,
      authProvider: "email_otp",
      isVerified: true,
      isEmailVerified: true,
      isPhoneVerified: false,
      isOnboarded: true,
      userType: "user",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    mockUsers.set(testUserId, activeUser)

    mockUserRepo = {
      async findUserById(id: string) {
        return mockUsers.get(id) || null
      },
    } as unknown as UserRepository

    mockEmergencyRepo = {
      async createContact(userId: string, input: any) {
        const id = `550e8400-e29b-41d4-a716-${Math.random().toString(16).slice(2, 14).padEnd(12, "0")}`
        const contact: UserEmergencyContact = {
          id,
          userId,
          contactName: input.contactName,
          contactPhone: input.contactPhone,
          relationship: input.relationship || null,
          isPrimary: input.isPrimary ?? true,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        mockContacts.set(id, contact)
        return contact
      },
      async findContactsByUserId(userId: string) {
        return Array.from(mockContacts.values()).filter(
          (c) => c.userId === userId
        )
      },
      async findContactById(userId: string, contactId: string) {
        const contact = mockContacts.get(contactId)
        if (contact && contact.userId === userId) {
          return contact
        }
        return null
      },
      async updateContact(userId: string, contactId: string, input: any) {
        const contact = mockContacts.get(contactId)
        if (!contact || contact.userId !== userId) {
          return null
        }
        const updated = { ...contact, ...input, updatedAt: new Date() }
        mockContacts.set(contactId, updated)
        return updated
      },
      async deleteContact(userId: string, contactId: string) {
        const contact = mockContacts.get(contactId)
        if (!contact || contact.userId !== userId) {
          return false
        }
        return mockContacts.delete(contactId)
      },
    } as unknown as EmergencyContactRepository

    emergencyService = new EmergencyContactService(
      mockEmergencyRepo,
      mockUserRepo
    )
  })

  it("should create a new emergency contact", async () => {
    const contact = await emergencyService.createContact(testUserId, {
      contactName: "Sarah Connor",
      contactPhone: "+14155552671",
      relationship: "Spouse",
      isPrimary: true,
    })

    expect(contact.id).toBeDefined()
    expect(contact.userId).toBe(testUserId)
    expect(contact.contactName).toBe("Sarah Connor")
    expect(contact.contactPhone).toBe("+14155552671")
    expect(contact.isPrimary).toBe(true)
  })

  it("should list all contacts for authenticated user", async () => {
    await emergencyService.createContact(testUserId, {
      contactName: "Contact 1",
      contactPhone: "+14155552671",
    })
    await emergencyService.createContact(testUserId, {
      contactName: "Contact 2",
      contactPhone: "+14155552672",
    })

    const list = await emergencyService.listContacts(testUserId)
    expect(list.length).toBe(2)
  })

  it("should retrieve single contact by ID", async () => {
    const created = await emergencyService.createContact(testUserId, {
      contactName: "Single Contact",
      contactPhone: "+14155552673",
    })

    const fetched = await emergencyService.getContactById(testUserId, created.id)
    expect(fetched.id).toBe(created.id)
    expect(fetched.contactName).toBe("Single Contact")
  })

  it("should prevent IDOR and throw 404 when querying contact of another user", async () => {
    const created = await emergencyService.createContact(testUserId, {
      contactName: "Private Contact",
      contactPhone: "+14155552674",
    })

    // Create another active user
    mockUsers.set(otherUserId, { ...mockUsers.get(testUserId)!, id: otherUserId })

    await expect(
      emergencyService.getContactById(otherUserId, created.id)
    ).rejects.toThrowError(EmergencyContactServiceError)

    try {
      await emergencyService.getContactById(otherUserId, created.id)
    } catch (err: any) {
      expect(err.statusCode).toBe(404)
      expect(err.details?.code).toBe("CONTACT_NOT_FOUND")
    }
  })

  it("should update an existing contact", async () => {
    const created = await emergencyService.createContact(testUserId, {
      contactName: "Old Contact",
      contactPhone: "+14155552675",
    })

    const updated = await emergencyService.updateContact(testUserId, created.id, {
      contactName: "Updated Contact",
      relationship: "Sister",
    })

    expect(updated.contactName).toBe("Updated Contact")
    expect(updated.relationship).toBe("Sister")
  })

  it("should delete an existing contact", async () => {
    const created = await emergencyService.createContact(testUserId, {
      contactName: "To Delete",
      contactPhone: "+14155552676",
    })

    const result = await emergencyService.deleteContact(testUserId, created.id)
    expect(result.success).toBe(true)

    await expect(
      emergencyService.getContactById(testUserId, created.id)
    ).rejects.toThrowError(EmergencyContactServiceError)
  })

  it("should throw 400 LIMIT_EXCEEDED when user attempts to exceed 10 emergency contacts", async () => {
    // Populate 10 existing contacts
    for (let i = 1; i <= 10; i++) {
      await emergencyService.createContact(testUserId, {
        contactName: `Contact ${i}`,
        contactPhone: `+1415555260${i}`,
      })
    }

    await expect(
      emergencyService.createContact(testUserId, {
        contactName: "11th Contact",
        contactPhone: "+14155552611",
      })
    ).rejects.toThrowError(EmergencyContactServiceError)

    try {
      await emergencyService.createContact(testUserId, {
        contactName: "11th Contact",
        contactPhone: "+14155552611",
      })
    } catch (err: any) {
      expect(err.statusCode).toBe(400)
      expect(err.details?.code).toBe("LIMIT_EXCEEDED")
      expect(err.message).toContain("Maximum emergency contacts limit reached")
    }
  })

  it("should throw 403 when user is blocked", async () => {
    mockUsers.set(testUserId, {
      ...mockUsers.get(testUserId)!,
      status: "blocked",
    })

    try {
      await emergencyService.listContacts(testUserId)
    } catch (err: any) {
      expect(err.statusCode).toBe(403)
      expect(err.details?.code).toBe("ACCOUNT_BLOCKED")
    }
  })
})
