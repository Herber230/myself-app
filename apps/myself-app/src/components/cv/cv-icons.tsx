import type { ContactChannelType } from '@myself-app/domain';
import type { ReactNode } from 'react';

/**
 * The human mode's icons, drawn inline (ADR 0012). Shapes only — no `<text>`,
 * which a PDF would carry as text and an ATS would read. Always beside the
 * words they illustrate, never in their place, so each is `aria-hidden`.
 */
function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      className="cv-icon"
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
      {children}
    </svg>
  );
}

const MAIL = (
  <>
    <rect x="1.5" y="3" width="13" height="10" rx="1.5" />
    <path d="m2 4 6 5 6-5" />
  </>
);

/** A square badge with an `i` and an `n`, drawn. */
const LINKEDIN = (
  <>
    <rect x="1.5" y="1.5" width="13" height="13" rx="2" />
    <path d="M5 7v4.5M5 4.75v.01M8 11.5V7m0 2a2 2 0 0 1 4 0v2.5" />
  </>
);

/** Angle brackets: code, where the repositories are. */
const CODE = <path d="M5.5 4 1.5 8l4 4m5-8 4 4-4 4" />;

/** Two links of a chain, for any other channel. */
const LINK = (
  <path d="M7 9a3 3 0 0 0 4.2 0l2-2A3 3 0 0 0 9 2.8l-.8.8M9 7a3 3 0 0 0-4.2 0l-2 2A3 3 0 0 0 7 13.2l.8-.8" />
);

const PIN = (
  <>
    <path d="M8 14.5s5-4.3 5-8.5A5 5 0 0 0 3 6c0 4.2 5 8.5 5 8.5Z" />
    <circle cx="8" cy="6" r="1.75" />
  </>
);

const CHANNEL_SHAPES: Partial<Record<ContactChannelType, ReactNode>> = {
  email: MAIL,
  linkedin: LINKEDIN,
  github: CODE,
};

export function ChannelIcon({ type }: { type: ContactChannelType }) {
  return <Icon>{CHANNEL_SHAPES[type] ?? LINK}</Icon>;
}

export function LocationIcon() {
  return <Icon>{PIN}</Icon>;
}
