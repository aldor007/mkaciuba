# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a React-based photo gallery and portfolio application (mkaciuba.pl) built using Nx monorepo, React, TypeScript, TailwindCSS, Apollo GraphQL, and Strapi CMS. The application consists of a Strapi backend (blog directory) serving data via GraphQL, and multiple React frontends for viewing photos and blog posts.

## Project Structure

### Monorepo Architecture
- **Nx Workspace**: Uses Nx 15.9.0 for monorepo management with multiple apps and shared libraries
- **blog/**: Strapi v3.6.x application serving as the CMS and GraphQL API backend
- **apps/photos**: Main React SPA frontend for browsing photos/galleries
- **apps/photos-ssr**: Express server providing Server-Side Rendering (SSR) with Redis caching
- **apps/photos-embed**: Embeddable photo widget/component
- **apps/photos-e2e**: Cypress E2E tests for photos app
- **apps/photos-embed-e2e**: Cypress E2E tests for photos-embed app
- **libs/api**: GraphQL type definitions and shared API interfaces (auto-generated from Strapi schema via blog/graphql.tsx)
- **libs/image**: Reusable image components (ImageList, Placeholder, responsive image handling)
- **libs/types**: Shared TypeScript type definitions
- **libs/ui-kit**: Shared UI components

### Key Architecture Patterns

**Data Flow**: Strapi CMS (MySQL) → GraphQL API → Apollo Client → React Components

**SSR with Caching**: The photos-ssr app renders React on the server, implements a two-tier caching strategy:
- In-memory LRU cache (100 items, 1 minute TTL, allows stale) - see apps/photos-ssr/src/redis.ts:10-14
- Redis cache (optional, configurable TTL per route type, default 600s)
- Cache keys include path, page query param, and authentication tokens - see apps/photos-ssr/src/cache-utils.ts
- Cache-control headers vary by content type (published posts: 3600s, unpublished: 60s, galleries with auth: private)
- Purge API: `DELETE /v1/purge?path=<url>` with X-API-KEY header
- Asset versioning uses APP_VERSION env var (from semantic-release/CI) or package.json version

**Apollo Client Pagination**: Custom `startLimitPagination` field policy in apps/photos/src/app/apollo.ts implements offset-based pagination using `start`/`limit` arguments

**GraphQL Code Generation**: Strapi schema is code-generated to TypeScript types using graphql-codegen:
- Config: blog/codegen.yml
- Output: blog/graphql.tsx (hooks) and blog/graphql.schema.json (introspection)
- Run: `cd blog && npm run generate`

**Image Handling**: Custom Strapi upload provider (strapi-provider-upload-mort) in blog/providers/ for image optimization. Images served through responsive picture elements with WebP support

**Code Splitting**: Uses @loadable/component for dynamic imports and SSR code splitting (manifest.json, loadable-stats.json)

## Common Commands

### Development
```bash
# Start all photo-related services (photos, photos-ssr, photos-admin, api)
npm run start-photos

# Start default app (photos)
npm start

# Start specific app
nx serve photos
nx serve photos-ssr
nx serve photos-embed

# Start Strapi backend (from blog directory)
cd blog && npm run develop
```

### Building
```bash
# Build all projects
npm run build

# Build specific project
nx build photos
nx build photos-ssr

# Build with production optimizations
nx build photos --configuration=production

# Build Strapi
cd blog && npm run build
```

### Testing
```bash
# Run tests for all projects
npm test

# Run tests for specific project
nx test photos
nx test api
nx test image
nx test photos-ssr

# Run single test file
nx test photos --testFile=src/app/app.spec.tsx

# Run tests in watch mode
nx test photos --watch

# Run tests with coverage
nx test photos --coverage

# Run E2E tests
npm run e2e
nx e2e photos-e2e
nx e2e photos-embed-e2e
```

**Note**: Tests use Jest with ts-jest transformer. Test files should use `*.spec.ts` or `*.spec.tsx` naming convention.

### Linting and Formatting
```bash
# Lint workspace
npm run lint

# Lint specific project
nx lint photos

# Format code
npm run format

# Check formatting
npm run format:check
```

### Nx Utilities
```bash
# View dependency graph
npm run dep-graph

# Show affected apps
npm run affected:apps

# Build affected projects only
npm run affected:build

# Test affected projects
npm run affected:test
```

### Strapi/Blog Commands
```bash
cd blog

# Start development server
npm run develop

# Generate GraphQL types for frontend
npm run generate

# Start production server
npm start
```

## Environment Variables

### photos-ssr App
- `API_URL` or `environment.apiUrl`: Strapi GraphQL endpoint
- `STRAPI_URL` or `environment.strapiUrl`: Strapi base URL for proxying
- `ASSETS_URL`: CDN or static assets URL prefix
- `REDIS_URL`, `REDIS_PORT`, `REDIS_DB`: Optional Redis configuration for SSR caching
- `API_KEY`: Required for cache purge endpoint authentication

### Strapi (blog)
Database configuration in `blog/config/database.js`:
- `DATABASE_CLIENT`: Database client type (e.g., 'mysql')
- `DATABASE_HOST`: Database host
- `DATABASE_PORT`: Database port
- `DATABASE_NAME`: Database name
- `DATABASE_USERNAME`: Database username
- `DATABASE_PASSWORD`: Database password

See `blog/.env.example` for all required environment variables

## Important Conventions

### Testing (from user's global CLAUDE.md)
- Use `should` syntax in test descriptions
- Use table-driven tests (table tests) for unit tests
- Always include `t.Parallel()` in tests (Note: This is Go convention; for Jest use appropriate parallel execution)
- Run tests with race detection enabled: `nx test <project> -- --race`

### Code Style
- TypeScript for all frontend code
- TailwindCSS v3 for styling (configuration in tailwind.config.js)
- React 18.3.1 with functional components and hooks
- Apollo Client 3.8.10 for GraphQL data fetching
- ESLint + Prettier for code quality
- React Router v6 for routing

### File Naming
- React components: PascalCase (e.g., `ImageList.tsx`, `PostCard.tsx`)
- Utilities/libraries: camelCase (e.g., `apollo.ts`, `redis.ts`)
- Test files: `*.spec.ts` or `*.spec.tsx`

## Nx Configuration Notes
- Default collection: `@nrwl/react`
- Cacheable operations: build, lint, test, e2e
- Default base branch: `master`
- Build target dependencies: Projects build dependencies first

## Data Model Overview

Main Strapi content types (in blog/api/):
- **Post** (blog/api/post): Blog posts with title, text, images, galleries, categories, tags, publication dates
- **Category** (blog/api/category): Photo gallery categories with media collections, public/private access tokens
- **Gallery** (blog/api/gallery): Top-level gallery containers holding multiple categories
- **PostCategory** (blog/api/post-category): Classification for blog posts
- **Tag** (blog/api/tag): Taxonomy for posts
- **Page** (blog/api/page): Static pages
- **Menu/Footer** (blog/api/menu, blog/api/footer): Site navigation and configuration
- **UploadFile**: Media files with responsive image variants (thumbnails, webp support)

## Known Issues/Quirks
- Using Strapi v3.6.x (older version, not latest v4) with Node 14 in blog directory
- Node version: Root project uses Node 20.18.1 (.nvmrc), blog uses Node 14 (blog/.nvm)
- npm version: Root requires npm >=10.0.0, blog requires npm >=6.0.0
- Some webpack customizations in app-specific webpack.config.ts files
- photos-ssr proxies /graphql requests to Strapi backend
- Strapi has custom extensions in blog/extensions/ for graphql, upload, and users-permissions plugins

## Deployment

The project uses Docker for deployment:
- Multi-stage Dockerfile with builder and runtime stages
- Uses Node 20 Alpine base images
- Accepts APP_VERSION build arg for versioning
- Supports pre-built dist/ artifacts (for CI/CD workflows)
- Production build sets NODE_ENV=production and NX_DAEMON=false
- Final image runs: `node dist/apps/photos-ssr/main.js`
- Environment files are copied during build (environment.prod.ts → environment.ts)
