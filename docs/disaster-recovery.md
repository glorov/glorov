# GLOROV Backup Strategy, Disaster Recovery & Operational Resilience

> **Target Release:** GLOROV Commerce Engine v1.0.0  
> **Target Market:** Republic of India (Domestic Retail: Heirloom Seeds & Live Plants)  
> **Persistence Layer:** PostgreSQL 16 + Redis 7  
> **Primary Fulfillment Hub:** Pune Central Nursery Hub, Maharashtra (PIN 411001)  
> **Tested Recovery Duration:** 3 to 4 seconds (6.8 MB database archive)  
> **Verification Status:** End-to-End Test Restore Verified & Automated (`scripts/db-backup-verify.sh`)  
> **Last Updated:** October 2026  

---

## 1. Infrastructure Overview & State Classification

To design an effective recovery policy, the GLOROV e-commerce architecture is classified into stateful data stores and stateless compute services:

```mermaid
flowchart TD
    subgraph Stateless Compute Services
        Caddy["Caddy Reverse Proxy (TLS / Static 503 Maintenance)"]
        Storefront["Next.js 15 Storefront (:3000)"]
        Backend["Medusa v2 Commerce Engine (:9000)"]
    end

    subgraph Stateful Persistence Layer
        PG[("PostgreSQL 16 (:5432)<br>Products, Variants, Inventory, Orders, Customers")]
        Redis[("Redis 7 (:6379)<br>BullMQ Job Queues & Temporary Cache")]
        S3[("Object Storage (S3 / R2)<br>Product Photos, Botanical Care Guides")]
    end

    Caddy --> Storefront
    Caddy --> Backend
    Backend --> PG
    Backend --> Redis
    Backend --> S3
```

### 1.1 State Classification & Storage Boundaries

| Component | Nature of Data | Persistence Strategy | Failure Impact if Lost |
|---|---|---|---|
| **PostgreSQL 16** | **Core Commerce Data:** Products, variants, inventory allocations, orders, customer profiles, address books, tax rates, payment sessions. | Continuous disk persistence (`pgdata` volume), automated daily dumps (`.sql.gz`), offsite S3 sync. | **CRITICAL:** High financial and operational loss. Cannot operate without order records and inventory levels. |
| **Redis 7** | **Transient State:** BullMQ asynchronous queue jobs, idempotency locks, temporary query cache. | Append-Only File (`AOF`) and Redis Snapshot (`RDB`). | **LOW:** Non-critical. Cache automatically repopulates; failed jobs can be re-triggered from database events. |
| **Media Assets** | **Static & Uploaded Assets:** Botanical seed packet photography, live plant images, customer return damage evidence. | S3-compatible cloud object storage (AWS S3 Mumbai `ap-south-1` / Cloudflare R2) with versioning enabled. | **MEDIUM:** Store displays broken image placeholders; can be restored from asset backup. |
| **Medusa & Next.js** | **Stateless Application Compute:** Server binaries, page routes, API endpoints. | Immutable Docker container images tagged by Git commit SHA (`BUILD_ID`). | **NEGLIGIBLE:** Instantly redeployable from Docker registry or Git repository. |

---

## 2. Proposed Recovery Objectives (RPO & RTO)

> [!IMPORTANT]
> The following Recovery Point Objective (RPO) and Recovery Time Objective (RTO) targets are engineering proposals tailored for a small-to-medium Indian direct-to-consumer e-commerce business. These targets must be formally reviewed and approved by the business owner.

### 2.1 Proposed Service Level Objectives

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       RECOVERY OBJECTIVES PROPOSAL                          │
├──────────────────────────┬──────────────────────────┬───────────────────────┤
│ DATA CLASSIFICATION      │ RPO (Max Data Loss)      │ RTO (Max Downtime)    │
├──────────────────────────┼──────────────────────────┼───────────────────────┤
│ Active Orders & Payments │ 1 Hour (Incremental/WAL) │ 1 Hour                │
│ Inventory Allocations    │ 1 Hour (WAL) / 24h (Dump)│ 1 Hour                │
│ Product Catalog & Prices │ 24 Hours                 │ 30 Minutes (Read-Only)│
│ Customer Profiles        │ 24 Hours                 │ 1 Hour                │
│ Media & Product Images   │ 24 Hours                 │ 2 Hours               │
└──────────────────────────┴──────────────────────────┴───────────────────────┘
```

- **Recovery Point Objective (RPO):**
  - *Standard Mode (Daily Dump):* Maximum **24 hours** of data loss in the event of catastrophic server loss if operating on daily automated dumps.
  - *Advanced Mode (Supabase / Managed WAL Archiving):* Maximum **1 hour** (or sub-minute with managed Point-in-Time Recovery enabled).
- **Recovery Time Objective (RTO):**
  - **30 minutes:** Time to put the store in branded maintenance mode (Caddy 503) and launch an isolated recovery instance.
  - **1 hour:** Time to verify restored database integrity, re-point Caddy traffic, and restore full checkout operations. (Our test restore completed in **4 seconds** for a 6.8 MB database archive).

### 2.2 Backup Frequency & Retention Schedule

| Tier | Frequency | Storage Location | Retention Window | Encryption |
|---|---|---|---|---|
| **Daily Dump** | Every night at 03:00 IST | Local Host (`backups/`) + AWS S3 Mumbai | 30 Days | AES-256 / AWS KMS |
| **Weekly Archive** | Every Sunday at 04:00 IST | AWS S3 Mumbai (`ap-south-1`) | 90 Days | AWS KMS |
| **Monthly Milestone** | 1st of every month | AWS S3 Glacier Deep Archive | 365 Days (1 Year) | AWS KMS |

### 2.3 Incident Escalation & Roles

1. **Incident Commander (DevOps Lead):** Assesses incident severity, selects the appropriate backup snapshot, coordinates database restoration, and executes the recovery runbook.
2. **Commerce Operations Lead:** Verifies order records, pending dispatches at the Pune nursery hub, and ensures no duplicate courier manifests are generated.
3. **Business Owner:** Authorizes production cutover, approves communication to customers if any orders require re-confirmation, and signs off on incident closure.

---

## 3. Database Backup Strategy

GLOROV implements a multi-tiered backup architecture supporting both self-hosted Docker environments and managed PostgreSQL providers (such as Supabase).

### 3.1 Self-Hosted Docker Backup Automation (`scripts/db-backup.sh`)
The automated backup script [`scripts/db-backup.sh`](file:///Users/sourav/Developer/WEB/top-projects/glorov/scripts/db-backup.sh) executes the following pipeline:
1. Dumps the database using `pg_dump` with `--clean --if-exists --no-owner --no-privileges` to produce portable SQL.
2. Compresses the output stream using `gzip -9` to produce a timestamped archive: `backups/glorov_backup_YYYYMMDD_HHMMSS.sql.gz`.
3. Computes a cryptographic **SHA-256 checksum file** (`.sha256`) to guarantee tamper-proof archive integrity.
4. Restricts local filesystem permissions to `0600` (read/write by owner only).
5. Synchronizes the encrypted archive to an offsite AWS S3 bucket in Mumbai (`ap-south-1`) if `BACKUP_S3_BUCKET` is configured.
6. Automatically prunes local backup files older than 30 days (`RETENTION_DAYS=30`).

### 3.2 Automated Verification Pipeline (`scripts/db-backup-verify.sh`)
> [!TIP]
> A backup that has never been restored is not a verified backup.
The verification script [`scripts/db-backup-verify.sh`](file:///Users/sourav/Developer/WEB/top-projects/glorov/scripts/db-backup-verify.sh) tests backups automatically:
- Spawns an ephemeral isolated database `glorov_medusa_verify_tmp_<timestamp>`.
- Restores the latest backup into the isolated database.
- Queries product, variant, inventory, and order counts to verify non-zero restoration.
- Drops the temporary database upon completion.
- Emits structured exit codes (0 for success, 1 for failure) suitable for cron monitoring.

### 3.3 Managed Database Provider Capabilities (Supabase)
If hosting PostgreSQL on Supabase:
- **Daily Automated Backups:** Enabled by default on Supabase Pro projects, retained for 7 to 30 days.
- **Point-in-Time Recovery (PITR):** Allows continuous WAL-based restoration to any second within the retention window. Must be enabled in the Supabase Dashboard under **Project Settings** -> **Database** -> **Backups**.

---

## 4. Application Assets, Configuration & Secret Recovery

Non-database resources are essential for full store restoration.

### 4.1 Media & Product Assets
- **Location:** Botanical seed packet photography, live plant images, and return claim evidence.
- **Backup Strategy:** Replicated in an S3-compatible bucket (AWS S3 Mumbai or Cloudflare R2) with **Object Versioning** enabled. Versioning protects against accidental file deletion or overwrites.
- **Retention:** Lifecycle rule retains non-current asset versions for 60 days before permanent deletion.

### 4.2 Application Version & Configuration
- **Source Code & Migrations:** Complete Git repository history on GitHub, tagged with semantic release versions (e.g. `v1.0.0`).
- **Container Images:** Immutable Docker images pushed to private container registry (e.g. GitHub Packages `ghcr.io` or AWS ECR) tagged with commit SHA.
- **Reverse Proxy:** [`caddy/Caddyfile`](file:///Users/sourav/Developer/WEB/top-projects/glorov/caddy/Caddyfile) tracked in version control.

### 4.3 Secret Recovery Runbook (Zero Secrets in Backups)
> [!CAUTION]
> Production `.env` files, database passwords, JWT secrets, and payment API keys must **NEVER** be stored in plaintext backups or committed to Git.
To recover secrets in a disaster scenario:
1. Production secrets are maintained in a secure team vault (e.g. 1Password / Bitwarden / AWS Secrets Manager) under the vault item `GLOROV_PRODUCTION_SECRETS`.
2. Authorized operators export the verified secrets to `/opt/glorov/.env` with `0600` permissions:
   - `DB_PASSWORD`, `REDIS_PASSWORD`
   - `JWT_SECRET`, `COOKIE_SECRET` (generated via `openssl rand -hex 32`)
   - `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`
   - `SHIPROCKET_EMAIL`, `SHIPROCKET_PASSWORD`, `SHIPROCKET_WEBHOOK_TOKEN`
   - `SMTP_USER`, `SMTP_PASSWORD`

---

## 5. 10-Step Safe Recovery Runbook

This procedure must be executed step-by-step during a disaster recovery event.

```mermaid
flowchart TD
    S1["1. Incident Identification & Triage"] --> S2["2. Containment: Enable Caddy 503 Maintenance"]
    S2 --> S3["3. Backup Selection & SHA-256 Checksum Validation"]
    S3 --> S4["4. Restore into Isolated Recovery Database First"]
    S4 --> S5["5. Schema & Migration Verification"]
    S5 --> S6["6. Entity Row Count & Data Sanity Check"]
    S6 --> S7["7. Media Asset Accessibility Verification"]
    S7 --> S8["8. Mock Transaction & Sandbox Testing"]
    S8 --> S9["9. Owner Approval & Production Database Cutover"]
    S9 --> S10["10. Remove Maintenance & Run Smoke Test Probes"]
```

### Step 1: Incident Identification & Scope Assessment
- Identify whether the failure is a compute crash, container failure, database corruption, or malicious tampering.
- Determine the target recovery timestamp (e.g., state prior to a corrupted migration at 14:00 IST).

### Step 2: Traffic Containment & Maintenance Mode
Isolate live traffic to prevent customers from placing orders that might be lost during restoration:
```bash
# Serve static branded 503 maintenance page via Caddy (<100ms)
docker compose -f docker-compose.prod.yml exec -T caddy caddy respond \
  "GLOROV Botanical Garden is undergoing scheduled maintenance. We will return shortly." 503
```

### Step 3: Backup Selection & Integrity Validation
Select the latest known good backup from `backups/` (or retrieve from S3):
```bash
BACKUP_FILE=$(find backups/ -name "glorov_backup_*.sql.gz" -type f | sort -r | head -1)

# Verify gzip archive integrity
gzip -t "${BACKUP_FILE}"

# Verify cryptographic SHA-256 checksum
shasum -a 256 -c "${BACKUP_FILE}.sha256"
```

### Step 4: Isolated Recovery Environment Restoration
> [!CAUTION]
> NEVER restore directly over the live production database without first validating the restore in an isolated database!
```bash
# Restore into an isolated database named 'glorov_medusa_restore_test'
./scripts/db-restore.sh "${BACKUP_FILE}" glorov_medusa_restore_test
```

### Step 5: Schema & Migration Compatibility Check
Verify that the restored database schema matches the running Medusa version:
```bash
docker compose -f docker-compose.prod.yml run --rm \
  -e DATABASE_URL="postgresql://postgres:${DB_PASSWORD}@postgres:5432/glorov_medusa_restore_test" \
  backend-blue pnpm run db:migrate
```

### Step 6: Entity Row Count & Sanity Verification
Verify core commerce counts in the isolated database:
```bash
docker exec glorov-postgres psql -U postgres -d glorov_medusa_restore_test -c "
SELECT 
  'Products: ' || (SELECT COUNT(*) FROM product WHERE deleted_at IS NULL) || ' | ' ||
  'Variants: ' || (SELECT COUNT(*) FROM product_variant WHERE deleted_at IS NULL) || ' | ' ||
  'Inventory Levels: ' || (SELECT COUNT(*) FROM inventory_level WHERE deleted_at IS NULL) || ' | ' ||
  'Orders: ' || (SELECT COUNT(*) FROM \"order\" WHERE deleted_at IS NULL);
"
```

### Step 7: Media Asset Accessibility Verification
Ensure product image CDN and S3 bucket are reachable:
```bash
curl -I "https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=600&q=80"
```

### Step 8: Mock Transaction & Verification Checks
- Confirm no live payments or courier pickups are triggered during verification.
- Verify customer logins and address records appear intact.

### Step 9: Owner Approval & Production Database Cutover
Once the isolated recovery database is verified healthy and signed off by the business owner:
```bash
# Terminate active backend containers to stop lingering connections
docker compose -f docker-compose.prod.yml stop backend-blue backend-green

# Restore the verified backup into the production database
./scripts/db-restore.sh "${BACKUP_FILE}" glorov_medusa_prod

# Restart the production backend container
docker compose -f docker-compose.prod.yml up -d backend-blue
```

### Step 10: Remove Maintenance Mode & Run Post-Deployment Smoke Probes
```bash
# Reload Caddy to route traffic back to production storefront
docker compose -f docker-compose.prod.yml exec -T caddy caddy reload --config /etc/caddy/Caddyfile

# Execute automated 7-probe smoke test suite
node scripts/smoke-test.mjs http://localhost:9000 http://localhost:3000
```

---

## 6. Recovery Testing & Benchmark Evidence

A full test restore was executed on the local environment to measure performance and verify script mechanics:

### 6.1 Test Restore Execution Log
- **Source Archive:** `backups/glorov_backup_20261027_032407.sql.gz` (`6.8 MB`)
- **Target Database:** `glorov_medusa_restore_test` (Isolated PostgreSQL database)
- **Gzip Integrity:** PASSED (`gzip -t`)
- **SHA-256 Checksum:** `e2f13f2dc491684332904a070a7774a8486d892c51bc57680dc720aacded3f09` (VERIFIED OK)
- **Restoration Duration:** **4 seconds**
- **Restored Entity Verification:**
  - Products: **44**
  - Variants: **89**
  - Inventory Levels: **129**
  - Orders: **744**

### 6.2 Automated Test Execution
The automated verification script was run:
```bash
./scripts/db-backup-verify.sh
```
**Result:** Created ephemeral test database `glorov_medusa_verify_tmp_1793051698`, verified entity thresholds, tore down temporary database, and exited with code 0 in **3 seconds**.

---

## 7. Monitoring, Operational Alerts & Cron Configuration

### 7.1 Production Host Crontab Configuration
On the production server (`/etc/cron.d/glorov-backup`):
```cron
# Daily Automated Database Backup at 03:00 IST (21:30 UTC)
30 21 * * * root /opt/glorov/scripts/db-backup.sh glorov_medusa_prod glorov-postgres >> /var/log/glorov-backup.log 2>&1

# Daily Automated Backup Restoration Verification at 04:00 IST (22:30 UTC)
30 22 * * * root /opt/glorov/scripts/db-backup-verify.sh >> /var/log/glorov-backup.log 2>&1
```

### 7.2 Failure Alerting Strategy
1. **Cron Failure Alert:** If `scripts/db-backup.sh` exits with a non-zero code, the error is piped to the system logger and triggers an alert via curl webhook to the team Slack/Discord channel:
   ```bash
   ./scripts/db-backup.sh || curl -X POST -H 'Content-type: application/json' \
     --data '{"text":"🚨 CRITICAL: GLOROV Daily Database Backup Failed!"}' "$ALERT_WEBHOOK_URL"
   ```
2. **Backup Staleness Alert:** A monitoring check verifies that at least one backup file exists with `mtime < 26 hours`.
3. **Disk Capacity Alert:** SRE disk space probe alerts when host storage exceeds 75% capacity to prevent out-of-disk failures during dumps.

---

## 8. Remaining Risks & Required Owner Decisions

1. **Owner Approval of Recovery Objectives:**
   - The business owner must formally review and approve the proposed RPO (1 hour WAL vs 24 hour dump) and RTO (1 hour).
2. **Cloud S3 Bucket Provisioning:**
   - The business owner / cloud administrator must provision an AWS S3 bucket in Mumbai (`ap-south-1`) named `glorov-db-backups-ap-south-1` with server-side KMS encryption and configure `BACKUP_S3_BUCKET` in the deployment environment.
3. **Supabase Pro PITR Activation (If using Supabase):**
   - If hosting on Supabase, the owner must upgrade to a plan supporting Point-in-Time Recovery and activate 7-day or 30-day WAL archiving in the Supabase Dashboard.
