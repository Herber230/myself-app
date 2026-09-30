import { loadProjectPage } from '@myself-app/domain/use-cases';
import { browserSources } from '@myself-app/implementation-adapters/browser';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { siteT } from '../../i18n/server.js';
import { SourcesProvider } from '../../sources/sources.js';
import { SITE_CONTENT } from '../../test/shipped-content.js';
import { DecisionExplorer } from './decision-explorer.js';
import {
  decisionExplorerCopyOf,
  decisionOptionsOf,
  decisionRowsOf,
} from './decision-rows.js';

let explorer: () => React.JSX.Element;
let numbers: string[];

beforeAll(async () => {
  const page = await loadProjectPage(SITE_CONTENT, 'myself-app');
  const decisions = page?.decisions ?? [];
  const t = siteT('en');
  const rows = decisionRowsOf(decisions, 'en', t);
  numbers = rows.map(row => row.number);
  const options = decisionOptionsOf(decisions, t);
  explorer = () => (
    <SourcesProvider sources={browserSources}>
      <DecisionExplorer
        decisions={rows}
        statuses={options.statuses}
        areas={options.areas}
        copy={decisionExplorerCopyOf(t)}
      />
    </SourcesProvider>
  );
  // The file the export writes, served where the explorer asks for it.
  const file = JSON.stringify(await SITE_CONTENT.dataFile('adr.json'));
  vi.stubGlobal('fetch', async (url: string) =>
    url === '/data/adr.json'
      ? new Response(file)
      : new Response('', { status: 404 }),
  );
});

afterAll(() => {
  vi.unstubAllGlobals();
});

afterEach(() => {
  window.history.replaceState(null, '', '/en/projects/myself-app/');
});

const shownRecords = () =>
  [...document.querySelectorAll('li[data-adr]')].map(row =>
    row.getAttribute('data-adr'),
  );

describe('a project’s decision records', () => {
  it('are every record by number in the static HTML, with no controls', () => {
    const html = renderToString(explorer());
    expect(html).toContain('/en/projects/myself-app/adr/0016/');
    expect(html).not.toContain('type="search"');
    expect(html).toContain('Read when');
  });

  it('are filtered by status from the URL', async () => {
    window.history.replaceState(
      null,
      '',
      '/en/projects/myself-app/?status=superseded-in-part',
    );
    render(explorer());
    await waitFor(() => expect(shownRecords()).toEqual(['myself-app-0008']));
    expect(screen.getByText(`Showing 1 of ${numbers.length}`)).toBeTruthy();
  });

  it('are ordered by a sort chosen, which clearing the filters keeps', async () => {
    render(explorer());
    fireEvent.click(screen.getByRole('button', { name: 'Number' }));
    expect(window.location.search).toBe('?sort=number-asc');
    fireEvent.click(screen.getByRole('button', { name: 'Number, ascending' }));
    expect(window.location.search).toBe('?sort=number-desc');
    await waitFor(() =>
      expect(shownRecords()[0]).toBe(`myself-app-${numbers.at(-1)}`),
    );

    fireEvent.click(screen.getByRole('button', { name: 'Date' }));
    expect(window.location.search).toBe('?sort=date-desc');

    fireEvent.click(screen.getByRole('button', { name: 'ui' }));
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Clear filters' }),
      ).toBeTruthy(),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(window.location.search).toBe('?sort=date-desc');
  });

  it('say when nothing matches, and search titles and symptoms', async () => {
    render(explorer());
    fireEvent.change(screen.getByRole('searchbox'), {
      target: { value: 'nothing says this' },
    });
    await waitFor(() =>
      expect(screen.getByText('No record matches the filter.')).toBeTruthy(),
    );
    fireEvent.change(screen.getByRole('searchbox'), {
      target: { value: 'budget' },
    });
    await waitFor(() => expect(shownRecords().length).toBeGreaterThan(0));
  });

  it('toggle a status on and off', async () => {
    render(explorer());
    fireEvent.click(screen.getByRole('button', { name: 'Accepted' }));
    expect(window.location.search).toBe('?status=accepted');
    fireEvent.click(screen.getByRole('button', { name: 'Accepted' }));
    expect(window.location.search).toBe('');
  });
});
