import type { Profile } from '@myself-app/domain';
import { loadProfile } from '@myself-app/domain/use-cases';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SITE_CONTENT } from '../../test/shipped-content.js';
import { Hero } from './hero.js';

describe('the hero', () => {
  it('shows the name, the title and the three calls to action', async () => {
    const profile = await loadProfile(SITE_CONTENT);
    const { container } = render(<Hero locale="es" profile={profile} />);
    expect(
      screen.getByRole('heading', { level: 1, name: 'Herber Colop' }),
    ).toBeTruthy();
    expect(screen.getByText('Ingeniero de software')).toBeTruthy();
    // The shipped profile carries no tagline.
    expect(container.querySelector('.hero-tagline')).toBeNull();
    expect(
      screen.getByRole('link', { name: 'Ver mi CV' }).getAttribute('href'),
    ).toBe('/es/cv/');
    expect(
      screen
        .getByRole('link', { name: 'Explorar mi radar tecnológico' })
        .getAttribute('href'),
    ).toBe('/es/tech-radar/');
    expect(
      screen.getByRole('link', { name: 'Leer mi blog' }).getAttribute('href'),
    ).toBe('/es/blog/');
    expect(
      screen
        .getByRole('link', { name: 'Desliza para ver más' })
        .getAttribute('href'),
    ).toBe('/es/#about');
  });

  it('shows a tagline when the profile has one', () => {
    const profile = {
      firstName: 'Ada',
      lastName: 'Lovelace',
      tagline: { en: 'The first programmer.', es: 'La primera programadora.' },
    } as unknown as Profile;
    render(<Hero locale="en" profile={profile} />);
    expect(screen.getByText('The first programmer.')).toBeTruthy();
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
