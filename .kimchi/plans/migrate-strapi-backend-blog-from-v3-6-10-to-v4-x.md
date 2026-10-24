<!-- kimchi-work-id: ac0e6475-e65b-409f-8829-104daf9e3c68 -->
# Migrate Strapi backend (blog/) from v3.6.10 to v4.x

## Goal

Migrate the Strapi application in `blog/` from Strapi v3.6.10 (Node 14) to Strapi v4 (latest v4 LTS, 4.25.x, Node 20), **preserving the public GraphQL contract** consumed by `apps/photos`, `apps/photos-ssr`, and `apps/photos-embed`:

- custom types/fields: `Image`, `UploadFile.thumbnail/thumbnails/matchingThumbnails/previewUrl`, `Category.randomImage/mediasCount/file/medias`
- custom operations: `Query.categoryBySlug`, `Query.recentImages`, `Query.categoriesCount`, custom `Query.categories` behavior, `Mutation.validateTokenForCategory`
- disabled-by-design operations on `upload` and `users-permissions` schemas
- the `strapi-provider-upload-mort` S3 upload provider (URL/previewUrl transform pattern)
- Redis-backed GraphQL response cache honoring `x-gallery-token` / `x-debug` headers
- slug lifecycles on post/category

Deliverables: converted code, configs, Dockerfile update, regenerated `graphql.schema.json`/`graphql.tsx` with parity diff vs v3, green test suites, and a written MySQL data-migration runbook (production DB is **not** touched).

## Constraints

- All work on branch `work/3-migrate-strapi-v3-to-v4-with-b` in this worktree; no push/merge; clear commits.
- Keep the frontend apps source-compatible: GraphQL schema parity is the gate (diff against committed `blog/graphql.schema.json`); frontend query changes only if a breaking diff is unavoidable and justified.
- No production database changes. Data migration delivered as runbook + references to official scripts.
- No new dependencies beyond what the migration requires (Strapi v4 packages, `mysql2`, Apollo cache plugins already in use conceptually in v3).
- Keep MySQL as the database (MySQL 8 per docker-compose).
- Root workspace Nx config stays untouched unless build requires it (blog is not an Nx project).

## Chunks

### 1. Dependencies + codemod structure conversion
**Files changed:** `blog/package.json`, `blog/package-lock.json` (regen), `blog/.nvm` (14 → 18 or 20, see Open Questions), new `blog/src/**` tree (generated), deletion of old `blog/api/*/models|controllers|services|config`, `blog/config/hook.js`, `blog/hooks/`.

Steps: commit current state; run `npx @strapi/codemods migrate:application` against `blog/` (clean tree required); commit codemod output verbatim; then hand-rewrite `blog/package.json` dependencies to v4: `@strapi/strapi@4.25.x`, `@strapi/plugin-graphql`, `@strapi/plugin-users-permissions`, `strapi-provider-upload-mort` kept as `file:providers/strapi-provider-upload-mort`, add `apollo-server-cache-redis`, `apollo-server-core`, `apollo-server-plugin-response-cache`, `mysql2`; drop v3 `strapi*` packages, `knex` pin, `mysql`, `strapi-hook-redis`, `apollo-server-plugin-response-cache` v3-era duplicates. Update `.nvm` and `engines` (node >=18).

**Depends on:** none.
**Accept when:** `npm install` succeeds in blog/ with Node 20; `npm run build` reaches Strapi build (failures from missing configs are acceptable at this point, missing JS module errors are not).
**Test coverage:** none yet (structural step).

### 2. v4 configurations
**Files changed:** `blog/config/server.js`, new `blog/config/admin.js`, `blog/config/api.js`, `blog/config/middlewares.js` (replaces `middleware.js`), `blog/config/database.js`, `blog/config/plugins.js`, `blog/config/cron-tasks.js` (port whatever `config/functions/cron.js` contains), `blog/.env.example`, new `blog/src/index.js` skeleton (register/bootstrap).

- `database.js`: v4 `connection` object, `client: 'mysql'`, `connection: {host, port, database, user, password}`, `pool`, `ssl` flags matching current env vars.
- `server.js`: `admin.jwt.secret` from `ADMIN_JWT_SECRET`.
- `middlewares.js`: default v4 stack + `strapi::cors` configured (origin `*`, headers `*` — same as v3 `middleware.js`).
- `plugins.js`: `upload.config.provider: 'strapi-provider-upload-mort'` (full package name for local providers) + existing `providerOptions`; `graphql.config` with `amountLimit: 30`, `depthLimit: 7`, `defaultLimit` to match v3 behavior, and `apolloServer` response-cache plugins (Chunk 4 wires the logic); `users-permissions.config.jwtSecret: env('JWT_SECRET')` replacing `extensions/users-permissions/config/jwt.js`.
- `.env.example`: add `APP_KEYS`, `ADMIN_JWT_SECRET`, `API_TOKEN_SALT`, `TRANSFER_TOKEN_SALT`, `JWT_SECRET`, plus existing DB/Redis/AWS vars documented.
- Bootstrap/cron: move `config/functions/bootstrap.js` + `cron.js` logic into `src/index.js` (`bootstrap`) and `config/cron-tasks.js`; drop `config/functions/`; drop `config/hook.js` (v3 hooks system gone; cache hook replaced in Chunk 4).

**Depends on:** 1.
**Accept when:** `npm run develop` boots against a fresh MySQL (docker-compose) and serves the admin panel; no v3-era config files remain.
**Test coverage:** boot smoke; `curl /admin` returns 200.

### 3. Content types, lifecycles, routes
**Files changed:** `blog/src/api/{post,category,gallery,tag,page,menu,footer,post-category,product}/content-types/*/schema.json` (codemod output, hand-verified), new `blog/src/api/post/content-types/post/lifecycles.js`, `blog/src/api/category/content-types/category/lifecycles.js`, `blog/src/api/*/routes/*.js`, `blog/src/api/*/controllers/*.js`, `blog/src/api/*/services/*.js`, `blog/src/components/menu-config/menu.json`, `blog/__tests__/**` (adapt).

- Manually verify every schema: v3 relation syntax (`model`/`via`/`collection`/`dominant`) → v4 `relation`/`target` (`api::gallery.gallery` etc.)/`mappedBy`/`inversedBy`; media fields (`plugin: 'upload'`) → `type: 'media'` with `allowedTypes`; `draftAndPublish` options preserved (post = true; others per current settings — data migration will fill `published_at`); enumeration/`private` flags preserved; `configurable` flags dropped (v4 doesn't use them).
- Move lifecycles (post `beforeCreate` slug+makeid; category `beforeCreate` slug, `beforeUpdate` slugOverride) into content-types `lifecycles.js`.
- Controllers/services: `createCoreController`/`createCoreService` factories (currently empty stubs in v3 anyway); routes with `handler: 'api::post.post.find'` naming.
- Adapt `blog/__tests__/api/product/*` jest tests to v4 service APIs.

**Depends on:** 2.
**Accept when:** all 9 content types + menu-config component load; admin panel lists them; creating a Post/Category auto-generates the slug.
**Test coverage:** `cd blog && npm test` (product api + schema tests) green.

### 4. GraphQL custom layer rewrite (the core of this migration)
**Files changed:** `blog/src/index.js` (register), new `blog/src/graphql/` modules (image, category, upload-extensions, users-permissions-guard, cache wiring), `blog/lib/image.js` + `blog/lib/index.js` (kept in place, updated as needed), new `blog/src/utils/cache.js` (replaces `blog/hooks/cache`), deletion of `blog/extensions/` v3-era files.

- Register via `strapi.plugin('graphql').service('extension').use(({ nexus }) => …)`:
  - Types: `Image`, `ValidationToken`; `extendType UploadFile` with `thumbnail(width, webp)`, `thumbnails`, `matchingThumbnails(preset)`, and `previewUrl` (computed from the storage-path base64 transform URL — no custom DB column, see Decision Log).
  - `extendType Category`: `randomImage`, `mediasCount`, `file` (JWT-verify against `x-gallery-token` for private categories, cache hints preserved), `medias` (offset slice behavior preserved).
  - Queries: `categoryBySlug` (app-cache + auth logic ported), `recentImages`, `categoriesCount`, `categories` (public-only + `publicationDate` filter + `file = null` behavior), and disable `category` findOne as v3 did.
  - Mutation: `validateTokenForCategory` (JWT sign, cookie set — via Koa context).
- Replace `strapi.services.*` calls with `strapi.entityService` / `strapi.service('api::category.category')`; v3 `_limit/_start/_sort` params → v4 `limit/start/orderBy/filters` (e.g. `publicationDate_lt` filters keep working in v4).
- Disable shadow CRUD to mirror v3 `extensions/upload/config/schema.graphql.js` (all file queries/mutations) and `extensions/users-permissions/config/schema.graphql.js` (role/user/login/etc.).
- Resolver context: v4 exposes the Koa context differently than v3 (`context.koaContext.headers` / `.cookies`) — verify against the installed `@strapi/plugin-graphql` source and adapt header/cookie access (`x-gallery-token`, `x-debug`, `category_token` cookie).
- Cache service: port `hooks/cache` (LRU + `node-cache-redis`) into `src/utils/cache.js`, initialized in `bootstrap`, consumed by `categoryBySlug`/`recentImages`.
- Response cache: keep feature parity via `graphql.config.apolloServer` — `apollo-server-plugin-response-cache` + `RedisCache`, `sessionId`/`shouldReadFromCache`/`shouldWriteToCache` honoring `x-gallery-token`/`x-debug`, `cacheControl: { defaultMaxAge: 3600 }`, persisted queries with Redis cache (community-verified pattern for v4, source in research note).

**Depends on:** 3.
**Accept when:** server boots with zero GraphQL registration errors; `npm run generate` produces `graphql.schema.json`; diff vs v3 schema shows only known-benign changes (documented in the PR).
**Test coverage:** new jest tests for `lib/image.js` preset selection and `previewUrl`/`thumbnail` computation (pure functions); `cd blog && npm test` green.

### 5. Upload provider (mort) v4 interface
**Files changed:** `blog/providers/strapi-provider-upload-mort/index.js`, `blog/providers/strapi-provider-upload-mort/package.json`.

- Keep `init(config)`/`upload(file)`/`delete(file)` logic; add `uploadStream(file)` (collect stream → buffer → same S3 path; v4 admin uploads stream); keep `url`/`previewUrl`/`path` assignment identical.
- Provider config in `config/plugins.js` (done in Chunk 2); `getStoragePath`/`base64Url` helpers reused from `blog/lib`.
- Note: AWS SDK v2 kept (do not upgrade SDK in this task — out of scope; listed under "Also noticed" at the end).

**Depends on:** 2 (config), 4 (previewUrl resolver).
**Accept when:** Strapi boots with provider loaded (`Could not load upload provider` absent); unit test for provider URL/path derivation passes.
**Test coverage:** jest unit test with mocked `aws-sdk` S3 constructor asserting upload key, `file.url`, `file.previewUrl`, `file.path`.

### 6. Contract verification, codegen, Docker, runbook, frontend smoke
**Files changed:** `blog/codegen.yml` (schema source switch if needed), `blog/graphql.schema.json`, `blog/graphql.tsx` (regenerated), `blog/Dockerfile`, `blog/docker-compose.yaml` (mysql stays 8, redis service stays), new `blog/MIGRATION.md`; possibly minimal fixes in `apps/photos/src/**`, `apps/photos-ssr/src/**` if type drift surfaces.

- Regenerate types: point codegen at the running v4 server's schema export (enable `generateArtifacts` or introspection URL) → diff `graphql.schema.json` against the committed v3 one; fix drift in extensions until parity.
- Dockerfile: `node:14-alpine` → `node:20-alpine`; copy new `src/` tree (drop `hooks/`, `extensions/` paths as needed); drop vips/libimagequant build deps (not needed without local sharp processing).
- `MIGRATION.md` runbook: backup, official `strapi/migration-scripts` `v3-sql-v4-sql` usage for MySQL (env config for v3/v4 DBs), plus manual notes: `JWT_SECRET` continuity (set env to the v3 default `27c12e2a-…` if prod relies on it), admin user recreation or script, cache/Redis unchanged.
- Frontend: `nx test photos`, `nx test api`, `nx test image`; boot `npm run start-photos` and smoke-test home page, category/gallery page (public + token), post page; verify `previewUrl`/`thumbnails` render.

**Depends on:** 4, 5.
**Accept when:** schema diff clean (or documented); blog jest green; photos jest green; full stack boots locally; Docker image builds.
**Test coverage:** existing suites + `npm run build` in blog; manual smoke checklist captured in MIGRATION.md.

## Verification Strategy

1. `cd blog && npm install && npm run develop` against docker-compose MySQL — boots, admin works.
2. `cd blog && npm test` — all backend tests green.
3. `cd blog && npm run generate` — `graphql.schema.json` diff vs v3 baseline is the contract gate; only documented differences accepted.
4. Root workspace: `npm test` (affected: photos, api, image) and `npm run start-photos` manual smoke of home/category/post/private-gallery flows.
5. `docker build` of blog image succeeds.

## Decision Log

- **Target v4.25.x, not v5:** task explicitly asks for v4. Note: official docs state v4 maintenance ended ~April 2026 — flagged in Open Questions.
- **Node 20 for blog** (matches root .nvmrc 20.18.1; v4.14.5+ recommends 20) — pending confirmation.
- **`previewUrl` computed, not stored:** v4 cannot add custom columns to the plugin-owned `files` table the way v3 `File.settings.json` did; the value is deterministically derivable (base64 storage path → mort transform URL), so a Nexus resolver computes it. No data migration needed for that column.
- **GraphQL response cache preserved** via `graphql.config.apolloServer` (community-verified v4 pattern) rather than dropped — keeps `x-gallery-token`-aware caching and cache-control behavior photos-ssr relies on.
- **Cache hook → module singleton:** v3 hooks system is gone; `src/utils/cache.js` (LRU + node-cache-redis) initialized in bootstrap replaces `strapi.services.cache`.
- **mysql2 replaces mysql** per v4 standard; `knex <0.20.0` pin dropped (v4 bundles its own knex).
- **Codemod first, manual fixes after:** `@strapi/codemods migrate:application` handles structure/settings.json → schema.json/routes; custom extensions (schema.graphql.js, hooks, providers) are rewritten by hand because the codemod doesn't cover them.
- **AWS SDK v2 kept** in the provider (behavior preservation; SDK upgrade is separate work).

## Risks

- **v4 is past its maintenance window** (docs say support ended April 2026) — no security patches upstream; confirm v4 is really the target.
- **Codemod output imperfect on relations/components** — mitigated by hand-verification of all 9 schemas (Chunk 3).
- **Resolver context API drift** (`context.request` vs `context.koaContext`) — verify against installed plugin source; small blast radius (headers/cookies only).
- **Admin uploads may use streaming** — provider needs `uploadStream` implemented or uploads silently fail.
- **Schema drift breaking frontend** — mitigated by the codegen diff gate; residual risk: v4 renames enum/scalar shapes subtly (e.g. `DateTime` handling) requiring small frontend query tweaks.
- **`import.js`** (v3-era data import script, `mysql-await` + callbacks) may not run on Node 20 — out of migration scope unless verification shows otherwise; it's a standalone script.
- **Data migration is runbook-only** — actual prod migration executed by the human later; risk of env-specific surprises (column casing, `core_store` renames) documented in MIGRATION.md.

## Open Questions

1. Confirm target **v4.25.x** (rather than v5), despite v4's maintenance window ending April 2026?
2. **Node version for blog**: 20 (recommended, matches root) or 18?
3. **Data migration scope**: code + runbook only (no production DB touched by this task) — correct?
4. **JWT secret continuity**: does production run with the hardcoded default from `extensions/users-permissions/config/jwt.js` (`27c12e2a-6799-437d-b156-439e411db871`)? If yes, that value must be set as `JWT_SECRET` in the deployment env to keep existing tokens valid.
