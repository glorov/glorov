/**
 * GLOROV Storefront Application Security Utilities
 */

/**
 * Validates and sanitizes a URL to prevent Open Redirect attacks.
 * Ensures the target destination is strictly a safe relative path on the same origin.
 * Rejects external URLs (http/https), protocol-relative URLs (//), backslash evasions (/\),
 * and dangerous URI schemes (javascript:, data:).
 */
export function getSafeRedirectUrl(
  url: string | null | undefined,
  defaultUrl: string = '/account'
): string {
  if (!url || typeof url !== 'string') {
    return defaultUrl
  }

  const trimmed = url.trim()

  // Must begin with a single slash '/'
  if (!trimmed.startsWith('/')) {
    return defaultUrl
  }

  // Reject protocol-relative URLs (e.g. //evil.com) and backslash evasions (e.g. /\evil.com, /\\evil.com)
  if (trimmed.startsWith('//') || trimmed.startsWith('/\\') || trimmed.startsWith('\\')) {
    return defaultUrl
  }

  // Reject control characters and dangerous protocols embedded in relative format
  if (/[\r\n\t]/.test(trimmed)) {
    return defaultUrl
  }

  // Double check that URL constructor doesn't parse it as external with arbitrary host
  try {
    const parsed = new URL(trimmed, 'https://glorov.in')
    if (parsed.origin !== 'https://glorov.in') {
      return defaultUrl
    }
  } catch {
    return defaultUrl
  }

  return trimmed
}
