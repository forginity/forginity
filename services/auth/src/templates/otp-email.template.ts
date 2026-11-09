import type {
  GenerateOtpEmailOptions,
  GeneratedEmail,
} from "../types/otp.types.js"

export function generateOtpEmailTemplate(
  options: GenerateOtpEmailOptions
): GeneratedEmail {
  const { otp, purpose = "verification", expiresInMinutes = 10 } = options

  const formattedPurpose =
    purpose === "authentication"
      ? "Login & Verification"
      : purpose === "sign_up"
        ? "Sign Up Verification"
        : purpose === "sign_in"
          ? "Sign In Verification"
          : "Verification Code"

  const subject = `Welcome to Forginity`

  const text = `
FORGINITY

${formattedPurpose}
Your 6-digit verification code is: ${otp}

This code will expire in ${expiresInMinutes} minutes.
If you did not request this verification code, you can safely ignore this email.

— The Forginity Team
`.trim()

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0c0a09; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #fafafa;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0c0a09; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Main Container Card -->
        <table role="presentation" width="100%" style="max-width: 480px; background-color: #18181b; border: 1px solid #27272a; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);" cellspacing="0" cellpadding="0" border="0">
          
          <!-- Top Coral Accent Bar -->
          <tr>
            <td style="height: 4px; background: linear-gradient(90deg, #f97316 0%, #fb923c 50%, #f97316 100%);"></td>
          </tr>

          <!-- Header / Brand Section -->
          <tr>
            <td style="padding: 32px 32px 20px 32px; text-align: left;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td>
                    <span style="font-size: 18px; font-weight: 800; letter-spacing: 0.1em; color: #fafafa; text-transform: uppercase;">
                      FORGINITY
                    </span>
                    <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background-color: #f97316; margin-left: 4px; vertical-align: middle;"></span>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; padding: 4px 8px; border-radius: 9999px; background-color: rgba(249, 115, 22, 0.15); color: #fb923c; border: 1px solid rgba(249, 115, 22, 0.3);">
                      ${formattedPurpose}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Section -->
          <tr>
            <td style="padding: 0 32px 32px 32px;">
              <h1 style="margin: 0 0 12px 0; font-size: 22px; font-weight: 700; color: #fafafa; line-height: 1.3;">
                Your Verification Code
              </h1>
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #a1a1aa;">
                Use the one-time verification code below to complete your authentication on the Forginity platform:
              </p>

              <!-- Prominent OTP Code Container -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 0 0 24px 0;">
                <tr>
                  <td align="center" style="background-color: #09090b; border: 1px solid #27272a; border-radius: 8px; padding: 20px 16px;">
                    <span style="font-family: 'SF Mono', Consolas, Monaco, 'Liberation Mono', Menlo, Courier, monospace; font-size: 32px; font-weight: 800; letter-spacing: 10px; color: #fb923c; display: inline-block; padding-left: 10px;">
                      ${otp}
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Expiry Alert -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 0 0 24px 0;">
                <tr>
                  <td style="background-color: rgba(39, 39, 42, 0.5); border-left: 3px solid #f97316; border-radius: 4px; padding: 10px 14px;">
                    <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #d4d4d8;">
                      ⏳ This code is valid for <strong>${expiresInMinutes} minutes</strong> and can only be used once.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #71717a;">
                If you did not request this verification code, please ignore this email. Never share this code with anyone.
              </p>
            </td>
          </tr>

          <!-- Footer Section -->
          <tr>
            <td style="padding: 20px 32px; background-color: #121214; border-top: 1px solid #27272a; text-align: center;">
              <p style="margin: 0; font-size: 11px; line-height: 1.6; color: #52525b;">
                &copy; ${new Date().getFullYear()} Forginity Platform. All rights reserved.<br>
                Secure Identity & Authentication Infrastructure.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim()

  return { subject, html, text }
}
