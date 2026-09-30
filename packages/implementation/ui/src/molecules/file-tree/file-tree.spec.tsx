import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { FileTree } from './file-tree.js';

describe('a file tree', () => {
  it('lists each path with its note, folders folding open', () => {
    const { container } = render(
      <FileTree
        label="File structure"
        rows={[
          { path: 'packages/', note: 'The packages.' },
          { path: 'packages/domain/', note: 'Entities.' },
        ]}
      />,
    );
    expect(screen.getByRole('list', { name: 'File structure' })).toBeTruthy();
    expect(screen.getByText('packages/')).toBeTruthy();
    expect(screen.getByText('Entities.')).toBeTruthy();
    const folder = container.querySelector('details');
    expect(folder?.open).toBe(true);
    expect(folder?.querySelector('summary')?.textContent).toContain(
      'packages/',
    );
  });
});
