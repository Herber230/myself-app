import {
  EntityLinkResolverTag,
  type EntityRepository,
} from '@entifix/business';
import {
  describeEntityColumns,
  deserializeEntityCollection,
  EntifixBuildError,
  type Entity,
  type EntityConstructor,
  type EntityId,
  type EntityLoadRequest,
  type EntityPage,
  extractMetaEntity,
  serializeEntityCollection,
} from '@entifix/core';
import { Context, Effect } from 'effect';

import { makeStaticLinkResolver } from './link-resolver.js';
import { loadThroughUseCase } from './load-through-use-case.js';
import { type LinkMember, resolveLinks } from './resolved-links.js';
import { makeStaticRepository } from './static-repository.js';
import {
  ContentValidationError,
  type EntityRule,
  validateRecords,
  type ValidationProblem,
} from './validation.js';

/**
 * A site's content, defined once (ADR 0018): which entity each file holds, the
 * rules it must pass, and what the browser's copy of it carries. The
 * definition validates every file, builds a repository per entity, and answers
 * reads through entifix's `load` use case.
 *
 * It knows no entity of any site: the sources name them.
 */

/** A request for every record it keeps: paging is the definition's to set. */
export type UnpagedRequest<TEntity extends Entity> = Omit<
  EntityLoadRequest<TEntity>,
  'page' | 'pageSize'
>;

/**
 * A member of an entity by name: any name for a source whose entity is no
 * longer known (`ContentSource` erased by `defineSource`).
 */
export type MemberOf<TEntity extends Entity> = Entity extends TEntity
  ? string
  : keyof TEntity & string;

/**
 * What `/data/<key>.json` carries of an entity, when not every record whole:
 * the records a request keeps, and the members left out (entifix#40).
 */
export interface PublishedView<TEntity extends Entity> {
  readonly request?: UnpagedRequest<TEntity>;
  readonly omit?: readonly MemberOf<TEntity>[];
}

/**
 * The text of one localized member of one record, kept in a file beside the
 * records rather than in them (a post's Markdown body), or `undefined` when
 * that locale has no file.
 */
export type ReadSidecar = (id: string, locale: string) => string | undefined;

/** One entity, the file it is read from, and what else holds of it. */
export interface ContentSource<TEntity extends Entity = Entity> {
  readonly entity: EntityConstructor<TEntity>;
  readonly file: string;
  readonly rules?: readonly EntityRule[];
  readonly published?: PublishedView<TEntity>;
  /**
   * Members read from files beside the records, attached per locale before
   * validation, so a missing locale fails with its path.
   */
  readonly sidecars?: Readonly<Partial<Record<MemberOf<TEntity>, ReadSidecar>>>;
}

/**
 * A source, typed for its own entity and then kept beside every other.
 *
 * A request over `Post` names `Post`'s members, which a list of sources for
 * any entity cannot check; this is the one place that forgets which entity a
 * source was written for, after checking it.
 */
export function defineSource<TEntity extends Entity>(
  source: ContentSource<TEntity>,
): ContentSource {
  return source as unknown as ContentSource;
}

export interface StaticContentOptions {
  /** Every locale a localized member must carry. */
  readonly locales: readonly string[];
  /** Which `type: 'string'` members of an entity hold a text per locale. */
  readonly localizedMembersOf?: (
    entity: EntityConstructor<Entity>,
  ) => readonly string[];
}

/** The content, validated and served. */
export interface StaticContent {
  readonly sources: readonly ContentSource[];
  /** The records as validated: the files, with every sidecar attached. */
  readonly records: Readonly<Record<string, readonly unknown[]>>;
  /** The repository an entity is served from; throws for one with no source. */
  repositoryOf(entity: EntityConstructor<Entity>): EntityRepository;
  /** One page of records, as the use case returns it. */
  load<TEntity extends Entity>(
    entity: EntityConstructor<TEntity>,
    request?: EntityLoadRequest<TEntity>,
  ): Promise<EntityPage<TEntity>>;
  /**
   * Every record a request keeps, filtered and sorted as asked, with the
   * links named in `resolve` read as the records they point at.
   */
  loadAll<TEntity extends Entity>(
    entity: EntityConstructor<TEntity>,
    request?: UnpagedRequest<TEntity>,
    options?: LoadAllOptions<TEntity>,
  ): Promise<TEntity[]>;
  /**
   * Resolves links of records already loaded — the second step from a
   * record, as a CV's employments to their employers.
   */
  resolve<TEntity extends Entity>(
    records: readonly TEntity[],
    members: readonly LinkMember<TEntity>[],
  ): Promise<TEntity[]>;
  /**
   * The ids of every record a request keeps, as text: what a page's static
   * params and a sitemap are made of.
   */
  ids<TEntity extends Entity>(
    entity: EntityConstructor<TEntity>,
    request?: UnpagedRequest<TEntity>,
  ): Promise<string[]>;
  /** Every file the browser may read, one per source, by `dataFileOf`. */
  readonly dataFiles: readonly string[];
  /**
   * The records one data file carries, serialized as entifix writes them —
   * links as ids, dates as ISO strings — through its source's published view.
   */
  dataFile(name: string): Promise<unknown[]>;
}

export interface LoadAllOptions<TEntity extends Entity> {
  /** The link members to resolve on every record loaded. */
  readonly resolve?: readonly LinkMember<TEntity>[];
}

/** The data file an entity is written to, from its metadata key. */
export function dataFileOf(entity: EntityConstructor<Entity>): string {
  const meta = extractMetaEntity(entity);
  return `${meta.key ?? meta.name}.json`;
}

/** Thrown when the sources themselves are wrong, whatever the content. */
export class ContentDefinitionError extends EntifixBuildError {}

/** The ids a file declares, so a link into it can be checked. */
function idsOf(records: readonly unknown[] = []): ReadonlySet<EntityId> {
  return new Set(
    records.flatMap(record =>
      record !== null && typeof record === 'object' && 'id' in record
        ? [record.id as EntityId]
        : [],
    ),
  );
}

/**
 * Each link member of an entity, and the source of the entity it points at,
 * read from the entity itself: a link knows its target's class.
 */
function linkedSources(
  source: ContentSource,
  sources: readonly ContentSource[],
): Record<string, ContentSource> {
  const instance = new source.entity() as unknown as Record<string, unknown>;
  return Object.fromEntries(
    describeEntityColumns(source.entity)
      .filter(
        column => column.type === 'link' || column.type === 'linkCollection',
      )
      .map(column => {
        const { entityConstructor } = instance[column.name] as {
          entityConstructor: EntityConstructor<Entity>;
        };
        const target = sources.find(each => each.entity === entityConstructor);
        if (target === undefined) {
          throw new ContentDefinitionError(
            `${source.entity.name}.${column.name} links to ${entityConstructor.name}, which no source declares`,
          );
        }
        return [column.name, target];
      }),
  );
}

/**
 * The content with every source's sidecars attached: per record, an object of
 * the locales whose file exists, or nothing when none does. A record with no
 * id is left for validation to report.
 */
function withSidecars(
  content: Readonly<Record<string, readonly unknown[]>>,
  sources: readonly ContentSource[],
  locales: readonly string[],
): Readonly<Record<string, readonly unknown[]>> {
  const attached: Record<string, readonly unknown[]> = { ...content };
  for (const { file, sidecars = {} } of sources) {
    const members = Object.entries(sidecars) as [string, ReadSidecar][];
    if (members.length === 0) continue;
    attached[file] = (content[file] ?? []).map(record => {
      if (record === null || typeof record !== 'object') return record;
      const { id } = record as { id?: unknown };
      if (typeof id !== 'string' && typeof id !== 'number') return record;
      const texts = members.flatMap(([member, read]) => {
        const text = Object.fromEntries(
          locales.flatMap(locale => {
            const found = read(String(id), locale);
            return found === undefined ? [] : [[locale, found]];
          }),
        );
        return Object.keys(text).length === 0 ? [] : [[member, text]];
      });
      return { ...record, ...Object.fromEntries(texts) };
    });
  }
  return attached;
}

/**
 * Validates every file, then builds a repository over each.
 *
 * Every problem in every file is collected before anything throws, so one
 * build reports all of what is wrong with the content, not the first thing.
 */
export function defineStaticContent(
  files: Readonly<Record<string, readonly unknown[]>>,
  sources: readonly ContentSource[],
  { locales, localizedMembersOf = () => [] }: StaticContentOptions,
): StaticContent {
  const content = withSidecars(files, sources, locales);
  const problems: ValidationProblem[] = [];
  const validated = sources.map(source => {
    const result = validateRecords(source.entity, content[source.file] ?? [], {
      source: source.file,
      locales,
      localizedMembers: localizedMembersOf(source.entity),
      linkTargets: Object.fromEntries(
        Object.entries(linkedSources(source, sources)).map(
          ([member, target]) => [member, idsOf(content[target.file])],
        ),
      ),
      rules: source.rules,
    });
    problems.push(...result.problems);
    return { source, records: result.records };
  });

  if (problems.length > 0) throw new ContentValidationError(problems);

  const repositories = new Map(
    validated.map(({ source, records }) => {
      const instances = Effect.runSync(
        deserializeEntityCollection(source.entity, records),
      ) as Entity[];
      return [
        source.entity,
        makeStaticRepository(source.entity, instances),
      ] as const;
    }),
  );

  const repositoryOf = (entity: EntityConstructor<Entity>) => {
    const repository = repositories.get(entity);
    if (repository === undefined) {
      throw new ContentDefinitionError(
        `No source is defined for ${entity.name}`,
      );
    }
    return repository;
  };

  const load = <TEntity extends Entity>(
    entity: EntityConstructor<TEntity>,
    request: EntityLoadRequest<TEntity> = {},
  ): Promise<EntityPage<TEntity>> => {
    try {
      return loadThroughUseCase(
        repositoryOf(entity as EntityConstructor<Entity>),
        request,
      );
    } catch (error) {
      return Promise.reject(error);
    }
  };

  // entifix's own link resolver, over the same repositories.
  const resolver = Context.get(
    makeStaticLinkResolver([...repositories]),
    EntityLinkResolverTag,
  );
  const resolve = <TEntity extends Entity>(
    records: readonly TEntity[],
    members: readonly LinkMember<TEntity>[],
  ) => resolveLinks(records, members, resolver);

  const loadAll = async <TEntity extends Entity>(
    entity: EntityConstructor<TEntity>,
    request: UnpagedRequest<TEntity> = {},
    { resolve: members = [] }: LoadAllOptions<TEntity> = {},
  ): Promise<TEntity[]> => {
    // A site's files hold a few dozen records each, so one page as large as
    // can be counted is all of them.
    const page = await load(entity, {
      ...request,
      page: 1,
      pageSize: Number.MAX_SAFE_INTEGER,
    });
    return resolve(page.items, members);
  };

  return {
    sources,
    records: content,
    repositoryOf,
    load,
    loadAll,
    resolve,
    async ids(entity, request) {
      const records = await loadAll(entity, request);
      return records.map(record => String(record.id));
    },
    dataFiles: sources.map(source => dataFileOf(source.entity)),
    async dataFile(name) {
      const source = sources.find(each => dataFileOf(each.entity) === name);
      if (source === undefined) {
        throw new RangeError(`No entity is written to /data/${name}`);
      }
      const records = await loadAll(source.entity, source.published?.request);
      const omitted: readonly string[] = source.published?.omit ?? [];
      return serializeEntityCollection(source.entity, records).map(record =>
        Object.fromEntries(
          Object.entries(record).filter(
            ([member]) => !omitted.includes(member),
          ),
        ),
      );
    },
  };
}
