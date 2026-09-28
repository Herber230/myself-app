/**
 * The JSON written into the export. What this catches is a file that disagrees
 * with the page beside it, and one a browser could not read back into the same
 * records.
 */
import { Technology } from '@myself-app/domain';
import { dataFileOf } from '@myself-app/static-adapter';
import { describe, expect, it } from 'vitest';

import { withPostBodies } from './post-bodies';
import { SITE_CONTENT } from './repositories';
import { buildSiteContent, CONTENT_SOURCES } from './site-content';

describe('the data files', () => {
  it('are one per entity, named by its metadata key', () => {
    expect(SITE_CONTENT.dataFiles).toHaveLength(CONTENT_SOURCES.length);
    expect(SITE_CONTENT.dataFiles).toContain('technology.json');
  });

  it('carry every record the pages render, as entifix serializes it', async () => {
    const written = (await SITE_CONTENT.dataFile('technology.json')) as {
      id: string;
      quadrant: string;
    }[];
    const rendered = await SITE_CONTENT.loadAll(Technology);
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
              await SITE_CONTENT.dataFile(dataFileOf(source.entity)),
            ] as const,
        ),
      ),
    );
    // `post.json` carries no bodies (ADR 0017): they come from their files.
    const again = buildSiteContent(withPostBodies(content));
    const [before, after] = await Promise.all([
      SITE_CONTENT.loadAll(Technology),
      again.loadAll(Technology),
    ]);
    expect(after.map(record => record.name)).toEqual(
      before.map(record => record.name),
    );
  });
});

describe('the posts file', () => {
  it('leaves out every body and every draft', async () => {
    const written = (await SITE_CONTENT.dataFile('post.json')) as Record<
      string,
      unknown
    >[];
    expect(written.length).toBeGreaterThan(0);
    for (const record of written) {
      expect(record).not.toHaveProperty('body');
      expect(record.draft).toBe(false);
    }
    expect(written.map(record => record.id)).not.toContain('effect-four');
  });
});
