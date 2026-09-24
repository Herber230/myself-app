import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { paramsOf, renderPage } from '../../../test/render';
import CvPage, { generateMetadata } from './page';

type Props = Parameters<typeof CvPage>[0];

describe('the CV page', () => {
  it('shows the default variant for people', async () => {
    await renderPage(CvPage(paramsOf({ locale: 'es' }) as Props), 'es');
    expect(
      screen.getByRole('heading', { level: 1, name: 'Herber Colop' }),
    ).toBeTruthy();
    expect(document.querySelector('article')?.dataset.mode).toBe('human');
  });

  it('is its own canonical', async () => {
    const metadata = await generateMetadata(
      paramsOf({ locale: 'en' }) as Props,
    );
    expect(metadata.alternates?.canonical).toBe('/en/cv/');
  });
});
