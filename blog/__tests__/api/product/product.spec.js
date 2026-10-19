'use strict';

const productLifecycles = require('../../../src/api/product/content-types/product/lifecycles');

// Mock slugify (simple transliteration-free behaviour, as in the v3 spec)
jest.mock('slugify', () => (text, options) => {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
});

// Mock makeid
jest.mock('../../../lib', () => ({
  makeid: jest.fn((length) => {
    // Return predictable ID for testing
    return 'abcd'.substring(0, length);
  })
}));

describe('api/product lifecycles (v4)', () => {
  describe('beforeCreate', () => {
    it('should generate slug from name', async () => {
      const data = { name: 'Testowy produkt' };

      await productLifecycles.beforeCreate({ params: { data } });

      expect(data.slug).toBeDefined();
      expect(data.slug).toContain('testowy-produkt');
      expect(data.slug).toContain('-abcd');
    });

    it('should handle name with special characters', async () => {
      const data = { name: 'Produkt: Testowy (specjalny)!' };

      await productLifecycles.beforeCreate({ params: { data } });

      expect(data.slug).toBeDefined();
      expect(data.slug).toMatch(/^produkt-testowy-specjalny-[a-z0-9]{4}$/);
    });

    it('should handle name with spaces', async () => {
      const data = { name: '  Multiple   Spaces   Between  ' };

      await productLifecycles.beforeCreate({ params: { data } });

      expect(data.slug).toBeDefined();
      expect(data.slug).toMatch(/^multiple-spaces-between-[a-z0-9]{4}$/);
    });

    it('should not modify data when name is missing', async () => {
      const data = { description: 'Some description' };

      await productLifecycles.beforeCreate({ params: { data } });

      expect(data.slug).toBeUndefined();
    });

    it('should handle empty name', async () => {
      const data = { name: '' };

      await productLifecycles.beforeCreate({ params: { data } });

      expect(data.slug).toBeUndefined();
    });

    it('should handle null name', async () => {
      const data = { name: null };

      await productLifecycles.beforeCreate({ params: { data } });

      expect(data.slug).toBeUndefined();
    });

    it('should append random ID to slug', async () => {
      const { makeid } = require('../../../lib');

      // Set up mock to return specific value
      makeid.mockReturnValueOnce('xyz9');

      const data = { name: 'Test Product' };

      await productLifecycles.beforeCreate({ params: { data } });

      expect(data.slug).toBe('test-product-xyz9');
      expect(makeid).toHaveBeenCalledWith(4);
    });

    it('should generate unique slugs for same name', async () => {
      const { makeid } = require('../../../lib');

      makeid.mockReturnValueOnce('aaa1').mockReturnValueOnce('bbb2');

      const data1 = { name: 'Same Name' };
      const data2 = { name: 'Same Name' };

      await productLifecycles.beforeCreate({ params: { data: data1 } });
      await productLifecycles.beforeCreate({ params: { data: data2 } });

      expect(data1.slug).toBe('same-name-aaa1');
      expect(data2.slug).toBe('same-name-bbb2');
      expect(data1.slug).not.toBe(data2.slug);
    });

    it('should handle very long names', async () => {
      const longName = 'A'.repeat(200);
      const data = { name: longName };

      await productLifecycles.beforeCreate({ params: { data } });

      expect(data.slug).toBeDefined();
      expect(typeof data.slug).toBe('string');
      expect(data.slug).toMatch(/-[a-z0-9]{4}$/);
    });
  });
});
