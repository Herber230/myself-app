import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { LinkCard } from './link-card.js';

describe('a link card', () => {
  it('is one link, its title, as a heading of the level asked', () => {
    render(<LinkCard href="/en/blog/" title="The blog" titleAs="h2" />);
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(1);
    expect(links[0]?.getAttribute('href')).toBe('/en/blog/');
    expect(
      screen.getByRole('heading', { level: 2, name: 'The blog' }),
    ).toBeTruthy();
  });

  it('is a third-level heading unless told otherwise, or a paragraph', () => {
    render(<LinkCard href="/en/" title="Home" />);
    expect(
      screen.getByRole('heading', { level: 3, name: 'Home' }),
    ).toBeTruthy();
    const { container } = render(
      <LinkCard href="/en/" title="A line" titleAs="p" />,
    );
    expect(container.querySelector('p.link-card-title')?.textContent).toBe(
      'A line',
    );
  });

  it('opens a web address safely, and leaves mail to the mail client', () => {
    render(
      <>
        <LinkCard href="https://example.com/" title="Web" />
        <LinkCard href="mailto:a@b.c" title="Mail" />
      </>,
    );
    const web = screen.getByRole('link', { name: 'Web' });
    expect(web.getAttribute('target')).toBe('_blank');
    expect(web.getAttribute('rel')).toBe('noopener noreferrer');
    const mail = screen.getByRole('link', { name: 'Mail' });
    expect(mail.getAttribute('href')).toBe('mailto:a@b.c');
    expect(mail.getAttribute('target')).toBeNull();
  });

  it('carries its label, text, cue, mark and extra control, the cue hidden from a screen reader', () => {
    const { container } = render(
      <LinkCard
        href="https://github.com/ab"
        title="ab"
        name="GitHub: ab"
        eyebrow="GitHub"
        description="Repositories."
        cue="See my code"
        mark={<svg data-testid="mark" />}
        markKind="logo"
        extra={<button type="button">{'Copy'}</button>}
        variant="github"
      />,
    );
    const card = container.querySelector('article');
    expect(card?.className).toBe('link-card link-card-standard');
    expect(card?.getAttribute('data-mark')).toBe('logo');
    expect(card?.getAttribute('data-variant')).toBe('github');
    expect(screen.getByRole('link', { name: 'GitHub: ab' })).toBeTruthy();
    expect(container.querySelector('.link-card-eyebrow')?.textContent).toBe(
      'GitHub',
    );
    expect(container.querySelector('.link-card-text')?.textContent).toBe(
      'Repositories.',
    );
    const cue = container.querySelector('.link-card-cue');
    expect(cue?.textContent).toBe('See my code');
    expect(cue?.getAttribute('aria-hidden')).toBe('true');
    expect(
      container.querySelector('.link-card-mark [data-testid="mark"]'),
    ).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Copy' })).toBeTruthy();
  });

  it('redraws a glyph by default, and leaves out what it is not given', () => {
    const { container } = render(
      <LinkCard href="/en/" title="Bare" size="compact" mark={<svg />} />,
    );
    const card = container.querySelector('article');
    expect(card?.className).toBe('link-card link-card-compact');
    expect(card?.getAttribute('data-mark')).toBe('glyph');
    expect(card?.hasAttribute('data-variant')).toBe(false);
    expect(container.querySelector('.link-card-eyebrow')).toBeNull();
    expect(container.querySelector('.link-card-text')).toBeNull();
    expect(container.querySelector('.link-card-footer')).toBeNull();
  });

  it('keeps the arrow alone when its cue is empty, and drops the mark it lacks', () => {
    const { container } = render(<LinkCard href="/en/" title="A" cue="" />);
    expect(container.querySelector('.link-card-cue')?.textContent).toBe('');
    expect(container.querySelector('.link-card-mark')).toBeNull();
    expect(container.querySelector('article')?.hasAttribute('data-mark')).toBe(
      false,
    );
  });
});
