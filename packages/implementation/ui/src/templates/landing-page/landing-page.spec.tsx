import {
  loadBeyondCodeTeaser,
  loadCareer,
  loadContactChannels,
  loadFeaturedProjects,
  loadPersonalChannels,
  loadProfile,
} from '@myself-app/domain/use-cases';
import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { stubIntersectionObserver } from '../../test/intersection-observer.js';
import { renderPage } from '../../test/render.js';
import { SITE_CONTENT } from '../../test/shipped-content.js';
import { LandingPageView } from './landing-page.js';

// The nav marks the section in view, which jsdom cannot observe.
beforeEach(() => {
  stubIntersectionObserver();
});

describe('the landing page', () => {
  it('runs the hero, then each section the nav anchors to, then the door to "Beyond the code"', async () => {
    const [profile, career, projects, channels, beyondCode, personalChannels] =
      await Promise.all([
        loadProfile(SITE_CONTENT),
        loadCareer(SITE_CONTENT),
        loadFeaturedProjects(SITE_CONTENT),
        loadContactChannels(SITE_CONTENT),
        loadBeyondCodeTeaser(SITE_CONTENT),
        loadPersonalChannels(SITE_CONTENT),
      ]);
    await renderPage(
      Promise.resolve(
        <LandingPageView
          locale="en"
          profile={profile}
          career={career}
          projects={projects}
          channels={channels}
          cvVariant="full-stack"
          beyondCode={beyondCode}
          personalChannels={personalChannels}
        />,
      ),
      'en',
    );
    expect(
      screen.getByRole('heading', { level: 1, name: 'Herber Colop' }),
    ).toBeTruthy();
    expect(
      [...document.querySelectorAll('main > section[id]')].map(
        section => section.id,
      ),
    ).toEqual(['about', 'projects', 'contact', 'beyond-code']);
  });
});
