import type {
  GenerateOtpEmailOptions,
  GeneratedEmail,
} from "../types/otp.types.js"

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

export function generateOtpEmailTemplate(
  options: GenerateOtpEmailOptions
): GeneratedEmail {
  const { otp, expiresInMinutes = 10 } = options

  const productName = (
    options.productName ||
    process.env.PRODUCT_NAME ||
    process.env.APP_NAME ||
    "Forginity"
  ).trim()

  const safeProductName = escapeHtml(productName)
  const safeOtp = escapeHtml(String(otp))
  const safeExpiry = escapeHtml(String(expiresInMinutes))

  const subject = `Your verification code for ${productName}`
  const currentYear = new Date().getFullYear()

  const text = `
${productName}

Your verification code:

${otp}

Expires in ${expiresInMinutes} minutes.

Didn't request this code? You can safely ignore this email.

© ${currentYear} ${productName}. All rights reserved.
Automated security notification.
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

  <title>${escapeHtml(subject)}</title>

  <!--[if mso]>
  <style>
    body, table, td {
      font-family: Arial, Helvetica, sans-serif !important;
    }
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

    table {
      border-collapse: collapse;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }

    img {
      border: 0;
      display: block;
      outline: none;
      text-decoration: none;
    }

    @media only screen and (max-width: 560px) {
      .email-wrapper {
        padding: 24px 12px !important;
      }

      .email-card {
        width: 100% !important;
      }

      .card-content {
        padding-left: 24px !important;
        padding-right: 24px !important;
      }

      .otp-code {
        font-size: 30px !important;
        letter-spacing: 7px !important;
      }
    }
  </style>
</head>

<body style="
  margin: 0;
  padding: 0;
  background-color: #0b0b0c;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
    Roboto, Helvetica, Arial, sans-serif;
  color: #f4f4f5;
  -webkit-font-smoothing: antialiased;
">

  <!-- Preheader -->
  <div style="
    display: none;
    max-height: 0;
    max-width: 0;
    overflow: hidden;
    opacity: 0;
    color: transparent;
    mso-hide: all;
  ">
    Your ${safeProductName} verification code is ready.
    &#847; &zwnj; &nbsp; &#8199; &shy;
  </div>

  <!-- Email Wrapper -->
  <table
    role="presentation"
    width="100%"
    cellspacing="0"
    cellpadding="0"
    border="0"
    class="email-wrapper"
    style="
      width: 100%;
      background-color: #0b0b0c;
      padding: 48px 16px;
    "
  >
    <tr>
      <td align="center">

        <!-- Email Card -->
        <table
          role="presentation"
          width="520"
          cellspacing="0"
          cellpadding="0"
          border="0"
          class="email-card"
          style="
            width: 100%;
            max-width: 520px;
            background-color: #141416;
            border: 1px solid #26262a;
            border-radius: 14px;
            overflow: hidden;
          "
        >

          <!-- Accent Border -->
          <tr>
            <td
              height="3"
              style="
                height: 3px;
                background-color: #ff6347;
                font-size: 0;
                line-height: 0;
              "
            ></td>
          </tr>

          <!-- Brand Header -->
          <tr>
            <td
              class="card-content"
              style="
                padding: 28px 36px;
                border-bottom: 1px solid #232328;
              "
            >
              <span style="
                font-size: 15px;
                font-weight: 750;
                letter-spacing: 0.12em;
                text-transform: uppercase;
                color: #ffffff;
              ">
                ${safeProductName}
              </span>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td
              class="card-content"
              style="padding: 40px 36px 36px;"
            >

              <!-- Heading -->
              <h1 style="
                margin: 0 0 28px;
                font-size: 26px;
                line-height: 1.3;
                font-weight: 650;
                letter-spacing: -0.7px;
                color: #ffffff;
              ">
                Your verification code
              </h1>

              <!-- OTP Display -->
              <table
                role="presentation"
                width="100%"
                cellspacing="0"
                cellpadding="0"
                border="0"
              >
                <tr>
                  <td
                    align="center"
                    style="
                      padding: 28px 12px;
                      background-color: #0b0b0d;
                      border: 1px solid #2a2a30;
                      border-radius: 10px;
                    "
                  >
                    <span
                      class="otp-code"
                      style="
                        font-family: 'SF Mono', Menlo, Monaco,
                          Consolas, 'Liberation Mono', monospace;
                        font-size: 36px;
                        font-weight: 750;
                        letter-spacing: 10px;
                        line-height: 1.3;
                        color: #ff6347;
                      "
                    >
                      ${safeOtp}
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Expiry Information -->
              <p style="
                margin: 22px 0 0;
                font-size: 13px;
                line-height: 1.5;
                color: #83838d;
              ">
                Expires in
                <strong style="color: #f4f4f5;">
                  ${safeExpiry} minutes
                </strong>
              </p>

              <!-- Security Notice -->
              <p style="
                margin: 20px 0 0;
                font-size: 12px;
                line-height: 1.6;
                color: #71717a;
              ">
                Didn't request this code? You can safely ignore this email.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td
              class="card-content"
              style="
                padding: 22px 36px;
                border-top: 1px solid #232328;
                background-color: #111113;
              "
            >

              <p style="
                margin: 0 0 6px;
                font-size: 11px;
                line-height: 1.5;
                color: #71717a;
              ">
                &copy; ${currentYear} ${safeProductName}. All rights reserved.
              </p>

              <p style="
                margin: 0;
                font-size: 10px;
                line-height: 1.5;
                color: #52525b;
              ">
                Automated security notification.
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

  return {
    subject,
    html,
    text,
  }
}