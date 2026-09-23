import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { NavMenus } from './nav-menus';

function renderMenus() {
  return render(
    <>
      <details className="nav-menu" data-testid="one">
        <summary>One</summary>
        <a href="#about">About</a>
      </details>
      <details className="nav-menu" data-testid="two">
        <summary>Two</summary>
        <button type="button">Blue</button>
      </details>
      <p>Elsewhere</p>
      <NavMenus />
    </>,
  );
}

describe('the nav menus', () => {
  it('keep one open at a time', () => {
    const { getByTestId, getByText } = renderMenus();
    const [one, two] = [getByTestId('one'), getByTestId('two')] as const;
    one.setAttribute('open', '');
    two.setAttribute('open', '');
    fireEvent.click(getByText('Blue'));
    expect(one.hasAttribute('open')).toBe(false);
    expect(two.hasAttribute('open')).toBe(true);
  });

  it('close on a click elsewhere', () => {
    const { getByTestId, getByText } = renderMenus();
    getByTestId('one').setAttribute('open', '');
    fireEvent.click(getByText('Elsewhere'));
    expect(getByTestId('one').hasAttribute('open')).toBe(false);
  });

  it('close when a link in one is followed', () => {
    const { getByTestId, getByText } = renderMenus();
    getByTestId('one').setAttribute('open', '');
    fireEvent.click(getByText('About'));
    expect(getByTestId('one').hasAttribute('open')).toBe(false);
  });

  it('close on Escape, handing focus back to the trigger', () => {
    const { getByTestId, getByText } = renderMenus();
    getByTestId('two').setAttribute('open', '');
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(getByTestId('two').hasAttribute('open')).toBe(false);
    expect(document.activeElement).toBe(getByText('Two'));
  });

  it('ignore other keys, and Escape with nothing open', () => {
    const { getByTestId } = renderMenus();
    getByTestId('one').setAttribute('open', '');
    fireEvent.keyDown(document, { key: 'Enter' });
    expect(getByTestId('one').hasAttribute('open')).toBe(true);
    getByTestId('one').removeAttribute('open');
    expect(() => fireEvent.keyDown(document, { key: 'Escape' })).not.toThrow();
  });

  it('close all on a click on the page itself', () => {
    const { getByTestId } = renderMenus();
    getByTestId('one').setAttribute('open', '');
    fireEvent.click(document);
    expect(getByTestId('one').hasAttribute('open')).toBe(false);
  });

  it('close on Escape even when a menu has no trigger to refocus', () => {
    const { container } = render(
      <>
        <details className="nav-menu" open />
        <NavMenus />
      </>,
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(container.querySelector('details')?.hasAttribute('open')).toBe(
      false,
    );
  });

  it('stop listening once unmounted', () => {
    const { getByTestId, getByText, unmount } = renderMenus();
    const one = getByTestId('one');
    const elsewhere = getByText('Elsewhere');
    unmount();
    document.body.append(one, elsewhere);
    one.setAttribute('open', '');
    fireEvent.click(elsewhere);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(one.hasAttribute('open')).toBe(true);
    one.remove();
    elsewhere.remove();
  });
});
