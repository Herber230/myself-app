import { describe, expect, it } from 'vitest';

import { buildTree } from './tree.js';

describe('a tree of paths', () => {
  it('nests each row under its parent, adding a folder only leading to others', () => {
    const tree = buildTree([
      { path: 'packages/ts/', note: 'Agnostic.' },
      { path: 'packages/ts/core/', note: 'Entities.' },
      { path: 'README.md', note: 'Start here.' },
    ]);
    expect(tree.map(node => node.name)).toEqual(['packages/', 'README.md']);
    const [packages] = tree;
    expect(packages?.note).toBeUndefined();
    expect(packages?.children[0]).toMatchObject({
      name: 'ts/',
      note: 'Agnostic.',
    });
    expect(packages?.children[0]?.children[0]).toMatchObject({
      name: 'core/',
      path: 'packages/ts/core/',
    });
  });

  it('notes a folder written after a child already made it', () => {
    const [docs] = buildTree([
      { path: 'docs/adr/', note: 'Decisions.' },
      { path: 'docs/', note: 'Documents.' },
    ]);
    expect(docs?.note).toBe('Documents.');
    expect(docs?.children).toHaveLength(1);
  });
});
