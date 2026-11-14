import { describe, it, expect, vi, beforeEach } from "vitest"
import request from "supertest"
import app from "../app.js"
import { userRepository } from "../repositories/user.repository.js"
import { userService, UserServiceError } from "../services/user.service.js"
import { emergencyContactService, EmergencyContactServiceError } from "../services/emergency-contact.service.js"
import { signAccessToken } from "../utils/token.utils.js"
import type { User, UserEmergencyContact } from "../db/auth.schema.js"

describe("User Profile & Emergency Contact Routes", () => {
  const mockUserId = "550e8400-e29b-41d4-a716-446655440001"
  const mockEmail = "rider@forginity.com"
  const mockContactId = "550e8400-e29b-41d4-a716-446655440099"
  let validAccessToken: string

  const mockUser: User = {
    id: mockUserId,
    email: mockEmail,
    phone: "+14155552671",
    name: "Alex Rider",
    passwordHash: null,
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
    userType: "user",
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockContact: UserEmergencyContact = {
    id: mockContactId,
    userId: mockUserId,
    contactName: "Sarah Connor",
    contactPhone: "+14155552671",
    relationship: "Spouse",
    isPrimary: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(async () => {
    vi.restoreAllMocks()
    validAccessToken = await signAccessToken({
      userId: mockUserId,
      email: mockEmail,
    })
    vi.spyOn(userRepository, "findUserById").mockResolvedValue(mockUser)
  })

  describe("GET /api/users/me", () => {
    it("should return 401 Unauthorized when Authorization header is missing", async () => {
      const res = await request(app).get("/api/users/me")
      expect(res.status).toBe(401)
      expect(res.body.code).toBe("UNAUTHORIZED")
    })

    it("should return 401 Unauthorized when token is invalid", async () => {
      const res = await request(app)
        .get("/api/users/me")
        .set("Authorization", "Bearer invalid-token")
      expect(res.status).toBe(401)
      expect(res.body.code).toBe("INVALID_TOKEN")
    })

    it("should return 200 OK with sanitized user profile", async () => {
      vi.spyOn(userService, "getUserProfile").mockResolvedValueOnce(mockUser)

      const res = await request(app)
        .get("/api/users/me")
        .set("Authorization", `Bearer ${validAccessToken}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.user.email).toBe(mockEmail)
      expect(res.body.user.name).toBe("Alex Rider")
    })

    it("should also resolve via the /api/auth/users/me alias", async () => {
      vi.spyOn(userService, "getUserProfile").mockResolvedValueOnce(mockUser)

      const res = await request(app)
        .get("/api/auth/users/me")
        .set("Authorization", `Bearer ${validAccessToken}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.user.email).toBe(mockEmail)
    })
  })

  describe("PUT /api/users/me", () => {
    it("should return 400 Bad Request on invalid country code or avatarUrl format", async () => {
      const res = await request(app)
        .put("/api/users/me")
        .set("Authorization", `Bearer ${validAccessToken}`)
        .send({
          country: "invalid-3-chars",
          avatarUrl: "not-a-valid-url",
        })

      expect(res.status).toBe(400)
      expect(res.body.error).toBe("Validation Error")
    })

    it("should return 200 OK with updated profile", async () => {
      const updatedUser = {
        ...mockUser,
        firstName: "Alexander",
        name: "Alexander Rider",
        avatarUrl: "https://assets.forginity.com/alex.jpg",
      }
      vi.spyOn(userService, "updateUserProfile").mockResolvedValueOnce(updatedUser)

      const res = await request(app)
        .put("/api/users/me")
        .set("Authorization", `Bearer ${validAccessToken}`)
        .send({
          firstName: "Alexander",
          avatarUrl: "https://assets.forginity.com/alex.jpg",
        })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.user.firstName).toBe("Alexander")
      expect(res.body.user.avatarUrl).toBe("https://assets.forginity.com/alex.jpg")
    })
  })

  describe("Emergency Contacts Sub-Resources (/api/users/me/emergency-contacts)", () => {
    it("GET / should return 200 OK with list of contacts", async () => {
      vi.spyOn(emergencyContactService, "listContacts").mockResolvedValueOnce([mockContact])

      const res = await request(app)
        .get("/api/users/me/emergency-contacts")
        .set("Authorization", `Bearer ${validAccessToken}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.contacts.length).toBe(1)
      expect(res.body.contacts[0].contactName).toBe("Sarah Connor")
    })

    it("POST / should return 400 Bad Request on non-E.164 phone number", async () => {
      const res = await request(app)
        .post("/api/users/me/emergency-contacts")
        .set("Authorization", `Bearer ${validAccessToken}`)
        .send({
          contactName: "John Connor",
          contactPhone: "555-1234", // Not E.164
        })

      expect(res.status).toBe(400)
      expect(res.body.error).toBe("Validation Error")
    })

    it("POST / should return 201 Created on valid contact creation", async () => {
      vi.spyOn(emergencyContactService, "createContact").mockResolvedValueOnce(mockContact)

      const res = await request(app)
        .post("/api/users/me/emergency-contacts")
        .set("Authorization", `Bearer ${validAccessToken}`)
        .send({
          contactName: "Sarah Connor",
          contactPhone: "+14155552671",
          relationship: "Spouse",
          isPrimary: true,
        })

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.contact.contactName).toBe("Sarah Connor")
    })

    it("GET /:contactId should return 400 Bad Request for non-UUID parameter", async () => {
      const res = await request(app)
        .get("/api/users/me/emergency-contacts/invalid-id")
        .set("Authorization", `Bearer ${validAccessToken}`)

      expect(res.status).toBe(400)
      expect(res.body.error).toBe("Validation Error")
    })

    it("GET /:contactId should return 404 when contact is not found", async () => {
      vi.spyOn(emergencyContactService, "getContactById").mockRejectedValueOnce(
        new EmergencyContactServiceError("Emergency contact not found.", 404, {
          code: "CONTACT_NOT_FOUND",
        })
      )

      const res = await request(app)
        .get(`/api/users/me/emergency-contacts/${mockContactId}`)
        .set("Authorization", `Bearer ${validAccessToken}`)

      expect(res.status).toBe(404)
      expect(res.body.code).toBe("CONTACT_NOT_FOUND")
    })

    it("GET /:contactId should return 200 OK with single contact", async () => {
      vi.spyOn(emergencyContactService, "getContactById").mockResolvedValueOnce(mockContact)

      const res = await request(app)
        .get(`/api/users/me/emergency-contacts/${mockContactId}`)
        .set("Authorization", `Bearer ${validAccessToken}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.contact.id).toBe(mockContactId)
    })

    it("PUT /:contactId should return 200 OK with updated contact", async () => {
      const updatedContact = { ...mockContact, relationship: "Partner" }
      vi.spyOn(emergencyContactService, "updateContact").mockResolvedValueOnce(updatedContact)

      const res = await request(app)
        .put(`/api/users/me/emergency-contacts/${mockContactId}`)
        .set("Authorization", `Bearer ${validAccessToken}`)
        .send({
          relationship: "Partner",
        })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.contact.relationship).toBe("Partner")
    })

    it("DELETE /:contactId should return 200 OK with success message", async () => {
      vi.spyOn(emergencyContactService, "deleteContact").mockResolvedValueOnce({
        success: true,
        message: "Emergency contact deleted successfully",
      })

      const res = await request(app)
        .delete(`/api/users/me/emergency-contacts/${mockContactId}`)
        .set("Authorization", `Bearer ${validAccessToken}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.message).toBe("Emergency contact deleted successfully")
    })
  })

  describe("DELETE /api/users/me", () => {
    it("should return 200 OK when user successfully soft-deletes own account", async () => {
      vi.spyOn(userService, "deleteOwnAccount").mockResolvedValueOnce({
        success: true,
        message:
          "Account has been deleted successfully and all active sessions revoked.",
      })

      const res = await request(app)
        .delete("/api/users/me")
        .set("Authorization", `Bearer ${validAccessToken}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.message).toContain("Account has been deleted successfully")
    })

    it("should return 400 Bad Request when account is already deleted", async () => {
      vi.spyOn(userService, "deleteOwnAccount").mockRejectedValueOnce(
        new UserServiceError("Account has already been deleted.", 400, {
          code: "ACCOUNT_DELETED",
        })
      )

      const res = await request(app)
        .delete("/api/users/me")
        .set("Authorization", `Bearer ${validAccessToken}`)

      expect(res.status).toBe(400)
      expect(res.body.code).toBe("ACCOUNT_DELETED")
    })
  })

  describe("POST /api/users/:userId/restore", () => {
    it("should return 403 Forbidden when called by a non-admin user", async () => {
      const res = await request(app)
        .post(`/api/users/${mockUserId}/restore`)
        .set("Authorization", `Bearer ${validAccessToken}`)

      expect(res.status).toBe(403)
      expect(res.body.code).toBe("FORBIDDEN")
    })

    it("should return 400 Bad Request when userId is not a valid UUID", async () => {
      const adminToken = await signAccessToken({
        userId: "550e8400-e29b-41d4-a716-446655440099",
        email: "admin@forginity.com",
        userType: "admin",
      })
      vi.spyOn(userRepository, "findUserById").mockResolvedValueOnce({
        ...mockUser,
        id: "550e8400-e29b-41d4-a716-446655440099",
        userType: "admin",
      })

      const res = await request(app)
        .post("/api/users/not-a-uuid/restore")
        .set("Authorization", `Bearer ${adminToken}`)

      expect(res.status).toBe(400)
      expect(res.body.error).toBe("Validation Error")
    })

    it("should return 200 OK when user is restored by an admin", async () => {
      const adminToken = await signAccessToken({
        userId: "550e8400-e29b-41d4-a716-446655440099",
        email: "admin@forginity.com",
        userType: "admin",
      })
      vi.spyOn(userRepository, "findUserById").mockResolvedValueOnce({
        ...mockUser,
        id: "550e8400-e29b-41d4-a716-446655440099",
        userType: "admin",
      })

      vi.spyOn(userService, "restoreAccount").mockResolvedValueOnce({
        success: true,
        message: "Account has been restored successfully.",
        user: { ...mockUser, status: "active" },
      })

      const res = await request(app)
        .post(`/api/users/${mockUserId}/restore`)
        .set("Authorization", `Bearer ${adminToken}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.message).toBe("Account has been restored successfully.")
      expect(res.body.user.status).toBe("active")
    })

    it("should return 404 Not Found when user does not exist", async () => {
      const adminToken = await signAccessToken({
        userId: "550e8400-e29b-41d4-a716-446655440099",
        email: "admin@forginity.com",
        userType: "admin",
      })
      vi.spyOn(userRepository, "findUserById").mockResolvedValueOnce({
        ...mockUser,
        id: "550e8400-e29b-41d4-a716-446655440099",
        userType: "admin",
      })

      vi.spyOn(userService, "restoreAccount").mockRejectedValueOnce(
        new UserServiceError("User account not found.", 404, {
          code: "USER_NOT_FOUND",
        })
      )

      const res = await request(app)
        .post(`/api/users/${mockUserId}/restore`)
        .set("Authorization", `Bearer ${adminToken}`)

      expect(res.status).toBe(404)
      expect(res.body.code).toBe("USER_NOT_FOUND")
    })
  })
})
