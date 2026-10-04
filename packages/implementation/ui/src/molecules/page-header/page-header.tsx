import {
  cn,
  linkClassName,
  Stack,
  Text,
} from '@entifix/react-controls/primitives';
import Link from 'next/link';
import type { ReactNode } from 'react';

/**
 * A page's head, the same on every page that has one: the way back, a line
 * above the title (a post's date, say), the title with its mark, what the
 * page is about in muted body text, and under it the page's labels — chips —
 * with its calls to action at the end of their line.
 *
 * Laid out by its own width (`container-type`), not the screen's: where it is
 * narrow, the actions take a line each, full width. No hooks, so a client
 * component may render it too.
 */
export function PageHeader({
  back,
  eyebrow,
  glyph,
  title,
  titleLang,
  lead,
  actions,
  className,
  children,
}: {
  back?: { readonly href: string; readonly label: string };
  /** Above the title: a post's date and reading time. */
  eyebrow?: ReactNode;
  /** Beside the title: a project's mark. */
  glyph?: ReactNode;
  title: ReactNode;
  /** The title's language, when it is not the page's. */
  titleLang?: string;
  lead?: ReactNode;
  /** At the end of the labels' line: links that leave the page, say. */
  actions?: ReactNode;
  className?: string;
  /** Under the lead: the page's labels. */
  children?: ReactNode;
}) {
  return (
    <header className={cn('page-header', className)}>
      <Stack gap="s">
        {back !== undefined && (
          <Link
            href={back.href}
            className={cn(linkClassName, 'page-header-back')}
          >
            {back.label}
          </Link>
        )}
        {eyebrow}
        <div className="page-header-title">
          {glyph}
          <Text as="h1" step={3} weight="semibold" lang={titleLang}>
            {title}
          </Text>
        </div>
        {lead !== undefined && (
          <Text muted className="page-header-lead">
            {lead}
          </Text>
        )}
        {(children !== undefined || actions !== undefined) && (
          <div className="page-header-meta">
            {children}
            {actions !== undefined && (
              <div className="page-header-actions">{actions}</div>
            )}
          </div>
        )}
      </Stack>
    </header>
  );
}
