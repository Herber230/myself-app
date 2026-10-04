import {
  type DecisionPage,
  loadArchitectureDecision,
} from '@myself-app/domain/use-cases';
import { buildSiteContent } from '@myself-app/implementation-adapters/server';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderPage } from '../../test/render.js';
import { SITE_CONTENT, SITE_RECORDS } from '../../test/shipped-content.js';
import { DecisionPageView } from './decision-page.js';

async function pageOf(
  number: string,
  locale: 'en' | 'es' = 'en',
  content = SITE_CONTENT,
) {
  const page = (await loadArchitectureDecision(content, {
    project: 'myself-app',
    number,
  })) as DecisionPage;
  await renderPage(
    Promise.resolve(
      <DecisionPageView
        locale={locale}
        page={page}
        outline={[]}
        body={<p>The record.</p>}
      />,
    ),
    locale,
  );
  return page;
}

describe("a decision record's page", () => {
  it('says where it stands, when, and what supersedes it', async () => {
    const page = await pageOf('0008');
    expect(
      screen.getByRole('heading', { level: 1, name: page.decision.title }),
    ).toBeTruthy();
    expect(screen.getByText('ADR 0008')).toBeTruthy();
    expect(screen.getByText('Superseded in part')).toBeTruthy();
    expect(screen.getByText('Superseded by')).toBeTruthy();
    expect(
      screen.getByRole('link', { name: /^ADR 0011 · / }).getAttribute('href'),
    ).toBe('/en/projects/myself-app/adr/0011/');
    expect(
      screen
        .getByRole('link', { name: 'All the decisions of myself-app' })
        .getAttribute('href'),
    ).toBe('/en/projects/myself-app/#decisions');
    expect(screen.getByText('The record.')).toBeTruthy();
    expect(screen.getByText('Read when')).toBeTruthy();
  });

  it('links what it supersedes, around a record in English', async () => {
    await pageOf('0011', 'es');
    expect(screen.getByText('Reemplaza a')).toBeTruthy();
    expect(
      screen.getByRole('link', { name: /^ADR 0008 · / }).getAttribute('href'),
    ).toBe('/es/projects/myself-app/adr/0008/');
    expect(document.querySelector('article')?.getAttribute('lang')).toBe('en');
  });

  it('has no read-when line for a record without one', async () => {
    const records = SITE_RECORDS['adrs.json'] as Record<string, unknown>[];
    const content = buildSiteContent({
      ...SITE_RECORDS,
      'adrs.json': records.map(({ readWhen, ...record }) =>
        record.id === 'myself-app-0001' ? record : { ...record, readWhen },
      ),
    });
    await pageOf('0001', 'en', content);
    expect(screen.queryByText('Read when')).toBeNull();
  });
});
