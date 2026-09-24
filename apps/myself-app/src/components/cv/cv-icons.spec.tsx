import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ChannelIcon, LocationIcon } from './cv-icons';

const shapeOf = (container: HTMLElement) =>
  container.querySelector('svg')?.innerHTML;

describe('a CV icon', () => {
  it('is hidden from a screen reader, and carries no text a PDF would keep', () => {
    const { container } = render(<ChannelIcon type="email" />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
    expect(svg?.querySelector('text')).toBeNull();
    expect(svg?.textContent).toBe('');
  });

  it('is drawn for email, LinkedIn and GitHub, and a link for the rest', () => {
    const shapes = (
      ['email', 'linkedin', 'github', 'medium', 'x'] as const
    ).map(type => shapeOf(render(<ChannelIcon type={type} />).container));
    expect(new Set(shapes.slice(0, 3)).size).toBe(3);
    expect(shapes[3]).toBe(shapes[4]);
    expect(shapes.slice(0, 3)).not.toContain(shapes[3]);
  });

  it('marks the location with a pin', () => {
    const { container } = render(<LocationIcon />);
    expect(container.querySelector('circle')).not.toBeNull();
  });
});
