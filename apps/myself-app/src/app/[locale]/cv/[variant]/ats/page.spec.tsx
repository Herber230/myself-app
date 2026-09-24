import { describe, expect, it } from 'vitest';

import { paramsOf, renderPage } from '../../../../../test/render';
import CvVariantAtsPage, {
  dynamicParams,
  generateMetadata,
  generateStaticParams,
} from './page';

type Props = Parameters<typeof CvVariantAtsPage>[0];

describe("a variant's CV page for an ATS", () => {
  it('is written for the same variants as the page for people', async () => {
    expect(dynamicParams).toBe(false);
    expect(await generateStaticParams()).toEqual([
      { variant: 'backend' },
      { variant: 'frontend' },
      { variant: 'devops' },
    ]);
  });

  it('shows the variant in the ATS mode', async () => {
    await renderPage(
      CvVariantAtsPage(paramsOf({ locale: 'en', variant: 'backend' }) as Props),
      'en',
    );
    expect(document.querySelector('article')?.dataset.mode).toBe('ats');
  });

  it('points at the page for people', async () => {
    const metadata = await generateMetadata(
      paramsOf({ locale: 'en', variant: 'backend' }) as Props,
    );
    expect(metadata.alternates?.canonical).toBe('/en/cv/backend/');
    expect(metadata.robots).toEqual({ index: false, follow: true });
  });
});
