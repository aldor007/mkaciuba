import React from 'react';
import { FacetGroup, SortOption } from './woodFilters';

export interface FilterBarProps {
  sortOptions: SortOption[];
  defaultSort: string;
  sort: string | null;
  facetGroups: FacetGroup[];
  selectedValues: string[];
  count?: number;
  /** Optional slot for the grid density control, rendered next to the sort select. */
  columnsControl?: React.ReactNode;
  onSortChange: (value: string) => void;
  onToggleFacet: (value: string) => void;
  onClearAll: () => void;
}

const PILL_IDLE_CLASSES =
  'px-3 py-1 rounded-full text-sm border border-gray-600 bg-white text-gray-600 hover:bg-gray-600 hover:text-white transition-all';
const PILL_ACTIVE_CLASSES =
  'px-3 py-1 rounded-full text-sm border border-gray-800 bg-gray-600 text-white';

/**
 * Toolbar for the /wood listing: result count, clear-all, sort select,
 * facet pill groups (single-select each) and an optional columns-control slot.
 * Presentational only — all state comes from props (URL-driven in WoodPage).
 */
export const FilterBar = ({
  sortOptions,
  defaultSort,
  sort,
  facetGroups,
  selectedValues,
  count,
  columnsControl,
  onSortChange,
  onToggleFacet,
  onClearAll,
}: FilterBarProps) => {
  const hasFilters = selectedValues.length > 0;

  return (
    <div className="max-w-screen-xl mx-auto w-full px-4 mb-4" data-testid="wood-filter-bar">
      <div className="flex flex-wrap items-center gap-3">
        {count !== undefined && count !== null && (
          <span className="text-sm text-gray-600" data-testid="wood-count">
            Pozycje: {count}
          </span>
        )}
        {hasFilters && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-sm underline text-gray-600 hover:text-gray-900"
            data-testid="wood-clear-all"
          >
            Wyczyść wszystko
          </button>
        )}
        <div className="ml-auto flex flex-wrap items-center gap-2">
          {columnsControl}
          <label htmlFor="wood-sort" className="text-sm text-gray-600">
            Sortuj
          </label>
          <select
            id="wood-sort"
            data-testid="wood-sort-select"
            value={sort || defaultSort}
            onChange={(event) => onSortChange(event.target.value)}
            className="border border-gray-600 rounded-xl px-3 py-2 text-sm bg-white text-gray-900"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-2 mt-3">
        {facetGroups.map((group) => (
          <div
            key={group.label}
            className="flex flex-wrap items-center gap-2"
            data-testid={`wood-facet-${group.label}`}
          >
            <span className="text-sm text-gray-600">{group.label}:</span>
            {group.options.map((option) => {
              const active = selectedValues.includes(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onToggleFacet(option.value)}
                  aria-pressed={active}
                  className={active ? PILL_ACTIVE_CLASSES : PILL_IDLE_CLASSES}
                  data-testid={`wood-pill-${option.value}`}
                  data-active={active}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
