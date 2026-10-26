/**
 * RFC 5322 compliant email regex pattern (simplified and hardened against ReDoS and CRLF injection).
 * Ensures standard user@domain.tld formatting while preventing header injection.
 */
const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/

/**
 * Validate that an email address is syntactically sound and free of injection characters.
 */
export function isValidEmail(email: string | null | undefined): boolean {
  if (!email || typeof email !== 'string') return false
  // Disallow CRLF / newline / tab injection anywhere in raw string
  if (/[\r\n\t]/.test(email)) return false

  const trimmed = email.trim()
  if (trimmed.length === 0 || trimmed.length > 254) return false

  return EMAIL_REGEX.test(trimmed)
}

/**
 * Mask email address for safe, privacy-preserving logging.
 * Example: 'aarav.patel@glorov.in' -> 'a***l@glorov.in'
 * Example: 'me@example.com' -> 'm***e@example.com'
 */
export function maskEmail(email: string | null | undefined): string {
  if (!email || typeof email !== 'string') return '***'
  const trimmed = email.trim()
  const parts = trimmed.split('@')
  if (parts.length !== 2) return '***'

  const [local, domain] = parts
  if (local.length <= 2) {
    return `${local[0] || '*'}***@${domain}`
  }

  return `${local[0]}***${local[local.length - 1]}@${domain}`
}
