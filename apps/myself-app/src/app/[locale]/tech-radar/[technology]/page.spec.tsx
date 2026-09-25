import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { paramsOf, renderPage } from '../../../../test/render';
import TechnologyPage, {
  dynamicParams,
  generateMetadata,
  generateStaticParams,
} from './page';

type Props = Parameters<typeof TechnologyPage>[0];

const propsOf = (locale: string, technology: string) =>
  paramsOf({ locale, technology }) as Props;

describe("a technology's page", () => {
  it('is written for every technology, and no other', async () => {
    const params = await generateStaticParams();
    expect(params).toContainEqual({ technology: 'typescript' });
    expect(params.length).toBeGreaterThanOrEqual(16);
    expect(dynamicParams).toBe(false);
  });

  it('says where it sits, how it moved and where I used it', async () => {
    await renderPage(TechnologyPage(propsOf('en', 'typescript')), 'en');
    expect(
      screen.getByRole('heading', { level: 1, name: 'TypeScript' }),
    ).toBeTruthy();
    expect(
      screen.getByRole('link', { name: '← Back to the radar' }),
    ).toHaveProperty('pathname', '/en/tech-radar/');
    expect(screen.getByText('Languages & frameworks')).toBeTruthy();

    const history = screen.getByRole('heading', { name: 'How it moved' })
      .nextElementSibling as HTMLElement;
    expect(within(history).getAllByRole('listitem').length).toBeGreaterThan(0);

    expect(
      screen.getByRole('link', { name: 'myself-app' }).getAttribute('href'),
    ).toBe('/en/#project-myself-app');
    expect(
      screen.getByRole('link', { name: 'Website' }).getAttribute('href'),
    ).toBe('https://www.typescriptlang.org');
    expect(
      screen.getByRole('link', { name: 'Source' }).getAttribute('rel'),
    ).toBe('noopener noreferrer');
  });

  it('links only what a technology has', async () => {
    await renderPage(TechnologyPage(propsOf('en', 'amazon-s3')), 'en');
    expect(screen.getByRole('link', { name: 'Website' })).toBeTruthy();
    expect(screen.queryByRole('link', { name: 'Source' })).toBeNull();
  });

  it('shows its areas and links, and says when no project uses it', async () => {
    await renderPage(
      TechnologyPage(propsOf('es', 'static-first-delivery')),
      'es',
    );
    expect(screen.getByText('Áreas')).toBeTruthy();
    expect(screen.queryByRole('link', { name: 'Sitio web' })).toBeNull();
    expect(
      screen.getByText('Ningún proyecto de este sitio la usa todavía.'),
    ).toBeTruthy();
  });

  it('is titled and alternated per locale', async () => {
    const metadata = await generateMetadata(propsOf('es', 'typescript'));
    expect(metadata.title).toBe(
      'TypeScript — Radar tecnológico — Herber Colop',
    );
    expect(metadata.alternates?.canonical).toBe('/es/tech-radar/typescript/');
  });

  it('is not found for an unknown locale or technology', async () => {
    await expect(TechnologyPage(propsOf('fr', 'typescript'))).rejects.toThrow();
    await expect(TechnologyPage(propsOf('en', 'cobol'))).rejects.toThrow();
  });
});
