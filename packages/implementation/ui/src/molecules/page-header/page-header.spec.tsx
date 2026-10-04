import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PageHeader } from './page-header.js';

describe('a page’s head', () => {
  it('has the way back, a line above the title, its mark, the lead, labels and actions', () => {
    const { container } = render(
      <PageHeader
        className="extra"
        back={{ href: '/en/', label: '← Back' }}
        eyebrow={<p>ADR 0016</p>}
        glyph={<svg data-testid="glyph" />}
        title="A static export"
        titleLang="en"
        lead="Served from S3."
        actions={<a href="https://github.com">Source</a>}
      >
        <ul aria-label="Technologies" />
      </PageHeader>,
    );
    const header = container.querySelector('header') as HTMLElement;
    expect(header.className).toBe('page-header extra');
    expect(
      screen.getByRole('link', { name: '← Back' }).getAttribute('href'),
    ).toBe('/en/');
    expect(screen.getByText('ADR 0016')).toBeTruthy();
    expect(screen.getByTestId('glyph')).toBeTruthy();
    const title = screen.getByRole('heading', {
      level: 1,
      name: 'A static export',
    });
    expect(title.getAttribute('lang')).toBe('en');
    expect(screen.getByText('Served from S3.')).toBeTruthy();
    expect(screen.getByRole('list', { name: 'Technologies' })).toBeTruthy();
    expect(header.querySelector('.page-header-actions')?.textContent).toBe(
      'Source',
    );
  });

  it('is only its title when given nothing else', () => {
    const { container } = render(<PageHeader title="Tech radar" />);
    expect(screen.queryByRole('link')).toBeNull();
    expect(container.querySelector('.page-header-lead')).toBeNull();
    expect(container.querySelector('.page-header-meta')).toBeNull();
    expect(screen.getByRole('heading', { level: 1 }).hasAttribute('lang')).toBe(
      false,
    );
  });

  it('lines up actions with no labels', () => {
    const { container } = render(
      <PageHeader title="entifix" actions={<a href="/">Source</a>} />,
    );
    expect(container.querySelector('.page-header-meta')?.children).toHaveLength(
      1,
    );
  });
});
