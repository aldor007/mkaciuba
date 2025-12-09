import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import App from './app';

describe('App', () => {
  beforeEach(() => {
    // Mock window.scrollTo since jsdom doesn't implement it
    window.scrollTo = jest.fn();
  });

  afterEach(() => {
    cleanup();
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
