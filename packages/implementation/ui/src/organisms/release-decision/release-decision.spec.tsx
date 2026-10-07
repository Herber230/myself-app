import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { siteT } from '../../i18n/server.js';
import { releaseCopyOf } from './release-copy.js';
import { ReleaseDecision } from './release-decision.js';

const COPY = releaseCopyOf(siteT('en'));
const POLICY = {
  version: '1.10.0',
  repositoryUrl: 'https://github.com/Herber230/myself-app',
  types: [
    { type: 'feat', level: 'minor' as const, section: 'Features' },
    { type: 'fix', level: 'patch' as const, section: 'Bug Fixes' },
    { type: 'docs' },
  ],
};

const valueOf = (term: string) =>
  screen.getByText(term).nextElementSibling?.textContent;

describe('the release decision', () => {
  it('starts from the first type, with its example description', () => {
    render(<ReleaseDecision policy={POLICY} copy={COPY} />);
    expect(valueOf(COPY.commit)).toBe(`feat: ${COPY.example}`);
    expect(valueOf(COPY.next)).toBe('1.10.0 → 1.11.0, a minor release');
    expect(valueOf(COPY.deploys)).toBe(COPY.yes);
    const notes = document.querySelector('.release-changelog pre')?.textContent;
    expect(notes).toMatch(
      /^## \[1\.11\.0\]\(https:\/\/github\.com\/Herber230\/myself-app\/compare\/v1\.10\.0\.\.\.v1\.11\.0\) \(\d{4}-\d{2}-\d{2}\)/,
    );
    expect(notes).toContain('### Features');
  });

  it('answers a patch, a major, and nothing', () => {
    render(<ReleaseDecision policy={POLICY} copy={COPY} />);
    const type = screen.getByRole('combobox', { name: COPY.type });
    fireEvent.change(type, { target: { value: 'fix' } });
    expect(valueOf(COPY.next)).toBe('1.10.0 → 1.10.1, a patch release');
    fireEvent.click(screen.getByRole('switch', { name: COPY.breaking }));
    expect(valueOf(COPY.commit)).toBe(`fix!: ${COPY.example}`);
    expect(valueOf(COPY.next)).toBe('1.10.0 → 2.0.0, a major release');
    fireEvent.click(screen.getByRole('switch', { name: COPY.breaking }));
    fireEvent.change(type, { target: { value: 'docs' } });
    expect(valueOf(COPY.next)).toBe(COPY.none);
    expect(valueOf(COPY.deploys)).toBe(COPY.no);
    expect(screen.getByText(COPY.hidden)).toBeTruthy();
  });

  it('writes the description typed, and the example again when it is cleared', () => {
    render(<ReleaseDecision policy={POLICY} copy={COPY} />);
    const description = screen.getByRole('textbox', { name: COPY.description });
    fireEvent.change(description, { target: { value: 'a pipeline' } });
    expect(valueOf(COPY.commit)).toBe('feat: a pipeline');
    fireEvent.change(description, { target: { value: '' } });
    expect(valueOf(COPY.commit)).toBe(`feat: ${COPY.example}`);
  });

  it('falls back to feat for a policy that names no type', () => {
    render(<ReleaseDecision policy={{ ...POLICY, types: [] }} copy={COPY} />);
    expect(valueOf(COPY.commit)).toBe(`feat: ${COPY.example}`);
    expect(valueOf(COPY.next)).toBe(COPY.none);
  });
});
