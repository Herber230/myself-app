'use client';

import { button } from '@entifix/react-controls/primitives';
import { useEffect, useMemo, useSyncExternalStore } from 'react';

import { applyHidden, parseHidden, withHidden } from './cv-hidden';

/** Tells the customizer the query string changed under it. */
const SEARCH_CHANGED = 'cv-search-changed';

function subscribe(onChange: () => void) {
  window.addEventListener('popstate', onChange);
  window.addEventListener(SEARCH_CHANGED, onChange);
  return () => {
    window.removeEventListener('popstate', onChange);
    window.removeEventListener(SEARCH_CHANGED, onChange);
  };
}

/** One part of the sheet a visitor can hide, named as the sheet names it. */
export interface CvCustomizerOption {
  readonly part: string;
  readonly label: string;
}

export interface CvCustomizerGroup {
  readonly legend: string;
  readonly options: readonly CvCustomizerOption[];
}

export interface CvCustomizerCopy {
  readonly label: string;
  readonly reset: string;
  readonly downloadNote: string;
}

/**
 * Tailors the sheet before printing (#38, ADR 0015): a checkbox per section,
 * position and technology, checked while it is shown.
 *
 * It only chooses what is shown of a sheet rendered whole at build time: its
 * options are plain props, so no entifix code reaches the page (ADR 0003).
 * The URL's `?hide=` is its state, as the radar's filter is: each choice
 * rewrites it in place, and the one `<style>` that hides parts follows it, so
 * the link reopens the same sheet and printing keeps it.
 *
 * Rendered only once hydrated, like the print button: without scripting
 * there is nothing to toggle.
 */
export function CvCustomizer({
  groups,
  copy,
}: {
  groups: readonly CvCustomizerGroup[];
  copy: CvCustomizerCopy;
}) {
  // `null` in the static HTML. Read through the store, not once on mount: on
  // a client-side navigation the router writes the new URL during its commit,
  // and the store reads it again after.
  const search = useSyncExternalStore(
    subscribe,
    () => window.location.search,
    () => null,
  );
  const hidden = useMemo(
    () => (search === null ? [] : parseHidden(search)),
    [search],
  );

  // Owns the stylesheet while mounted. On a client-side navigation the inline
  // script does not run, and the stylesheet of the page left behind would
  // otherwise stay: this writes this page's, and removes it on the way out.
  useEffect(() => {
    if (search !== null) applyHidden(hidden);
  }, [search, hidden]);
  useEffect(() => () => applyHidden([]), []);

  if (search === null) return null;

  function choose(next: string[]) {
    const { pathname, hash } = window.location;
    window.history.replaceState(
      window.history.state,
      '',
      `${pathname}${withHidden(window.location.search, next)}${hash}`,
    );
    window.dispatchEvent(new Event(SEARCH_CHANGED));
  }

  const toggle = (part: string, shown: boolean) =>
    choose(shown ? hidden.filter(each => each !== part) : [...hidden, part]);

  return (
    <details className="cv-customize">
      <summary>{copy.label}</summary>
      <div className="cv-customize-body">
        {groups.map(group => (
          <fieldset key={group.legend}>
            <legend>{group.legend}</legend>
            {group.options.map(option => (
              <label key={option.part}>
                <input
                  type="checkbox"
                  checked={!hidden.includes(option.part)}
                  onChange={event => toggle(option.part, event.target.checked)}
                />
                {option.label}
              </label>
            ))}
          </fieldset>
        ))}
        <div className="cv-customize-footer">
          <button
            type="button"
            className={button({ variant: 'secondary', size: 'sm' })}
            disabled={hidden.length === 0}
            onClick={() => choose([])}
          >
            {copy.reset}
          </button>
          {/* Always present, so the note is announced when it appears. */}
          <p className="cv-hint" aria-live="polite">
            {hidden.length > 0 && copy.downloadNote}
          </p>
        </div>
      </div>
    </details>
  );
}
