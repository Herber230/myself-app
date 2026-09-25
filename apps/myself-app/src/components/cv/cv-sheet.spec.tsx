import { CONTENT } from '@myself-app/content';
import type { Certificate, Technology } from '@myself-app/domain';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { type CvSheet as CvSheetContent, loadCvSheet } from '../../content/cv';
import { SITE_REPOSITORIES } from '../../content/repositories';
import { buildSiteRepositories } from '../../content/site-content';
import { CvSheet } from './cv-sheet';

const sheetOf = async (variant: string) =>
  (await loadCvSheet(SITE_REPOSITORIES, variant)) as CvSheetContent;

const headings = () =>
  screen.getAllByRole('heading', { level: 2 }).map(each => each.textContent);

describe('the CV sheet', () => {
  it('is one light sheet, marked with its mode', async () => {
    const { container } = render(
      <CvSheet sheet={await sheetOf('full-stack')} locale="en" mode="human" />,
    );
    const sheet = container.querySelector('article');
    expect(sheet?.getAttribute('data-theme')).toBe('light');
    expect(sheet?.getAttribute('data-mode')).toBe('human');
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(
      'Herber Colop',
    );
  });

  it('has the standard sections, in the order a parser expects', async () => {
    render(<CvSheet sheet={await sheetOf('backend')} locale="en" mode="ats" />);
    expect(headings()).toEqual([
      'Summary',
      'Technical skills',
      'Experience',
      'Education',
      'Certificates',
    ]);
  });

  it('writes its headings, months and notes in Spanish, all of them', async () => {
    render(
      <CvSheet sheet={await sheetOf('full-stack')} locale="es" mode="ats" />,
    );
    expect(headings()).toEqual([
      'Resumen',
      'Habilidades técnicas',
      'Experiencia',
      'Educación',
      'Certificaciones',
    ]);
    expect(screen.getByText('nov 2025 – Actualidad')).toBeTruthy();
    expect(screen.getByText('nov 2020 – nov 2025')).toBeTruthy();
    expect(
      screen.getByText(
        'Universidad de San Carlos de Guatemala · 2016 – 2017 · sin concluir',
      ),
    ).toBeTruthy();
    expect(
      screen.getByText('Universidad Mesoamericana · 2007 – 2014'),
    ).toBeTruthy();
  });

  it('shows each employment’s role, employer, dates and highlights', async () => {
    // The site has no highlight yet, so one is written for the check.
    const repositories = buildSiteRepositories({
      ...CONTENT,
      'employment-highlights.json': [
        {
          id: 'experiments',
          period: 'healthcare-frontend-engineer',
          text: { en: 'Ran the experiments.', es: 'Llevé los experimentos.' },
          focuses: ['frontend'],
          order: 0,
        },
      ],
    });
    const sheet = (await loadCvSheet(
      repositories,
      'frontend',
    )) as CvSheetContent;
    render(<CvSheet sheet={sheet} locale="en" mode="human" />);
    const roles = screen.getAllByRole('heading', { level: 3 });
    expect(roles[0].textContent).toBe(sheet.employments[0].period.role?.en);
    const experience = screen.getByRole('region', { name: 'Experience' });
    expect(
      within(experience)
        .getAllByRole('listitem')
        .map(each => each.textContent),
    ).toEqual(['Ran the experiments.']);
    expect(within(experience).getByText('Nov 2025 – Present')).toBeTruthy();
  });

  it('lists every certificate with its issuer', async () => {
    render(<CvSheet sheet={await sheetOf('devops')} locale="en" mode="ats" />);
    const certificates = screen.getByRole('region', { name: 'Certificates' });
    expect(
      within(certificates)
        .getAllByRole('listitem')
        .map(each => each.textContent),
    ).toEqual([
      'Professional Scrum Master I · Scrum.org',
      'Business Development Manager · TM Forum',
      'Frameworx Transformation Manager · TM Forum',
    ]);
  });
});

describe('the ATS mode', () => {
  it('writes each contact as a label and its address, linked to the full URL', async () => {
    render(
      <CvSheet sheet={await sheetOf('full-stack')} locale="en" mode="ats" />,
    );
    const header = screen.getByRole('banner');
    expect(header.querySelector('svg')).toBeNull();
    const github = within(header).getByRole('link', {
      name: 'github.com/Herber230',
    });
    expect(github.getAttribute('href')).toBe('https://github.com/Herber230');
    expect(github.parentElement?.textContent).toBe(
      'GitHub: github.com/Herber230',
    );
    expect(
      within(header).getByRole('link', { name: 'herbercolop@gmail.com' })
        .parentElement?.textContent,
    ).toBe('Email: herbercolop@gmail.com');
    expect(header.textContent).toContain('Location: ');
  });

  it('puts the technologies on one comma-separated line', async () => {
    const sheet = await sheetOf('full-stack');
    render(<CvSheet sheet={sheet} locale="en" mode="ats" />);
    const skills = screen.getByRole('region', { name: 'Technical skills' });
    expect(within(skills).queryByRole('list')).toBeNull();
    expect(skills.querySelector('p')?.textContent).toBe(
      sheet.technologies.map(each => each.name?.en).join(', '),
    );
  });
});

describe('the human mode', () => {
  it('puts an icon beside each contact’s handle, still linked to the full URL', async () => {
    render(
      <CvSheet sheet={await sheetOf('full-stack')} locale="en" mode="human" />,
    );
    const header = screen.getByRole('banner');
    const github = within(header).getByRole('link', { name: 'Herber230' });
    expect(github.getAttribute('href')).toBe('https://github.com/Herber230');
    expect(github.querySelector('svg[aria-hidden="true"]')).not.toBeNull();
    expect(header.textContent).not.toContain('Location: ');
  });

  it('shows the technologies as chips', async () => {
    const sheet = await sheetOf('full-stack');
    render(<CvSheet sheet={sheet} locale="en" mode="human" />);
    const skills = screen.getByRole('region', { name: 'Technical skills' });
    expect(within(skills).getAllByRole('listitem')).toHaveLength(
      sheet.technologies.length,
    );
  });
});

describe('the parts a visitor can hide', () => {
  const parts = (container: HTMLElement) =>
    [...container.querySelectorAll('[data-cv-part]')].map(each =>
      each.getAttribute('data-cv-part'),
    );

  it('are named on the human sheet: sections, positions, technologies', async () => {
    const sheet = await sheetOf('backend');
    const { container } = render(
      <CvSheet sheet={sheet} locale="en" mode="human" />,
    );
    const named = parts(container);
    expect(named.filter(each => each?.startsWith('section:'))).toEqual([
      'section:summary',
      'section:skills',
      'section:experience',
      'section:education',
      'section:certificates',
    ]);
    expect(named.filter(each => each?.startsWith('position:'))).toEqual(
      sheet.employments.map(each => `position:${String(each.period.id)}`),
    );
    expect(named.filter(each => each?.startsWith('tech:'))).toEqual(
      sheet.technologies.map(each => `tech:${String(each.id)}`),
    );
  });

  it('are not named on the ATS sheet, which is never customized', async () => {
    const { container } = render(
      <CvSheet sheet={await sheetOf('backend')} locale="en" mode="ats" />,
    );
    expect(parts(container)).toEqual([]);
  });
});

describe('a sparse sheet', () => {
  it('leaves out what it does not have', async () => {
    const full = await sheetOf('full-stack');
    const sheet: CvSheetContent = {
      ...full,
      technologies: [{ id: 'nameless' } as Technology],
      employments: full.employments.map(each => ({ ...each, highlights: [] })),
      education: [],
      certificates: [
        {
          id: 'dated',
          name: 'A certificate',
          issuer: 'An issuer',
          issued: new Date('2020-05-01T00:00:00.000Z'),
        } as Certificate,
      ],
    };
    render(<CvSheet sheet={sheet} locale="en" mode="human" />);
    expect(headings()).not.toContain('Education');
    const skills = screen.getByRole('region', { name: 'Technical skills' });
    expect(within(skills).getByRole('listitem').textContent).toBe('');
    const experience = screen.getByRole('region', { name: 'Experience' });
    expect(within(experience).queryByRole('list')).toBeNull();
    expect(screen.getByText('A certificate · An issuer · 2020')).toBeTruthy();
  });

  it('shows no certificates section without any', async () => {
    render(
      <CvSheet
        sheet={{ ...(await sheetOf('backend')), certificates: [] }}
        locale="en"
        mode="ats"
      />,
    );
    expect(headings()).not.toContain('Certificates');
  });
});
