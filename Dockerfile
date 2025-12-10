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
RUN yarn nx build photos-ssr --configuration=production

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

ENV NODE_ENV=production
CMD ["node", "dist/apps/photos-ssr/main.js"]