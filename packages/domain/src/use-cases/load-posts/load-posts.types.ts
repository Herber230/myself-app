import type { SiteLocale } from '../../locales.js';
import type { LocalizedText } from '../../localized-text.js';

export interface BlogReadOptions {
  /**
   * Whether drafts are read (ADR 0017). The app decides: `next dev` shows
   * them, the export never does. Off unless asked.
   */
  readonly includeDrafts?: boolean;
}

/**
 * A post as its preview shows it: no body, links resolved to names.
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
  readonly tags: readonly {
    readonly id: string;
    readonly label: LocalizedText;
  }[];
  readonly technologies: readonly {
    readonly id: string;
    readonly name: LocalizedText;
  }[];
}
