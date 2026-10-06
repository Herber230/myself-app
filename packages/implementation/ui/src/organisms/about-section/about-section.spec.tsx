import type { Profile } from '@myself-app/domain';
import type { Career } from '@myself-app/domain/use-cases';
import { loadCareer, loadProfile } from '@myself-app/domain/use-cases';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SITE_CONTENT } from '../../test/shipped-content.js';
import { AboutSection } from './about-section.js';

describe('the about section', () => {
  it.each(['en', 'es'] as const)(
    'shows the portrait, the facts and the bio in %s',
    async locale => {
      const [profile, career] = await Promise.all([
        loadProfile(SITE_CONTENT),
        loadCareer(SITE_CONTENT),
      ]);
      const { container } = render(
        <AboutSection locale={locale} profile={profile} career={career} />,
      );
      const paragraphs = (profile.bio?.[locale] as string).split('\n\n');
      expect(paragraphs.length).toBeGreaterThan(1);
      expect(
        [...container.querySelectorAll('.about-bio > p')].map(
          p => p.textContent,
        ),
      ).toEqual(paragraphs);
      const portrait = screen.getByRole('img', {
        name: profile.pictureAlt?.[locale],
      });
      expect(portrait.getAttribute('src')).toBe('/profile/herber-colop.webp');
      const facts = container.querySelector('dl') as HTMLElement;
      expect(
        within(facts).getByText(profile.location?.[locale] as string),
      ).toBeTruthy();
      expect(within(facts).getByText('2014')).toBeTruthy();
      expect(
        within(facts).getByText(
          locale === 'en'
            ? 'Frontend Software Engineer at Vana'
            : 'Frontend Software Engineer en Vana',
        ),
      ).toBeTruthy();
    },
  );

  it('shows a fact for each thing it knows', () => {
    const career = {
      since: new Date('2015-01-01'),
      current: {
        period: {},
        employer: { name: 'Globex' },
      },
    } as unknown as Career;
    render(
      <AboutSection locale="en" profile={{} as Profile} career={career} />,
    );
    expect(screen.getByText('2015')).toBeTruthy();
    // A role the period lacks reads as nothing rather than "undefined".
    expect(screen.getByText('at Globex')).toBeTruthy();
    expect(screen.queryByText('Based in')).toBeNull();
  });

  it('keeps a portrait without alt text out of the accessibility tree', () => {
    const { container } = render(
      <AboutSection
        locale="en"
        profile={{ pictureUrl: '/me.webp' } as Profile}
      />,
    );
    expect(container.querySelector('img')?.getAttribute('alt')).toBe('');
    expect(screen.queryByRole('img')).toBeNull();
    expect(container.querySelector('dl')).toBeNull();
  });

  it('shows only its heading for a profile without a bio, a picture or facts', () => {
    const { container } = render(
      <AboutSection locale="en" profile={{} as Profile} />,
    );
    expect(container.querySelector('p')).toBeNull();
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('.about-aside')).toBeNull();
    expect(screen.getByRole('heading', { name: 'About me' })).toBeTruthy();
  });
});
