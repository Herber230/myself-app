import {
  loadContactChannels,
  loadFeaturedProjects,
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
  it('runs the hero, then each section the nav anchors to, in order', async () => {
    const [profile, projects, channels] = await Promise.all([
      loadProfile(SITE_CONTENT),
      loadFeaturedProjects(SITE_CONTENT),
      loadContactChannels(SITE_CONTENT),
    ]);
    await renderPage(
      Promise.resolve(
        <LandingPageView
          locale="en"
          profile={profile}
          projects={projects}
          channels={channels}
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
    ).toEqual(['about', 'projects', 'entifix', 'contact']);
  });
});
