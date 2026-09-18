/**
 * The JSON the browser reads (ADR 0003, path C): one file per entity, written
 * into the export by a `force-static` route handler as `/data/<key>.json`.
 *
 * Produced from the same repositories the pages render from, through the same
 * `load` use case, so the files and the pages cannot disagree. A record goes
 * out as entifix serializes it — links as ids, dates as ISO strings — which is
 * what the browser's own mapping expects back.
 */
import {
  type Entity,
  type EntityConstructor,
  extractMetaEntity,
  serializeEntityCollection,
} from '@entifix/core';

import { loadEvery } from './queries';
import { CONTENT_SOURCES, type SiteRepositories } from './site-content';

/** The file an entity is written to, from its own metadata key. */
export function dataFileOf(entity: EntityConstructor<Entity>): string {
  const meta = extractMetaEntity(entity);
  return `${meta.key ?? meta.name}.json`;
}

/** Every file the export carries, by name. */
export const DATA_FILES: readonly string[] = CONTENT_SOURCES.map(source =>
  dataFileOf(source.entity),
);

/** The records of the entity a file is named for, serialized. */
export async function dataFileContent(
  repositories: SiteRepositories,
  file: string,
): Promise<unknown[]> {
  const source = CONTENT_SOURCES.find(each => dataFileOf(each.entity) === file);
  if (source === undefined) {
    throw new RangeError(`No entity is written to /data/${file}`);
  }
  const records = await loadEvery(repositories, source.entity);
  return serializeEntityCollection(source.entity, records);
}
