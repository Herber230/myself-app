import type { ContactChannelType } from '@myself-app/domain';
import type { ReactNode } from 'react';

/**
 * Contact icons, drawn inline: the CV's human mode (ADR 0012) and the landing
 * page's contact section. Shapes only — no `<text>`, which a PDF would carry
 * as text and an ATS would read. Always beside the words they illustrate,
 * never in their place, so each is `aria-hidden`. The caller names the class,
 * since the sheet and the screen size and colour them differently.
 */
interface IconProps {
  readonly className: string;
}

function Icon({ children, className }: IconProps & { children: ReactNode }) {
  return (
    <svg
      className={className}
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

/** A camera's rounded body, its lens and its flash. */
const INSTAGRAM = (
  <>
    <rect x="2" y="2" width="12" height="12" rx="3.5" />
    <circle cx="8" cy="8" r="2.75" />
    <path d="M11.5 4.5v.01" />
  </>
);

/** A lower-case f in a round badge. */
const FACEBOOK = (
  <>
    <circle cx="8" cy="8" r="6.5" />
    <path d="M10 5H9.25A1.75 1.75 0 0 0 7.5 6.75V14.5M5.75 8.75h4" />
  </>
);

/** A lower-case g, as Goodreads writes its own. */
const GOODREADS = (
  <>
    <circle cx="8" cy="6.75" r="3.25" />
    <path d="M11.25 3.5v6.25a3.75 3.75 0 0 1-7 1.9" />
  </>
);

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
  instagram: INSTAGRAM,
  facebook: FACEBOOK,
  goodreads: GOODREADS,
};

export function ChannelIcon({
  type,
  className,
}: IconProps & { type: ContactChannelType }) {
  return <Icon className={className}>{CHANNEL_SHAPES[type] ?? LINK}</Icon>;
}

export function LocationIcon({ className }: IconProps) {
  return <Icon className={className}>{PIN}</Icon>;
}

/** An arrow down onto a tray: the CV's prebuilt PDF. */
const DOWNLOAD = (
  <path d="M8 2v8m-3.5-3.5L8 10l3.5-3.5M2.5 11v1.5a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V11" />
);

/** A printer: its paper in, its body, its sheet out. */
const PRINTER = (
  <>
    <path d="M4.5 6V2h7v4" />
    <rect x="1.5" y="6" width="13" height="5.5" rx="1" />
    <path d="M4.5 9.5h7V14h-7z" />
  </>
);

/** The CV's actions (#36): downloading, printing, sharing this version. */
export function DownloadIcon({ className }: IconProps) {
  return <Icon className={className}>{DOWNLOAD}</Icon>;
}

export function PrintIcon({ className }: IconProps) {
  return <Icon className={className}>{PRINTER}</Icon>;
}

/** Three sliders: tailoring the sheet. */
const SLIDERS = (
  <path d="M2 4h6m3 0h3M2 8h2m3 0h7M2 12h8m3 0h1M9.5 2.5v3M5.5 6.5v3M11.5 10.5v3" />
);

export function SlidersIcon({ className }: IconProps) {
  return <Icon className={className}>{SLIDERS}</Icon>;
}

export function LinkIcon({ className }: IconProps) {
  return <Icon className={className}>{LINK}</Icon>;
}

/**
 * GitHub's own mark (Octicons' `mark-github`, MIT), filled rather than
 * stroked: a button that leads to a repository wears the logo a reader looks
 * for, where the contact icons stay drawn in the site's line.
 */
export function GitHubMark({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      width="1em"
      height="1em"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z" />
    </svg>
  );
}

/**
 * LinkedIn's own mark (Simple Icons, CC0), filled like `GitHubMark`: the
 * contact cards wear the logo a reader looks for.
 */
export function LinkedInMark({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

/**
 * A channel's mark on the landing's contact cards: the brand's own logo where
 * the site carries one, else the line icon the CV draws.
 */
export function ChannelMark({
  type,
  className,
}: IconProps & { type: ContactChannelType }) {
  if (type === 'github') return <GitHubMark className={className} />;
  if (type === 'linkedin') return <LinkedInMark className={className} />;
  return <ChannelIcon type={type} className={className} />;
}
