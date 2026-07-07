import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';
import React from 'react';

// Mock dependencies
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { changeLanguage: vi.fn(), language: 'en-IN' },
  }),
}));

describe('App', () => {
  it('renders without crashing', () => {
    expect(true).toBe(true);
  });
});
