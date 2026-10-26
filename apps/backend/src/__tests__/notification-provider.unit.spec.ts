import { EmailNotificationProviderService } from '../modules/notification-email/service'
import { MockEmailTransport } from '../modules/notification-email/transports/mock-transport'
import { isValidEmail, maskEmail } from '../modules/notification-email/utils/email-validator'

describe('Email Notification Provider & Delivery Engine', () => {
  let provider: EmailNotificationProviderService

  beforeEach(() => {
    MockEmailTransport.clear()
    provider = new EmailNotificationProviderService(
      {
        logger: {
          info: jest.fn(),
          warn: jest.fn(),
          error: jest.fn(),
          debug: jest.fn(),
        } as any,
      },
      {
        channels: ['email'],
        from: 'orders@glorov.in',
        from_name: 'GLOROV Botanical Garden',
        reply_to: 'care@glorov.in',
        mock_mode: true,
      }
    )
  })

  describe('Recipient Email Address Validation & Security', () => {
    it('should accept valid RFC 5322 compliant email addresses', () => {
      expect(isValidEmail('aarav.patel@glorov.in')).toBe(true)
      expect(isValidEmail('customer+botanical@example.co.in')).toBe(true)
      expect(isValidEmail('nursery_support@sub.domain.org')).toBe(true)
    })

    it('should reject invalid or malformed email addresses', () => {
      expect(isValidEmail('')).toBe(false)
      expect(isValidEmail('not-an-email')).toBe(false)
      expect(isValidEmail('missing-domain@')).toBe(false)
      expect(isValidEmail('@missing-local.com')).toBe(false)
      expect(isValidEmail('spaces in@address.com')).toBe(false)
      expect(isValidEmail('two@@at-signs.com')).toBe(false)
      expect(isValidEmail(null as any)).toBe(false)
      expect(isValidEmail(undefined as any)).toBe(false)
    })

    it('should strictly reject CRLF header injection attempts', () => {
      expect(isValidEmail('victim@glorov.in\r\nBcc:attacker@evil.com')).toBe(false)
      expect(isValidEmail('victim@glorov.in\nSubject:Injected')).toBe(false)
      expect(isValidEmail('victim@glorov.in\t')).toBe(false)
    })
  })

  describe('Privacy-Preserving Email Masking (maskEmail)', () => {
    it('should mask standard email addresses preserving initial and trailing characters', () => {
      expect(maskEmail('aarav.patel@glorov.in')).toBe('a***l@glorov.in')
      expect(maskEmail('priya@example.com')).toBe('p***a@example.com')
      expect(maskEmail('me@glorov.in')).toBe('m***@glorov.in')
    })

    it('should handle undefined or malformed values gracefully', () => {
      expect(maskEmail(null)).toBe('***')
      expect(maskEmail('')).toBe('***')
      expect(maskEmail('invalid-email')).toBe('***')
    })
  })

  describe('Provider Dispatch & Mock Transport', () => {
    it('should dispatch an email using a registered template and store it in MockEmailTransport', async () => {
      const result = await provider.send({
        to: 'aarav.patel@glorov.in',
        channel: 'email',
        template: 'order-placed',
        data: {
          order: {
            id: 'order_test_01',
            display_id: 1001,
            total: 99900,
          },
        },
      })

      expect(result).toHaveProperty('id')
      expect(typeof result.id).toBe('string')

      const sentEmails = MockEmailTransport.getSentEmails()
      expect(sentEmails.length).toBe(1)

      const last = MockEmailTransport.getLastEmail()
      expect(last?.to).toBe('aarav.patel@glorov.in')
      expect(last?.from).toContain('orders@glorov.in')
      expect(last?.subject).toContain('#1001')
      expect(last?.html).toContain('GLOROV BOTANICAL GARDEN')
      expect(last?.text).toContain('GLOROV BOTANICAL GARDEN')
    })

    it('should dispatch an email using pre-rendered content', async () => {
      const result = await provider.send({
        to: 'kavita@glorov.in',
        channel: 'email',
        template: 'custom',
        content: {
          subject: 'Direct Dispatch Notice',
          html: '<p>Direct HTML Content</p>',
          text: 'Direct Plain Text Content',
        } as any,
      })

      expect(result.id).toBeDefined()
      const last = MockEmailTransport.getLastEmail()
      expect(last?.subject).toBe('Direct Dispatch Notice')
      expect(last?.html).toBe('<p>Direct HTML Content</p>')
      expect(last?.text).toBe('Direct Plain Text Content')
    })

    it('should throw MedusaError when recipient address is invalid', async () => {
      await expect(
        provider.send({
          to: 'invalid-email-no-domain',
          channel: 'email',
          template: 'order-placed',
        })
      ).rejects.toThrow('Invalid recipient email address')

      expect(MockEmailTransport.getSentEmails().length).toBe(0)
    })

    it('should throw MedusaError when neither template nor content is provided', async () => {
      await expect(
        provider.send({
          to: 'aarav@glorov.in',
          channel: 'email',
          template: '',
        })
      ).rejects.toThrow('must provide either a template name or pre-rendered content')
    })
  })

  describe('Transient Provider Failure & Retry Behavior', () => {
    it('should handle temporary transport failure and allow safe retry', async () => {
      // Simulate 1 temporary network/SMTP outage
      MockEmailTransport.simulateFailure(1, new Error('ECONNRESET: SMTP connection dropped'))

      // First attempt must fail
      await expect(
        provider.send({
          to: 'aarav@glorov.in',
          channel: 'email',
          template: 'order-placed',
          data: { order: { id: 'order_retry_test', display_id: 1002 } },
        })
      ).rejects.toThrow('ECONNRESET: SMTP connection dropped')

      expect(MockEmailTransport.getSentEmails().length).toBe(0)

      // Retry attempt must succeed
      const retryResult = await provider.send({
        to: 'aarav@glorov.in',
        channel: 'email',
        template: 'order-placed',
        data: { order: { id: 'order_retry_test', display_id: 1002 } },
      })

      expect(retryResult.id).toBeDefined()
      expect(MockEmailTransport.getSentEmails().length).toBe(1)
      expect(MockEmailTransport.getLastEmail()?.to).toBe('aarav@glorov.in')

      // Delivery attempts audit trail must record both the failure and the subsequent success
      const attempts = MockEmailTransport.getDeliveryAttempts()
      expect(attempts.length).toBe(2)

      const failedAttempt = MockEmailTransport.getFailedAttempts()[0]
      expect(failedAttempt).toBeDefined()
      expect(failedAttempt.status).toBe('failure')
      expect(failedAttempt.error).toContain('ECONNRESET')
      expect(failedAttempt.toMasked).toBe('a***v@glorov.in')

      const successAttempt = MockEmailTransport.getSuccessfulAttempts()[0]
      expect(successAttempt).toBeDefined()
      expect(successAttempt.status).toBe('success')
      expect(successAttempt.toMasked).toBe('a***v@glorov.in')
    })
  })

  describe('Provider Option Validation (validateOptions)', () => {
    it('should validate valid options without error', () => {
      expect(() =>
        EmailNotificationProviderService.validateOptions({
          channels: ['email'],
          from: 'orders@glorov.in',
        })
      ).not.toThrow()
    })

    it('should throw MedusaError when channels is not an array', () => {
      expect(() =>
        EmailNotificationProviderService.validateOptions({
          channels: 'email' as any,
        })
      ).toThrow('must be an array')
    })

    it('should throw MedusaError when from email is invalid', () => {
      expect(() =>
        EmailNotificationProviderService.validateOptions({
          from: 'invalid-email-address',
        })
      ).toThrow('Invalid sender email')
    })
  })
})

