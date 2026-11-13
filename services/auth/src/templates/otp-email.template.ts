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
      background-color: #09090b !important;
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
        padding: 20px 12px !important;
      }
      .email-card {
        padding: 24px 18px !important;
      }
      .brand-title {
        font-size: 15px !important;
      }
      .heading-title {
        font-size: 20px !important;
      }
      .otp-code {
        font-size: 26px !important;
        letter-spacing: 4px !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f4f4f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="email-wrapper" style="width: 100%; background-color: #09090b; padding: 36px 16px; margin: 0;">
    <tr>
      <td align="center">
        <!--[if (gte mso 9)|(IE)]>
        <table role="presentation" width="440" align="center" style="width: 440px;">
        <tr>
        <td>
        <![endif]-->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="email-card" style="max-width: 440px; width: 100%; background-color: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 32px 28px; box-sizing: border-box; text-align: left;">
          
          <!-- Header / Brand -->
          <tr>
            <td style="padding: 0 0 20px 0; border-bottom: 1px solid #27272a;">
              <span class="brand-title" style="font-size: 16px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #fafafa;">
                ${resolvedProductName}
              </span>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td style="padding: 24px 0 0 0;">
              <h1 class="heading-title" style="margin: 0 0 10px 0; font-size: 22px; font-weight: 600; color: #fafafa; line-height: 1.3;">
                Verification Code
              </h1>
              <p style="margin: 0 0 22px 0; font-size: 14px; line-height: 1.5; color: #a1a1aa;">
                Use this one-time code to complete your verification for <strong style="color: #e4e4e7;">${resolvedProductName}</strong>:
              </p>

              <!-- OTP Code Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 0 0 22px 0;">
                <tr>
                  <td align="center" style="background-color: #09090b; border: 1px solid #27272a; border-radius: 8px; padding: 18px 12px;">
                    <span class="otp-code" style="font-family: ui-monospace, 'SF Mono', Menlo, Monaco, Consolas, 'Liberation Mono', monospace; font-size: 30px; font-weight: 700; letter-spacing: 6px; color: #f97316; display: inline-block;">
                      ${otp}
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Expiry & Security Info -->
              <p style="margin: 0 0 8px 0; font-size: 13px; line-height: 1.5; color: #d4d4d8;">
                This code expires in <strong>${expiresInMinutes} minutes</strong> and can only be used once.
              </p>
              <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #71717a;">
                If you did not request this verification code, please ignore this email.
              </p>
            </td>
          </tr>

          <!-- Minimal Footer -->
          <tr>
            <td style="padding: 24px 0 0 0; margin-top: 24px; border-top: 1px solid #27272a; text-align: center;">
              <p style="margin: 0; font-size: 11px; line-height: 1.5; color: #52525b;">
                &copy; ${currentYear} ${resolvedProductName}. All rights reserved.
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
