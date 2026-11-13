import { describe, it, expect, beforeEach } from "vitest"
import {
  UserProfileService,
  UserProfileServiceError,
} from "./user-profile.service.js"
import type { UserRepository } from "../repositories/user.repository.js"
import type { User } from "../db/auth.schema.js"

describe("UserProfileService Unit Tests", () => {
  let mockUsers: Map<string, User>
  let mockUserRepo: UserRepository
  let userProfileService: UserProfileService

  beforeEach(() => {
    mockUsers = new Map()

    mockUserRepo = {
      async findUserById(id: string) {
        return mockUsers.get(id) || null
      },
      async findUserByEmail() {
        return null
      },
      async findUserByGoogleId() {
        return null
      },
      async createUser() {
        throw new Error("Not implemented in test")
      },
      async updateUser(id: string, input: any) {
        const existing = mockUsers.get(id)
        if (!existing) return null
        const updated = { ...existing, ...input, updatedAt: new Date() }
        mockUsers.set(id, updated)
        return updated
      },
      async checkConnection() {
        return true
      },
    } as unknown as UserRepository

    userProfileService = new UserProfileService(mockUserRepo)
  })

  it("should return sanitized profile for an active user", async () => {
    const user: User = {
      id: "550e8400-e29b-41d4-a716-446655440001",
      email: "rider@forginity.com",
      phone: "+14155552671",
      name: "Alex Rider",
      passwordHash: "secret_hash_not_exposed",
      firstName: "Alex",
      lastName: "Rider",
      gender: "male",
      country: "US",
      avatarUrl: "https://lh3.googleusercontent.com/avatar",
      googleId: null,
      authProvider: "email_otp",
      isVerified: true,
      isEmailVerified: true,
      isPhoneVerified: false,
      isOnboarded: true,
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    mockUsers.set(user.id, user)

    const profile = await userProfileService.getUserProfile(user.id)

    expect(profile.id).toBe(user.id)
    expect(profile.email).toBe("rider@forginity.com")
    expect(profile.name).toBe("Alex Rider")
    expect("passwordHash" in profile).toBe(false)
  })

  it("should throw 404 USER_NOT_FOUND when user does not exist", async () => {
    await expect(
      userProfileService.getUserProfile("non-existent-user-id")
    ).rejects.toThrowError(UserProfileServiceError)

    try {
      await userProfileService.getUserProfile("non-existent-user-id")
    } catch (err: any) {
      expect(err.statusCode).toBe(404)
      expect(err.details?.code).toBe("USER_NOT_FOUND")
    }
  })

  it("should throw 403 ACCOUNT_BLOCKED when user is blocked", async () => {
    const user: User = {
      id: "550e8400-e29b-41d4-a716-446655440002",
      email: "blocked@forginity.com",
      phone: null,
      name: "Blocked Rider",
      passwordHash: null,
      firstName: "Blocked",
      lastName: "Rider",
      gender: null,
      country: null,
      avatarUrl: null,
      googleId: null,
      authProvider: "email_otp",
      isVerified: true,
      isEmailVerified: true,
      isPhoneVerified: false,
      isOnboarded: true,
      status: "blocked",
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    mockUsers.set(user.id, user)

    try {
      await userProfileService.getUserProfile(user.id)
    } catch (err: any) {
      expect(err.statusCode).toBe(403)
      expect(err.details?.code).toBe("ACCOUNT_BLOCKED")
    }
  })

  it("should update profile details and recompute composite name", async () => {
    const user: User = {
      id: "550e8400-e29b-41d4-a716-446655440003",
      email: "update@forginity.com",
      phone: null,
      name: "Old Name",
      passwordHash: null,
      firstName: "Old",
      lastName: "Name",
      gender: "male",
      country: "US",
      avatarUrl: null,
      googleId: null,
      authProvider: "email_otp",
      isVerified: true,
      isEmailVerified: true,
      isPhoneVerified: false,
      isOnboarded: true,
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    mockUsers.set(user.id, user)

    const updated = await userProfileService.updateUserProfile(user.id, {
      firstName: "New",
      lastName: "Rider",
      avatarUrl: "https://assets.forginity.com/avatars/new.png",
      country: "IN",
      gender: "prefer_not_to_say",
    })

    expect(updated.firstName).toBe("New")
    expect(updated.lastName).toBe("Rider")
    expect(updated.name).toBe("New Rider")
    expect(updated.country).toBe("IN")
    expect(updated.gender).toBe("prefer_not_to_say")
    expect(updated.avatarUrl).toBe("https://assets.forginity.com/avatars/new.png")
  })
})
