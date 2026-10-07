import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { PipelineGraph } from './pipeline-graph';

const STAGES = [
  { id: 'check', label: 'Check' },
  { id: 'ship', label: 'Ship' },
];

const JOBS = [
  { id: 'lint', label: 'Lint', stage: 'check', state: 'lit' as const },
  { id: 'test', label: 'Test', stage: 'check', state: 'fails' as const },
  { id: 'deploy', label: 'Deploy', stage: 'ship', state: 'dim' as const },
  { id: 'notify', label: 'Notify', stage: 'ship' },
  // A job of a stage not drawn is left out.
  { id: 'stray', label: 'Stray', stage: 'nowhere' },
];

const NEEDS = [
  { from: 'lint', to: 'test' },
  { from: 'test', to: 'deploy' },
  { from: 'lint', to: 'deploy' },
  { from: 'deploy', to: 'notify' },
  { from: 'stray', to: 'notify' },
];

function draw(props: Partial<Parameters<typeof PipelineGraph>[0]> = {}) {
  return render(
    <PipelineGraph
      label="Delivery pipeline"
      stages={STAGES}
      jobs={JOBS}
      needs={NEEDS}
      {...props}
    />,
  );
}

const arrows = (container: HTMLElement) => [
  ...container.querySelectorAll('[data-slot="pipeline-arrow"]'),
];

describe('a pipeline graph', () => {
  it('draws a column per stage and a box per job it can place', () => {
    const { container } = draw({ className: 'extra' });
    expect(
      screen
        .getByRole('group', { name: 'Delivery pipeline' })
        .getAttribute('class'),
    ).toContain('extra');
    expect(
      [...container.querySelectorAll('[data-slot="pipeline-stage"]')].map(
        stage => stage.textContent,
      ),
    ).toEqual(['Check', 'Ship']);
    expect(
      screen.getAllByRole('button').map(job => job.getAttribute('aria-label')),
    ).toEqual(['Lint', 'Test', 'Deploy', 'Notify']);
  });

  it('draws only the waits no longer path implies, and none to a job not placed', () => {
    const { container } = draw();
    // lint → deploy is implied by lint → test → deploy; stray is not placed.
    expect(arrows(container)).toHaveLength(3);
  });

  it('lights an arrow between two jobs run, and fades one to a job skipped', () => {
    const { container } = draw();
    const [lintToTest, testToDeploy, deployToNotify] = arrows(container);
    expect(lintToTest?.hasAttribute('data-lit')).toBe(true);
    expect(testToDeploy?.hasAttribute('data-lit')).toBe(false);
    expect(testToDeploy?.hasAttribute('data-dim')).toBe(true);
    expect(deployToNotify?.hasAttribute('data-dim')).toBe(true);
    const { container: quiet } = draw({
      jobs: JOBS.map(job => ({ ...job, state: undefined })),
    });
    expect(arrows(quiet).some(arrow => arrow.hasAttribute('data-lit'))).toBe(
      false,
    );
    const { container: half } = draw({
      jobs: JOBS.map(job =>
        job.id === 'test'
          ? { ...job, state: 'lit' as const }
          : { ...job, state: undefined },
      ),
    });
    expect(arrows(half)[0]?.hasAttribute('data-lit')).toBe(false);
  });

  it('marks each job by what the page says of it', () => {
    draw({ selected: 'notify' });
    const state = (label: string) =>
      screen.getByRole('button', { name: label }).getAttribute('data-state');
    expect([
      state('Lint'),
      state('Test'),
      state('Deploy'),
      state('Notify'),
    ]).toEqual(['lit', 'fails', 'dim', null]);
    expect(
      screen
        .getByRole('button', { name: 'Notify' })
        .getAttribute('aria-pressed'),
    ).toBe('true');
  });

  it('chooses a job by click, Enter or Space, and ignores other keys', () => {
    const onSelect = vi.fn();
    draw({ onSelect });
    const test = screen.getByRole('button', { name: 'Test' });
    fireEvent.click(test);
    fireEvent.keyDown(test, { key: 'Enter' });
    fireEvent.keyDown(test, { key: ' ' });
    fireEvent.keyDown(test, { key: 'Escape' });
    expect(onSelect.mock.calls).toEqual([['test'], ['test'], ['test']]);
  });

  it('draws without a listener, and with no jobs at all', () => {
    draw();
    const lint = screen.getByRole('button', { name: 'Lint' });
    expect(() => {
      fireEvent.click(lint);
      fireEvent.keyDown(lint, { key: 'Enter' });
    }).not.toThrow();
    const { container } = draw({ jobs: [], needs: [] });
    expect(container.querySelector('svg')?.getAttribute('viewBox')).toMatch(
      /^0 0 /,
    );
  });
});
