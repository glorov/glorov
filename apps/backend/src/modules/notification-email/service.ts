import { AbstractNotificationProviderService, MedusaError } from '@medusajs/framework/utils'
import type { Logger } from '@medusajs/framework/types'
import type {
  ProviderSendNotificationDTO,
  ProviderSendNotificationResultsDTO,
} from '@medusajs/framework/types'
import type { EmailNotificationOptions, SentEmailRecord } from './types'
import { isValidEmail, maskEmail } from './utils/email-validator'
import { renderTemplate } from './templates'
import { MockEmailTransport } from './transports/mock-transport'
import { SmtpEmailTransport } from './transports/smtp-transport'

type InjectedDependencies = {
  logger?: Logger
}

export class EmailNotificationProviderService extends AbstractNotificationProviderService {
  public static identifier = 'email-notification'

  public static validateOptions(options: Record<any, any>): void {
    if (!options) return
    if (options.channels && !Array.isArray(options.channels)) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        'Notification provider option "channels" must be an array of strings'
      )
    }
    if (options.from && !isValidEmail(options.from)) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Invalid sender email in notification provider options: ${options.from}`
      )
    }
  }

  private options: EmailNotificationOptions
  private logger?: Logger
  private smtpTransport?: SmtpEmailTransport

  constructor(container: InjectedDependencies, options: EmailNotificationOptions) {
    super()

    this.options = options
    this.logger = container.logger

    // Automatically use Mock mode in automated tests, when mock_mode=true, or when SMTP host is unconfigured
    const isMock =
      options.mock_mode === true ||
      process.env.NODE_ENV === 'test' ||
      process.env.NOTIFICATION_MOCK_MODE === 'true' ||
      !options.smtp?.host

    if (!isMock && options.smtp?.host) {
      this.smtpTransport = new SmtpEmailTransport(options.smtp)
    }
  }

  public async send(
    notification: ProviderSendNotificationDTO
  ): Promise<ProviderSendNotificationResultsDTO> {
    const to = notification.to
    if (!to || !isValidEmail(to)) {
      const masked = maskEmail(to)
      this.logger?.warn?.(
        `[EmailNotificationProvider] Notification rejected: invalid recipient email address "${masked}"`
      )
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Invalid recipient email address: ${masked}`
      )
    }

    const fromAddress =
      notification.from ||
      (this.options.from_name
        ? `"${this.options.from_name}" <${this.options.from || 'orders@glorov.in'}>`
        : this.options.from || 'orders@glorov.in')

    let subject = ''
    let html = ''
    let text = ''

    if (notification.content) {
      // Content pre-rendered by caller
      const content = notification.content as any
      subject = content.subject || 'GLOROV Botanical Notification'
      html = content.html || content.body || ''
      text = content.text || content.body || ''
    } else if (notification.template) {
      // Render via GLOROV template engine
      const rendered = renderTemplate(notification.template, (notification.data || {}) as any)
      subject = rendered.subject
      html = rendered.html
      text = rendered.text
    } else {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        'Notification payload must provide either a template name or pre-rendered content'
      )
    }

    const notificationId = `email_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    const record: SentEmailRecord = {
      id: notificationId,
      to,
      from: fromAddress,
      replyTo: this.options.reply_to || 'care@glorov.in',
      subject,
      html,
      text,
      template: notification.template,
      timestamp: new Date(),
      metadata: (notification.data || {}) as Record<string, unknown>,
    }

    this.logger?.info?.(
      `[EmailNotificationProvider] Dispatching notification to ${maskEmail(to)}: template="${notification.template || 'custom'}"`
    )

    try {
      if (this.smtpTransport) {
        const result = await this.smtpTransport.send(record)
        this.logger?.info?.(
          `[EmailNotificationProvider] SMTP delivery success to ${maskEmail(to)} (id: ${result.id})`
        )
        return { id: result.id }
      } else {
        const result = await MockEmailTransport.send(record)
        this.logger?.info?.(
          `[EmailNotificationProvider] Mock delivery recorded to ${maskEmail(to)} (id: ${result.id})`
        )
        return { id: result.id }
      }
    } catch (err: any) {
      this.logger?.error?.(
        `[EmailNotificationProvider] Delivery failed to ${maskEmail(to)}: ${err.message}`
      )
      throw err
    }
  }

  public getOptions(): EmailNotificationOptions {
    return this.options
  }
}
