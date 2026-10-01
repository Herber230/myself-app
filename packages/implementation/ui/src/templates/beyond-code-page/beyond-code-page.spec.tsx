import type { ContactChannel } from '@myself-app/domain';
import {
  type InterestSection,
  loadBeyondCode,
  loadPersonalChannels,
} from '@myself-app/domain/use-cases';
import { screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { stubIntersectionObserver } from '../../test/intersection-observer.js';
import { renderPage } from '../../test/render.js';
import { SITE_CONTENT } from '../../test/shipped-content.js';
import { BeyondCodePageView } from './beyond-code-page.js';

beforeEach(() => {
  stubIntersectionObserver();
});

async function pageOf(
  locale: 'en' | 'es',
  channels?: readonly ContactChannel[],
) {
  const [sections, personal] = await Promise.all([
    loadBeyondCode(SITE_CONTENT),
    loadPersonalChannels(SITE_CONTENT),
  ]);
  const bodies = Object.fromEntries(
    sections.map(({ interest }: InterestSection) => [
      String(interest.id),
      <p key="body">{`The body of ${String(interest.id)}.`}</p>,
    ]),
  );
  return renderPage(
    Promise.resolve(
      <BeyondCodePageView
        locale={locale}
        sections={sections}
        bodies={bodies}
        channels={channels ?? personal}
      />,
    ),
    locale,
  );
}

describe('the "Beyond the code" page', () => {
  it('is titled, with a link back home and one to each interest', async () => {
    await pageOf('en');
    expect(
      screen.getByRole('heading', { level: 1, name: 'Beyond the code' }),
    ).toBeTruthy();
    expect(
      screen
        .getByRole('link', { name: '← Back to the home page' })
        .getAttribute('href'),
    ).toBe('/en/');
    const jump = screen.getByRole('list', { name: 'Interests on this page' });
    expect(
      within(jump)
        .getAllByRole('link')
        .map(link => link.getAttribute('href')),
    ).toEqual(['#motorcycles', '#reading', '#salsa']);
  });

  it('gives each interest its section, its summary and its body', async () => {
    await pageOf('es');
    const reading = screen.getByRole('region', { name: 'Lectura' });
    expect(reading.id).toBe('reading');
    expect(
      within(reading).getByText(/^Leo filosofía y física teórica/),
    ).toBeTruthy();
    expect(within(reading).getByText('The body of reading.')).toBeTruthy();
  });

  it('shows a gallery only where there are photos, and posts only where there are any', async () => {
    await pageOf('en');
    const motorcycles = screen.getByRole('region', { name: 'Motorcycles' });
    expect(
      within(motorcycles).getByRole('list', {
        name: 'Photos and videos: Motorcycles',
      }),
    ).toBeTruthy();
    expect(within(motorcycles).queryByText('From the blog')).toBeNull();

    const reading = screen.getByRole('region', { name: 'Reading' });
    expect(within(reading).queryByRole('list', { name: /^Photos/ })).toBeNull();
    expect(within(reading).getByText('From the blog')).toBeTruthy();
    expect(
      within(reading).getByRole('link', { name: 'Books' }).getAttribute('href'),
    ).toBe('/en/blog/books/');
  });

  it('links the personal channels under the lead, or nothing when there are none', async () => {
    const { unmount } = await pageOf('en');
    expect(
      screen.getByRole('list', { name: 'Find me elsewhere' }),
    ).toBeTruthy();
    unmount();
    await pageOf('en', []);
    expect(
      screen.queryByRole('list', { name: 'Find me elsewhere' }),
    ).toBeNull();
  });
});
