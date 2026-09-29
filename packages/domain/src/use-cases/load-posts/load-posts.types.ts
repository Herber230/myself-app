import type { SiteLocale } from '../../locales.js';
import type { LocalizedText } from '../../localized-text.js';

export interface BlogReadOptions {
  /**
   * Whether drafts are read (ADR 0017). The app decides: `next dev` shows
   * them, the export never does. Off unless asked.
   */
  readonly includeDrafts?: boolean;
}

export interface PreviewOptions {
  /**
   * The prose a Markdown body opens with, as plain text. Markdown is the UI's
   * to read, so the caller hands the reader in.
   */
  readonly excerptOf: (markdown: string) => string;
}

/**
 * A post as its preview shows it: no body but its opening, links resolved to
 * names.
 */
export interface PostPreview {
  readonly id: string;
  readonly title: LocalizedText;
  readonly summary: LocalizedText;
  /** ISO 8601, as the page formats it. */
  readonly publishedAt: string;
  readonly updatedAt?: string;
  readonly draft: boolean;
  /** Minutes to read, per locale, from the body's words. */
  readonly readingMinutes: Readonly<Record<SiteLocale, number>>;
  /** The prose the body opens with, per locale, as plain text. */
  readonly excerpt: Readonly<Record<SiteLocale, string>>;
  readonly tags: readonly {
    readonly id: string;
    readonly label: LocalizedText;
  }[];
  readonly technologies: readonly {
    readonly id: string;
    readonly name: LocalizedText;
  }[];
}
