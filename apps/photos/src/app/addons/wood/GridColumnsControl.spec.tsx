import React from 'react';
import { act, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react';
import {
  DEFAULT_GRID_COLUMNS,
  GridColumnsControl,
  getGridClasses,
  useGridColumns,
} from './GridColumnsControl';

describe('getGridClasses', () => {
  test('should map each density to responsive width classes', () => {
    expect(getGridClasses(2)).toContain('md:w-1/2');
    expect(getGridClasses(3)).toContain('md:w-1/3');
    expect(getGridClasses(4)).toContain('md:w-1/4');
  });

  test('should keep single-column layout on small screens', () => {
    [2, 3, 4].forEach((columns) => {
      expect(getGridClasses(columns as any)).toContain('w-full');
    });
  });
});

describe('useGridColumns', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  test('should default to 2 columns (hydration-safe)', () => {
    const { result } = renderHook(() => useGridColumns());
    expect(result.current[0]).toBe(DEFAULT_GRID_COLUMNS);
  });

  test('should read the stored preference after mount', async () => {
    window.localStorage.setItem('mk:wood-cols', '3');
    const { result } = renderHook(() => useGridColumns());
    await waitFor(() => expect(result.current[0]).toBe(3));
  });

  test('should fall back to 2 for invalid stored values', async () => {
    window.localStorage.setItem('mk:wood-cols', '9');
    const { result } = renderHook(() => useGridColumns());
    await waitFor(() => expect(result.current[0]).toBe(DEFAULT_GRID_COLUMNS));
  });

  test('should persist density changes', async () => {
    const { result } = renderHook(() => useGridColumns());
    act(() => {
      result.current[1](4);
    });
    await waitFor(() => expect(result.current[0]).toBe(4));
    expect(window.localStorage.getItem('mk:wood-cols')).toBe('4');
  });
});

describe('GridColumnsControl', () => {
  test('should render 2/3/4 buttons with the active state', () => {
    const onChange = jest.fn();
    render(<GridColumnsControl columns={3} onChange={onChange} />);

    expect(screen.getByTestId('grid-cols-3')).toHaveAttribute('data-active', 'true');
    expect(screen.getByTestId('grid-cols-2')).toHaveAttribute('data-active', 'false');
    expect(screen.getByTestId('grid-cols-4')).toHaveAttribute('data-active', 'false');
  });

  test('should call onChange with the selected density', () => {
    const onChange = jest.fn();
    render(<GridColumnsControl columns={2} onChange={onChange} />);

    fireEvent.click(screen.getByTestId('grid-cols-4'));
    expect(onChange).toHaveBeenCalledWith(4);
  });
});
