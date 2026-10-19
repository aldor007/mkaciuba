'use strict';

const imageModule = require('./graphql/image');
const categoryModule = require('./graphql/category');
const postModule = require('./graphql/post');
const galleryModule = require('./graphql/gallery');
const miscModule = require('./graphql/misc');

/**
 * v3 kept its public GraphQL API flat (no entity wrappers) with
 * where/limit/start/sort args. v4's shadow-CRUD generates wrapper types
 * (EntityResponse / EntityResponseCollection with data/meta), so the v3
 * contract is preserved by disabling the generated queries and
 * re-registering flat custom queries (see src/graphql/*.js). The frontend
 * apps therefore stay source-compatible.
 */
const QUERIES_REPLACED_BY_CUSTOM_LAYER = [
  'api::category.category',
  'api::post.post',
  'api::page.page',
  'api::post-category.post-category',
  'api::tag.tag',
  'api::product.product',
  'api::gallery.gallery',
  'api::menu.menu',
  'api::footer.footer',
];

/**
 * Public v3 API surface: all custom operations run without auth.
 */
const PUBLIC_OPERATIONS = [
  'Query.categories',
  'Query.categoriesCount',
  'Query.categoryBySlug',
  'Query.recentImages',
  'Query.posts',
  'Query.postsCount',
  'Query.post',
  'Query.postBySlug',
  'Query.postByPermalink',
  'Query.prevNextPost',
  'Query.relatedPosts',
  'Query.galleryBySlug',
  'Query.galleryMenu',
  'Query.pageBySlug',
  'Query.page',
  'Query.postCategories',
  'Query.postCategoryBySlug',
  'Query.tags',
  'Query.tag',
  'Query.tagBySlug',
  'Query.products',
  'Query.productsCount',
  'Query.menu',
  'Query.footer',
  'Mutation.validateTokenForCategory',
];

/**
 * Admin-only auth lock applied to plugin-registered GraphQL operations that
 * the v3 app kept disabled (users-permissions + upload mutations).
 * v4 has no API to remove plugin-registered fields; requiring the admin
 * strategy denies them to any public/authenticated client.
 */
const ADMIN_LOCKED_OPERATIONS = [
  'Query.me',
  'Mutation.login',
  'Mutation.register',
  'Mutation.forgotPassword',
  'Mutation.resetPassword',
  'Mutation.changePassword',
  'Mutation.emailConfirmation',
  'Mutation.upload',
  'Mutation.multipleUpload',
  'Mutation.updateFileInfo',
  'Mutation.removeFile',
  'Mutation.createUsersPermissionsRole',
  'Mutation.updateUsersPermissionsRole',
  'Mutation.deleteUsersPermissionsRole',
  'Mutation.createUsersPermissionsUser',
  'Mutation.updateUsersPermissionsUser',
  'Mutation.deleteUsersPermissionsUser',
];

module.exports = {
  register({ strapi }) {
    const extensionService = strapi.plugin('graphql').service('extension');

    // Mirror v3's disabled schemas (upload + users-permissions CRUD).
    // NOTE: disable() would also remove the type registrations (UploadFile
    // is referenced by media fields) — so disable operations only.
    extensionService.shadowCRUD('plugin::upload.file').disableQueries();
    extensionService.shadowCRUD('plugin::upload.file').disableMutations();
    extensionService.shadowCRUD('plugin::upload.folder').disableQueries();
    extensionService.shadowCRUD('plugin::upload.folder').disableMutations();
    extensionService.shadowCRUD('plugin::users-permissions.user').disableQueries();
    extensionService.shadowCRUD('plugin::users-permissions.user').disableMutations();
    extensionService.shadowCRUD('plugin::users-permissions.role').disableQueries();
    extensionService.shadowCRUD('plugin::users-permissions.role').disableMutations();

    // Replace the generated (wrapper-shaped) queries with flat v3-shaped
    // custom queries. Mutations stay generated (v3 parity).
    for (const uid of QUERIES_REPLACED_BY_CUSTOM_LAYER) {
      extensionService.shadowCRUD(uid).disableQueries();
    }

    extensionService.use(({ nexus }) => {
      const image = imageModule({ nexus });
      const category = categoryModule({ nexus });
      const post = postModule({ nexus });
      const gallery = galleryModule({ nexus });
      const misc = miscModule({ nexus });

      const resolversConfig = {};
      for (const operation of PUBLIC_OPERATIONS) {
        resolversConfig[operation] = { auth: false };
      }
      for (const operation of ADMIN_LOCKED_OPERATIONS) {
        resolversConfig[operation] = { auth: { strategy: 'admin::auth' } };
      }

      return {
        types: [
          ...image.types,
          ...category.types,
          ...post.types,
          ...gallery.types,
          ...misc.types,
        ],
        resolvers: {
          Category: category.resolvers.Category,
        },
        resolversConfig,
      };
    });
  },

  bootstrap() {
    // Cache singleton initializes lazily on first use (see src/utils/cache.js).
  },
};
