import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import App from './app';

describe('App', () => {
  beforeEach(() => {
    // Mock window.scrollTo since jsdom doesn't implement it
    window.scrollTo = jest.fn();

    // Mock global fetch for Apollo Client
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: {} }),
        text: () => Promise.resolve('{}'),
      })
    ) as jest.Mock;
  });

  afterEach(() => {
    cleanup();
    jest.restoreAllMocks();
  });

  it('should render successfully', () => {
    const { baseElement } = render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );
    expect(baseElement).toBeTruthy();
  });
});
