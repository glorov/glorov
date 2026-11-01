import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

const ALLOWED_ORIGINS = [
  "https://glorov-admin.web.app",
  "https://glorov-admin.firebaseapp.com",
  "https://glorov-com.web.app",
  "https://glorov-com.firebaseapp.com",
  "https://glorov-store.web.app",
  "https://glorov-app.web.app",
  "http://localhost:5173",
  "http://localhost:9000",
  "http://localhost:3000",
  "https://glorov.com",
  "http://glorov.com",
  "https://20.244.48.139.sslip.io",
];

function applyCors(req: MedusaRequest, res: MedusaResponse) {
  const origin = req.headers.origin as string;
  if (origin && (ALLOWED_ORIGINS.includes(origin) || origin.endsWith(".web.app") || origin.endsWith(".firebaseapp.com"))) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, x-medusa-locale, x-publishable-api-key"
    );
  }
}

export const OPTIONS = async (req: MedusaRequest, res: MedusaResponse) => {
  applyCors(req, res);
  res.status(204).end();
};

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  applyCors(req, res);
  res.status(200).json({ enabled: false });
};
