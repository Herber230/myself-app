import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { NavIcon } from './nav-icon';

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
