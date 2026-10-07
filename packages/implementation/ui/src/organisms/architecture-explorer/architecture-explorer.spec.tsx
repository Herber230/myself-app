import {
  loadProjectPage,
  type ProjectArchitecture,
} from '@myself-app/domain/use-cases';
import { buildSiteContent } from '@myself-app/implementation-adapters/server';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { siteT } from '../../i18n/server.js';
import { SITE_CONTENT, SITE_RECORDS } from '../../test/shipped-content.js';
import { ArchitectureExplorer } from './architecture-explorer.js';
import { architectureCopyOf, architectureViewOf } from './architecture-rows.js';

const t = siteT('en');
const architecture = (await loadProjectPage(SITE_CONTENT, 'myself-app'))
  ?.architecture as ProjectArchitecture;
const VIEW = architectureViewOf(architecture, 'en', t);
const COPY = architectureCopyOf(t);
const BASE = 'https://github.com/Herber230/myself-app/tree/main/';

const diagram = () => screen.getByRole('group', { name: 'Ports and adapters' });
const part = (name: string) => within(diagram()).getByRole('button', { name });
const panel = () =>
  document.querySelector('.architecture-panel') as HTMLElement;

describe("a project's architecture explorer", () => {
  it('draws the hexagon from the content, its rings named, each pair connected once', () => {
    expect(VIEW.rings.map(ring => ring.label)).toEqual([
      'Domain',
      'Ports',
      'Adapters',
    ]);
    const pairs = VIEW.connections.map(({ from, to }) =>
      [from, to].sort().join(),
    );
    expect(new Set(pairs).size).toBe(pairs.length);
    render(<ArchitectureExplorer view={VIEW} copy={COPY} baseUrl={BASE} />);
    expect(within(diagram()).getAllByRole('button')).toHaveLength(
      VIEW.parts.length,
    );
    expect(panel().textContent).toBe(COPY.hint);
  });

  it('tells a part chosen, and links where it lives', () => {
    render(<ArchitectureExplorer view={VIEW} copy={COPY} baseUrl={BASE} />);
    fireEvent.click(part('Next route'));
    expect(
      within(panel()).getByText(/runs once, during next build/),
    ).toBeTruthy();
    expect(within(panel()).getByText('Adapters')).toBeTruthy();
    expect(
      within(panel())
        .getByRole('link', { name: 'apps/myself-app/' })
        .getAttribute('href'),
    ).toBe(`${BASE}apps/myself-app/`);
    expect(part('Next route').getAttribute('aria-pressed')).toBe('true');
  });

  it('names where a part lives without linking it, given no repository', () => {
    render(<ArchitectureExplorer view={VIEW} copy={COPY} />);
    fireEvent.click(part('Entities'));
    expect(
      within(panel()).getByText('packages/domain/').tagName.toLowerCase(),
    ).toBe('code');
  });

  it('fades the parts of the other runtime', () => {
    render(<ArchitectureExplorer view={VIEW} copy={COPY} />);
    fireEvent.click(screen.getByRole('radio', { name: 'In the browser' }));
    expect(part('Next route').getAttribute('data-state')).toBe('dim');
    expect(part('useUrlFilter').getAttribute('data-state')).toBeNull();
    // A part of no runtime of its own is never faded.
    expect(part('Use cases').getAttribute('data-state')).toBeNull();
    fireEvent.click(screen.getByRole('radio', { name: 'Everywhere' }));
    expect(part('Next route').getAttribute('data-state')).toBeNull();
  });

  it('walks a scenario a step at a time, its line travelled', () => {
    const { container } = render(
      <ArchitectureExplorer view={VIEW} copy={COPY} />,
    );
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'myself-app-filter-radar' },
    });
    expect(screen.getByText('Step 1 of 6')).toBeTruthy();
    expect(part('React explorer').getAttribute('data-state')).toBe('lit');
    expect(
      within(panel()).getByText('/en/tech-radar/?ring=adopt'),
    ).toBeTruthy();
    // The step's runtime holds the switch, and fades the build's parts.
    expect(
      screen
        .getByRole('radio', { name: 'In the browser' })
        .getAttribute('aria-checked'),
    ).toBe('true');
    expect(part('Static adapter').getAttribute('data-state')).toBe('dim');
    fireEvent.click(screen.getByRole('button', { name: 'Next step' }));
    expect(
      container.querySelectorAll('[data-slot="hexagon-edge"][data-travelled]'),
    ).toHaveLength(1);
    // Choosing a part leaves the scenario.
    fireEvent.click(part('Entities'));
    expect(screen.queryByText(/^Step /)).toBeNull();
    expect((screen.getByRole('combobox') as HTMLSelectElement).value).toBe('');
  });

  it('marks the step where a scenario fails, and leaves it for a runtime chosen', () => {
    render(<ArchitectureExplorer view={VIEW} copy={COPY} />);
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'myself-app-broken-record' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Next step' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next step' }));
    expect(part('Static adapter').getAttribute('data-state')).toBe('fails');
    expect(panel().hasAttribute('data-fails')).toBe(true);
    fireEvent.click(screen.getByRole('radio', { name: 'At build' }));
    expect(screen.queryByText(/^Step /)).toBeNull();
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '' } });
    expect(panel().textContent).toBe(COPY.hint);
  });

  it('offers the same parts as chips, for a phone', () => {
    render(<ArchitectureExplorer view={VIEW} copy={COPY} />);
    const rows = document.querySelector('.architecture-rows') as HTMLElement;
    fireEvent.click(
      within(rows).getByRole('button', { name: 'StaticContent' }),
    );
    expect(within(panel()).getByText('Ports')).toBeTruthy();
    expect(
      within(rows)
        .getByRole('button', { name: 'StaticContent' })
        .getAttribute('aria-pressed'),
    ).toBe('true');
  });

  it('draws a pair of parts that name each other once', async () => {
    const nodes = SITE_RECORDS['architecture-nodes.json'] as Record<
      string,
      unknown
    >[];
    const content = buildSiteContent({
      ...SITE_RECORDS,
      'architecture-nodes.json': nodes.map(node =>
        node.id === 'myself-app-content-port'
          ? { ...node, connects: ['myself-app-static-adapter'] }
          : node,
      ),
    });
    const both = (await loadProjectPage(content, 'myself-app'))
      ?.architecture as ProjectArchitecture;
    expect(architectureViewOf(both, 'en', t).connections).toHaveLength(
      VIEW.connections.length,
    );
  });

  it('travels a line either way, and holds no runtime for a step of none', () => {
    const view = {
      ...VIEW,
      scenarios: [
        {
          id: 'back',
          label: 'Back',
          steps: [
            {
              // Drawn from the adapter to the port; travelled the other way.
              nodes: ['myself-app-content-port'],
              from: 'myself-app-content-port',
              to: 'myself-app-static-adapter',
              title: 'Back',
              text: 'Answered.',
              fails: false,
            },
          ],
        },
      ],
    };
    const { container } = render(
      <ArchitectureExplorer view={view} copy={COPY} />,
    );
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'back' },
    });
    expect(
      container.querySelectorAll('[data-slot="hexagon-edge"][data-travelled]'),
    ).toHaveLength(1);
    expect(
      screen
        .getByRole('radio', { name: 'Everywhere' })
        .getAttribute('aria-checked'),
    ).toBe('true');
    expect(part('Next route').getAttribute('data-state')).toBeNull();
  });
});
