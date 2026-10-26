import nodemailer, { type Transporter } from 'nodemailer'
import type { SmtpConfig, SentEmailRecord } from '../types'

/**
 * Standard Nodemailer SMTP Transport for production and external staging environments.
 */
export class SmtpEmailTransport {
  private transporter: Transporter

  constructor(config: SmtpConfig) {
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port || 587,
      secure: config.secure ?? false,
      auth:
        config.user && config.password
          ? {
              user: config.user,
              pass: config.password,
            }
          : undefined,
      connectionTimeout: 10000,
      greetingTimeout: 5000,
      socketTimeout: 10000,
    })
  }

  public async send(record: SentEmailRecord): Promise<{ id: string }> {
    const info = await this.transporter.sendMail({
      from: record.from,
      to: record.to,
      replyTo: record.replyTo,
      subject: record.subject,
      html: record.html,
      text: record.text,
      headers: {
        'X-GLOROV-Notification-ID': record.id,
        'X-Entity-Ref-ID': record.id,
        'X-Auto-Response-Suppress': 'All',
      },
    })

    return { id: info.messageId || record.id }
  }

  public async verify(): Promise<boolean> {
    try {
      await this.transporter.verify()
      return true
    } catch {
      return false
    }
  }
}
