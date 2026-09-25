import { render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { hiddenCss, parseHidden } from './cv-hidden';
import { CvHiddenScript } from './cv-hidden-script';

/** Runs the script's text as the browser would, at `search`. */
function runAt(search: string) {
  window.history.replaceState(null, '', `/en/cv/${search}`);
  const { container } = render(<CvHiddenScript />);
  const source = container.querySelector('script')?.textContent ?? '';
  new Function(source)();
}

const hiddenStyle = () => document.getElementById('cv-hidden');

afterEach(() => {
  hiddenStyle()?.remove();
  window.history.replaceState(null, '', '/en/');
});

describe('the script that hides parts before paint', () => {
  it('writes the rules the customizer would, from the URL', () => {
    const search = '?hide=tech:jest,section:education,tech:jest,bad"]';
    runAt(search);
    expect(hiddenStyle()?.parentElement).toBe(document.head);
    expect(hiddenStyle()?.textContent).toBe(hiddenCss(parseHidden(search)));
  });

  it('writes nothing when the URL hides nothing', () => {
    runAt('');
    runAt('?hide=');
    runAt('?hide=photo:me');
    expect(hiddenStyle()).toBeNull();
  });
});
