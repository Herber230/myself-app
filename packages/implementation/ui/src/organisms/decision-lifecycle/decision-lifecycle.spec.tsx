import type { ArchitectureDecision } from '@myself-app/domain';
import { loadProjectPage } from '@myself-app/domain/use-cases';
import { render, screen, within } from '@testing-library/react';
import { beforeAll, describe, expect, it } from 'vitest';

import { SITE_CONTENT } from '../../test/shipped-content.js';
import { DecisionLifecycle, LIFECYCLE_STATES } from './decision-lifecycle.js';

let decisions: readonly ArchitectureDecision[];

beforeAll(async () => {
  decisions =
    (await loadProjectPage(SITE_CONTENT, 'myself-app'))?.decisions ?? [];
});

const revisionLines = (decision: ArchitectureDecision) =>
  (decision.body ?? '').match(/^- Revised: .*$/gm) ?? [];

const panel = (state: string) =>
  document.querySelectorAll<HTMLElement>('.state-path-panel')[
    LIFECYCLE_STATES.indexOf(state as (typeof LIFECYCLE_STATES)[number])
  ] as HTMLElement;

describe("a project's decision lifecycle", () => {
  it('is a section, closed at first, whose summary says how the work is done', () => {
    render(<DecisionLifecycle locale="en" decisions={decisions} />);
    const section = screen.getByRole('region', {
      name: 'Decisions that evolve',
    });
    expect(section.querySelector('details')?.open).toBe(false);
    const revisions = decisions.reduce(
      (sum, decision) => sum + revisionLines(decision).length,
      0,
    );
    expect(
      screen.getByText(`${decisions.length} records · ${revisions} revisions`),
    ).toBeTruthy();
    expect(screen.getByText(/^I build with coding agents\./)).toBeTruthy();
    expect(screen.getByText('See how it works')).toBeTruthy();
    expect(
      screen.getByText(/^An ADR \(architecture decision record\)/),
    ).toBeTruthy();
  });

  it('counts the records in each state, and starts on the revised ones', () => {
    render(<DecisionLifecycle locale="es" decisions={decisions} />);
    const accepted = decisions.filter(
      each => each.status === 'accepted',
    ).length;
    const revised = decisions.filter(
      each => revisionLines(each).length > 0,
    ).length;
    expect(
      screen.getByRole('radio', { name: `Aceptada, ${accepted}` }),
    ).toBeTruthy();
    expect(
      screen.getByRole('radio', { name: `Revisada, ${revised}` }),
    ).toHaveProperty('checked', true);
    expect(screen.getByRole('radio', { name: 'Promovida, 0' })).toBeTruthy();
  });

  it('shows the most revised record, its latest revision as plain words', () => {
    render(<DecisionLifecycle locale="en" decisions={decisions} />);
    const most = [...decisions].sort(
      (a, b) => revisionLines(b).length - revisionLines(a).length,
    )[0] as ArchitectureDecision;
    const number = String(most.number).padStart(4, '0');
    const revised = within(panel('revised'));
    expect(
      revised
        .getByRole('link', { name: `ADR ${number} · ${most.title}` })
        .getAttribute('href'),
    ).toBe(`?adr=${number}#decisions`);
    const quote = panel('revised').querySelector('.adr-life-quote');
    expect(quote?.textContent).not.toMatch(/\]\(|^- Revised/);
    expect(
      revised.getByRole('link', { name: /^See all/ }).getAttribute('href'),
    ).toBe('?revised=yes#decisions');
  });

  it('links a state to its records in the explorer, and says when there are none', () => {
    render(<DecisionLifecycle locale="en" decisions={decisions} />);
    expect(
      within(panel('superseded-in-part'))
        .getByRole('link', { name: /^ADR 0008/ })
        .getAttribute('href'),
    ).toBe('?adr=0008#decisions');
    expect(
      within(panel('accepted'))
        .getByRole('link', { name: /^See all/ })
        .getAttribute('href'),
    ).toBe('?status=accepted#decisions');
    expect(within(panel('superseded')).getByText('None yet.')).toBeTruthy();
    // Promoted has no record, and no list to see.
    expect(within(panel('promoted')).queryByRole('link')).toBeNull();
  });

  it('starts on the accepted ones while none is revised, and reads a record with no body', () => {
    const plain = [
      { number: 1, title: 'One', status: 'accepted' },
      { number: 2, title: 'Two', status: 'accepted', body: 'No revision.' },
    ] as ArchitectureDecision[];
    render(<DecisionLifecycle locale="en" decisions={plain} />);
    expect(screen.getByRole('radio', { name: 'Accepted, 2' })).toHaveProperty(
      'checked',
      true,
    );
    expect(screen.getByRole('radio', { name: 'Revised, 0' })).toBeTruthy();
    expect(screen.getByText('2 records · 0 revisions')).toBeTruthy();
  });
});
