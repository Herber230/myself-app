import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { EntifixSection } from './entifix-section';

describe('the entifix section', () => {
  it('links the repository and the packages, safely', () => {
    render(<EntifixSection locale="en" />);
    const links = screen.getAllByRole('link');
    expect(links.map(link => link.getAttribute('href'))).toEqual([
      'https://github.com/r10c-technologies/entifix',
      'https://www.npmjs.com/org/entifix',
    ]);
    for (const link of links) {
      expect(link.getAttribute('rel')).toBe('noopener noreferrer');
    }
  });

  it('says how this page runs on it, in each locale', () => {
    render(<EntifixSection locale="es" />);
    expect(
      screen.getByRole('region', { name: 'Construido sobre entifix' })
        .textContent,
    ).toContain('caso de uso');
  });
});
