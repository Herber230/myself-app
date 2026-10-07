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

  it('links each name into the repository, and lines notes up by depth', () => {
    const { container } = render(
      <FileTree
        label="File structure"
        baseUrl="https://github.com/o/r/tree/main/"
        rows={[
          { path: 'packages/', note: 'The packages.' },
          { path: 'packages/domain/', note: 'Entities.' },
        ]}
      />,
    );
    const link = screen.getByRole('link', { name: /^domain\// });
    expect(link.getAttribute('href')).toBe(
      'https://github.com/o/r/tree/main/packages/domain/',
    );
    expect(link.getAttribute('target')).toBe('_blank');
    expect(
      [...container.querySelectorAll<HTMLElement>('.file-tree-item')].map(
        item => item.style.getPropertyValue('--depth'),
      ),
    ).toEqual(['0', '1']);
  });

  it('leaves names as text without a repository', () => {
    render(
      <FileTree label="Files" rows={[{ path: 'docs/', note: 'Records.' }]} />,
    );
    expect(screen.queryByRole('link')).toBeNull();
    expect(screen.getByText('docs/').tagName).toBe('CODE');
  });
});
