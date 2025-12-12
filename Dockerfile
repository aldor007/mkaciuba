# syntax=docker/dockerfile:1.4

# Build stage
FROM node:20-alpine AS builder

# Accept version as build argument
ARG APP_VERSION
ENV APP_VERSION=${APP_VERSION}

# Install build dependencies
RUN apk add --no-cache python3 make g++

WORKDIR /opt/app

# Copy package files first (better layer caching)
COPY package.json yarn.lock decorate-angular-cli.js ./

# Use versioned cache mount for yarn to speed up installs
# Cache path includes v2 to allow invalidation if needed
# Note: --frozen-lockfile removed due to yarn 1.x cache interaction issues
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn-v2 \
    yarn install --network-timeout 100000

# Copy only necessary config files
COPY nx.json tsconfig.base.json babel.config.json tailwind.config.js postcss.config.js ./

# Copy source files
COPY apps ./apps
COPY libs ./libs

# Set up environment files for production build
RUN cp apps/photos/src/environments/environment.prod.ts apps/photos/src/environments/environment.ts && \
    cp apps/photos-ssr/src/environments/environment.prod.ts apps/photos-ssr/src/environments/environments.ts

# Copy pre-built dist if available (excluded by .dockerignore for local builds)
# GitHub Actions modifies .dockerignore to include dist before docker build
# This allows using the exact manifest.json that references S3-uploaded CSS files
COPY dist ./dist

# Build applications only if dist doesn't exist
# Disable Nx daemon in Docker to avoid polling issues
ENV NODE_ENV=production
ENV NX_DAEMON=false
RUN echo "📦 Building with APP_VERSION: ${APP_VERSION:-not set}" && \
    if [ ! -d "dist/apps/photos" ] || [ ! -f "dist/apps/photos/manifest.json" ]; then \
      echo "Building from source..." && \
      yarn nx build photos --configuration=production && \
      yarn nx build photos-ssr --configuration=production; \
    else \
      echo "Using pre-built artifacts from workflow (manifest.json preserved)"; \
    fi

# Validate CSS files are emitted (combined with build for fewer layers)
RUN CSS_FILE=$(find dist/apps/photos/ -name "main*.css" -type f -not -path "*/assets/*" | head -1) && \
    [ -n "$CSS_FILE" ] && [ -f "dist/apps/photos/manifest.json" ] && \
    echo "✓ CSS validation passed: $(basename $CSS_FILE) ($(wc -c < $CSS_FILE) bytes)" || \
    (echo "ERROR: CSS validation failed" && exit 1)

# Production stage
FROM node:20-alpine

# Accept version as build argument and set as environment variable
ARG APP_VERSION
ENV APP_VERSION=${APP_VERSION}

# Only install runtime dependencies (no build tools needed)
WORKDIR /opt/app

# Copy package files
COPY package.json yarn.lock decorate-angular-cli.js ./

# Install only production dependencies with versioned cache mount
# Cache path includes v2 to allow invalidation if needed
# Note: --frozen-lockfile not used with --production due to yarn 1.x limitation
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn-v2 \
    yarn install --production --network-timeout 100000 && \
    yarn cache clean

# Copy built artifacts from builder
COPY --from=builder /opt/app/dist ./dist

# Verify assets in production image
RUN CSS_FILE=$(find dist/apps/photos/ -name "main*.css" -type f -not -path "*/assets/*" | head -1) && \
    [ -n "$CSS_FILE" ] && \
    echo "✓ Assets verified: $(find dist/apps/photos/ -name '*.css' -type f | wc -l) CSS files" || \
    (echo "ERROR: Assets missing in production" && exit 1)

# Set production environment and expose port
ENV NODE_ENV=production
EXPOSE 3000

# Log the version for debugging
RUN echo "📦 Docker image built with APP_VERSION: ${APP_VERSION:-not set}"

# Use non-root user for security
USER node

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "dist/apps/photos-ssr/main.js"]
