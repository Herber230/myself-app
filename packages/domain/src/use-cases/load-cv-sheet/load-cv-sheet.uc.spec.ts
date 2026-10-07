import { describe, expect, it } from 'vitest';

import { fixtureContent } from '../content.fixture.js';
import { loadCvSheet } from './load-cv-sheet.uc.js';

const ids = (records: readonly { id: unknown }[] = []) =>
  records.map(each => each.id);

describe("a variant's sheet", () => {
  it('lists its technologies and employments in its order, each with the variant’s technologies used there', async () => {
    const sheet = await loadCvSheet(fixtureContent(), 'full-stack');
    expect(sheet?.variant.id).toBe('full-stack');
    expect(ids(sheet?.technologies)).toEqual(['react', 'typescript']);
    expect(sheet?.employments.map(each => each.period.id)).toEqual([
      'globex-architect',
      'acme-engineer',
    ]);
    expect(sheet?.employments.map(each => each.employer.id)).toEqual([
      'globex',
      'acme',
    ]);
    expect(sheet?.employments.map(each => ids(each.technologies))).toEqual([
      ['typescript'],
      // jest was used there, but the variant does not list it.
      ['typescript'],
    ]);
  });

  it('carries the profile, its channels, education and certificates, by order', async () => {
    const sheet = await loadCvSheet(fixtureContent(), 'backend');
    expect(sheet?.profile.id).toBe('ada');
    expect(ids(sheet?.channels)).toEqual(['github', 'email']);
    expect(ids(sheet?.education)).toEqual(['bachelors', 'masters']);
    expect(ids(sheet?.certificates)).toEqual(['cloud', 'scrum']);
  });

  it('shows the highlights sharing one of its focuses, by their order', async () => {
    const highlightsOf = async (variant: string) =>
      (await loadCvSheet(fixtureContent(), variant))?.employments.map(each =>
        ids(each.highlights),
      );
    expect(await highlightsOf('backend')).toEqual([['migration']]);
    // Full-stack takes every focus, so every highlight.
    expect(await highlightsOf('full-stack')).toEqual([
      ['platform'],
      ['redesign', 'migration'],
    ]);
  });

  it('is nothing for an id that names no variant', async () => {
    expect(await loadCvSheet(fixtureContent(), 'astronaut')).toBeUndefined();
  });
});
