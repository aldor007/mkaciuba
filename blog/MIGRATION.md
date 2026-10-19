# Strapi v3 → v4 migration runbook (blog/)

This runbook covers deploying the migrated v4 backend and moving a production
MySQL database from Strapi v3.6.x to v4.26.x. **The code migration is complete
in this branch; the production data migration is executed by you.**

## What changed in the code

- Strapi 3.6.10 (Node 14) → **4.26.2 (Node 20)**; project tree moved to `src/`
  (api content-types, components, extensions), dependencies re-pinned to
  `@strapi/*` v4, `mysql2` client, admin panel peers added explicitly.
- The v3 `schema.graphql.js` custom resolvers are replaced by a nexus-based
  extension layer in `src/index.js` + `src/graphql/*` that keeps the **flat
  v3-shaped GraphQL contract** (where/limit/start/sort args, no entity
  wrappers, `id` on flat types) so the frontend apps remain source-compatible.
- The v3 `hooks/cache` service is now `src/utils/cache.js` (LRU + Redis,
  null-guarded).
- The GraphQL response cache (Redis, `x-gallery-token`/`x-debug` aware) is
  wired through `graphql.config.apolloServer` in `config/plugins.js`.
- `strapi-provider-upload-mort` implements the v4 provider interface
  (`uploadStream` added); it declares `aws-sdk` correctly now.
- The `files` table keeps the custom `path` column through the
  `src/extensions/upload/content-types/File/schema.json` extension (the full
  native v4 File schema + `path`; extension files REPLACE the plugin schema,
  so it must stay complete and in sync with the pinned `@strapi/strapi` minor).
- `.env` gains: `APP_KEYS`, `ADMIN_JWT_SECRET`, `API_TOKEN_SALT`,
  `TRANSFER_TOKEN_SALT`, `JWT_SECRET` (see `.env.example`).

## Documented GraphQL differences vs v3

- `*Connection` queries removed (frontend does not use them).
- `me`, `login`, `register`, `upload`, `usersPermissions*` mutations exist in
  the schema but are **admin-locked** (v4 cannot remove plugin-registered
  operations; they reject non-admin callers).
- `created_at`/`updated_at` → `createdAt`/`updatedAt` (not queried by the
  frontend).
- v4 structural types (`*Entity`, `*FiltersInput`, `PaginationArg`) exist
  alongside the flat custom queries the frontend uses.

## Data migration (MySQL)

Use the official Strapi migration scripts
(<https://github.com/strapi/migration-scripts/tree/main/v3-sql-v4-sql>):

1. **Back up** the production v3 database and store the dump somewhere safe.
2. Provision an empty target MySQL 8 database for v4 (do not reuse the v3 DB).
3. Clone the migration-scripts repo and configure its `.env` (copy
   `.env.mysql.example`):

   ```
   DATABASE_CLIENT=mysql
   BATCH_SIZE=50
   DATABASE_V3_HOST=... DATABASE_V3_PORT=3306 DATABASE_V3_DATABASE=... DATABASE_V3_USER=... DATABASE_V3_PASSWORD=...
   DATABASE_V4_HOST=... DATABASE_V4_PORT=3306 DATABASE_V4_DATABASE=... DATABASE_V4_USER=... DATABASE_V4_PASSWORD=...
   ```

4. Run `yarn && yarn run v3-sql-v4-sql`. The script renames the Strapi core
   tables (`core_store` → `strapi_core_store`, admin tables, join tables for
   relations) and copies content tables.
5. **Secrets**: set `.env` on the v4 deployment before first boot:
   - `JWT_SECRET` — **must match the v3 users-permissions secret** or existing
     gallery tokens stop validating. If v3 ran with the hardcoded default from
     `extensions/users-permissions/config/jwt.js`, use:
     `27c12e2a-6799-437d-b156-439e411db871`
   - `ADMIN_JWT_SECRET` — any random value (admin sessions restart clean).
   - `APP_KEYS` (comma-separated), `API_TOKEN_SALT`, `TRANSFER_TOKEN_SALT` —
     random values (`openssl rand -base64 32`).
6. Boot v4 (`npm run develop` or the Docker image). Strapi creates any
   missing tables/columns on first boot. The `files` table's custom
   `path`/`previewUrl` columns survive because the File extension schema
   declares them.
7. **Admin users** are not migrated by the script for all setups — create the
   first administrator via `/admin` on first boot, or copy the v3 admin users
   before switching (the v4 admin user schema differs; recreating is simpler).
8. **Permissions**: v3 `core_store` entries are migrated by the script;
   verify Settings → Roles → Public still has `find` permissions for the
   content types if any non-custom (shadow-CRUD) REST routes are consumed.
   The public GraphQL surface (custom flat queries) runs with `auth: false`
   and does not depend on role permissions.

## Smoke checklist after migration

- [ ] `GET /admin` returns 200 and the admin panel loads.
- [ ] GraphQL (POST /graphql):
  - [ ] `categories { id name slug image { id matchingThumbnails(preset: "categorylist") { url } } }` returns data.
  - [ ] `categoryBySlug(slug: "<known>") { id name medias { id url } }` returns medias with mort transform URLs.
  - [ ] A **private** category without `x-gallery-token` returns an auth error; with a token minted via `validateTokenForCategory` it returns data.
  - [ ] `posts { id }`, `postBySlug(slug: ...) { id title mainImage { url } }` work.
  - [ ] `menu { topMenu { name } }` and `footer { id }` return content.
  - [ ] `products { id name slug }` + `productsCount` return the wood catalogue.
- [ ] Upload an image via the admin media library: it lands in S3 under
      `files/sources/<year>/<hash><ext>`, and `url`/`previewUrl` point at the
      mort transform service.
- [ ] Redis caches warm up (`menu`, `footer`, category keys) and
      `x-debug`/`x-gallery-token` requests bypass the response cache.
- [ ] Frontend (`npm run start-photos` at the repo root) renders the home
      page, a gallery/category page and a post page.

## Rollback

Keep the v3 deployment (code + DB) intact until the v4 stack passes the smoke
checklist. Rolling back means repointing DNS/containers at the v3 deployment;
no destructive step is taken on the v3 database by this migration.
