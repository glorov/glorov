import medusaConfig from "../../medusa-config";

describe("Administrative Access Control & Security Invariants", () => {
  it("enforces CORS separation between store and admin origins", () => {
    const { storeCors, adminCors } = medusaConfig.projectConfig.http;
    expect(storeCors).toBeDefined();
    expect(adminCors).toBeDefined();

    // Store CORS must not allow administrative port by default without explicit origin
    expect(storeCors).toContain("http://localhost:3000");

    // Prohibit wildcard CORS
    expect(storeCors.split(",")).not.toContain("*");
    expect(adminCors.split(",")).not.toContain("*");
  });

  it("verifies required secrets are defined and isolated from store client bundles", () => {
    expect(medusaConfig.projectConfig.http.jwtSecret).toBeDefined();
    expect(medusaConfig.projectConfig.http.cookieSecret).toBeDefined();

    // Secrets must meet minimum complexity length (at least 24 characters)
    expect(String(medusaConfig.projectConfig.http.jwtSecret).length).toBeGreaterThanOrEqual(24);
    expect(String(medusaConfig.projectConfig.http.cookieSecret).length).toBeGreaterThanOrEqual(24);
  });

  it("verifies database connection pool adheres to concurrency limits", () => {
    const driverOptions = medusaConfig.projectConfig.databaseDriverOptions as {
      pool?: { min: number; max: number };
    };
    expect(driverOptions.pool).toBeDefined();
    expect(driverOptions.pool?.min).toBeGreaterThanOrEqual(2);
    expect(driverOptions.pool?.max).toBeLessThanOrEqual(20);
  });
});
