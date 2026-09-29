'use client';

/**
 * The browser's sources for the pages that filter (ADR 0016, #75): the UI's
 * `SourcesProvider`, handed the adapters' `browserSources`. A client module of
 * its own, because a server page cannot pass functions to one.
 *
 * ⚠️ Mounted around the radar's and the blog's explorers only, never in the
 * layout: it brings entifix-browser and Effect with it (+76 KB gzipped), and
 * `budget.spec.ts` holds the landing page and the CV to shipping none.
 */
import { browserSources } from '@myself-app/implementation-adapters/browser';
import { SourcesProvider } from '@myself-app/implementation-ui/sources';
import type { ReactNode } from 'react';

export function BrowserSources({ children }: { children: ReactNode }) {
  return <SourcesProvider sources={browserSources}>{children}</SourcesProvider>;
}
