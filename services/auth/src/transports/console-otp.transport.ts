import type {
  OtpDeliveryOptions,
  OtpDeliveryResult,
  OtpTransport,
  SentOtpRecord,
} from "../types/otp.types.js"

export class ConsoleOtpTransport implements OtpTransport {
  public readonly name = "console"
  public lastSentOtp: SentOtpRecord | null = null
  public sentHistory: SentOtpRecord[] = []

  async send(options: OtpDeliveryOptions): Promise<OtpDeliveryResult> {
    const record: SentOtpRecord = {
      identifier: options.identifier,
      identifierType: options.identifierType,
      otp: options.otp,
      purpose: options.purpose,
      timestamp: new Date(),
    }

    this.lastSentOtp = record
    this.sentHistory.push(record)

    if (!process.env.VITEST) {
      console.log(
        `\x1b[33m[ConsoleOtpTransport]\x1b[0m OTP dispatch simulation for ${options.identifier} (${options.purpose}): \x1b[1m\x1b[32m${options.otp}\x1b[0m (expires in ${options.expiresInSeconds}s)`
      )
    }

    return {
      success: true,
      messageId: `sim-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    }
  }

  clear(): void {
    this.lastSentOtp = null
    this.sentHistory = []
  }
}
