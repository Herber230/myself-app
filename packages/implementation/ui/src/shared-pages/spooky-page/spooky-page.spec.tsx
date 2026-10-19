import { render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SpookyPageView } from './spooky-page.js';

beforeEach(() => {
  vi.stubGlobal('CSS', { supports: () => true });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('the Spooky page', () => {
  it('opens with the question, read as one heading', () => {
    render(<SpookyPageView />);
    expect(screen.getByText('Hi Gabs.')).toBeTruthy();
    expect(
      screen.getByText('Thinking about a nickname, I found the perfect one:'),
    ).toBeTruthy();
    // Its two lines are block spans: a browser names it "Would you like to be
    // my Spooky?" (the e2e journey holds that); jsdom, with no layout, joins
    // them without the space.
    const question = screen.getByRole('heading', { level: 1 });
    expect([...question.children].map(line => line.textContent)).toEqual([
      'Would you like to be my',
      'Spooky?',
    ]);
  });

  it('points to the story below', () => {
    render(<SpookyPageView />);
    expect(
      screen
        .getByRole('link', { name: 'Read on, if you dare' })
        .getAttribute('href'),
    ).toBe('#secret');
  });

  it('tells the story in its sections, and ends by asking again', () => {
    render(<SpookyPageView />);
    expect(
      screen.getAllByRole('heading', { level: 2 }).map(h => h.textContent),
    ).toEqual([
      'Two ghosts, one secret',
      'Try it: look at a ghost',
      'Spukhafte Fernwirkung',
      'The ghosts were real',
      'Will you be my Spooky?',
    ]);
    // Each section is a landmark named by its heading.
    expect(
      screen.getByRole('region', { name: 'Two ghosts, one secret' }),
    ).toBeTruthy();
  });

  it('quotes Einstein in German, glossed in English', () => {
    const { container } = render(<SpookyPageView />);
    const quote = container.querySelector('blockquote');
    expect(quote?.getAttribute('lang')).toBe('de');
    expect(
      within(quote as HTMLElement).getByText('spukhafte Fernwirkung'),
    ).toBeTruthy();
    expect(quote?.querySelector('footer')?.getAttribute('lang')).toBe('en');
  });

  it('holds the demo, the backdrop and the closing night scene', () => {
    const { container } = render(<SpookyPageView />);
    expect(
      screen.getByRole('button', { name: 'Look at Ghost A' }),
    ).toBeTruthy();
    expect(container.querySelector('.spooky-parallax')).not.toBeNull();
    expect(container.querySelector('.spooky-scene')).not.toBeNull();
    // Pumpkins and hearts drift up the hero.
    const drifters = container.querySelectorAll('.spooky-drifter');
    expect(
      [...drifters].some(drifter => drifter.querySelector('.spooky-heart')),
    ).toBe(true);
    expect(
      [...drifters].some(drifter => drifter.querySelector('.spooky-pumpkin')),
    ).toBe(true);
  });
});
