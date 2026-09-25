import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it } from 'vitest';

import { CvCustomizer, type CvCustomizerGroup } from './cv-customizer';
import { applyHidden } from './cv-hidden';

const groups: CvCustomizerGroup[] = [
  {
    legend: 'Sections',
    options: [
      { part: 'section:summary', label: 'Summary' },
      { part: 'section:education', label: 'Education' },
    ],
  },
  {
    legend: 'Technologies',
    options: [{ part: 'tech:jest', label: 'Jest' }],
  },
];

const copy = {
  label: 'Customize',
  reset: 'Show everything',
  downloadNote: 'The download is the full sheet.',
};

const customizer = <CvCustomizer groups={groups} copy={copy} />;

const hiddenStyle = () => document.getElementById('cv-hidden');
const at = (url: string) => window.history.replaceState(null, '', url);
const url = () =>
  `${window.location.pathname}${window.location.search}${window.location.hash}`;

afterEach(() => {
  hiddenStyle()?.remove();
  at('/en/');
});

describe('the CV customizer', () => {
  it('is not in the static HTML, where there is no script to run it', () => {
    expect(renderToString(customizer)).toBe('');
  });

  it('keeps what the inline script hid while it hydrates', async () => {
    at('/en/cv/?hide=tech:jest');
    // As `CvHiddenScript` leaves the page before React runs.
    applyHidden(['tech:jest']);
    const written = hiddenStyle();
    const container = document.createElement('div');
    container.innerHTML = renderToString(customizer);
    document.body.appendChild(container);
    await act(async () => {
      hydrateRoot(container, customizer);
    });
    expect(hiddenStyle()).toBe(written);
    expect(hiddenStyle()?.textContent).toContain('tech:jest');
    expect(screen.getByRole('checkbox', { name: 'Jest' })).toHaveProperty(
      'checked',
      false,
    );
    container.remove();
  });

  it('shows every part checked, and hides nothing, on a plain URL', () => {
    at('/en/cv/');
    render(customizer);
    const sections = screen.getByRole('group', { name: 'Sections' });
    expect(
      within(sections)
        .getAllByRole('checkbox')
        .map(box => (box as HTMLInputElement).checked),
    ).toEqual([true, true]);
    expect(
      screen.getByRole('button', { name: 'Show everything' }),
    ).toHaveProperty('disabled', true);
    expect(screen.queryByText(copy.downloadNote)).toBeNull();
    expect(hiddenStyle()).toBeNull();
  });

  it('hides a part when it is unchecked, in the page and in the URL', () => {
    at('/en/cv/?lang=en#top');
    render(customizer);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Jest' }));
    fireEvent.click(screen.getByRole('checkbox', { name: 'Education' }));
    expect(hiddenStyle()?.textContent).toBe(
      '[data-cv-part="section:education"],[data-cv-part="tech:jest"]{display:none!important}',
    );
    expect(url()).toBe('/en/cv/?lang=en&hide=section:education,tech:jest#top');
    expect(screen.getByText(copy.downloadNote)).toBeTruthy();

    fireEvent.click(screen.getByRole('checkbox', { name: 'Jest' }));
    expect(hiddenStyle()?.textContent).toBe(
      '[data-cv-part="section:education"]{display:none!important}',
    );
    expect(url()).toBe('/en/cv/?lang=en&hide=section:education#top');
  });

  it('starts from what the URL hides, and shows everything again on reset', () => {
    at('/en/cv/?hide=tech:jest');
    render(customizer);
    expect(screen.getByRole('checkbox', { name: 'Jest' })).toHaveProperty(
      'checked',
      false,
    );
    expect(hiddenStyle()?.textContent).toContain('tech:jest');

    fireEvent.click(screen.getByRole('button', { name: 'Show everything' }));
    expect(screen.getByRole('checkbox', { name: 'Jest' })).toHaveProperty(
      'checked',
      true,
    );
    expect(hiddenStyle()).toBeNull();
    expect(url()).toBe('/en/cv/');
  });

  it('follows the URL when history moves under it', () => {
    at('/en/cv/');
    render(customizer);
    act(() => {
      at('/en/cv/?hide=tech:jest');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    expect(screen.getByRole('checkbox', { name: 'Jest' })).toHaveProperty(
      'checked',
      false,
    );
    expect(hiddenStyle()?.textContent).toContain('tech:jest');
  });

  it('takes its rules away when the page it customizes is left', () => {
    at('/en/cv/?hide=section:summary');
    const { unmount } = render(customizer);
    expect(hiddenStyle()).not.toBeNull();
    unmount();
    expect(hiddenStyle()).toBeNull();
  });
});
