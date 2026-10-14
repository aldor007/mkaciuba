import { ProductAvailability, ProductMaterial } from './types';

export interface SortOption {
  value: string;
  label: string;
}

export interface FacetOption {
  value: string;
  label: string;
}

export interface FacetGroup {
  label: string;
  options: FacetOption[];
}

/** Sort options offered on the /wood listing (PL labels match the site language). */
export const WOOD_SORT_OPTIONS: SortOption[] = [
  { value: 'id:desc', label: 'Najnowsze' },
  { value: 'publicationDate:desc', label: 'Od najnowszych' },
  { value: 'publicationDate:asc', label: 'Od najstarszych' },
  { value: 'name:asc', label: 'Alfabetycznie, A-Z' },
  { value: 'name:desc', label: 'Alfabetycznie, Z-A' },
  { value: 'price:asc', label: 'Cena, od najniższej' },
  { value: 'price:desc', label: 'Cena, od najwyższej' },
];

/** Whitelist of sort values accepted from the URL (see parseListingParams). */
export const WOOD_SORTS = WOOD_SORT_OPTIONS.map((option) => option.value);

/** Default sort — newest products first (mirrors the site's other listings). */
export const DEFAULT_WOOD_SORT = 'id:desc';

export const MATERIAL_OPTIONS: Array<{ value: ProductMaterial; label: string }> = [
  { value: 'oak', label: 'Dąb' },
  { value: 'ash', label: 'Jesion' },
  { value: 'walnut', label: 'Orzech' },
  { value: 'other', label: 'Inne' },
];

export const AVAILABILITY_OPTIONS: Array<{ value: ProductAvailability; label: string }> = [
  { value: 'in_stock', label: 'W magazynie' },
  { value: 'made_to_order', label: 'Na zamówienie' },
  { value: 'unavailable', label: 'Niedostępny' },
];

const MATERIAL_VALUES = MATERIAL_OPTIONS.map((option) => option.value);
const AVAILABILITY_VALUES = AVAILABILITY_OPTIONS.map((option) => option.value);

export const isMaterialValue = (value: string): value is ProductMaterial =>
  MATERIAL_VALUES.indexOf(value as ProductMaterial) !== -1;

export const isAvailabilityValue = (value: string): value is ProductAvailability =>
  AVAILABILITY_VALUES.indexOf(value as ProductAvailability) !== -1;

/**
 * Splits validated facet values from the URL (?tag=oak,in_stock) into material
 * and availability selections. Facets are single-select per group; the two
 * groups combine with AND in the where filter. Unknown values are ignored.
 */
export const splitFacets = (
  values: string[]
): { material: ProductMaterial | null; availability: ProductAvailability | null } => {
  const material = values.find(isMaterialValue) || null;
  const availability = values.find(isAvailabilityValue) || null;
  return { material, availability };
};

/** Builds the Strapi v3 where filter from the selected facet values (AND across groups). */
export const buildWoodWhere = (values: string[]): Record<string, string> => {
  const { material, availability } = splitFacets(values);
  const where: Record<string, string> = {};
  if (material) {
    where.material = material;
  }
  if (availability) {
    where.availability = availability;
  }
  return where;
};

/** Formats a price as PLN, e.g. 299 → "299,00 zł". */
export const formatPrice = (price?: number | null): string | null => {
  if (price === undefined || price === null) {
    return null;
  }
  return `${price.toFixed(2).replace('.', ',')} zł`;
};
