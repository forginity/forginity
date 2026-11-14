import { describe, it, expect, vi, beforeEach } from "vitest"
import {
  AdminUserService,
  AdminUserServiceError,
} from "./admin-user.service.js"
import { UserRepository } from "../repositories/user.repository.js"
import { EmergencyContactRepository } from "../repositories/emergency-contact.repository.js"
import { SessionRepository } from "../repositories/session.repository.js"
import type { User, UserEmergencyContact, Session } from "../db/auth.schema.js"

describe("AdminUserService Unit Tests", () => {
  let mockUserRepo: UserRepository
  let mockContactRepo: EmergencyContactRepository
  let mockSessionRepo: SessionRepository
  let adminUserService: AdminUserService

  const mockUserId = "550e8400-e29b-41d4-a716-446655440001"
  const mockUser: User = {
    id: mockUserId,
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

  const mockContact: UserEmergencyContact = {
    id: "660e8400-e29b-41d4-a716-446655440002",
    userId: mockUserId,
    contactName: "Sarah Rider",
    contactPhone: "+14155559999",
    relationship: "Sister",
    isPrimary: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockSession: Session = {
    id: "770e8400-e29b-41d4-a716-446655440003",
    userId: mockUserId,
    sessionTokenHash: "hash123",
    currentProductId: null,
    currentSection: null,
    ipAddress: "127.0.0.1",
    userAgent: "Mozilla",
    deviceType: "desktop",
    expiresAt: new Date(Date.now() + 86400000),
    lastActiveAt: new Date(),
    createdAt: new Date(),
  }

  beforeEach(() => {
    vi.restoreAllMocks()

    mockUserRepo = {
      findUserById: vi.fn(),
      findUsersWithPagination: vi.fn(),
      countUsers: vi.fn(),
      updateUserStatusById: vi.fn(),
    } as unknown as UserRepository

    mockContactRepo = {
      findContactsByUserId: vi.fn(),
    } as unknown as EmergencyContactRepository

    mockSessionRepo = {
      findSessionsByUserId: vi.fn(),
      deleteSessionsByUserId: vi.fn(),
    } as unknown as SessionRepository

    adminUserService = new AdminUserService(
      mockUserRepo,
      mockContactRepo,
      mockSessionRepo
    )
  })

  describe("listUsers", () => {
    it("should return sanitized paginated users and metadata", async () => {
      vi.spyOn(mockUserRepo, "findUsersWithPagination").mockResolvedValueOnce([
        mockUser,
      ])
      vi.spyOn(mockUserRepo, "countUsers").mockResolvedValueOnce(1)

      const result = await adminUserService.listUsers({
        limit: 10,
        offset: 0,
        search: "rider",
        status: "active",
      })

      expect(result.success).toBe(true)
      expect(result.users).toHaveLength(1)
      expect(result.users[0]?.id).toBe(mockUserId)
      expect(result.users[0]?.email).toBe("rider@forginity.com")
      expect(result.users[0]).not.toHaveProperty("passwordHash")
      expect(result.pagination).toEqual({
        total: 1,
        limit: 10,
        offset: 0,
        hasMore: false,
      })
    })

    it("should correctly compute hasMore: true when more users exist", async () => {
      vi.spyOn(mockUserRepo, "findUsersWithPagination").mockResolvedValueOnce([
        mockUser,
      ])
      vi.spyOn(mockUserRepo, "countUsers").mockResolvedValueOnce(25)

      const result = await adminUserService.listUsers({
        limit: 1,
        offset: 0,
      })

      expect(result.pagination.hasMore).toBe(true)
      expect(result.pagination.total).toBe(25)
    })
  })

  describe("getUserDetails", () => {
    it("should return user details with emergency contacts and active session count", async () => {
      vi.spyOn(mockUserRepo, "findUserById").mockResolvedValueOnce(mockUser)
      vi.spyOn(mockContactRepo, "findContactsByUserId").mockResolvedValueOnce([
        mockContact,
      ])
      vi.spyOn(mockSessionRepo, "findSessionsByUserId").mockResolvedValueOnce([
        mockSession,
      ])

      const result = await adminUserService.getUserDetails(mockUserId)

      expect(result.success).toBe(true)
      expect(result.user.id).toBe(mockUserId)
      expect(result.emergencyContacts).toHaveLength(1)
      expect(result.emergencyContacts[0]?.contactName).toBe("Sarah Rider")
      expect(result.activeSessionsCount).toBe(1)
    })

    it("should throw 404 if user is not found", async () => {
      vi.spyOn(mockUserRepo, "findUserById").mockResolvedValueOnce(null)

      await expect(
        adminUserService.getUserDetails(mockUserId)
      ).rejects.toThrowError(AdminUserServiceError)
    })
  })

  describe("updateUserStatus", () => {
    it("should update status to blocked and immediately revoke all active sessions", async () => {
      vi.spyOn(mockUserRepo, "findUserById").mockResolvedValueOnce(mockUser)
      vi.spyOn(mockUserRepo, "updateUserStatusById").mockResolvedValueOnce({
        ...mockUser,
        status: "blocked",
      })
      vi.spyOn(mockSessionRepo, "deleteSessionsByUserId").mockResolvedValueOnce(
        3
      )

      const result = await adminUserService.updateUserStatus(mockUserId, {
        status: "blocked",
        reason: "Suspected fraudulent activity",
      })

      expect(result.success).toBe(true)
      expect(result.user.status).toBe("blocked")
      expect(result.revokedSessionsCount).toBe(3)
      expect(mockSessionRepo.deleteSessionsByUserId).toHaveBeenCalledWith(
        mockUserId
      )
    })

    it("should update status to active without deleting active sessions", async () => {
      vi.spyOn(mockUserRepo, "findUserById").mockResolvedValueOnce({
        ...mockUser,
        status: "blocked",
      })
      vi.spyOn(mockUserRepo, "updateUserStatusById").mockResolvedValueOnce({
        ...mockUser,
        status: "active",
      })

      const result = await adminUserService.updateUserStatus(mockUserId, {
        status: "active",
      })

      expect(result.success).toBe(true)
      expect(result.user.status).toBe("active")
      expect(result.revokedSessionsCount).toBe(0)
      expect(mockSessionRepo.deleteSessionsByUserId).not.toHaveBeenCalled()
    })

    it("should throw 404 when updating non-existent user", async () => {
      vi.spyOn(mockUserRepo, "findUserById").mockResolvedValueOnce(null)

      await expect(
        adminUserService.updateUserStatus(mockUserId, { status: "blocked" })
      ).rejects.toThrow("User not found")
    })
  })
})
