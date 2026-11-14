import { SignJWT, jwtVerify, type JWTPayload } from "jose"
import type {
  AccessTokenPayload,
  RefreshTokenPayload,
  OnboardingTokenPayload,
} from "../types/auth.types.js"

const JWT_ISSUER = "forginity-auth"
const JWT_AUDIENCE = "forginity-platform"

export function getJwtSecretKey(): Uint8Array {
  const secret =
    process.env.JWT_SECRET || "forginity_default_jwt_secret_development_only"
  return new TextEncoder().encode(secret)
}

/**
 * Signs a 15-minute access JWT token for authenticated platform API requests.
 */
export async function signAccessToken(payload: {
  userId: string
  email: string
  currentProductId?: string
  userType?: string
  role?: string
}): Promise<string> {
  const secretKey = getJwtSecretKey()

  return new SignJWT({
    email: payload.email,
    scope: "access",
    ...(payload.currentProductId ? { productId: payload.currentProductId } : {}),
    ...(payload.userType ? { userType: payload.userType } : {}),
    ...(payload.role
      ? { role: payload.role }
      : payload.userType
        ? { role: payload.userType }
        : {}),
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.userId)
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(secretKey)
}

/**
 * Signs a 30-day refresh JWT token tied to an active database session.
 */
export async function signRefreshToken(payload: {
  userId: string
  sessionId: string
  tokenSecret?: string
}): Promise<string> {
  const secretKey = getJwtSecretKey()

  return new SignJWT({
    sessionId: payload.sessionId,
    scope: "refresh",
    ...(payload.tokenSecret ? { tokenSecret: payload.tokenSecret } : {}),
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.userId)
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secretKey)
}

/**
 * Signs a 2-hour scoped onboarding JWT token strictly restricted to profile completion.
 */
export async function signOnboardingToken(payload: {
  userId: string
  email: string
}): Promise<string> {
  const secretKey = getJwtSecretKey()

  return new SignJWT({
    email: payload.email,
    scope: "onboarding",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.userId)
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(secretKey)
}

/**
 * Verifies any Forginity JWT token, validating signature, expiration, issuer, and scope.
 */
export async function verifyJwtToken<T = JWTPayload & { scope: string }>(
  token: string,
  expectedScope: "access" | "refresh" | "onboarding"
): Promise<T> {
  const secretKey = getJwtSecretKey()

  const { payload } = await jwtVerify(token, secretKey, {
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
  })

  if (payload.scope !== expectedScope) {
    throw new Error(
      `Invalid token scope: expected '${expectedScope}' but received '${payload.scope}'`
    )
  }

  return payload as unknown as T
}
