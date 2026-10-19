import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { NightScene } from './night-scene.js';

describe('the night scene', () => {
  it('is a picture hidden from assistive technology', () => {
    const { container } = render(<NightScene />);
    expect(
      container.querySelector('svg.spooky-scene')?.getAttribute('aria-hidden'),
    ).toBe('true');
  });

  it('draws the moon, the curling hill, the cat and its key', () => {
    const { container } = render(<NightScene />);
    expect(container.querySelector('.spooky-scene-moon')).not.toBeNull();
    expect(container.querySelector('.spooky-scene-curl')).not.toBeNull();
    expect(container.querySelectorAll('.spooky-cat-eye')).toHaveLength(2);
    expect(container.querySelector('.spooky-key')).not.toBeNull();
  });

  it('lets snow fall and bats fly, each on its own beat', () => {
    const { container } = render(<NightScene />);
    const flakes = container.querySelectorAll<SVGGElement>('.spooky-flake');
    const bats = container.querySelectorAll<SVGGElement>('.spooky-bat');
    expect(flakes).toHaveLength(7);
    expect(bats).toHaveLength(3);
    const delays = new Set(
      [...flakes].map(flake => flake.style.animationDelay),
    );
    expect(delays.size).toBe(flakes.length);
    // Each flake is a six-pointed star: three crossing lines.
    expect(flakes[0].querySelectorAll('line')).toHaveLength(3);
  });
});
