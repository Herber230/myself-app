import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { stubIntersectionObserver } from '../../../test/intersection-observer';
import { paramsOf, renderPage } from '../../../test/render';
import BeyondCodePage, { generateMetadata } from './page';

beforeEach(() => {
  stubIntersectionObserver();
});

type Props = Parameters<typeof BeyondCodePage>[0];

describe('the "Beyond the code" page', () => {
  it('shows every interest, each body rendered from its Markdown', async () => {
    await renderPage(BeyondCodePage(paramsOf({ locale: 'en' }) as Props), 'en');
    expect(
      screen.getByRole('heading', { level: 1, name: 'Beyond the code' }),
    ).toBeTruthy();
    expect(
      screen
        .getAllByRole('heading', { level: 2 })
        .map(heading => heading.textContent),
    ).toEqual(['Motorcycles', 'Reading', 'Salsa']);
    expect(screen.getByText(/^Motorcycles have been a passion/)).toBeTruthy();
    expect(
      screen.getByRole('link', { name: 'Instagram: herbercolop' }),
    ).toBeTruthy();
    // Rendering Markdown loads the highlighter, slow on a CI runner with
    // coverage on: as long as a project's page is given.
  }, 30_000);

  it('is titled, described and alternated per locale', async () => {
    const metadata = await generateMetadata(
      paramsOf({ locale: 'es' }) as Props,
    );
    expect(metadata.title).toBe('Más allá del código — Herber Colop');
    expect(metadata.description).toMatch(/^Quién soy lejos del teclado/);
    expect(metadata.alternates?.canonical).toBe('/es/beyond-code/');
  });

  it('is not found for an unknown locale', async () => {
    await expect(
      BeyondCodePage(paramsOf({ locale: 'fr' }) as Props),
    ).rejects.toThrow();
    await expect(
      generateMetadata(paramsOf({ locale: 'fr' }) as Props),
    ).rejects.toThrow();
  });
});
