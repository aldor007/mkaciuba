const productModel = require('../../../api/product/models/product');

// Mock slugify. Virtual: the blog's node_modules may not be installed in this
// workspace (specs run from the workspace root); the virtual mock keeps this
// spec runnable in both environments.
jest.mock('slugify', () => (text, options) => {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}, {virtual: true});

// Mock makeid
jest.mock('../../../lib', () => ({
  makeid: jest.fn((length) => {
    // Return predictable ID for testing
    return 'abcd'.substring(0, length);
  })
}));

describe('api/product/models/product.js', () => {
  describe('lifecycles', () => {
    describe('beforeCreate', () => {
      it('should generate slug from name', async () => {
        const data = {
          name: 'Testowy produkt'
        };

        await productModel.lifecycles.beforeCreate(data);

        expect(data.slug).toBeDefined();
        expect(data.slug).toContain('testowy-produkt');
        expect(data.slug).toContain('-abcd');
      });

      it('should handle name with special characters', async () => {
        const data = {
          name: 'Produkt: Testowy (specjalny)!'
        };

        await productModel.lifecycles.beforeCreate(data);

        expect(data.slug).toBeDefined();
        expect(data.slug).toMatch(/^produkt-testowy-specjalny-[a-z0-9]{4}$/);
      });

      it('should handle name with spaces', async () => {
        const data = {
          name: '  Multiple   Spaces   Between  '
        };

        await productModel.lifecycles.beforeCreate(data);

        expect(data.slug).toBeDefined();
        expect(data.slug).toMatch(/^multiple-spaces-between-[a-z0-9]{4}$/);
      });

      it('should handle non-ASCII characters', async () => {
        const data = {
          name: 'Tëst Prödukt Nàme'
        };

        await productModel.lifecycles.beforeCreate(data);

        expect(data.slug).toBeDefined();
        // Slugify should handle non-ASCII characters
        expect(typeof data.slug).toBe('string');
      });

      it('should not modify data when name is missing', async () => {
        const data = {
          description: 'Some description'
        };

        await productModel.lifecycles.beforeCreate(data);

        expect(data.slug).toBeUndefined();
      });

      it('should handle empty name', async () => {
        const data = {
          name: ''
        };

        await productModel.lifecycles.beforeCreate(data);

        expect(data.slug).toBeUndefined();
      });

      it('should handle null name', async () => {
        const data = {
          name: null
        };

        await productModel.lifecycles.beforeCreate(data);

        expect(data.slug).toBeUndefined();
      });

      it('should append random ID to slug', async () => {
        const { makeid } = require('../../../lib');

        // Set up mock to return specific value
        makeid.mockReturnValueOnce('xyz9');

        const data = {
          name: 'Test Product'
        };

        await productModel.lifecycles.beforeCreate(data);

        expect(data.slug).toBe('test-product-xyz9');
        expect(makeid).toHaveBeenCalledWith(4);
      });

      it('should generate unique slugs for same name', async () => {
        const { makeid } = require('../../../lib');

        // Mock different IDs for each call
        makeid
          .mockReturnValueOnce('aaa1')
          .mockReturnValueOnce('bbb2');

        const data1 = { name: 'Same Name' };
        const data2 = { name: 'Same Name' };

        await productModel.lifecycles.beforeCreate(data1);
        await productModel.lifecycles.beforeCreate(data2);

        expect(data1.slug).toBe('same-name-aaa1');
        expect(data2.slug).toBe('same-name-bbb2');
        expect(data1.slug).not.toBe(data2.slug);
      });

      it('should handle very long names', async () => {
        const longName = 'A'.repeat(200);
        const data = { name: longName };

        await productModel.lifecycles.beforeCreate(data);

        expect(data.slug).toBeDefined();
        expect(typeof data.slug).toBe('string');
        // Should still append the ID
        expect(data.slug).toMatch(/-[a-z0-9]{4}$/);
      });
    });
  });
});
