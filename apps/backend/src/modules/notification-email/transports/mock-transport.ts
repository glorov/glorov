import type { SentEmailRecord, DeliveryAttemptRecord } from '../types'
import { maskEmail } from '../utils/email-validator'

/**
 * In-memory Mock Email Transport for automated test suites and local development without SMTP.
 * Stores dispatched messages in a thread-safe inspection array and provides failure simulation.
 * Records all delivery attempts and failure reasons without exposing secrets.
 */
export class MockEmailTransport {
  private static sentEmails: SentEmailRecord[] = []
  private static deliveryAttempts: DeliveryAttemptRecord[] = []
  private static failNextCount = 0
  private static failError: Error | null = null

  public static async send(record: SentEmailRecord): Promise<{ id: string }> {
    if (this.failNextCount > 0) {
      this.failNextCount--
      const error = this.failError || new Error('Simulated SMTP connection timeout or network failure')
      this.deliveryAttempts.push({
        id: record.id,
        toMasked: maskEmail(record.to),
        template: record.template,
        status: 'failure',
        error: error.message,
        timestamp: new Date(),
      })
      throw error
    }

    this.sentEmails.push({ ...record })
    this.deliveryAttempts.push({
      id: record.id,
      toMasked: maskEmail(record.to),
      template: record.template,
      status: 'success',
      timestamp: new Date(),
    })
    return { id: record.id }
  }

  public static getSentEmails(): SentEmailRecord[] {
    return [...this.sentEmails]
  }

  public static getLastEmail(): SentEmailRecord | undefined {
    return this.sentEmails[this.sentEmails.length - 1]
  }

  public static getEmailsFor(recipient: string): SentEmailRecord[] {
    const target = (recipient || '').toLowerCase().trim()
    return this.sentEmails.filter((e) => e.to.toLowerCase().trim() === target)
  }

  public static getEmailsByTemplate(template: string): SentEmailRecord[] {
    return this.sentEmails.filter((e) => e.template === template)
  }

  public static getDeliveryAttempts(): DeliveryAttemptRecord[] {
    return [...this.deliveryAttempts]
  }

  public static getFailedAttempts(): DeliveryAttemptRecord[] {
    return this.deliveryAttempts.filter((a) => a.status === 'failure')
  }

  public static getSuccessfulAttempts(): DeliveryAttemptRecord[] {
    return this.deliveryAttempts.filter((a) => a.status === 'success')
  }

  public static clear(): void {
    this.sentEmails = []
    this.deliveryAttempts = []
    this.failNextCount = 0
    this.failError = null
  }

  public static simulateFailure(count = 1, error?: Error): void {
    this.failNextCount = count
    this.failError = error || new Error('Simulated SMTP transport error')
  }
}

