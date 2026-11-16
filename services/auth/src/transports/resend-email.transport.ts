import nodemailer, { type Transporter } from "nodemailer"
import type {
  OtpDeliveryOptions,
  OtpDeliveryResult,
  OtpTransport,
  ResendEmailTransportConfig,
} from "../types/otp.types.js"
import { ConsoleOtpTransport } from "./console-otp.transport.js"
import { generateOtpEmailTemplate } from "../templates/otp-email.template.js"

export class ResendEmailTransport implements OtpTransport {
  public readonly name = "resend-nodemailer"
  private transporter: Transporter
  private fromAddress: string

  constructor(config?: ResendEmailTransportConfig) {
    const host = config?.host || process.env.SMTP_HOST || "smtp.resend.com"
    const port =
      config?.port ||
      (process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 465)
    const secure = config?.secure !== undefined ? config.secure : port === 465
    const user = config?.user || process.env.SMTP_USER || "resend"
    const pass = config?.pass || process.env.SMTP_PASS || ""

    const rawFrom = (config?.from || process.env.EMAIL_FROM || "").trim()

    // Resend requires a verified custom domain or the sandbox domain onboarding@resend.dev.
    // Public webmail domains (@gmail.com, @yahoo.com) cannot be used as the sender.
    if (!rawFrom || /@(gmail|yahoo|hotmail|outlook)\.com/i.test(rawFrom)) {
      this.fromAddress = "Forginity <onboarding@resend.dev>"
    } else if (!rawFrom.includes("@")) {
      // User provided bare domain name e.g. "nubeofthought.space"
      this.fromAddress = `Forginity <auth@${rawFrom}>`
    } else if (rawFrom.startsWith("@")) {
      this.fromAddress = `Forginity <auth${rawFrom}>`
    } else if (!rawFrom.includes("<")) {
      this.fromAddress = `Forginity <${rawFrom}>`
    } else {
      this.fromAddress = rawFrom
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    })
  }

  async send(options: OtpDeliveryOptions): Promise<OtpDeliveryResult> {
    if (options.identifierType !== "email") {
      return {
        success: false,
        error: "ResendEmailTransport only supports email delivery",
      }
    }

    const { subject, html, text } = generateOtpEmailTemplate({
      otp: options.otp,
      purpose: options.purpose,
      expiresInMinutes: Math.ceil(options.expiresInSeconds / 60),
      ...(options.productName ? { productName: options.productName } : {}),
    })

    try {
      const info = await this.transporter.sendMail({
        from: this.fromAddress,
        to: options.identifier,
        subject,
        html,
        text,
      })

      return {
        success: true,
        messageId: info.messageId,
      }
    } catch (error: any) {
      console.error(
        "[ResendEmailTransport] Failed to send email via nodemailer:",
        error
      )

      const errCode = error?.code || ""
      const errSyscall = error?.syscall || ""
      let friendlyMessage = "Failed to dispatch verification email."

      if (
        errCode === "EAI_AGAIN" ||
        errCode === "ENOTFOUND" ||
        errCode === "EDNS" ||
        errSyscall === "getaddrinfo"
      ) {
        friendlyMessage =
          "Email service network error: unable to resolve mail server (DNS/network issue). Please verify your connection or try again shortly."
      } else if (errCode === "ETIMEDOUT" || errCode === "ESOCKETTIMEDOUT") {
        friendlyMessage =
          "Email service connection timed out. Please check your network connection and try again."
      } else if (errCode === "ECONNREFUSED" || errCode === "ECONNRESET") {
        friendlyMessage =
          "Email service connection was reset or refused by the mail server. Please try again shortly."
      } else if (error?.responseCode >= 400 && error?.responseCode < 500) {
        friendlyMessage = `Email provider rejected request: ${error?.message || "Invalid recipient or sender."}`
      } else if (error?.message) {
        friendlyMessage = `Email delivery error: ${error.message}`
      }

      return {
        success: false,
        error: friendlyMessage,
      }
    }
  }
}

// Default singleton for testing / development
const defaultConsoleTransport = new ConsoleOtpTransport()

/**
 * Factory to retrieve the active OTP transport based on environment settings.
 * In automated test suites or when no SMTP/Resend credentials exist,
 * defaults to ConsoleOtpTransport to ensure 0-cost, 100% deterministic tests.
 */
export function getOtpTransport(): OtpTransport {
  const hasResendCredentials = Boolean(
    process.env.RESEND_API_KEY || process.env.SMTP_PASS
  )

  // Use live Resend transport when running the app with credentials configured
  // In automated test runs (VITEST) or when credentials are absent, default to ConsoleOtpTransport
  if (!process.env.VITEST && hasResendCredentials) {
    return new ResendEmailTransport()
  }

  return defaultConsoleTransport
}

export { defaultConsoleTransport }
