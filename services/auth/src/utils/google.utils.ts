import { createRemoteJWKSet, jwtVerify } from "jose"
import type { GoogleTokenClaims } from "../types/auth.types.js"

export interface GoogleTokenVerifier {
  verify(idToken: string): Promise<GoogleTokenClaims>
}

export type JwtVerifyFn = typeof jwtVerify

const GOOGLE_JWKS_URL = "https://www.googleapis.com/oauth2/v3/certs"
const GOOGLE_ISSUERS = ["https://accounts.google.com", "accounts.google.com"]

export class DefaultGoogleTokenVerifier implements GoogleTokenVerifier {
  private jwks: ReturnType<typeof createRemoteJWKSet>
  private jwtVerifyFn: JwtVerifyFn

  constructor(
    jwksUri: string = GOOGLE_JWKS_URL,
    jwtVerifyFn: JwtVerifyFn = jwtVerify
  ) {
    this.jwks = createRemoteJWKSet(new URL(jwksUri))
    this.jwtVerifyFn = jwtVerifyFn
  }

  async verify(idToken: string): Promise<GoogleTokenClaims> {
    const rawClientId =
      process.env.GOOGLE_OAUTH_CLIENT_ID || process.env.GOOGLE_CLIENT_ID
    const allowedAudiences = rawClientId
      ? rawClientId
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      : []

    const verifyOptions: {
      issuer: string[]
      audience?: string | string[]
    } = {
      issuer: GOOGLE_ISSUERS,
    }

    if (allowedAudiences.length === 1) {
      verifyOptions.audience = allowedAudiences[0]
    } else if (allowedAudiences.length > 1) {
      verifyOptions.audience = allowedAudiences
    }

    const { payload } = await this.jwtVerifyFn(idToken, this.jwks, verifyOptions)

    if (!payload.sub || typeof payload.sub !== "string") {
      throw new Error("Google ID token missing subject (sub) claim")
    }

    if (!payload.email || typeof payload.email !== "string") {
      throw new Error("Google ID token missing email claim")
    }

    const emailVerified =
      payload.email_verified === true || payload.email_verified === "true"

    if (payload.email_verified !== undefined && !emailVerified) {
      throw new Error("Google email address is not verified")
    }

    return {
      sub: payload.sub,
      email: payload.email.toLowerCase().trim(),
      email_verified: emailVerified,
      name: typeof payload.name === "string" ? payload.name : undefined,
      picture: typeof payload.picture === "string" ? payload.picture : undefined,
      given_name:
        typeof payload.given_name === "string" ? payload.given_name : undefined,
      family_name:
        typeof payload.family_name === "string" ? payload.family_name : undefined,
    }
  }
}

export const defaultGoogleTokenVerifier = new DefaultGoogleTokenVerifier()
