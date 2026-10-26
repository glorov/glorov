# ==============================================================================
# GLOROV Medusa v2 Backend Production Multi-Stage Dockerfile
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Base image with pnpm and system tools
# ------------------------------------------------------------------------------
FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate
RUN apk add --no-cache libc6-compat curl postgresql-client
WORKDIR /app

# ------------------------------------------------------------------------------
# Stage 2: Install dependencies and build backend artifacts
# ------------------------------------------------------------------------------
FROM base AS builder
WORKDIR /app

# Copy package manifests across monorepo
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages/types/package.json ./packages/types/
COPY packages/config/package.json ./packages/config/
COPY apps/backend/package.json ./apps/backend/

# Install all workspace dependencies with frozen lockfile
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Copy source files
COPY packages/ ./packages/
COPY apps/backend/ ./apps/backend/

# Build shared types package first, then backend
RUN pnpm --filter @glorov/types build
RUN pnpm --filter @glorov/backend build

# ------------------------------------------------------------------------------
# Stage 3: Minimal Production Runtime
# ------------------------------------------------------------------------------
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=9000

# Create non-root user for security
RUN addgroup --system --gid 1001 medusagroup
RUN adduser --system --uid 1001 medusauser

# Copy application artifacts from builder
COPY --from=builder /app /app

# Copy and set entrypoint script
COPY apps/backend/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

USER medusauser

EXPOSE 9000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:9000/health || exit 1

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
