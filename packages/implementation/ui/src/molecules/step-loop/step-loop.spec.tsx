import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { StepLoop } from './step-loop.js';

describe('steps in a loop', () => {
  it('is an ordered list, named, a step an icon and its words', () => {
    const { container } = render(
      <StepLoop
        label="How it goes"
        steps={[
          { key: 'a', label: 'First', icon: 'M0 0h1' },
          { key: 'b', label: 'Then', icon: 'M1 1h1' },
        ]}
      />,
    );
    const list = screen.getByRole('list', { name: 'How it goes' });
    expect(list.tagName).toBe('OL');
    expect(
      within(list)
        .getAllByRole('listitem')
        .map(step => step.textContent),
    ).toEqual(['First', 'Then']);
    // The icons only illustrate: a reader hears the words.
    expect(
      [...container.querySelectorAll('svg')].every(
        icon => icon.getAttribute('aria-hidden') === 'true',
      ),
    ).toBe(true);
    expect(container.querySelector('path')?.getAttribute('d')).toBe('M0 0h1');
  });

  it('times each step by its place, and knows how many there are', () => {
    const { container } = render(
      <StepLoop
        label="Loop"
        steps={['a', 'b', 'c'].map(key => ({ key, label: key, icon: 'M0 0' }))}
      />,
    );
    expect(
      [...container.querySelectorAll<HTMLElement>('.step-loop-step')].map(
        step => step.style.getPropertyValue('--step'),
      ),
    ).toEqual(['0', '1', '2']);
    expect(
      (container.firstElementChild as HTMLElement).style.getPropertyValue(
        '--loop-steps',
      ),
    ).toBe('3');
  });
});
