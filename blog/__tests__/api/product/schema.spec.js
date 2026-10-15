const schema = require('../../../api/product/config/schema.graphql');

describe('api/product/config/schema.graphql.js', () => {
  afterEach(() => {
    delete global.strapi;
  });

  it('should define the productsCount query (shadow CRUD does not generate Count queries)', () => {
    expect(schema.definition).toContain('productsCount(where: JSON): Int!');
    expect(schema.resolver.Query.productsCount).toBeDefined();
    expect(schema.resolver.Query.productsCount.resolver).toBeInstanceOf(Function);
    expect(schema.resolver.Query.productsCount.resolverOf).toBe(
      'application::product.product.find'
    );
  });

  it('should count products with the where filter', async () => {
    global.strapi = {
      services: {
        product: {
          count: jest.fn().mockResolvedValue(7),
        },
      },
    };

    const result = await schema.resolver.Query.productsCount.resolver(
      null,
      { where: { material: 'oak' } },
      {},
      {}
    );

    expect(global.strapi.services.product.count).toHaveBeenCalledWith({ material: 'oak' });
    expect(result).toBe(7);
  });

  it('should default to an empty where filter', async () => {
    global.strapi = {
      services: {
        product: {
          count: jest.fn().mockResolvedValue(0),
        },
      },
    };

    const result = await schema.resolver.Query.productsCount.resolver(null, {}, {}, {});

    expect(global.strapi.services.product.count).toHaveBeenCalledWith({});
    expect(result).toBe(0);
  });
});
