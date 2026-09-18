/**
 * The JSON written into the export. What this catches is a file that disagrees
 * with the page beside it, and one a browser could not read back into the same
 * records.
 */
import { entity } from '@entifix/core';
import { Technology } from '@myself-app/domain';
import { describe, expect, it } from 'vitest';

import { DATA_FILES, dataFileContent, dataFileOf } from './data-files';
import { loadEvery } from './queries';
import { SITE_REPOSITORIES } from './repositories';
import { buildSiteRepositories, CONTENT_SOURCES } from './site-content';

describe('the data files', () => {
  it('are one per entity, named by its metadata key', () => {
    expect(DATA_FILES).toHaveLength(CONTENT_SOURCES.length);
    expect(DATA_FILES).toContain('technology.json');
    expect(dataFileOf(Technology)).toBe('technology.json');
  });

  it('fall back to the class name for an entity that declares no key', () => {
    // Applied by hand: the app's Vitest runs oxc, which cannot parse decorator
    // syntax, and this is all `@entity()` does with it.
    class Keyless {
      id = 'k';
    }
    const metadata = {};
    entity()(Keyless, {
      kind: 'class',
      name: 'Keyless',
      metadata,
      addInitializer: () => undefined,
    });
    Object.defineProperty(Keyless, Symbol.metadata, { value: metadata });
    expect(dataFileOf(Keyless)).toBe('Keyless.json');
  });

  it('carry every record the pages render, as entifix serializes it', async () => {
    const written = (await dataFileContent(
      SITE_REPOSITORIES,
      'technology.json',
    )) as { id: string; quadrant: string }[];
    const rendered = await loadEvery(SITE_REPOSITORIES, Technology);
    expect(written.map(record => record.id)).toEqual(
      rendered.map(record => record.id),
    );
    // A link travels as the id it names.
    expect(written[0].quadrant).toBe(rendered[0].quadrant.id);
  });

  it('read back into the same records, dates included', async () => {
    const content = Object.fromEntries(
      await Promise.all(
        CONTENT_SOURCES.map(
          async source =>
            [
              source.file,
              await dataFileContent(
                SITE_REPOSITORIES,
                dataFileOf(source.entity),
              ),
            ] as const,
        ),
      ),
    );
    const again = buildSiteRepositories(content);
    const [before, after] = await Promise.all([
      loadEvery(SITE_REPOSITORIES, Technology),
      loadEvery(again, Technology),
    ]);
    expect(after.map(record => record.name)).toEqual(
      before.map(record => record.name),
    );
  });

  it('refuse a file no entity is written to', async () => {
    await expect(
      dataFileContent(SITE_REPOSITORIES, 'nothing.json'),
    ).rejects.toThrow('No entity is written to /data/nothing.json');
  });
});
