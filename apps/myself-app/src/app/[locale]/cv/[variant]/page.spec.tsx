import { describe, expect, it } from 'vitest';

import { paramsOf, renderPage } from '../../../../test/render';
import CvVariantPage, {
  dynamicParams,
  generateMetadata,
  generateStaticParams,
} from './page';

type Props = Parameters<typeof CvVariantPage>[0];

describe("a variant's CV page", () => {
  it('is written for every variant but the default, and no other', async () => {
    expect(dynamicParams).toBe(false);
    expect(await generateStaticParams()).toEqual([
      { variant: 'backend' },
      { variant: 'frontend' },
      { variant: 'devops' },
    ]);
  });

  it('shows the variant for people', async () => {
    await renderPage(
      CvVariantPage(paramsOf({ locale: 'en', variant: 'frontend' }) as Props),
      'en',
    );
    expect(document.querySelector('article')?.dataset.mode).toBe('human');
  });

  it('is its own canonical', async () => {
    const metadata = await generateMetadata(
      paramsOf({ locale: 'es', variant: 'devops' }) as Props,
    );
    expect(metadata.alternates?.canonical).toBe('/es/cv/devops/');
  });
});
