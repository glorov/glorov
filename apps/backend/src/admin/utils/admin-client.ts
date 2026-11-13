/**
 * Admin API Client for Glorov Medusa v2 Admin Dashboard Extensions.
 * Automatically resolves the backend URL, attaches authentication headers & credentials,
 * and handles both JSON and error responses gracefully.
 */

/**
 * Automatically sets the GLOROV botanical favicon in the Medusa Admin document head
 * replacing any default or empty placeholder favicon.
 */
export function ensureAdminFavicon(): void {
  if (typeof document === "undefined") return;

  const setFavicon = () => {
    let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement | null;
    const faviconHref = "/favicon.ico";

    if (!link || link.href.includes("data:,") || !link.href) {
      if (!link) {
        link = document.createElement("link");
        document.head.appendChild(link);
      }
      link.type = "image/x-icon";
      link.rel = "shortcut icon";
      link.href = faviconHref;
    }

    // Also inject SVG favicon if available
    let svgLink = document.querySelector("link[type='image/svg+xml']") as HTMLLinkElement | null;
    if (!svgLink) {
      svgLink = document.createElement("link");
      svgLink.rel = "icon";
      svgLink.type = "image/svg+xml";
      svgLink.href = "/favicon.svg";
      document.head.appendChild(svgLink);
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setFavicon);
  } else {
    setFavicon();
  }
}

// Automatically invoke on admin client load
if (typeof window !== "undefined") {
  ensureAdminFavicon();
}

export function getBackendBaseUrl(): string {
  if (typeof window !== "undefined") {
    const sdk = (window as any).__sdk;
    if (sdk?.client?.baseUrl) {
      return String(sdk.client.baseUrl).replace(/\/+$/, "");
    }
  }
  // @ts-ignore
  if (typeof __BACKEND_URL__ !== "undefined" && __BACKEND_URL__) {
    // @ts-ignore
    return String(__BACKEND_URL__).replace(/\/+$/, "");
  }
  return "https://api.glorov.tech";
}

export interface AdminApiResponse<T = any> {
  ok: boolean;
  status: number;
  data: T;
  error?: string;
}

export interface AdminRequestInit extends Omit<RequestInit, "body"> {
  body?: any;
}

export async function adminFetch<T = any>(
  path: string,
  options: AdminRequestInit = {}
): Promise<AdminApiResponse<T>> {
  const normPath = path.startsWith("/") ? path : `/${path}`;

  // 1. If window.__sdk is initialized, leverage its client directly
  if (typeof window !== "undefined") {
    const sdk = (window as any).__sdk;
    if (sdk?.client?.fetch) {
      try {
        const bodyObj =
          options.body && typeof options.body === "string"
            ? JSON.parse(options.body)
            : options.body;

        const resData = await sdk.client.fetch(normPath, {
          method: options.method || "GET",
          headers: options.headers as Record<string, string>,
          body: bodyObj,
        });

        return {
          ok: true,
          status: 200,
          data: resData as T,
        };
      } catch (err: any) {
        console.warn(`[adminFetch SDK attempt on ${normPath}]:`, err);
        // Fall back to direct fetch below
      }
    }
  }

  // 2. Direct HTTPS fetch to the Medusa backend
  const baseUrl = getBackendBaseUrl();
  const fullUrl = `${baseUrl}${normPath}`;

  const headers = new Headers(options.headers || {});
  headers.set("Accept", "application/json");

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (!headers.has("Authorization") && typeof window !== "undefined") {
    const token =
      localStorage.getItem("medusa_auth_token") ||
      sessionStorage.getItem("medusa_auth_token");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  try {
    const finalBody =
      options.body && typeof options.body === "object" && !(options.body instanceof FormData)
        ? JSON.stringify(options.body)
        : options.body;

    const res = await fetch(fullUrl, {
      ...options,
      body: finalBody,
      headers,
      credentials: "include",
    });

    const contentType = res.headers.get("content-type") || "";
    let data: any = null;
    if (contentType.includes("application/json")) {
      data = await res.json();
    } else {
      const text = await res.text();
      data = { message: text };
    }

    if (!res.ok) {
      const errorMsg =
        data?.message || (typeof data === "string" ? data : `HTTP ${res.status}`);
      return {
        ok: false,
        status: res.status,
        data,
        error: errorMsg,
      };
    }

    return {
      ok: true,
      status: res.status,
      data: data as T,
    };
  } catch (err: any) {
    return {
      ok: false,
      status: 0,
      data: {} as T,
      error: err?.message || "Failed to connect to backend",
    };
  }
}
