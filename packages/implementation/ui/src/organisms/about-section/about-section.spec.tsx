import type { Profile } from '@myself-app/domain';
import { loadProfile } from '@myself-app/domain/use-cases';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SITE_CONTENT } from '../../test/shipped-content.js';
import { AboutSection } from './about-section.js';

describe('the about section', () => {
  it.each(['en', 'es'] as const)(
    'shows the portrait and the bio in %s',
    async locale => {
      const profile = await loadProfile(SITE_CONTENT);
      render(<AboutSection locale={locale} profile={profile} />);
      expect(screen.getByText(profile.bio?.[locale] as string)).toBeTruthy();
      const portrait = screen.getByRole('img', {
        name: profile.pictureAlt?.[locale],
      });
      expect(portrait.getAttribute('src')).toBe('/profile/herber-colop.webp');
    },
  );

  it('keeps a portrait without alt text out of the accessibility tree', () => {
    const { container } = render(
      <AboutSection
        locale="en"
        profile={{ pictureUrl: '/me.webp' } as Profile}
      />,
    );
    expect(container.querySelector('img')?.getAttribute('alt')).toBe('');
    expect(screen.queryByRole('img')).toBeNull();
  });

  it('shows only its heading for a profile without a bio or a picture', () => {
    const { container } = render(
      <AboutSection locale="en" profile={{} as Profile} />,
    );
    expect(container.querySelector('p')).toBeNull();
    expect(container.querySelector('img')).toBeNull();
    expect(screen.getByRole('heading', { name: 'About me' })).toBeTruthy();
  });
});
