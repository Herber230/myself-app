'use client';

/**
 * Where the browser reads the entities a page filters (ADR 0016, #75). The UI
 * declares what it needs; the app mounts it with the adapters' sources — only
 * on the pages that filter, so no other page ships entifix-browser and Effect.
 */
import type { EntitySource } from '@myself-app/entifix-incubator-browser';
import { createContext, type ReactNode, useContext } from 'react';

export interface BrowserSources {
  /** Every published post, without its body (ADR 0017). */
  readonly posts: EntitySource;
  readonly technologies: EntitySource;
  /** Every project's decision records, without their bodies (#77). */
  readonly decisions: EntitySource;
}

const SourcesContext = createContext<BrowserSources | undefined>(undefined);

export function SourcesProvider({
  sources,
  children,
}: {
  sources: BrowserSources;
  children: ReactNode;
}) {
  return <SourcesContext value={sources}>{children}</SourcesContext>;
}

/** The sources the page was mounted with; a filter outside one is a bug. */
export function useSources(): BrowserSources {
  const sources = useContext(SourcesContext);
  if (sources === undefined) {
    throw new Error('A filter was rendered outside a SourcesProvider.');
  }
  return sources;
}
