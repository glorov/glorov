# GLOROV SSH Key Management & Rotation Runbook

**Reference Issue:** `GLOROV-DEPLOY-005` (MEDIUM)  
**Applicability:** Production & Staging Azure VMs, GitHub Actions CI/CD Pipeline

---

## 1. Current Architecture & Setup

GLOROV's automated continuous deployment pipeline ([`.github/workflows/deploy.yml`](file:///.github/workflows/deploy.yml)) interacts with the production Azure VM via an OpenSSH private key stored in GitHub Secrets.

### Secret Inventory
- **`AZURE_SSH_KEY`** (fallback: `SERVER_SSH_KEY`): Ed25519 or RSA-4096 private key used by the GitHub Actions runner.
- **`AZURE_HOST`**: Production server IP address (`20.244.48.139`).
- **`AZURE_USER`**: Deployment user (`elsesourav`).

On the VM, the corresponding public key is appended to `/home/elsesourav/.ssh/authorized_keys`.

---

## 2. Security Policy & Rotation Schedule

> [!IMPORTANT]
> Static deployment credentials pose credential leakage risks if unmonitored.
> - **Mandatory Rotation:** Every **90 days**.
> - **Immediate Emergency Rotation:** Triggered on any suspected developer machine compromise or GitHub token leak.
> - **Algorithm Requirement:** **Ed25519** (`ssh-ed25519`) only. Do not use legacy RSA or DSA keys.

---

## 3. Step-by-Step 90-Day Key Rotation Procedure

Follow this zero-downtime, safe overlap procedure to rotate keys without locking GitHub Actions out of the server.

### Step 1: Generate a New Ed25519 Key Pair Locally
```bash
# Generate key pair with timestamp label
ssh-keygen -t ed25519 \
  -C "github-actions-deploy-$(date +%Y%m%d)" \
  -f ~/.ssh/glorov_deploy_new \
  -N ""
```
This generates:
- `~/.ssh/glorov_deploy_new` (Private Key)
- `~/.ssh/glorov_deploy_new.pub` (Public Key)

### Step 2: Append New Public Key to the Azure VM
Connect to the server using your personal administrator key or existing session:
```bash
# Copy new public key to server authorized_keys
cat ~/.ssh/glorov_deploy_new.pub | ssh elsesourav@20.244.48.139 "mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"
```
*Note: Both old and new public keys are now authorized, ensuring zero interruption during transition.*

### Step 3: Test New Key from Local Terminal
Verify that the newly created key can authenticate directly:
```bash
ssh -i ~/.ssh/glorov_deploy_new -o IdentitiesOnly=yes elsesourav@20.244.48.139 "echo 'Authentication Successful!'"
```

### Step 4: Update GitHub Actions Repository Secrets
1. Navigate to: `https://github.com/elsesourav/glorov/settings/secrets/actions`
2. Update (or overwrite) secret `AZURE_SSH_KEY` with the exact contents of `~/.ssh/glorov_deploy_new`:
   ```bash
   cat ~/.ssh/glorov_deploy_new | pbcopy
   ```
3. Ensure no trailing or leading whitespace is introduced.

### Step 5: Validate via GitHub Actions Workflow Run
1. Go to GitHub repository -> **Actions** -> **Deploy GLOROV to Azure VM**.
2. Click **Run workflow** (`workflow_dispatch` on `main`).
3. Monitor Step 9 (*Configure SSH & Deploy Deployment Automation Scripts*) to confirm connection succeeds.

### Step 6: Revoke the Old Key from Azure VM
Once the workflow succeeds, connect to the server and delete the retired public key:
```bash
ssh -i ~/.ssh/glorov_deploy_new elsesourav@20.244.48.139
nano ~/.ssh/authorized_keys
# Delete the old key line, save, and exit.
```

### Step 7: Securely Destroy Local Temporary Key
```bash
rm -f ~/.ssh/glorov_deploy_new ~/.ssh/glorov_deploy_new.pub
```

---

## 4. Future Architecture Recommendation: Azure OIDC (Keyless Deployments)

To eliminate static SSH keys entirely, migrate to **GitHub Actions OIDC with Azure Federated Credentials**:

1. **Azure Managed Identity:** Create a User-Assigned Managed Identity or Azure AD App Registration.
2. **Federated Credential:** Establish trust with `repo:elsesourav/glorov:ref:refs/heads/main`.
3. **Azure CLI Execution:** Runners request short-lived OIDC tokens (`permissions: id-token: write`) using `azure/login@v1`.
4. **Command Execution:** Run deployment scripts via `az vm run-command invoke` or Azure Bastion, eliminating all port 22 exposure and static SSH secrets.
