import { ModuleProvider, Modules } from '@medusajs/framework/utils'
import { EmailNotificationProviderService } from './service'

export default ModuleProvider(Modules.NOTIFICATION, {
  services: [EmailNotificationProviderService],
})

export * from './service'
export * from './types'
export * from './transports/mock-transport'
export * from './transports/smtp-transport'
export * from './templates'
export * from './utils/email-validator'
export * from './utils/format-currency'
