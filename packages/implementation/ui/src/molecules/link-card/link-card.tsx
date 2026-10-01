import { ExternalLink } from '@myself-app/entifix-incubator-react-controls';
import Link from 'next/link';
import type { ReactNode } from 'react';

export interface LinkCardProps {
  /** Where the card leads: a site path, a web address or a `mailto:`. */
  readonly href: string;
  /** The card's link text, and its heading. */
  readonly title: string;
  /** The heading's level, or a paragraph where a heading would mislead. */
  readonly titleAs?: 'h2' | 'h3' | 'p';
  /** The link's accessible name, when the title alone says too little. */
  readonly name?: string;
  /** A small label above the title: "GitHub". */
  readonly eyebrow?: string;
  /** One or two sentences under the title. */
  readonly description?: string;
  /** What following it does: "How it works". Its arrow is `site.css`'s. */
  readonly cue?: string;
  /** A drawing or a logo, in the badge at its start. */
  readonly mark?: ReactNode;
  /**
   * How the mark moves on hover: a line `glyph` redraws stroke by stroke, a
   * filled `logo` tilts.
   */
  readonly markKind?: 'glyph' | 'logo';
  /** `compact` for a list of many: smaller, tighter, the same motion. */
  readonly size?: 'standard' | 'compact';
  /** A control of its own beside the cue — a copy button — still clickable. */
  readonly extra?: ReactNode;
  /** A hook for a caller's own rule: `data-channel`'s value. */
  readonly variant?: string;
}

/**
 * The site's one clickable card: the projects, the contact channels, the
 * interests and the related posts. The title is its one link, stretched over
 * the whole card (`site.css`), so a screen reader hears one link rather than
 * a card of text. On hover and focus every card moves the same way — it
 * lifts, its border and glow take the primary colour, its mark redraws or
 * tilts, and its cue's arrow slides — and only its colours change under
 * reduced motion.
 */
export function LinkCard({
  href,
  title,
  titleAs: Title = 'h3',
  name,
  eyebrow,
  description,
  cue,
  mark,
  markKind = 'glyph',
  size = 'standard',
  extra,
  variant,
}: LinkCardProps) {
  const link = {
    href,
    className: 'link-card-link',
    'aria-label': name,
    children: title,
  };
  return (
    <article
      className={`link-card link-card-${size}`}
      data-mark={mark ? markKind : undefined}
      data-variant={variant}
    >
      {mark && <span className="link-card-mark">{mark}</span>}
      <div className="link-card-body">
        {eyebrow && <p className="link-card-eyebrow">{eyebrow}</p>}
        <Title className="link-card-title">
          {href.startsWith('/') ? (
            <Link {...link} />
          ) : /^https?:/.test(href) ? (
            <ExternalLink {...link} />
          ) : (
            <a {...link} />
          )}
        </Title>
        {description && <p className="link-card-text">{description}</p>}
        {(cue !== undefined || extra) && (
          <div className="link-card-footer">
            <span aria-hidden="true" className="link-card-cue">
              {cue}
            </span>
            {extra}
          </div>
        )}
      </div>
    </article>
  );
}
