import {
  loadProjectPage,
  type ProjectPipeline,
} from '@myself-app/domain/use-cases';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { siteT } from '../../i18n/server.js';
import { SITE_CONTENT } from '../../test/shipped-content.js';
import { PipelineExplorer } from './pipeline-explorer.js';
import { pipelineCopyOf, pipelineViewOf } from './pipeline-rows.js';

const t = siteT('en');
const pipeline = (await loadProjectPage(SITE_CONTENT, 'myself-app'))
  ?.pipeline as ProjectPipeline;
const REPOSITORY = 'https://github.com/Herber230/myself-app';
const VIEW = pipelineViewOf(pipeline, {
  locale: 'en',
  projectId: 'myself-app',
  repositoryUrl: REPOSITORY,
  t,
});
const COPY = pipelineCopyOf(t);

const graph = () => screen.getByRole('group', { name: 'Delivery pipeline' });
const job = (name: string) => within(graph()).getByRole('button', { name });
const panel = () =>
  document.querySelector('.architecture-panel') as HTMLElement;
const pick = (value: string) =>
  fireEvent.change(screen.getByRole('combobox'), { target: { value } });

describe("a project's pipeline explorer", () => {
  it('draws the stages and jobs from the content, one arrow per wait', () => {
    expect(VIEW.stages.map(stage => stage.label)).toEqual([
      'Your machine',
      'Pull request',
      'Checks',
      'Gate',
      'Merge',
      'Deploy',
    ]);
    expect(VIEW.needs).toContainEqual({
      from: 'myself-app-initialize',
      to: 'myself-app-lint',
    });
    render(<PipelineExplorer view={VIEW} copy={COPY} />);
    expect(within(graph()).getAllByRole('button')).toHaveLength(
      VIEW.jobs.length,
    );
    expect(panel().textContent).toBe(COPY.hint);
  });

  it('tells a job chosen: what it runs, its file and the records that decided it', () => {
    render(<PipelineExplorer view={VIEW} copy={COPY} />);
    fireEvent.click(job('Release'));
    expect(
      within(panel()).getByText(/semantic-release reads the commits/),
    ).toBeTruthy();
    expect(within(panel()).getByText('Deploy')).toBeTruthy();
    expect(
      within(panel())
        .getByRole('link', { name: '.github/workflows/deploy.yml' })
        .getAttribute('href'),
    ).toBe(`${REPOSITORY}/blob/main/.github/workflows/deploy.yml`);
    expect(
      within(panel())
        .getByRole('link', { name: 'ADR 0021' })
        .getAttribute('href'),
    ).toBe('/en/projects/myself-app/adr/0021/');
  });

  it('names no file for a job of no workflow, and no records for one none decided', () => {
    render(<PipelineExplorer view={VIEW} copy={COPY} />);
    fireEvent.click(job('Squash merge'));
    expect(
      within(panel()).queryByText(COPY.definedIn, { exact: false }),
    ).toBeNull();
    fireEvent.click(job('Test'));
    expect(
      within(panel()).queryByText(COPY.decidedIn, { exact: false }),
    ).toBeNull();
  });

  it('names a file without linking it, given no repository', () => {
    const view = pipelineViewOf(pipeline, {
      locale: 'en',
      projectId: 'myself-app',
      t,
    });
    render(<PipelineExplorer view={view} copy={COPY} />);
    fireEvent.click(job('Lint'));
    expect(
      within(panel())
        .getByText('.github/workflows/pull_request_check.yml')
        .tagName.toLowerCase(),
    ).toBe('code');
  });

  it('walks a change through it, lighting the jobs run and fading the ones skipped', () => {
    render(<PipelineExplorer view={VIEW} copy={COPY} />);
    pick('myself-app-docs-releases-nothing');
    expect(job('CI Gate').getAttribute('data-state')).toBe('lit');
    expect(job('Site').getAttribute('data-state')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Next step' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next step' }));
    expect(job('Release').getAttribute('data-state')).toBe('lit');
    expect(job('Site').getAttribute('data-state')).toBe('dim');
    expect(
      within(panel()).getByText('gh workflow run deploy.yml'),
    ).toBeTruthy();
    // Choosing a job leaves the scenario.
    fireEvent.click(job('Lint'));
    expect(screen.queryByText(/^Step /)).toBeNull();
  });

  it('marks the jobs where a change is stopped', () => {
    render(<PipelineExplorer view={VIEW} copy={COPY} />);
    pick('myself-app-e2e-blocks');
    expect(job('E2E').getAttribute('data-state')).toBe('fails');
    expect(panel().hasAttribute('data-fails')).toBe(true);
    pick('');
    expect(panel().textContent).toBe(COPY.hint);
  });

  it('offers the same jobs as chips, for a phone', () => {
    render(<PipelineExplorer view={VIEW} copy={COPY} />);
    const rows = document.querySelector('.architecture-rows') as HTMLElement;
    fireEvent.click(within(rows).getByRole('button', { name: 'CI Gate' }));
    expect(within(panel()).getByText(/The one required check/)).toBeTruthy();
  });
});
