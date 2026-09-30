import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { paramsOf, renderPage } from '../../../../../../test/render';
import DecisionPage, {
  dynamicParams,
  generateMetadata,
  generateStaticParams,
} from './page';

type Props = Parameters<typeof DecisionPage>[0];

const propsOf = (locale: string, project: string, number: string) =>
  paramsOf({ locale, project, number }) as Props;

describe("a decision record's page", () => {
  it('is written for every record of every project, and no other', async () => {
    const params = await generateStaticParams();
    expect(params).toContainEqual({ project: 'myself-app', number: '0016' });
    expect(params).toContainEqual({ project: 'entifix', number: '0001' });
    expect(dynamicParams).toBe(false);
  });

  it('shows the record, its links pointing at the others’ pages', async () => {
    await renderPage(DecisionPage(propsOf('en', 'myself-app', '0008')), 'en');
    expect(screen.getByText('ADR 0008')).toBeTruthy();
    expect(
      document.querySelector(
        'article a[href^="/en/projects/myself-app/adr/0003"]',
      ),
    ).not.toBeNull();
  }, 30_000);

  it('names itself by its title, and describes itself by its symptom', async () => {
    const metadata = await generateMetadata(
      propsOf('es', 'myself-app', '0001'),
    );
    expect(metadata.title).toMatch(/ — myself-app — Herber Colop$/);
    expect(metadata.description).toBeTruthy();
    expect(metadata.alternates?.canonical).toBe(
      '/es/projects/myself-app/adr/0001/',
    );
  });

  it('is not found for another locale or record', async () => {
    await expect(
      DecisionPage(propsOf('fr', 'myself-app', '0001')),
    ).rejects.toThrow();
    await expect(
      DecisionPage(propsOf('en', 'myself-app', '0999')),
    ).rejects.toThrow();
  });
});
