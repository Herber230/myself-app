import { browserSources } from '@myself-app/implementation-adapters/browser';
import { useSources } from '@myself-app/implementation-ui/sources';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { BrowserSources } from './browser-sources';

function Probe() {
  return <p>{useSources() === browserSources ? 'adapters' : 'other'}</p>;
}

describe('the browser sources', () => {
  it('hand the UI the adapters’ sources', () => {
    render(
      <BrowserSources>
        <Probe />
      </BrowserSources>,
    );
    expect(screen.getByText('adapters')).toBeTruthy();
  });
});
