'use client';

import { button } from '@entifix/react-controls/primitives';
import { useSyncExternalStore } from 'react';

const subscribe = () => () => undefined;

/**
 * Prints the sheet from the visitor's own browser (#36): the one way a sheet
 * becomes a PDF with whatever the visitor chose. Its output depends on their
 * browser and its settings, so the prebuilt PDF beside it is the guaranteed
 * one (ADR 0012).
 *
 * Before printing, the document title becomes the file name Chromium and
 * Safari offer (`Herber Colop — CV (Backend)`), and it is put back once the
 * dialog closes. Printing waits for the fonts, so a quick click never prints
 * a fallback.
 *
 * Rendered only once hydrated: without scripting there is nothing to click,
 * and the browser's own Print still prints the same sheet.
 */
export function CvPrintButton({
  label,
  fileName,
}: {
  label: string;
  fileName: string;
}) {
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  if (!hydrated) return null;

  async function print() {
    const title = document.title;
    document.title = fileName;
    window.addEventListener(
      'afterprint',
      () => {
        document.title = title;
      },
      { once: true },
    );
    await document.fonts.ready;
    window.print();
  }

  return (
    <button
      type="button"
      className={button({ variant: 'primary', size: 'sm' })}
      onClick={() => void print()}
    >
      {label}
    </button>
  );
}
