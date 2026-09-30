import { loadProjectPage } from '@myself-app/domain/use-cases';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SITE_CONTENT } from '../../test/shipped-content.js';
import { DecisionPractice, sampleDecision } from './decision-practice.js';

const decisionsOf = async (project: string) =>
  (await loadProjectPage(SITE_CONTENT, project))?.decisions ?? [];

describe('the practice of decision records', () => {
  it('tells the life of a record in five steps', async () => {
    render(
      <DecisionPractice
        locale="en"
        decisions={await decisionsOf('myself-app')}
      />,
    );
    expect(
      [...document.querySelectorAll('.adr-step-name')].map(
        step => step.textContent,
      ),
    ).toEqual(['Decide', 'Record', 'Point', 'Match', 'Evolve']);
    expect(screen.getByText('How the records steer the work')).toBeTruthy();
  });

  it('lays out the newest record’s header, line by line, as its file writes it', async () => {
    const decisions = await decisionsOf('myself-app');
    const sample = sampleDecision(decisions);
    render(<DecisionPractice locale="es" decisions={decisions} />);
    const lines = [...document.querySelectorAll('.adr-anatomy-code')].map(
      line => line.textContent,
    );
    expect(lines[0]).toBe(`# ${sample?.number}. ${sample?.title}`);
    expect(lines[4]).toBe(`- Read when: ${sample?.readWhen}`);
    expect(lines[2]).toMatch(/^- Date: \d{4}-\d{2}-\d{2}$/);
    expect(screen.getByText(/^Anatomía de un registro/)).toBeTruthy();
  });

  it('writes a status as the record does', async () => {
    const decisions = await decisionsOf('myself-app');
    // Superseded in part, and with a Read when line to show.
    const partly = decisions.filter(
      decision => decision.status === 'superseded-in-part' && decision.readWhen,
    );
    expect(partly.length).toBeGreaterThan(0);
    render(<DecisionPractice locale="en" decisions={partly.slice(0, 1)} />);
    expect(screen.getByText('- Status: Superseded in part')).toBeTruthy();
  });

  it('shows no anatomy without a record to show', () => {
    render(<DecisionPractice locale="en" decisions={[]} />);
    expect(document.querySelector('.adr-anatomy')).toBeNull();
    expect(sampleDecision([])).toBeUndefined();
  });
});
