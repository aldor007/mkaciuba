'use strict';

/**
 * v4 port of the productsCount spec: the v3 schema.graphql.js resolver
 * became a nexus field in src/graphql/misc.js. A minimal fake nexus
 * captures the field definitions so the resolvers can be invoked directly.
 */
const miscModule = require('../../../src/graphql/misc');
const categoryModule = require('../../../src/graphql/category');
const postModule = require('../../../src/graphql/post');

function buildFakeNexus() {
  const captured = { queryFields: {}, extendedTypes: [] };
  const makeT = () => {
    const t = {
      _fields: {},
      field(name, cfg) {
        t._fields[name] = cfg;
      },
      id(name, cfg) {
        t._fields[name] = cfg;
      },
      string(name, cfg) {
        t._fields[name] = cfg;
      },
      nonNull: {
        id(name, cfg) {
          t._fields[name] = cfg;
        },
        int(name, cfg) {
          t._fields[name] = cfg;
        },
        string(name, cfg) {
          t._fields[name] = cfg;
        },
      },
      list: {
        field(name, cfg) {
          t._fields[name] = cfg;
        },
      },
    };
    t.list = Object.assign((name, cfg) => {
      if (typeof name === 'string') {
        return { name, cfg };
      }
      return null;
    }, {
      field(name, cfg) {
        t._fields[name] = cfg;
      },
    });
    return t;
  };
  const nexus = {
    objectType: (cfg) => cfg,
    extendType: ({ type, definition }) => {
      const t = makeT();
      definition(t);
      if (type === 'Query') {
        Object.assign(captured.queryFields, t._fields);
      } else {
        captured.extendedTypes.push({ type, fields: t._fields });
      }
    },
    nonNull: (inner) => ({ _nonNull: inner }),
    list: (inner) => ({ _list: inner }),
  };
  return { nexus, captured };
}

describe('src/graphql compatibility layer', () => {
  it('registers the flat relation/media fields expected by the v3 frontend on Category', () => {
    const { nexus, captured } = buildFakeNexus();
    categoryModule({ nexus });
    const categoryFields = captured.extendedTypes.find((entry) => entry.type === 'Category').fields;
    expect(categoryFields.file).toBeDefined();
    expect(categoryFields.gallery).toBeDefined();
    expect(categoryFields.image).toBeDefined();
    expect(categoryFields.medias).toBeDefined();
    expect(categoryFields.medias.args).toEqual({
      start: 'Int',
      limit: 'Int',
      sort: 'String',
    });
  });

  it('registers the flat relation/media fields expected by the v3 frontend on Post', () => {
    const { nexus, captured } = buildFakeNexus();
    postModule({ nexus });
    const postFields = captured.extendedTypes.find((entry) => entry.type === 'Post').fields;
    expect(postFields.image).toBeDefined();
    expect(postFields.cover_image).toBeDefined();
    expect(postFields.gallery).toBeDefined();
    expect(postFields.category).toBeDefined();
    expect(postFields.tags).toBeDefined();
  });
});

describe('src/graphql/misc — productsCount', () => {
  let productsCount;

  beforeAll(() => {
    const { nexus, captured } = buildFakeNexus();
    miscModule({ nexus });
    productsCount = captured.queryFields.productsCount;
  });

  afterEach(() => {
    delete global.strapi;
  });

  it('registers a non-null Int productsCount query (shadow CRUD does not generate Count queries)', () => {
    expect(productsCount).toBeDefined();
    expect(productsCount.resolve).toBeInstanceOf(Function);
  });

  it('should count products with the where filter', async () => {
    const count = jest.fn().mockResolvedValue(7);
    global.strapi = {
      db: {
        query: jest.fn().mockReturnValue({ count }),
      },
    };

    const result = await productsCount.resolve(null, { where: { material: 'oak' } }, {}, {});

    expect(global.strapi.db.query).toHaveBeenCalledWith('api::product.product');
    expect(count).toHaveBeenCalledWith({ where: { material: 'oak' } });
    expect(result).toBe(7);
  });

  it('should translate v3-style where operators to v4 filters', async () => {
    const count = jest.fn().mockResolvedValue(2);
    global.strapi = {
      db: {
        query: jest.fn().mockReturnValue({ count }),
      },
    };

    const result = await productsCount.resolve(null, { where: { price_lt: 100 } }, {}, {});

    expect(count).toHaveBeenCalledWith({ where: { price: { $lt: 100 } } });
    expect(result).toBe(2);
  });

  it('should default to an empty where filter', async () => {
    const count = jest.fn().mockResolvedValue(0);
    global.strapi = {
      db: {
        query: jest.fn().mockReturnValue({ count }),
      },
    };

    const result = await productsCount.resolve(null, {}, {}, {});

    expect(count).toHaveBeenCalledWith({ where: {} });
    expect(result).toBe(0);
  });
});
