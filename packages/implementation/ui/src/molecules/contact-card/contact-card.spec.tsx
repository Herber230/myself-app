import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ContactCard } from './contact-card.js';

describe('a contact card', () => {
  it("is one link named by channel and handle, under the channel's name", () => {
    const { container } = render(
      <ContactCard
        type="github"
        url="https://github.com/ab"
        channel="GitHub"
        handle="ab"
        name="GitHub: ab"
        action="See my code"
      />,
    );
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(1);
    expect(links[0]?.getAttribute('aria-label')).toBe('GitHub: ab');
    expect(links[0]?.textContent).toBe('ab');
    expect(container.querySelector('.link-card-eyebrow')?.textContent).toBe(
      'GitHub',
    );
    expect(container.querySelector('.link-card-cue')?.textContent).toBe(
      'See my code',
    );
    const card = container.querySelector('article');
    expect(card?.getAttribute('data-mark')).toBe('logo');
    expect(card?.getAttribute('data-variant')).toBe('github');
    expect(container.querySelector('.contact-card-copy')).toBeNull();
  });

  it('offers its value for copying when given one', () => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: () => Promise.resolve() },
    });
    render(
      <ContactCard
        type="email"
        url="mailto:a@b.c"
        channel="Email"
        handle="a@b.c"
        name="Email: a@b.c"
        action="Send me an email"
        copy={{
          value: 'a@b.c',
          label: 'Copy',
          name: 'Copy email address',
          copiedLabel: 'Copied',
        }}
      />,
    );
    expect(
      screen.getByRole('button', { name: 'Copy email address' }).className,
    ).toBe('contact-card-copy');
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: undefined,
    });
  });
});
