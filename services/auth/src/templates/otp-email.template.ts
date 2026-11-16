import type {
  GenerateOtpEmailOptions,
  GeneratedEmail,
} from "../types/otp.types.js"

export function generateOtpEmailTemplate(
  options: GenerateOtpEmailOptions
): GeneratedEmail {
  const { otp, expiresInMinutes = 10 } = options

  const resolvedProductName = (
    options.productName ||
    process.env.PRODUCT_NAME ||
    process.env.APP_NAME ||
    "Forginity"
  ).trim()

  const subject = `Your One-Time Password (OTP) for Verification (${resolvedProductName})`
  const currentYear = new Date().getFullYear()

  const text = `
${resolvedProductName.toUpperCase()}

Your One-Time Password (OTP) for Verification

Your verification code is: ${otp}

This code expires in ${expiresInMinutes} minutes and can only be used once.
If you did not request this verification code, please ignore this email.

— The ${resolvedProductName} Team
`.trim()

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
  <title>${subject}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
  <style>
    body {
      margin: 0 !important;
      padding: 0 !important;
      background-color: #0b0b0c !important;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    table, td {
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
      border-collapse: collapse;
    }
    img {
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
    }
    @media only screen and (max-width: 480px) {
      .email-wrapper {
        padding: 24px 12px !important;
      }
      .email-card {
        padding: 28px 20px !important;
        border-radius: 12px !important;
      }
      .brand-title {
        font-size: 14px !important;
      }
      .heading-title {
        font-size: 22px !important;
      }
      .otp-code {
        font-size: 30px !important;
        letter-spacing: 8px !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0b0c; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #f4f4f5; -webkit-font-smoothing: antialiased;">
  <!-- Hidden Preheader Text for Inbox Preview -->
  <div style="display: none; font-size: 1px; color: #0b0b0c; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    Your ${resolvedProductName} verification passcode is ${otp}. Valid for ${expiresInMinutes} minutes.
    &#847; &zwnj; &nbsp; &#8199; &shy; &#847; &zwnj; &nbsp; &#8199; &shy; &#847; &zwnj; &nbsp; &#8199; &shy;
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="email-wrapper" style="width: 100%; background-color: #0b0b0c; padding: 48px 16px; margin: 0;">
    <tr>
      <td align="center">
        <!--[if (gte mso 9)|(IE)]>
        <table role="presentation" width="460" align="center" style="width: 460px;">
        <tr>
        <td>
        <![endif]-->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="email-card" style="max-width: 460px; width: 100%; background-color: #141416; border: 1px solid #26262a; border-radius: 16px; padding: 36px 32px; box-sizing: border-box; text-align: left; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);">
          
          <!-- Header / Brand -->
          <tr>
            <td style="padding: 0 0 24px 0; border-bottom: 1px solid #232328;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td>
                    <span class="brand-title" style="font-size: 15px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #ffffff;">
                      ${resolvedProductName}
                    </span>
                  </td>
                  <td align="right">
                    <span style="font-size: 10px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #ff6347; background-color: rgba(255, 99, 71, 0.12); border: 1px solid rgba(255, 99, 71, 0.25); border-radius: 6px; padding: 3px 8px;">
                      SECURITY PASSCODE
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td style="padding: 28px 0 0 0;">
              <h1 class="heading-title" style="margin: 0 0 8px 0; font-size: 24px; font-weight: 600; color: #ffffff; letter-spacing: -0.02em; line-height: 1.25;">
                Verification Code
              </h1>
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #9e9ea7;">
                Use the one-time passcode below to authenticate your session for <strong style="color: #f4f4f5;">${resolvedProductName}</strong>:
              </p>

              <!-- OTP Code Display Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 0 0 24px 0;">
                <tr>
                  <td align="center" style="background-color: #0b0b0d; border: 1px solid #2a2a30; border-radius: 12px; padding: 22px 16px;">
                    <span class="otp-code" style="font-family: ui-monospace, 'SF Mono', Menlo, Monaco, Consolas, 'Liberation Mono', monospace; font-size: 34px; font-weight: 700; letter-spacing: 10px; color: #ff6347; display: inline-block; text-shadow: 0 0 24px rgba(255, 99, 71, 0.3);">
                      ${otp}
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Expiry & Security Badge -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 0 0 20px 0;">
                <tr>
                  <td style="background-color: rgba(255, 255, 255, 0.03); border: 1px solid #242429; border-radius: 8px; padding: 12px 14px;">
                    <p style="margin: 0 0 4px 0; font-size: 13px; font-weight: 500; color: #d4d4d8; line-height: 1.4;">
                      ⏱ This passcode expires in <strong style="color: #ffffff;">${expiresInMinutes} minutes</strong>
                    </p>
                    <p style="margin: 0; font-size: 12px; color: #71717a; line-height: 1.4;">
                      It is strictly single-use and cannot be shared.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #71717a;">
                If you did not request this verification code, please ignore this email. Your account credentials and data remain safe.
              </p>
            </td>
          </tr>

          <!-- Minimal Footer -->
          <tr>
            <td style="padding: 24px 0 0 0; margin-top: 24px; border-top: 1px solid #232328; text-align: center;">
              <p style="margin: 0 0 4px 0; font-size: 11px; line-height: 1.5; color: #52525b;">
                &copy; ${currentYear} ${resolvedProductName}. All rights reserved.
              </p>
              <p style="margin: 0; font-size: 10px; line-height: 1.5; color: #3f3f46;">
                Automated security notification &bull; Please do not reply to this email
              </p>
            </td>
          </tr>

        </table>
        <!--[if (gte mso 9)|(IE)]>
        </td>
        </tr>
        </table>
        <![endif]-->
      </td>
    </tr>
  </table>
</body>
</html>
`.trim()

  return { subject, html, text }
}
