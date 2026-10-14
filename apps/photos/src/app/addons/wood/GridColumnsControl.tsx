import React, { useEffect, useState } from 'react';

export type GridColumns = 2 | 3 | 4;

const STORAGE_KEY = 'mk:wood-cols';
const VALID_COLUMNS: GridColumns[] = [2, 3, 4];

/** Default density — matches the site's existing 2-column card grids. */
export const DEFAULT_GRID_COLUMNS: GridColumns = 2;

/** Responsive width classes for each density (mirrors the site's card grid patterns). */
export const getGridClasses = (columns: GridColumns): string =>
  (
    {
      2: 'w-full sm:w-1/1 md:w-1/2',
      3: 'w-full sm:w-1/2 md:w-1/3',
      4: 'w-full sm:w-1/2 md:w-1/4',
    } as Record<GridColumns, string>
  )[columns];

const readStoredColumns = (): GridColumns => {
  if (typeof window === 'undefined') {
    return DEFAULT_GRID_COLUMNS;
  }
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? parseInt(stored, 10) : NaN;
    return (VALID_COLUMNS as number[]).indexOf(parsed) !== -1
      ? (parsed as GridColumns)
      : DEFAULT_GRID_COLUMNS;
  } catch {
    return DEFAULT_GRID_COLUMNS;
  }
};

/**
 * Grid density preference for the /wood listing.
 * Applied POST-MOUNT only — localStorage is not available during SSR and the
 * default must match the server-rendered markup to keep hydration stable.
 */
export const useGridColumns = (): [GridColumns, (columns: GridColumns) => void] => {
  const [columns, setColumns] = useState<GridColumns>(DEFAULT_GRID_COLUMNS);

  useEffect(() => {
    setColumns(readStoredColumns());
  }, []);

  const updateColumns = (next: GridColumns) => {
    setColumns(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, String(next));
    } catch {
      // localStorage unavailable (private mode etc.) — in-memory only
    }
  };

  return [columns, updateColumns];
};

export interface GridColumnsControlProps {
  columns: GridColumns;
  onChange: (columns: GridColumns) => void;
}

export const GridColumnsControl = ({ columns, onChange }: GridColumnsControlProps) => (
  <div
    className="flex items-center gap-1"
    role="group"
    aria-label="Liczba kolumn"
    data-testid="grid-columns-control"
  >
    {VALID_COLUMNS.map((value) => {
      const active = columns === value;
      return (
        <button
          key={value}
          type="button"
          onClick={() => onChange(value)}
          aria-pressed={active}
          title={`${value} kolumny`}
          className={
            active
              ? 'w-9 h-9 text-sm border border-gray-800 rounded-lg bg-gray-600 text-white transition-all'
              : 'w-9 h-9 text-sm border border-gray-600 rounded-lg bg-white text-gray-600 hover:bg-gray-600 hover:text-white transition-all'
          }
          data-testid={`grid-cols-${value}`}
          data-active={active}
        >
          {value}
        </button>
      );
    })}
  </div>
);
