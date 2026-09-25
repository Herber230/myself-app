import type { Profile } from '@myself-app/domain';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { loadProfile } from '../../content/profile';
import { SITE_REPOSITORIES } from '../../content/repositories';
import { AboutSection } from './about-section';

describe('the about section', () => {
  it.each(['en', 'es'] as const)('shows the bio in %s', async locale => {
    const profile = await loadProfile(SITE_REPOSITORIES);
    render(<AboutSection locale={locale} profile={profile} />);
    expect(screen.getByText(profile.bio?.[locale] as string)).toBeTruthy();
  });

  it('shows only its heading for a profile without a bio', () => {
    const { container } = render(
      <AboutSection locale="en" profile={{} as Profile} />,
    );
    expect(container.querySelector('p')).toBeNull();
    expect(screen.getByRole('heading', { name: 'About me' })).toBeTruthy();
  });
});
