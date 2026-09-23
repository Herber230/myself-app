import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { paramsOf, renderPage } from '../../../test/render';
import CvPage, { generateMetadata } from './page';

type Props = Parameters<typeof CvPage>[0];

describe('the CV page', () => {
  it('renders under the nav', async () => {
    await renderPage(CvPage(paramsOf({ locale: 'es' }) as Props), 'es');
    expect(screen.getByRole('heading', { level: 1, name: 'CV' })).toBeTruthy();
    expect(screen.getByRole('banner')).toBeTruthy();
  });

  it('is titled and alternated per locale', async () => {
    const metadata = await generateMetadata(
      paramsOf({ locale: 'en' }) as Props,
    );
    expect(metadata.title).toBe('CV — Herber Colop');
    expect(metadata.alternates?.canonical).toBe('/en/cv/');
  });

  it('is not found for an unknown locale', async () => {
    await expect(CvPage(paramsOf({ locale: 'fr' }) as Props)).rejects.toThrow();
    await expect(
      generateMetadata(paramsOf({ locale: 'fr' }) as Props),
    ).rejects.toThrow();
  });
});
