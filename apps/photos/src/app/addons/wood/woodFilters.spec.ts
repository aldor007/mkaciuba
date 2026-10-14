import {
  DEFAULT_WOOD_SORT,
  WOOD_SORTS,
  buildWoodWhere,
  formatPrice,
  isAvailabilityValue,
  isMaterialValue,
  splitFacets,
} from './woodFilters';

describe('WOOD_SORTS', () => {
  test('should include the default sort', () => {
    expect(WOOD_SORTS).toContain(DEFAULT_WOOD_SORT);
  });

  test('should only contain values matching Strapi sort syntax', () => {
    WOOD_SORTS.forEach((sort) => {
      expect(sort).toMatch(/^[a-zA-Z_][a-zA-Z0-9_]*:(asc|desc)$/);
    });
  });
});

describe('isMaterialValue / isAvailabilityValue', () => {
  test('should recognize material values', () => {
    expect(isMaterialValue('oak')).toBe(true);
    expect(isMaterialValue('ash')).toBe(true);
    expect(isMaterialValue('walnut')).toBe(true);
    expect(isMaterialValue('other')).toBe(true);
    expect(isMaterialValue('in_stock')).toBe(false);
    expect(isMaterialValue('bogus')).toBe(false);
  });

  test('should recognize availability values', () => {
    expect(isAvailabilityValue('in_stock')).toBe(true);
    expect(isAvailabilityValue('made_to_order')).toBe(true);
    expect(isAvailabilityValue('unavailable')).toBe(true);
    expect(isAvailabilityValue('oak')).toBe(false);
    expect(isAvailabilityValue('bogus')).toBe(false);
  });
});

describe('splitFacets', () => {
  test('should split material and availability values', () => {
    expect(splitFacets(['oak', 'in_stock'])).toEqual({
      material: 'oak',
      availability: 'in_stock',
    });
  });

  test('should ignore unknown values', () => {
    expect(splitFacets(['oak', 'bogus'])).toEqual({ material: 'oak', availability: null });
  });

  test('should use the first value per group (single-select)', () => {
    expect(splitFacets(['oak', 'ash', 'in_stock'])).toEqual({
      material: 'oak',
      availability: 'in_stock',
    });
  });

  test('should return empty selections for no values', () => {
    expect(splitFacets([])).toEqual({ material: null, availability: null });
  });
});

describe('buildWoodWhere', () => {
  test('should be empty without facet values', () => {
    expect(buildWoodWhere([])).toEqual({});
  });

  test('should filter by material', () => {
    expect(buildWoodWhere(['oak'])).toEqual({ material: 'oak' });
  });

  test('should filter by availability', () => {
    expect(buildWoodWhere(['in_stock'])).toEqual({ availability: 'in_stock' });
  });

  test('should combine material and availability with AND', () => {
    expect(buildWoodWhere(['oak', 'in_stock'])).toEqual({
      material: 'oak',
      availability: 'in_stock',
    });
  });

  test('should ignore unknown values', () => {
    expect(buildWoodWhere(['bogus'])).toEqual({});
  });
});

describe('formatPrice', () => {
  test('should format as PLN with comma decimal separator', () => {
    expect(formatPrice(299)).toBe('299,00 zł');
    expect(formatPrice(299.5)).toBe('299,50 zł');
    expect(formatPrice(1000)).toBe('1000,00 zł');
  });

  test('should return null for a missing price', () => {
    expect(formatPrice(null)).toBeNull();
    expect(formatPrice(undefined)).toBeNull();
  });
});
