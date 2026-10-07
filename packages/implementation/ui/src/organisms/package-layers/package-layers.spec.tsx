import {
  loadProjectPage,
  type ProjectPage,
} from '@myself-app/domain/use-cases';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { siteT } from '../../i18n/server.js';
import { SITE_CONTENT } from '../../test/shipped-content.js';
import { layersCopyOf, layersViewOf } from './layer-rows.js';
import { PackageLayers } from './package-layers.js';

const t = siteT('en');
const COPY = layersCopyOf(t);
const page = (await loadProjectPage(SITE_CONTENT, 'myself-app')) as ProjectPage;
const VIEW = layersViewOf(
  page.layers as NonNullable<ProjectPage['layers']>,
  page.paths,
  'en',
);
const BASE = 'https://github.com/Herber230/myself-app/tree/main/';

const box = (name: string) =>
  within(screen.getByRole('group', { name: 'Packages by layer' })).getByRole(
    'button',
    { name },
  );
const panel = () => document.querySelector('.layers-panel') as HTMLElement;

describe("a project's package layers", () => {
  it('draws the bands top first, each package with its note, its own or its folder’s', () => {
    expect(VIEW.bands[0]).toBe('App');
    const domain = VIEW.boxes.find(each => each.id === 'myself-app-domain');
    expect(domain?.path).toBe('packages/domain/');
    expect(domain?.note).toMatch(/^Entities, use cases/);
    expect(domain?.band).toBe(2);
    render(<PackageLayers view={VIEW} copy={COPY} baseUrl={BASE} />);
    expect(panel().textContent).toBe(COPY.hint);
  });

  it('tells the package pointed at: its folder, what it imports and what imports it', () => {
    render(<PackageLayers view={VIEW} copy={COPY} baseUrl={BASE} />);
    fireEvent.mouseEnter(box('ui'));
    expect(
      within(panel())
        .getByRole('link', { name: 'packages/implementation/ui/' })
        .getAttribute('href'),
    ).toBe(`${BASE}packages/implementation/ui/`);
    expect(
      within(panel()).getByText('Imports: domain, entifix-incubator'),
    ).toBeTruthy();
    expect(within(panel()).getByText('Imported by: myself-app')).toBeTruthy();
    fireEvent.mouseEnter(box('content'));
    expect(within(panel()).getByText('Imports: nothing')).toBeTruthy();
  });

  it('draws the imports lint refuses, and why, on demand', () => {
    const { container } = render(<PackageLayers view={VIEW} copy={COPY} />);
    const refused = () =>
      container.querySelectorAll('[data-slot="layer-edge"][data-refused]');
    expect(refused()).toHaveLength(0);
    fireEvent.click(
      screen.getByRole('button', { name: 'Show what lint refuses' }),
    );
    expect(refused()).toHaveLength(VIEW.refused.length);
    const list = document.querySelector('.layers-refused') as HTMLElement;
    expect(within(list).getByText('ui → adapters')).toBeTruthy();
    expect(list.textContent).toContain('The UI never reads content');
    fireEvent.click(
      screen.getByRole('button', { name: 'Show what lint refuses' }),
    );
    expect(refused()).toHaveLength(0);
  });

  it('lists the packages band by band for a phone, and the folders around the code', () => {
    render(<PackageLayers view={VIEW} copy={COPY} />);
    const list = document.querySelector('.layers-list') as HTMLElement;
    expect(within(list).getAllByText(/^Imports: /).length).toBeGreaterThan(0);
    const around = document.querySelector('.layers-around') as HTMLElement;
    expect(within(around).getByText('apps/infra/').tagName.toLowerCase()).toBe(
      'code',
    );
  });

  it('has no folders around the code when every path is a package', () => {
    render(<PackageLayers view={{ ...VIEW, around: [] }} copy={COPY} />);
    expect(document.querySelector('.layers-around')).toBeNull();
  });
});
