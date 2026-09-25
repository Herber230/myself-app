import type { Profile } from '@myself-app/domain';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { loadProfile } from '../../content/profile';
import { SITE_REPOSITORIES } from '../../content/repositories';
import { Hero } from './hero';

describe('the hero', () => {
  it('shows the name, the title, the tagline and the two calls to action', async () => {
    const profile = await loadProfile(SITE_REPOSITORIES);
    render(<Hero locale="es" profile={profile} />);
    expect(
      screen.getByRole('heading', { level: 1, name: 'Herber Colop' }),
    ).toBeTruthy();
    expect(screen.getByText('Ingeniero de software')).toBeTruthy();
    expect(
      screen.getByText(
        'Ingeniero de software enfocado en la arquitectura, no en las herramientas.',
      ),
    ).toBeTruthy();
    expect(
      screen.getByRole('link', { name: 'Ver mi CV' }).getAttribute('href'),
    ).toBe('/es/cv/');
    expect(
      screen
        .getByRole('link', { name: 'Explorar mi radar tecnológico' })
        .getAttribute('href'),
    ).toBe('/es/tech-radar/');
    expect(
      screen
        .getByRole('link', { name: 'Desliza para ver más' })
        .getAttribute('href'),
    ).toBe('/es/#about');
  });

  it('shows no title or tagline line for a profile without them', () => {
    const profile = { firstName: 'Ada', lastName: 'Lovelace' } as Profile;
    const { container } = render(<Hero locale="en" profile={profile} />);
    expect(container.querySelector('.hero-title')).toBeNull();
    expect(container.querySelector('.hero-tagline')).toBeNull();
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(
      'Ada Lovelace',
    );
  });
});
