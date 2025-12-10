# Build stage
FROM node:20-alpine AS builder

RUN  apk add --update python3 make g++\
   && rm -rf /var/cache/apk/*

WORKDIR /opt/app

# Copy package files and install ALL dependencies (including devDependencies needed for build)
COPY ./package.json ./yarn.lock ./decorate-angular-cli.js /opt/app/
RUN yarn --network-timeout 100000 --frozen-lockfile

# Copy source files and configuration
COPY ./apps /opt/app/apps
COPY ./libs /opt/app/libs
COPY ./nx.json /opt/app/nx.json
COPY ./tsconfig.base.json /opt/app/tsconfig.base.json
COPY ./babel.config.json /opt/app/babel.config.json
COPY ./tailwind.config.js /opt/app/tailwind.config.js
COPY ./postcss.config.js /opt/app/postcss.config.js

# Set up environment files for production build
RUN cp /opt/app/apps/photos/src/environments/environment.prod.ts /opt/app/apps/photos/src/environments/environment.ts
RUN cp /opt/app/apps/photos-ssr/src/environments/environment.prod.ts /opt/app/apps/photos-ssr/src/environments/environments.ts

# Build the application
ENV NODE_ENV=production
RUN yarn nx build photos --configuration=production
RUN yarn nx build photos-ssr --configuration=production

# Validate CSS files are emitted
RUN echo "Validating CSS files in Docker build..." && \
    CSS_FILE=$(find /opt/app/dist/apps/photos/ -name "main*.css" -type f -not -path "*/assets/*" 2>/dev/null | head -1) && \
    if [ -z "$CSS_FILE" ]; then \
      echo "ERROR: No main CSS file found in /opt/app/dist/apps/photos/" && \
      echo "Available files:" && \
      find /opt/app/dist/apps/photos/ -name "*.css" -type f 2>/dev/null || echo "No CSS files found" && \
      exit 1; \
    fi && \
    if [ ! -f "/opt/app/dist/apps/photos/manifest.json" ]; then \
      echo "ERROR: manifest.json not found in /opt/app/dist/apps/photos/" && \
      exit 1; \
    fi && \
    echo "✓ CSS validation passed" && \
    echo "  - CSS file: $(basename $CSS_FILE) ($(wc -c < $CSS_FILE) bytes)" && \
    echo "  - manifest.json: found" && \
    echo "  - Total CSS files: $(find /opt/app/dist/apps/photos/ -name '*.css' -type f | wc -l) files"

# Production stage
FROM node:20-alpine

RUN  apk add --update python3 make g++\
   && rm -rf /var/cache/apk/*

WORKDIR /opt/app

# Copy package files and install only production dependencies
COPY ./package.json ./yarn.lock ./decorate-angular-cli.js /opt/app/
RUN yarn --network-timeout 100000 --frozen-lockfile --production

# Copy built artifacts from builder stage
COPY --from=builder /opt/app/dist /opt/app/dist

# Verify assets are present in production image
RUN echo "Verifying assets in production image..." && \
    CSS_FILE=$(find /opt/app/dist/apps/photos/ -name "main*.css" -type f -not -path "*/assets/*" 2>/dev/null | head -1) && \
    if [ -z "$CSS_FILE" ]; then \
      echo "ERROR: CSS files missing in production image!" && \
      ls -la /opt/app/dist/apps/photos/ 2>/dev/null || echo "photos dist directory not found" && \
      exit 1; \
    fi && \
    echo "✓ Assets verified in production image" && \
    echo "  - Photos app directory: /opt/app/dist/apps/photos/" && \
    echo "  - Total CSS files: $(find /opt/app/dist/apps/photos/ -name '*.css' -type f | wc -l) files"

ENV NODE_ENV=production
CMD ["node", "dist/apps/photos-ssr/main.js"]