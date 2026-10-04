'use client';

import { SplitButton } from '@myself-app/entifix-incubator-react-controls';
import {
  type ReactNode,
  useEffect,
  useState,
  useSyncExternalStore,
} from 'react';

import { CvPrintButton } from '../../atoms/cv-print-button/cv-print-button.js';
import { LinkIcon, PrintIcon } from '../../atoms/icons/icons.js';

const subscribe = () => () => undefined;

/** How long the entry says "Copied" before it reads as before. */
const CONFIRMATION_MS = 2000;

export interface CvDownloadMenuCopy {
  /** The ▾ trigger's accessible name. */
  readonly more: string;
  readonly print: string;
  /** The print dialog's settings for a clean sheet, under the entry. */
  readonly printHint: string;
  readonly copyLink: string;
  readonly linkCopied: string;
}

/** Closes the menu once an entry acts, as the theme menu's entries do. */
const closeMenu = () =>
  document
    .querySelector('.cv-download-menu')
    ?.closest('details')
    ?.removeAttribute('open');

/**
 * The CV's actions (#36, ADR 0012): the prebuilt PDF as the main one, and,
 * behind ▾, printing the sheet as tailored and copying a link to it.
 *
 * The download link is rendered by the page and handed in, so it stays in the
 * static HTML with the attributes `tools/render-pdfs.mjs` reads. The menu
 * needs scripting for every entry, so it joins the link once hydrated.
 */
export function CvDownloadMenu({
  fileName,
  copy,
  children,
}: {
  fileName: string;
  copy: CvDownloadMenuCopy;
  /** The download link, styled as the primary button. */
  children: ReactNode;
}) {
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), CONFIRMATION_MS);
    return () => clearTimeout(timer);
  }, [copied]);

  if (!hydrated)
    return <SplitButton primary={children} menuLabel={copy.more} />;

  const canCopy = typeof navigator.clipboard?.writeText === 'function';

  async function copyLink() {
    // The address as it is now: `?hide=` included, so the link reopens it.
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    closeMenu();
  }

  return (
    <>
      <SplitButton primary={children} menuLabel={copy.more}>
        <ul className="cv-download-menu">
          <li>
            <CvPrintButton
              fileName={fileName}
              className="nav-menu-item"
              onPrint={closeMenu}
            >
              <PrintIcon className="cv-download-menu-icon" />
              <span className="cv-download-menu-text">
                {copy.print}
                <small>{copy.printHint}</small>
              </span>
            </CvPrintButton>
          </li>
          {canCopy && (
            <li>
              <button
                type="button"
                className="nav-menu-item"
                onClick={() => void copyLink()}
              >
                <LinkIcon className="cv-download-menu-icon" />
                <span className="cv-download-menu-text">{copy.copyLink}</span>
              </button>
            </li>
          )}
        </ul>
      </SplitButton>
      {/* Always present, so the confirmation is announced when it appears. */}
      <span className="cv-download-status" role="status">
        {copied && copy.linkCopied}
      </span>
    </>
  );
}
