import { defineMiddlewares } from '@medusajs/framework/http'

/**
 * GLOROV Backend Global Middlewares
 * Extensible entry point for rate-limiting, CORS, and custom request processing.
 */
export default defineMiddlewares({
  routes: [],
})
