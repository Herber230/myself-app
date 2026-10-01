'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';

const subscribe = () => () => undefined;

/** How long the button says "Copied" before it reads "Copy" again. */
const CONFIRMATION_MS = 2000;

/**
 * Copies a value to the clipboard: the email card's second way to write,
 * since `mailto:` does nothing on a machine with no mail client. The button
 * confirms in its own words, and a polite live region says it once.
 *
 * Rendered only once hydrated, and only where the Clipboard API exists:
 * without it there is nothing to click.
 */
export function CopyButton({
  value,
  label,
  name,
  copiedLabel,
  className,
}: {
  value: string;
  /** What it says: "Copy". */
  label: string;
  /** Its accessible name, containing `label`: "Copy email address". */
  name: string;
  /** What it says once copied: "Copied". */
  copiedLabel: string;
  className?: string;
}) {
  const supported = useSyncExternalStore(
    subscribe,
    () => typeof navigator.clipboard?.writeText === 'function',
    () => false,
  );
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), CONFIRMATION_MS);
    return () => clearTimeout(timer);
  }, [copied]);

  if (!supported) return null;
  return (
    <button
      type="button"
      className={className}
      data-copied={copied || undefined}
      aria-label={copied ? copiedLabel : name}
      onClick={() => {
        void navigator.clipboard.writeText(value).then(() => setCopied(true));
      }}
    >
      <svg
        viewBox="0 0 16 16"
        width="1em"
        height="1em"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
      >
        {copied ? (
          <path d="m3 8.5 3 3 7-7" />
        ) : (
          <>
            <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" />
            <path d="M10.5 3.5v-.5A1.5 1.5 0 0 0 9 1.5H4A1.5 1.5 0 0 0 2.5 3v5A1.5 1.5 0 0 0 4 9.5h.5" />
          </>
        )}
      </svg>
      <span aria-hidden="true">{copied ? copiedLabel : label}</span>
      <span role="status" className="sr-only">
        {copied ? copiedLabel : ''}
      </span>
    </button>
  );
}
