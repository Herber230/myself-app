import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SiteBackdrop } from './site-backdrop.js';

describe('the site backdrop', () => {
  it('is decorative: hidden from assistive technology', () => {
    const { container } = render(<SiteBackdrop />);
    const backdrop = container.firstElementChild as HTMLElement;
    expect(backdrop.getAttribute('aria-hidden')).toBe('true');
    expect(backdrop.querySelector('.site-backdrop-track > svg')).toBeTruthy();
  });

  it('tiles code and diagrams, boxes and stores alike', () => {
    const { container } = render(<SiteBackdrop />);
    const tile = container.querySelector('pattern#site-backdrop-tile');
    expect(tile?.querySelectorAll('text.site-backdrop-code').length).toBe(4);
    expect(tile?.querySelectorAll('.site-backdrop-diagram rect').length).toBe(
      11,
    );
    expect(
      [...(tile?.querySelectorAll('text.site-backdrop-label') ?? [])].map(
        label => label.textContent,
      ),
    ).toContain('CloudFront');
  });
});
