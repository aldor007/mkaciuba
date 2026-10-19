'use strict';

/**
 * v4 port of the productsCount spec: the v3 schema.graphql.js resolver
 * became a nexus field in src/graphql/misc.js. A minimal fake nexus
 * captures the field definitions so the resolvers can be invoked directly.
 */
const miscModule = require('../../../src/graphql/misc');

function buildFakeNexus() {
  const captured = { queryFields: {}, extendedTypes: [] };
  const makeT = () => {
    const t = {
      _fields: {},
      field(name, cfg) {
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
  };
  return { nexus, captured };
}

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
