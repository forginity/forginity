import { describe, it, expect, vi, beforeEach } from "vitest"
import { DefaultGoogleTokenVerifier, defaultGoogleTokenVerifier } from "./google.utils.js"

describe("Google Utilities (google.utils)", () => {
  let mockJwtVerify: any
  let verifier: DefaultGoogleTokenVerifier

  beforeEach(() => {
    mockJwtVerify = vi.fn()
    verifier = new DefaultGoogleTokenVerifier("https://www.googleapis.com/oauth2/v3/certs", mockJwtVerify)
  })

  it("should export defaultGoogleTokenVerifier singleton", () => {
    expect(defaultGoogleTokenVerifier).toBeInstanceOf(DefaultGoogleTokenVerifier)
  })

  it("should verify and normalize valid Google token claims", async () => {
    mockJwtVerify.mockResolvedValueOnce({
      payload: {
        sub: "google-12345",
        email: "Rider@FORGINITY.COM",
        email_verified: true,
        name: "Test Rider",
        picture: "https://lh3.googleusercontent.com/avatar",
        given_name: "Test",
        family_name: "Rider",
      },
      protectedHeader: { alg: "RS256" },
    })

    const claims = await verifier.verify("mock-google-id-token")

    expect(claims.sub).toBe("google-12345")
    expect(claims.email).toBe("rider@forginity.com")
    expect(claims.email_verified).toBe(true)
    expect(claims.name).toBe("Test Rider")
    expect(claims.picture).toBe("https://lh3.googleusercontent.com/avatar")
    expect(claims.given_name).toBe("Test")
    expect(claims.family_name).toBe("Rider")
  })

  it("should throw error if subject (sub) claim is missing", async () => {
    mockJwtVerify.mockResolvedValueOnce({
      payload: {
        email: "rider@forginity.com",
        email_verified: true,
      },
      protectedHeader: { alg: "RS256" },
    })

    await expect(verifier.verify("token-without-sub")).rejects.toThrow(
      "Google ID token missing subject (sub) claim"
    )
  })

  it("should throw error if email claim is missing", async () => {
    mockJwtVerify.mockResolvedValueOnce({
      payload: {
        sub: "google-12345",
        email_verified: true,
      },
      protectedHeader: { alg: "RS256" },
    })

    await expect(verifier.verify("token-without-email")).rejects.toThrow(
      "Google ID token missing email claim"
    )
  })

  it("should throw error if email_verified is explicitly false", async () => {
    mockJwtVerify.mockResolvedValueOnce({
      payload: {
        sub: "google-12345",
        email: "unverified@forginity.com",
        email_verified: false,
      },
      protectedHeader: { alg: "RS256" },
    })

    await expect(verifier.verify("unverified-email-token")).rejects.toThrow(
      "Google email address is not verified"
    )
  })
})
