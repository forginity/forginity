"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { cn } from "@workspace/ui/lib/utils"
import { OtpInput } from "@workspace/ui/components/otp-input"
import { ArrowRight, CheckCircle2, AlertCircle } from "lucide-react"
import { useInitiateEmailAuth, useVerifyEmailAuth } from "@forginity/sdk/modules/auth/auth.hooks"
import { useAppDispatch } from "@/lib/store/index"
import { clearUser, setUser } from "@/lib/store/slices/user-slice"

export interface LoginFormProps {
  className?: string
}

export function LoginForm({ className }: LoginFormProps) {
  const router = useRouter()
  const dispatch = useAppDispatch()

  const initiateMutation = useInitiateEmailAuth()
  const verifyMutation = useVerifyEmailAuth()

  // Passwordless Email + OTP Authentication Flow
  const [email, setEmail] = React.useState("")
  const [otpStep, setOtpStep] = React.useState<"email" | "verify">("email")
  const [otpValue, setOtpValue] = React.useState("")
  const [requestId, setRequestId] = React.useState<string | null>(null)
  const [debugOtp, setDebugOtp] = React.useState<string | null>(null)
  const [resendCountdown, setResendCountdown] = React.useState(0)
  const [isVerifying, setIsVerifying] = React.useState(false)
  const [isRedirecting, setIsRedirecting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null)

  const isLoading = initiateMutation.isPending || verifyMutation.isPending
  const isBusy = isLoading || isVerifying || isRedirecting

  /* ==========================================================================
   * [COMMENTED] PASSWORD AUTHENTICATION STATE & HANDLERS
   * Reserved for future password fallback if enabled by organization policy.
   * ==========================================================================
  const [authMode, setAuthMode] = React.useState<"password" | "otp">("otp")
  const [password, setPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [rememberMe, setRememberMe] = React.useState(false)

  const handlePasswordSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid work email address.")
      return
    }

    if (!password) {
      setError("Please enter your administrator password.")
      return
    }

    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setSuccessMessage("Credentials submitted.")
    }, 800)
  }
  ========================================================================== */

  // Handle redirect from expired/revoked session or explicit logout
  React.useEffect(() => {
    if (typeof window === "undefined") return
    const params = new URLSearchParams(window.location.search)
    const isExpired = params.get("expired") === "1"
    const isLoggedOut = params.get("logged_out") === "1"

    if (isExpired || isLoggedOut) {
      dispatch(clearUser())
      try {
        localStorage.removeItem("admin_access_token")
        localStorage.removeItem("access_token")
        localStorage.removeItem("admin_user")
        document.cookie = "admin_session=; path=/; max-age=0"
      } catch {
        // Ignore storage errors
      }
      if (isExpired) {
        setError("Your session has expired. Please sign in again.")
      }
      window.history.replaceState({}, "", "/login")
    }
  }, [dispatch])

  // Resend timer countdown effect
  React.useEffect(() => {
    if (resendCountdown <= 0) return
    const timer = setInterval(() => {
      setResendCountdown((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [resendCountdown])

  /**
   * Step 1: Initiate Passwordless Sign-In
   * Directly calls auth service via @forginity/sdk useInitiateEmailAuth hook.
   */
  const handleOtpInitiate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)

    const trimmedEmail = email.trim()
    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      setError("Please enter a valid work email address.")
      return
    }

    try {
      const data = await initiateMutation.mutateAsync({
        email: trimmedEmail,
        intent: "sign_in",
        userType: "admin",
        productName: "Forginity Admin",
      })

      setRequestId(data.requestId)
      if (data.debugOtp) {
        setDebugOtp(data.debugOtp)
      }
      setOtpStep("verify")
      setResendCountdown(data.cooldownSeconds || 60)
      setSuccessMessage(`One-time verification code sent to ${trimmedEmail}`)
    } catch (err: any) {
      const message = err?.message || ""
      const isRateLimited =
        err?.code === "RATE_LIMITED" ||
        err?.status === 429 ||
        /Please wait \d+ seconds/i.test(message)

      if (isRateLimited) {
        const match = message.match(/(\d+)\s*seconds/i)
        const seconds =
          err?.details?.cooldownSeconds ||
          (match ? parseInt(match[1], 10) : 60)

        const existingRequestId = err?.details?.requestId || requestId
        if (existingRequestId) {
          setRequestId(existingRequestId)
        }

        setResendCountdown(seconds)
        setOtpStep("verify")
        setSuccessMessage(
          `A verification code was already dispatched. Please enter your code or wait ${seconds}s to request another.`
        )
        return
      }

      setError(err?.message || "Failed to initiate administrator sign-in.")
    }
  }

  /**
   * Step 2: Verify 6-digit OTP code
   * Directly calls auth service via @forginity/sdk useVerifyEmailAuth hook.
   * Refresh token is stored securely in an HTTP-only cookie by the API.
   * Authenticated user profile is stored directly into Redux store.
   */
  const executeOtpVerify = async (codeToVerify?: string) => {
    if (isBusy) return
    const code = (codeToVerify || otpValue).trim()

    if (!requestId) {
      setError("Verification request expired. Please re-enter your email.")
      setOtpStep("email")
      return
    }

    if (code.length !== 6) {
      setError("Please enter all 6 digits of your one-time verification code.")
      return
    }

    setError(null)
    setSuccessMessage(null)
    setIsVerifying(true)

    try {
      const data = await verifyMutation.mutateAsync({
        requestId,
        code,
        intent: "sign_in",
        userType: "admin",
      })

      if (data.user) {
        dispatch(setUser(data.user))
      }

      if (data.session?.accessToken) {
        localStorage.setItem("admin_access_token", data.session.accessToken)
        document.cookie = `admin_session=${data.session.accessToken}; path=/; max-age=900; SameSite=Lax`
      }

      setIsRedirecting(true)
      setSuccessMessage("Authentication verified! Entering workspace...")
      setTimeout(() => {
        window.location.href = "/"
      }, 300)
    } catch (err: any) {
      setIsVerifying(false)
      setError(err?.message || "Verification failed.")
    }
  }

  const handleOtpVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    await executeOtpVerify()
  }

  /**
   * Resend code handler with countdown protection
   */
  const handleResendOtp = async () => {
    if (resendCountdown > 0 || isLoading || isRedirecting) return
    setError(null)
    setOtpValue("")

    try {
      const data = await initiateMutation.mutateAsync({
        email: email.trim(),
        intent: "sign_in",
        userType: "admin",
        productName: "Forginity Admin",
      })

      setRequestId(data.requestId)
      if (data.debugOtp) {
        setDebugOtp(data.debugOtp)
      }
      setResendCountdown(data.cooldownSeconds || 60)
      setSuccessMessage(`New code sent to ${email.trim()}`)
    } catch (err: any) {
      const message = err?.message || ""
      const isRateLimited =
        err?.code === "RATE_LIMITED" ||
        err?.status === 429 ||
        /Please wait \d+ seconds/i.test(message)

      if (isRateLimited) {
        const match = message.match(/(\d+)\s*seconds/i)
        const seconds =
          err?.details?.cooldownSeconds ||
          (match ? parseInt(match[1], 10) : 60)
        setResendCountdown(seconds)
        setError(`Please wait ${seconds}s before requesting another verification code.`)
        return
      }

      setError(err?.message || "Unable to resend code. Please try again.")
    }
  }

  const resetOtpFlow = () => {
    setOtpStep("email")
    setOtpValue("")
    setRequestId(null)
    setDebugOtp(null)
    setError(null)
    setSuccessMessage(null)
  }

  return (
    <div className={cn("w-full space-y-6", className)}>
      {/* Header text matching Figma 320:378 */}
      <div className="space-y-2">
        <h2 className="text-2xl sm:text-[30px] font-light text-[#f6f6f6] tracking-tight leading-tight">
          Welcome back
        </h2>
        <p className="text-sm font-normal text-[#a1a1a1] leading-relaxed">
          {otpStep === "email"
            ? "Sign in with your administrator account."
            : `Enter the 6-digit code sent to ${email.trim()}`}
        </p>
      </div>

      {/* Feedback alerts */}
      {error && (
        <div
          role="alert"
          className="flex items-center gap-2.5 rounded-lg border border-[#d94f2e]/40 bg-[#d94f2e]/10 px-3.5 py-2.5 text-xs text-[#ff967f]"
        >
          <AlertCircle className="size-4 shrink-0 text-[#d94f2e]" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && !error && (
        <div
          role="status"
          className="flex items-center gap-2.5 rounded-lg border border-[#ff6347]/30 bg-[#ff6347]/10 px-3.5 py-2.5 text-xs text-[#ff967f]"
        >
          <CheckCircle2 className="size-4 shrink-0 text-[#ff6347]" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Development Debug Code Helper */}
      {debugOtp && otpStep === "verify" && (
        <div className="rounded-lg border border-[#292929] bg-[#141414] px-3.5 py-2 text-center text-xs text-[#a1a1a1]">
          Development OTP: <span className="font-mono font-medium text-[#ff967f]">{debugOtp}</span>
        </div>
      )}

      {/* PASSWORDLESS EMAIL & OTP SIGN-IN (ACTIVE PRODUCTION FLOW) */}
      <div className="space-y-5">
        {otpStep === "email" ? (
          /* Step 1: Work email input matching Figma 320:382 */
          <form onSubmit={handleOtpInitiate} className="space-y-5" noValidate>
            <div className="space-y-2">
              <label
                htmlFor="admin-work-email"
                className="block text-sm font-normal text-[#f6f6f6]"
              >
                Work email
              </label>
              <div className="relative">
                <input
                  id="admin-work-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="h-[50px] w-full rounded-lg border border-[#292929] bg-[#141414] px-4 text-sm text-[#f6f6f6] placeholder-[#858585] outline-none transition-colors focus:border-[#ff6347] focus:ring-1 focus:ring-[#ff6347]/50"
                />
              </div>
            </div>

            {/* Submit button with Figma geometry and coral accent */}
            <button
              type="submit"
              disabled={isLoading}
              className="flex h-[50px] w-full items-center justify-center gap-2 rounded-lg bg-[#ff6347] px-4 text-sm font-medium text-[#16100f] transition-all hover:bg-[#ff7257] active:bg-[#d94f2e] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="size-4 animate-spin rounded-full border-2 border-[#16100f] border-t-transparent" />
                  Sending passcode...
                </span>
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>

            {/* Direct code entry fallback if code was already received */}
            {email.trim().includes("@") && (
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setError(null)
                    setOtpStep("verify")
                  }}
                  className="text-xs text-[#a1a1a1] hover:text-[#ff967f] transition-colors cursor-pointer"
                >
                  Already have a verification code? <span className="underline text-[#ff967f]">Enter code</span>
                </button>
              </div>
            )}
          </form>
        ) : (
          /* Step 2: 6-digit numeric OTP code entry */
          <form onSubmit={handleOtpVerify} className="space-y-5" noValidate>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#a1a1a1]">Admin account</span>
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={resetOtpFlow}
                  className="text-xs text-[#ff967f] hover:underline disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Change email
                </button>
              </div>
              <div className="rounded-lg border border-[#292929] bg-[#141414] px-4 py-3 text-sm text-[#f6f6f6] truncate font-mono">
                {email.trim()}
              </div>
            </div>

            {/* 6-Digit Passcode Input */}
            <div className="space-y-2">
              <label className="block text-sm font-normal text-[#f6f6f6]">
                6-digit passcode
              </label>
              <div className="w-full py-1">
                <OtpInput
                  length={6}
                  value={otpValue}
                  disabled={isBusy}
                  onChange={(val) => setOtpValue(val)}
                  onComplete={(val) => {
                    setOtpValue(val)
                    executeOtpVerify(val)
                  }}
                  error={Boolean(error)}
                />
              </div>
            </div>

            {/* Resend actions */}
            <div className="flex items-center justify-between text-xs text-[#a1a1a1]">
              <span>Didn&apos;t receive the code?</span>
              <button
                type="button"
                disabled={resendCountdown > 0 || isBusy}
                onClick={handleResendOtp}
                className={cn(
                  "font-medium transition-colors cursor-pointer",
                  resendCountdown > 0 || isBusy
                    ? "text-[#858585] cursor-not-allowed"
                    : "text-[#ff967f] hover:underline"
                )}
              >
                {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : "Resend code"}
              </button>
            </div>

            {/* Verify & sign in button */}
            <button
              type="submit"
              disabled={isBusy || otpValue.length !== 6}
              className="flex h-[50px] w-full items-center justify-center rounded-lg bg-[#ff6347] px-4 text-sm font-medium text-[#16100f] transition-all hover:bg-[#ff7257] active:bg-[#d94f2e] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isRedirecting ? (
                <span className="inline-flex items-center gap-2">
                  <span className="size-4 animate-spin rounded-full border-2 border-[#16100f] border-t-transparent" />
                  Entering workspace...
                </span>
              ) : isVerifying || verifyMutation.isPending ? (
                <span className="inline-flex items-center gap-2">
                  <span className="size-4 animate-spin rounded-full border-2 border-[#16100f] border-t-transparent" />
                  Verifying code...
                </span>
              ) : (
                "Verify & sign in"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
