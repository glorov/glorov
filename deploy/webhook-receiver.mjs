#!/usr/bin/env node
/**
 * GLOROV Automated Deployment Webhook Receiver
 *
 * Listens for GitHub push webhook events, verifies HMAC-SHA256 signature,
 * and triggers automated backend deployment on origin/main pushes.
 */
import http from "node:http";
import crypto from "node:crypto";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = parseInt(process.env.DEPLOY_WEBHOOK_PORT || "9099", 10);
const SECRET = process.env.DEPLOY_WEBHOOK_SECRET || "glorov_webhook_secret_2026";
const LOG_FILE = path.join(__dirname, "webhook.log");
const DEPLOY_SCRIPT = path.join(__dirname, "deploy-server.sh");

let isDeploying = false;
let pendingDeploy = false;

function log(msg) {
  const ts = new Date().toISOString();
  const line = `[${ts}] ${msg}\n`;
  process.stdout.write(line);
  try {
    fs.appendFileSync(LOG_FILE, line, "utf8");
  } catch {}
}

function verifySignature(payload, signature) {
  if (!signature || !signature.startsWith("sha256=")) {
    return false;
  }
  const expectedSig =
    "sha256=" +
    crypto
      .createHmac("sha256", SECRET)
      .update(payload)
      .digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature, "utf8"),
      Buffer.from(expectedSig, "utf8")
    );
  } catch {
    return false;
  }
}

function runDeploy() {
  if (isDeploying) {
    log("⚠️ Deployment already in progress. Queuing next deployment...");
    pendingDeploy = true;
    return;
  }

  isDeploying = true;
  pendingDeploy = false;
  log("🚀 Executing deployment script: " + DEPLOY_SCRIPT + " --pull");

  const child = spawn("bash", [DEPLOY_SCRIPT, "--pull"], {
    cwd: path.resolve(__dirname, ".."),
    env: { ...process.env },
    stdio: ["ignore", "pipe", "pipe"],
  });

  child.stdout.on("data", (data) => {
    process.stdout.write(data);
    try {
      fs.appendFileSync(LOG_FILE, data);
    } catch {}
  });

  child.stderr.on("data", (data) => {
    process.stderr.write(data);
    try {
      fs.appendFileSync(LOG_FILE, data);
    } catch {}
  });

  child.on("close", (code) => {
    isDeploying = false;
    log(`🏁 Deployment finished with exit code ${code}`);

    if (pendingDeploy) {
      log("🔁 Running queued pending deployment...");
      runDeploy();
    }
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);

  // Health check endpoint
  if (req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        status: "ok",
        service: "glorov-deploy-webhook",
        is_deploying: isDeploying,
        timestamp: new Date().toISOString(),
      })
    );
    return;
  }

  // Webhook listener endpoint
  if (req.method === "POST") {
    const signature = req.headers["x-hub-signature-256"];
    const event = req.headers["x-github-event"];
    let rawBody = "";

    req.on("data", (chunk) => {
      rawBody += chunk;
      // Protect against oversized payloads (>10MB)
      if (rawBody.length > 10 * 1024 * 1024) {
        req.destroy();
      }
    });

    req.on("end", () => {
      // 1. Verify GitHub Signature
      if (!verifySignature(rawBody, signature)) {
        log(`❌ Rejected request: Invalid signature from ${req.socket.remoteAddress}`);
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid HMAC SHA256 signature" }));
        return;
      }

      // 2. Ping event (GitHub test ping)
      if (event === "ping") {
        log("🏓 Received GitHub ping event. Signature verified successfully.");
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true, message: "Pong! Webhook configured properly." }));
        return;
      }

      // 3. Push event
      if (event === "push") {
        try {
          const payload = JSON.parse(rawBody);
          const ref = payload.ref;
          const commit = payload.after ? payload.after.substring(0, 7) : "unknown";
          const pusher = payload.pusher ? payload.pusher.name : "unknown";

          log(`📥 Received GitHub push event on ${ref} by ${pusher} (commit: ${commit})`);

          if (ref === "refs/heads/main") {
            log("🎯 Target branch 'main' detected. Triggering deployment!");
            runDeploy();
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({
                ok: true,
                message: `Deployment dispatched for commit ${commit}`,
                branch: ref,
              })
            );
          } else {
            log(`ℹ️ Ignoring push to branch ${ref} (only 'refs/heads/main' triggers auto-deploy)`);
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ ok: true, message: `Ignored branch ${ref}` }));
          }
        } catch (err) {
          log(`❌ Failed to parse webhook JSON payload: ${err.message}`);
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Malformed JSON payload" }));
        }
        return;
      }

      // Other events
      log(`ℹ️ Ignored unhandled GitHub event: ${event}`);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true, message: `Event ${event} ignored` }));
    });
    return;
  }

  // Not found
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not Found" }));
});

server.listen(PORT, "127.0.0.1", () => {
  log(`📡 GLOROV Webhook Receiver listening on http://127.0.0.1:${PORT}`);
});
