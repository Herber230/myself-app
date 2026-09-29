import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { type BrowserSources, SourcesProvider, useSources } from './sources.js';

const SOURCES: BrowserSources = {
  posts: async () => {
    throw new Error('not read');
  },
  technologies: async () => {
    throw new Error('not read');
  },
};

function Probe() {
  const sources = useSources();
  return <p>{sources === SOURCES ? 'mounted' : 'other'}</p>;
}

describe('the browser sources', () => {
  it('reach a filter inside the provider', () => {
    render(
      <SourcesProvider sources={SOURCES}>
        <Probe />
      </SourcesProvider>,
    );
    expect(screen.getByText('mounted')).toBeTruthy();
  });

  it('are missing outside one, which is a bug worth failing on', () => {
    expect(() => render(<Probe />)).toThrow('outside a SourcesProvider');
  });
});
