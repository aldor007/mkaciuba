'use strict';

const removeMd = require('remove-markdown');
const { getImagesFromPreset } = require('../../lib/image');
const { translateWhere, setCacheHint } = require('./utils');

const POST_UID = 'api::post.post';

const POST_POPULATE = {
  image: true,
  cover_image: true,
  tags: true,
  category: true,
  gallery: true,
};

async function findOneBySlug(strapi, slug, populate = POST_POPULATE) {
  const found = await strapi.entityService.findMany(POST_UID, {
    filters: { slug },
    limit: 1,
    populate,
  });
  return found && found[0];
}

/**
 * Post field extensions + post queries (v3 port).
 *
 * Note: `posts` and `post` are custom flat queries (v3 shape) — the
 * generated wrapper queries are disabled.
 */
module.exports = ({ nexus }) => {
  const PostExtensions = nexus.extendType({
    type: 'Post',
    definition(t) {
      t.nonNull.id('id');
      t.list.field('mainImage', {
        type: 'Image',
        resolve(obj) {
          if (!obj.image) {
            return null;
          }
          return getImagesFromPreset(obj.image, obj.post_image_preset || 'postlist');
        },
      });

      t.list.field('coverImage', {
        type: 'Image',
        resolve(obj) {
          if (!obj.cover_image) {
            return null;
          }
          return getImagesFromPreset(obj.cover_image, obj.cover_image_preset || 'coverimg');
        },
      });

      t.string('seoDescription', {
        resolve(obj) {
          if (obj.content_type === 'MARKDOWN') {
            return removeMd(obj.description || '');
          }
          return (obj.description || '')
            .replace(/&nbsp;/g, ' ')
            .replace(/<.*?>/g, '');
        },
      });
    },
  });

  const PostQueries = nexus.extendType({
    type: 'Query',
    definition(t) {
      t.list.field('posts', {
        type: 'Post',
        args: { where: 'JSON', limit: 'Int', start: 'Int', sort: 'String' },
        async resolve(obj, args, context, info) {
          setCacheHint(info, { maxAge: 3600, scope: 'PUBLIC' });
          return strapi.entityService.findMany(POST_UID, {
            filters: {
              ...translateWhere(args.where),
              publicationDate: { $lt: new Date() },
            },
            orderBy: args.sort || 'id:desc',
            start: args.start || 0,
            limit: args.limit,
            populate: POST_POPULATE,
          });
        },
      });

      t.field('post', {
        type: 'Post',
        args: { id: nexus.nonNull('ID') },
        async resolve(obj, args, context, info) {
          return strapi.entityService.findOne(POST_UID, args.id, {
            populate: POST_POPULATE,
          });
        },
      });

      t.nonNull.int('postsCount', {
        args: { where: 'JSON' },
        async resolve(obj, args, context, info) {
          const where = {
            ...translateWhere(args.where),
            publicationDate: {
              $lt: new Date(),
            },
          };
          return strapi.db.query(POST_UID).count({ where });
        },
      });

      t.field('postBySlug', {
        type: 'Post',
        args: { slug: 'String' },
        async resolve(obj, args, context, info) {
          const post = await findOneBySlug(strapi, args.slug);
          if (post) {
            if (new Date(post.publicationDate).getTime() < Date.now()) {
              setCacheHint(info, { maxAge: 8640, scope: 'PUBLIC' });
            } else {
              setCacheHint(info, { maxAge: 60, scope: 'PRIVATE' });
            }
          }
          return post;
        },
      });

      t.field('postByPermalink', {
        type: 'Post',
        args: { permalink: 'String' },
        async resolve(obj, args, context, info) {
          const found = await strapi.entityService.findMany(POST_UID, {
            filters: {
              publicationDate: { $lt: new Date() },
              permalink: args.permalink,
            },
            limit: 1,
            populate: POST_POPULATE,
          });
          return found && found[0];
        },
      });

      t.list.field('prevNextPost', {
        type: 'Post',
        args: { slug: 'String' },
        async resolve(obj, args, context, info) {
          setCacheHint(info, { maxAge: 600, scope: 'PUBLIC' });
          const post = await findOneBySlug(strapi, args.slug);
          if (!post) {
            return [];
          }
          const publicationBound = new Date();
          const post_lt = await strapi.entityService.findMany(POST_UID, {
            filters: {
              id: { $lt: post.id },
              publicationDate: { $lt: publicationBound },
            },
            orderBy: 'id:desc',
            limit: 1,
            populate: POST_POPULATE,
          });
          const post_gt = await strapi.entityService.findMany(POST_UID, {
            filters: {
              id: { $gt: post.id },
              publicationDate: { $lt: publicationBound },
            },
            orderBy: 'id:asc',
            limit: 1,
            populate: POST_POPULATE,
          });
          return [post_lt && post_lt[0], post_gt && post_gt[0]];
        },
      });

      t.list.field('relatedPosts', {
        type: 'Post',
        args: { slug: 'String' },
        async resolve(obj, args, context, info) {
          setCacheHint(info, { maxAge: 600, scope: 'PUBLIC' });
          const post = await findOneBySlug(strapi, args.slug);
          if (!post) {
            return [];
          }
          const filters = {
            id: { $ne: post.id },
            publicationDate: { $lt: new Date(post.publicationDate) },
          };
          if (post.keywords) {
            filters.keywords = { $contains: post.keywords.slice(0, 10) };
          }
          if (post.tags && post.tags.length) {
            filters.tags = { id: { $in: post.tags.map((t) => t.id) } };
          }
          return strapi.entityService.findMany(POST_UID, {
            filters,
            orderBy: 'id:desc',
            limit: 4,
            populate: POST_POPULATE,
          });
        },
      });
    },
  });

  return {
    types: [PostExtensions, PostQueries],
  };
};
