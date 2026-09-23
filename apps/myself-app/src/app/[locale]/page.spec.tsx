import { screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { stubIntersectionObserver } from '../../test/intersection-observer';
import { paramsOf, renderPage } from '../../test/render';
import HomePage, { generateMetadata } from './page';

beforeEach(() => {
  stubIntersectionObserver();
});

afterEach(() => vi.unstubAllGlobals());

type Props = Parameters<typeof HomePage>[0];

describe('the landing page', () => {
  it('opens on the hero, then a section per nav anchor', async () => {
    await renderPage(HomePage(paramsOf({ locale: 'en' }) as Props), 'en');
    expect(
      screen.getByRole('heading', { level: 1, name: 'Herber Colop' }),
    ).toBeTruthy();
    const headings = screen
      .getAllByRole('heading', { level: 2 })
      .map(heading => heading.textContent);
    expect(headings).toEqual([
      'About me',
      'Projects',
      'Built on entifix',
      'Contact',
    ]);
    expect(document.getElementById('entifix')?.tagName).toBe('SECTION');
  });

  it('is titled and alternated per locale', async () => {
    const metadata = await generateMetadata(
      paramsOf({ locale: 'es' }) as Props,
    );
    expect(metadata.title).toBe('Herber Colop');
    expect(metadata.alternates?.canonical).toBe('/es/');
  });

  it('is not found for an unknown locale', async () => {
    await expect(
      HomePage(paramsOf({ locale: 'fr' }) as Props),
    ).rejects.toThrow();
    await expect(
      generateMetadata(paramsOf({ locale: 'fr' }) as Props),
    ).rejects.toThrow();
  });
});
