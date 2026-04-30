import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import App from './App';

describe('App Component', () => {
  it('renders the header title', () => {
    render(<App />);
    const titleElement = screen.getByText(/Vortex Ingestion Hub/i);
    expect(titleElement).toBeDefined();
  });

  it('shows engine connected status', () => {
    render(<App />);
    const statusElement = screen.getByText(/ENGINE.CONNECTED/i);
    expect(statusElement).toBeDefined();
  });
});
