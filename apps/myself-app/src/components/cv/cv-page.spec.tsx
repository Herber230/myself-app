import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderPage } from '../../test/render';
import { cvMetadata, CvPageView } from './cv-page';

describe('a CV page', () => {
  it('shows the sheet under the nav, with the reading and the mode it is in', async () => {
    await renderPage(
      CvPageView({ locale: 'en', variant: 'backend', mode: 'ats' }),
      'en',
    );
    // The site's bar, then the sheet's own header (jsdom counts both as
    // banners; a browser scopes the second to its article).
    expect(screen.getAllByRole('banner')).toHaveLength(2);
    expect(
      screen.getByRole('heading', { level: 1, name: 'Herber Colop' }),
    ).toBeTruthy();
    expect(document.querySelector('article')?.getAttribute('data-mode')).toBe(
      'ats',
    );

    const reading = screen.getByRole('navigation', { name: 'Reading' });
    const readings = within(reading).getAllByRole('listitem');
    expect(readings).toHaveLength(4);
    // The page itself is not a link; the others keep the mode.
    expect(within(readings[1]).queryByRole('link')).toBeNull();
    expect(
      within(reading)
        .getAllByRole('link')
        .map(link => link.getAttribute('href')),
    ).toEqual(['/en/cv/ats/', '/en/cv/frontend/ats/', '/en/cv/devops/ats/']);

    const mode = screen.getByRole('navigation', { name: 'Written for' });
    expect(
      within(mode).getByRole('link', { name: 'People' }).getAttribute('href'),
    ).toBe('/en/cv/backend/');
  });

  it('offers to print, with the settings that print it cleanly', async () => {
    await renderPage(CvPageView({ locale: 'en', mode: 'ats' }), 'en');
    expect(
      screen.getByRole('button', { name: 'Print or save as PDF' }),
    ).toBeTruthy();
    expect(screen.getByText(/^For a clean sheet: A4/)).toBeTruthy();
  });

  it('keeps the page in the language switch', async () => {
    await renderPage(
      CvPageView({ locale: 'es', variant: 'devops', mode: 'human' }),
      'es',
    );
    const english = screen.getByRole('link', { name: 'English' });
    expect(english.getAttribute('href')).toBe('/en/cv/devops/');
  });

  it('shows the default variant with no variant in the route', async () => {
    await renderPage(CvPageView({ locale: 'en', mode: 'human' }), 'en');
    const reading = screen.getByRole('navigation', { name: 'Reading' });
    const current = within(reading).getByText(
      (_, element) => element?.getAttribute('aria-current') === 'page',
    );
    expect(current.closest('li')).toBe(
      within(reading).getAllByRole('listitem')[0],
    );
  });

  it('is not found for an unknown locale or variant', async () => {
    await expect(CvPageView({ locale: 'fr', mode: 'human' })).rejects.toThrow();
    await expect(
      CvPageView({ locale: 'en', variant: 'astronaut', mode: 'human' }),
    ).rejects.toThrow();
  });
});

describe("a CV page's metadata", () => {
  it('names the reading, and is its own canonical for people', async () => {
    const metadata = await cvMetadata({
      locale: 'en',
      variant: 'backend',
      mode: 'human',
    });
    expect(metadata.title).toMatch(/^CV: .+ — Herber Colop$/);
    expect(metadata.title).not.toContain('(ATS)');
    expect(metadata.alternates?.canonical).toBe('/en/cv/backend/');
    expect(metadata.robots).toBeUndefined();
  });

  it('is not indexed in the ATS mode, and points at its human page', async () => {
    const metadata = await cvMetadata({ locale: 'es', mode: 'ats' });
    expect(metadata.title).toContain('(ATS)');
    expect(metadata.alternates?.canonical).toBe('/es/cv/');
    expect(metadata.alternates?.languages).toMatchObject({
      en: '/en/cv/ats/',
      es: '/es/cv/ats/',
    });
    expect(metadata.robots).toEqual({ index: false, follow: true });
  });
});
