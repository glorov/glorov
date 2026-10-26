/**
 * GLOROV Storefront Environment Configuration Validator
 * Ensures that client bundles never leak backend secrets and that production
 * environments have valid, HTTPS endpoints and publishable keys.
 */

export interface StorefrontEnvConfig {
  backendUrl: string
  publishableKey: string
  baseUrl: string
  siteName: string
}

export function validateStorefrontEnv(
  env: Record<string, string | undefined> = process.env
): { valid: boolean; errors: string[]; config: StorefrontEnvConfig } {
  const errors: string[] = []
  const isProduction = env.NODE_ENV === 'production'

  // 1. Check for accidental secret leakage in public environment variables
  for (const [key, value] of Object.entries(env)) {
    if (key.startsWith('NEXT_PUBLIC_') && value) {
      const lowerKey = key.toLowerCase()
      if (
        lowerKey.includes('secret') ||
        lowerKey.includes('password') ||
        lowerKey.includes('token') ||
        lowerKey.includes('private') ||
        lowerKey.includes('jwt') ||
        lowerKey.includes('smtp')
      ) {
        errors.push(
          `Security Violation: Public environment variable "${key}" appears to contain private secrets or credentials.`
        )
      }
    }
  }

  // 2. Validate backend URL
  const backendUrl = env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'
  try {
    const parsed = new URL(backendUrl)
    if (isProduction) {
      if (parsed.protocol !== 'https:' && !parsed.hostname.includes('localhost')) {
        errors.push(
          `Insecure Configuration: NEXT_PUBLIC_MEDUSA_BACKEND_URL must use HTTPS in production (received "${backendUrl}").`
        )
      }
    }
  } catch {
    errors.push(
      `Invalid Configuration: NEXT_PUBLIC_MEDUSA_BACKEND_URL is not a valid URL ("${backendUrl}").`
    )
  }

  // 3. Validate publishable key
  const publishableKey = env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ''
  if (isProduction) {
    if (!publishableKey || publishableKey.includes('replace_with')) {
      errors.push(
        'Missing Configuration: NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY is required in production and must not be a placeholder.'
      )
    }
  }

  const baseUrl = env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const siteName = env.NEXT_PUBLIC_SITE_NAME || 'GLOROV — Indian Seeds & Live Plants'

  return {
    valid: errors.length === 0,
    errors,
    config: {
      backendUrl,
      publishableKey,
      baseUrl,
      siteName,
    },
  }
}
