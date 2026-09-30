import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { paramsOf, renderPage } from '../../../../test/render';
import ProjectPage, {
  dynamicParams,
  generateMetadata,
  generateStaticParams,
} from './page';

type Props = Parameters<typeof ProjectPage>[0];

const propsOf = (locale: string, project: string) =>
  paramsOf({ locale, project }) as Props;

describe("a project's page", () => {
  it('is written for every featured project, and no other', async () => {
    expect(await generateStaticParams()).toEqual([
      { project: 'entifix' },
      { project: 'myself-app' },
    ]);
    expect(dynamicParams).toBe(false);
  });

  it('shows the project, its overview in the reader’s language, and its decisions', async () => {
    await renderPage(ProjectPage(propsOf('es', 'myself-app')), 'es');
    expect(
      screen.getByRole('heading', { level: 1, name: 'myself-app' }),
    ).toBeTruthy();
    expect(
      screen.getByText(/Este sitio es un perfil de desarrollador/),
    ).toBeTruthy();
    expect(document.querySelectorAll('li[data-adr]').length).toBeGreaterThan(
      10,
    );
  }, 30_000);

  it('names itself, and its other language', async () => {
    const metadata = await generateMetadata(propsOf('en', 'entifix'));
    expect(metadata.title).toBe('entifix — Herber Colop');
    expect(metadata.alternates?.canonical).toBe('/en/projects/entifix/');
  });

  it('is not found for another locale or project', async () => {
    await expect(ProjectPage(propsOf('fr', 'entifix'))).rejects.toThrow();
    await expect(ProjectPage(propsOf('en', 'cobol'))).rejects.toThrow();
  });
});
