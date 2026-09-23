import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ScrollCue } from './scroll-cue';

describe('the scroll cue', () => {
  it('is a link to the first section, named by its label', () => {
    render(<ScrollCue href="/en/#about" label="Scroll to read more" />);
    expect(
      screen
        .getByRole('link', { name: 'Scroll to read more' })
        .getAttribute('href'),
    ).toBe('/en/#about');
  });
});
