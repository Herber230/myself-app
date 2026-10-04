import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { paramsOf, renderPage } from '../../../test/render';
import TechRadarPage, { generateMetadata } from './page';

type Props = Parameters<typeof TechRadarPage>[0];

describe('the tech radar page', () => {
  it('draws the radar and its legend from content', async () => {
    await renderPage(TechRadarPage(paramsOf({ locale: 'es' }) as Props), 'es');
    expect(
      screen.getByRole('heading', { level: 1, name: 'Radar tecnológico' }),
    ).toBeTruthy();
    expect(
      screen.getByRole('img', { name: /^Radar tecnológico:/ }),
    ).toBeTruthy();
    expect(screen.getAllByRole('listitem').length).toBeGreaterThan(0);
  });

  it('says what each ring means, from content', async () => {
    await renderPage(TechRadarPage(paramsOf({ locale: 'en' }) as Props), 'en');
    // Each ring's chip, described by what it means.
    const rings = within(screen.getByRole('group', { name: 'Ring' }))
      .getAllByRole('button')
      .map(chip => [
        chip.textContent,
        document.getElementById(chip.getAttribute('aria-describedby') ?? '')
          ?.textContent,
      ]);
    expect(rings.map(([name]) => name)).toEqual([
      'Adopt',
      'Trial',
      'Assess',
      'Hold',
    ]);
    expect(rings.map(([, meaning]) => meaning)).toContain('I am learning it.');
  });

  it('is titled and alternated per locale', async () => {
    const metadata = await generateMetadata(
      paramsOf({ locale: 'en' }) as Props,
    );
    expect(metadata.title).toBe('Tech radar — Herber Colop');
    expect(metadata.alternates?.canonical).toBe('/en/tech-radar/');
  });

  it('is not found for an unknown locale', async () => {
    await expect(
      TechRadarPage(paramsOf({ locale: 'fr' }) as Props),
    ).rejects.toThrow();
    await expect(
      generateMetadata(paramsOf({ locale: 'fr' }) as Props),
    ).rejects.toThrow();
  });
});
