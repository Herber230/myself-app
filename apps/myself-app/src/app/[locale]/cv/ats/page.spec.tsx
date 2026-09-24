import { describe, expect, it } from 'vitest';

import { paramsOf, renderPage } from '../../../../test/render';
import CvAtsPage, { generateMetadata } from './page';

type Props = Parameters<typeof CvAtsPage>[0];

describe('the CV page for an ATS', () => {
  it('shows the default variant in the ATS mode', async () => {
    await renderPage(CvAtsPage(paramsOf({ locale: 'en' }) as Props), 'en');
    expect(document.querySelector('article')?.dataset.mode).toBe('ats');
  });

  it('points at the page for people', async () => {
    const metadata = await generateMetadata(
      paramsOf({ locale: 'en' }) as Props,
    );
    expect(metadata.alternates?.canonical).toBe('/en/cv/');
  });
});
