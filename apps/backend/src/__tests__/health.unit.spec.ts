import medusaConfig from '../../medusa-config'

describe('Medusa Backend Health & Configuration', () => {
  it('loads valid projectConfig with required secrets and database URL', () => {
    expect(medusaConfig).toBeDefined()
    expect(medusaConfig.projectConfig).toBeDefined()
    expect(medusaConfig.projectConfig.databaseUrl).toBeDefined()
    expect(medusaConfig.projectConfig.http.jwtSecret).toBeDefined()
    expect(medusaConfig.projectConfig.http.cookieSecret).toBeDefined()
  })

  it('enforces PostgreSQL connection pool limits according to architecture specification', () => {
    const driverOptions = medusaConfig.projectConfig.databaseDriverOptions as {
      pool?: { min: number; max: number }
    }
    expect(driverOptions).toBeDefined()
    expect(driverOptions.pool).toBeDefined()
    expect(driverOptions.pool?.min).toBeGreaterThanOrEqual(2)
    expect(driverOptions.pool?.max).toBeLessThanOrEqual(20)
  })

  it('strictly prohibits wildcard CORS in compliance with security guidelines', () => {
    const { storeCors, adminCors, authCors } = medusaConfig.projectConfig.http
    expect(storeCors).not.toContain('*')
    expect(adminCors).not.toContain('*')
    expect(authCors).not.toContain('*')

    // Must allow storefront on port 3000
    expect(storeCors).toContain('http://localhost:3000')
  })
})
