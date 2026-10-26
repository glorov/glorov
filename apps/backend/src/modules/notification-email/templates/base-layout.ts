/**
 * Shared Base Layout for GLOROV Transactional Email Templates.
 * Provides a responsive HTML container and plain-text wrapper with consistent botanical branding.
 */

export interface BaseLayoutOptions {
  title: string
  contentHtml: string
  contentText: string
  supportEmail?: string
}

const DEFAULT_SUPPORT_EMAIL = 'care@glorov.in'

export function renderBaseHtml(options: BaseLayoutOptions): string {
  const supportEmail = options.supportEmail || DEFAULT_SUPPORT_EMAIL

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${escapeHtml(options.title)}</title>
  <style>
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1f2937; line-height: 1.6; }
    .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; }
    .header { background-color: #064e3b; padding: 28px 24px; text-align: center; }
    .header h1 { margin: 0; color: #ffffff; font-size: 22px; font-weight: 700; letter-spacing: 0.5px; }
    .header p { margin: 6px 0 0 0; color: #a7f3d0; font-size: 13px; letter-spacing: 0.3px; }
    .content { padding: 32px 24px; }
    .footer { background-color: #f1f5f9; padding: 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
    .footer a { color: #047857; text-decoration: none; font-weight: 500; }
    .btn { display: inline-block; background-color: #047857; color: #ffffff !important; padding: 12px 24px; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 6px; margin: 16px 0; }
    .badge { display: inline-block; padding: 4px 10px; font-size: 12px; font-weight: 600; border-radius: 9999px; }
    .badge-success { background-color: #dcfce7; color: #166534; }
    .badge-info { background-color: #e0f2fe; color: #075985; }
    .badge-warning { background-color: #fef3c7; color: #92400e; }
    .badge-danger { background-color: #fee2e2; color: #991b1b; }
    .item-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .item-table th { background-color: #f8fafc; color: #475569; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; padding: 10px 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
    .item-table td { padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
    .summary-table { width: 100%; margin-top: 16px; border-collapse: collapse; }
    .summary-table td { padding: 6px 12px; font-size: 14px; }
    .summary-table .total-row td { font-weight: 700; font-size: 16px; color: #064e3b; border-top: 2px solid #e2e8f0; padding-top: 12px; }
    .advisory-box { background-color: #f0fdf4; border-left: 4px solid #047857; padding: 14px 16px; margin: 20px 0; border-radius: 0 6px 6px 0; font-size: 13px; color: #166534; }
    .address-card { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; margin: 16px 0; font-size: 13px; }
    @media only screen and (max-width: 600px) {
      .content { padding: 20px 16px !important; }
      .header { padding: 20px 16px !important; }
      .item-table th, .item-table td { padding: 8px 6px !important; }
    }
  </style>
</head>
<body>
  <div style="background-color: #f8fafc; padding: 24px 12px;">
    <div class="email-container">
      <!-- Header -->
      <div class="header">
        <h1>🌱 GLOROV BOTANICAL GARDEN</h1>
        <p>Premium Viability Seeds & Nurtured Botanical Plants • Pune Nursery Hub</p>
      </div>

      <!-- Main Body Content -->
      <div class="content">
        ${options.contentHtml}
      </div>

      <!-- Footer -->
      <div class="footer">
        <p style="margin: 0 0 8px 0; font-weight: 600; color: #334155;">Customer Support & Botanical Inquiries</p>
        <p style="margin: 0 0 12px 0;">
          Questions about your order, germination, or transit status? Contact our botanical support team at
          <a href="mailto:${escapeHtml(supportEmail)}">${escapeHtml(supportEmail)}</a>.
          <br>Please quote your order reference in all inquiries for expedited assistance.
        </p>
        <p style="margin: 12px 0 8px 0; font-size: 11px; color: #94a3b8;">
          🔒 Security Notice: GLOROV will never request your bank account password, card CVV, or UPI PIN via email.
        </p>
        <p style="margin: 0; font-size: 11px; color: #94a3b8;">
          This is an automated transactional notification regarding your GLOROV order. Transactional emails cannot be unsubscribed from.
        </p>
      </div>
    </div>
  </div>
</body>
</html>`
}

export function renderBaseText(options: BaseLayoutOptions): string {
  const supportEmail = options.supportEmail || DEFAULT_SUPPORT_EMAIL

  return `============================================================
GLOROV BOTANICAL GARDEN
Premium Viability Seeds & Living Plants • Pune Nursery Hub
============================================================

${options.title}
------------------------------------------------------------

${options.contentText}

------------------------------------------------------------
CUSTOMER SUPPORT:
Questions about your order, germination, or transit status?
Email our botanical team: ${supportEmail}
Please quote your order reference in all inquiries for expedited assistance.

SECURITY NOTICE:
GLOROV will never request your banking password, card CVV, or UPI PIN via email.

This is an automated transactional notification regarding your GLOROV order.

============================================================`
}

export function escapeHtml(str: unknown): string {
  if (str === null || str === undefined) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
