import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { NavIcon, NavMenu, NavMenuCheck } from './nav-menu';

describe('a nav menu', () => {
  it('is a closed disclosure named by its label', () => {
    const { container } = render(
      <NavMenu label="Language" icon={<NavIcon name="globe" />} summary="EN">
        <a href="/es/">Español</a>
      </NavMenu>,
    );
    const details = container.querySelector('details');
    expect(details?.className).toBe('nav-menu');
    expect(details?.open).toBe(false);
    expect(screen.getByLabelText('Language').textContent).toBe('EN');
    expect(container.querySelector('.nav-menu-chevron')).not.toBeNull();
  });

  it('takes a class and can leave out the chevron', () => {
    const { container } = render(
      <NavMenu
        label="Menu"
        icon={<NavIcon name="menu" />}
        chevron={false}
        className="nav-menu-sheet"
      >
        <span />
      </NavMenu>,
    );
    expect(container.querySelector('details')?.className).toBe(
      'nav-menu nav-menu-sheet',
    );
    expect(container.querySelector('.nav-menu-chevron')).toBeNull();
  });
});

describe('a menu check', () => {
  it('draws a tick only when checked', () => {
    const { container } = render(
      <>
        <NavMenuCheck checked />
        <NavMenuCheck checked={false} />
      </>,
    );
    const [on, off] = container.querySelectorAll('svg');
    expect(on?.querySelector('path')).not.toBeNull();
    expect(off?.querySelector('path')).toBeNull();
  });
});

describe('a nav icon', () => {
  it('is decorative, and adds a class when given one', () => {
    const { container } = render(
      <>
        <NavIcon name="cv" />
        <NavIcon name="close" className="nav-icon-when-open" />
      </>,
    );
    const [plain, extra] = container.querySelectorAll('svg');
    expect(plain?.getAttribute('aria-hidden')).toBe('true');
    expect(plain?.getAttribute('class')).toBe('nav-icon');
    expect(extra?.getAttribute('class')).toBe('nav-icon nav-icon-when-open');
  });
});
