import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FilterBar } from './FilterBar';
import { DEFAULT_WOOD_SORT, WOOD_SORT_OPTIONS } from './woodFilters';

const FACET_GROUPS = [
  {
    label: 'Materiał',
    options: [
      { value: 'oak', label: 'Dąb' },
      { value: 'ash', label: 'Jesion' },
    ],
  },
  {
    label: 'Dostępność',
    options: [{ value: 'in_stock', label: 'W magazynie' }],
  },
];

const baseProps = {
  sortOptions: WOOD_SORT_OPTIONS,
  defaultSort: DEFAULT_WOOD_SORT,
  sort: null as string | null,
  facetGroups: FACET_GROUPS,
  selectedValues: [] as string[],
  count: undefined as number | undefined,
  onSortChange: jest.fn(),
  onToggleFacet: jest.fn(),
  onClearAll: jest.fn(),
};

describe('FilterBar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render all sort options', () => {
    render(<FilterBar {...baseProps} />);
    WOOD_SORT_OPTIONS.forEach((option) => {
      expect(screen.getByText(option.label)).toBeInTheDocument();
    });
  });

  test('should default the select to the default sort', () => {
    render(<FilterBar {...baseProps} />);
    expect((screen.getByTestId('wood-sort-select') as HTMLSelectElement).value).toBe(
      DEFAULT_WOOD_SORT
    );
  });

  test('should reflect the active sort', () => {
    render(<FilterBar {...baseProps} sort="name:asc" />);
    expect((screen.getByTestId('wood-sort-select') as HTMLSelectElement).value).toBe('name:asc');
  });

  test('should call onSortChange when the sort changes', () => {
    render(<FilterBar {...baseProps} />);
    fireEvent.change(screen.getByTestId('wood-sort-select'), { target: { value: 'name:asc' } });
    expect(baseProps.onSortChange).toHaveBeenCalledWith('name:asc');
  });

  test('should show the result count', () => {
    render(<FilterBar {...baseProps} count={5} />);
    expect(screen.getByText('Pozycje: 5')).toBeInTheDocument();
  });

  test('should hide the count when undefined', () => {
    render(<FilterBar {...baseProps} />);
    expect(screen.queryByText(/Pozycje:/)).not.toBeInTheDocument();
  });

  test('should render facet pills from all groups', () => {
    render(<FilterBar {...baseProps} />);
    expect(screen.getByTestId('wood-pill-oak')).toBeInTheDocument();
    expect(screen.getByTestId('wood-pill-ash')).toBeInTheDocument();
    expect(screen.getByTestId('wood-pill-in_stock')).toBeInTheDocument();
  });

  test('should highlight selected values', () => {
    render(<FilterBar {...baseProps} selectedValues={['oak']} />);
    expect(screen.getByTestId('wood-pill-oak')).toHaveAttribute('data-active', 'true');
    expect(screen.getByTestId('wood-pill-ash')).toHaveAttribute('data-active', 'false');
    expect(screen.getByTestId('wood-pill-in_stock')).toHaveAttribute('data-active', 'false');
  });

  test('should call onToggleFacet on pill click', () => {
    render(<FilterBar {...baseProps} />);
    fireEvent.click(screen.getByTestId('wood-pill-oak'));
    expect(baseProps.onToggleFacet).toHaveBeenCalledWith('oak');
  });

  test('should show clear-all only when filters are active', () => {
    const { rerender } = render(<FilterBar {...baseProps} selectedValues={[]} />);
    expect(screen.queryByTestId('wood-clear-all')).not.toBeInTheDocument();

    rerender(<FilterBar {...baseProps} selectedValues={['oak']} />);
    expect(screen.getByTestId('wood-clear-all')).toBeInTheDocument();
  });

  test('should call onClearAll on click', () => {
    render(<FilterBar {...baseProps} selectedValues={['oak']} />);
    fireEvent.click(screen.getByTestId('wood-clear-all'));
    expect(baseProps.onClearAll).toHaveBeenCalled();
  });

  test('should render the columnsControl slot', () => {
    render(
      <FilterBar
        {...baseProps}
        columnsControl={<button type="button" data-testid="columns-slot" />}
      />
    );
    expect(screen.getByTestId('columns-slot')).toBeInTheDocument();
  });
});
