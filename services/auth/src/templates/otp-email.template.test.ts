import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { generateOtpEmailTemplate } from "./otp-email.template.js"

describe("OTP Email Template (Minimal & Responsive)", () => {
  const originalEnv = { ...process.env }

  beforeEach(() => {
    delete process.env.PRODUCT_NAME
    delete process.env.APP_NAME
  })

  afterEach(() => {
    process.env = { ...originalEnv }
  })

  it("should generate default subject with (Forginity) when no product name is provided", () => {
    const result = generateOtpEmailTemplate({
      otp: "849201",
      expiresInMinutes: 10,
    })

    expect(result.subject).toBe(
      "Your One-Time Password (OTP) for Verification (Forginity)"
    )
    expect(result.text).toContain("FORGINITY")
    expect(result.text).toContain("849201")
    expect(result.text).toContain("10 minutes")
    expect(result.text).toContain("— The Forginity Team")
  })

  it("should generate dynamic subject with custom productName when passed in options", () => {
    const result = generateOtpEmailTemplate({
      otp: "654321",
      productName: "TrackRide",
      expiresInMinutes: 5,
    })

    expect(result.subject).toBe(
      "Your One-Time Password (OTP) for Verification (TrackRide)"
    )
    expect(result.text).toContain("TRACKRIDE")
    expect(result.text).toContain("654321")
    expect(result.text).toContain("5 minutes")
    expect(result.text).toContain("— The TrackRide Team")
    expect(result.html).toContain("TrackRide")
  })

  it("should use process.env.PRODUCT_NAME when options.productName is absent", () => {
    process.env.PRODUCT_NAME = "Custom Apparel"

    const result = generateOtpEmailTemplate({
      otp: "112233",
    })

    expect(result.subject).toBe(
      "Your One-Time Password (OTP) for Verification (Custom Apparel)"
    )
    expect(result.html).toContain("Custom Apparel")
  })

  it("should use process.env.APP_NAME as secondary fallback", () => {
    process.env.APP_NAME = "Candidate Screening"

    const result = generateOtpEmailTemplate({
      otp: "998877",
    })

    expect(result.subject).toBe(
      "Your One-Time Password (OTP) for Verification (Candidate Screening)"
    )
    expect(result.text).toContain("Candidate Screening")
  })

  it("should produce minimal, mobile-responsive HTML with proper email client meta tags and media queries", () => {
    const result = generateOtpEmailTemplate({
      otp: "543210",
      productName: "TrackRide",
      expiresInMinutes: 15,
    })

    // Viewport and email client normalizations
    expect(result.html).toContain(
      '<meta name="viewport" content="width=device-width, initial-scale=1.0">'
    )
    expect(result.html).toContain(
      '<meta name="x-apple-disable-message-reformatting">'
    )
    expect(result.html).toContain(
      '<meta name="format-detection" content="telephone=no, date=no, address=no, email=no">'
    )

    // Responsive media query rules
    expect(result.html).toContain("@media only screen and (max-width: 480px)")
    expect(result.html).toContain(".email-card")
    expect(result.html).toContain(".otp-code")

    // MSO Outlook compatibility comments
    expect(result.html).toContain("<!--[if mso]>")
    expect(result.html).toContain("<!--[if (gte mso 9)|(IE)]>")

    // Content checks
    expect(result.html).toContain("543210")
    expect(result.html).toContain("15 minutes")
    expect(result.html).toContain("Verification Code")
    expect(result.html).toContain("TrackRide")
    expect(result.html).toContain(
      "&copy; " + new Date().getFullYear() + " TrackRide. All rights reserved."
    )
  })
})
