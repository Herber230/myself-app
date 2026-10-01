import { describe, expect, it } from 'vitest';

import { fixtureContent } from '../content.fixture.js';
import { loadBeyondCode, loadBeyondCodeTeaser } from './load-beyond-code.uc.js';

describe('the "Beyond the code" page', () => {
  it('lists the interests in their order, not their position in the file', async () => {
    const sections = await loadBeyondCode(fixtureContent());
    expect(sections.map(each => each.interest.id)).toEqual([
      'reading',
      'chess',
    ]);
  });

  it('gives each interest its own media, in their order', async () => {
    const [reading, chess] = await loadBeyondCode(fixtureContent());
    expect(reading?.media.map(each => each.id)).toEqual(['library', 'shelf']);
    expect(chess?.media.map(each => each.id)).toEqual(['board']);
  });

  it('resolves the posts each interest lists, in its order', async () => {
    const [reading, chess] = await loadBeyondCode(fixtureContent());
    expect(reading?.posts.map(each => each.id)).toEqual([
      'on-typescript',
      'on-testing',
    ]);
    expect(chess?.posts).toEqual([]);
  });

  it('carries each body, read from its sidecar', async () => {
    const [reading] = await loadBeyondCode(fixtureContent());
    expect(reading?.interest.body).toEqual({
      en: 'About reading, in en.',
      es: 'About reading, in es.',
    });
  });
});

describe('the landing page teaser', () => {
  it('has every interest, and only the featured media, in order', async () => {
    const teaser = await loadBeyondCodeTeaser(fixtureContent());
    expect(teaser.interests.map(each => each.id)).toEqual(['reading', 'chess']);
    expect(teaser.media.map(each => each.id)).toEqual(['library', 'shelf']);
  });
});
