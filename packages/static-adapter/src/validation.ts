import {
  COLLECTION_TYPES,
  describeEntityColumns,
  EntifixBuildError,
  type Entity,
  type EntityConstructor,
  type EntityFieldDescriptor,
  type EntityId,
} from '@entifix/core';

/**
 * Content checked before it is served, because nothing else checks it.
 *
 * entifix's mapping assigns every non-relation value raw: it converts no date,
 * enforces no `required`, validates no enum value and resolves no link id
 * (ADR 0002). A record that is wrong therefore reaches a visitor as `undefined`
 * in the middle of a page, or as a string where the page expects a `Date`.
 * These rules run during `next build` instead, and a failure stops it.
 *
 * Every problem is collected rather than the first thrown, so one build says
 * everything that is wrong with the content, and each carries the path to the
 * value: `employment.json › acme › responsibilities is missing "es"`.
 */

export interface ValidationProblem {
  /** `<source> › <id> › <member>`, as far as each is known. */
  readonly path: string;
  readonly message: string;
}

/** Thrown when content is served that did not pass. Carries every problem. */
export class ContentValidationError extends EntifixBuildError {
  readonly problems: readonly ValidationProblem[];

  constructor(problems: readonly ValidationProblem[]) {
    super(
      `Static content is invalid:\n${problems
        .map(problem => `  ${problem.path} ${problem.message}`)
        .join('\n')}`,
      undefined,
      { count: problems.length },
    );
    this.problems = problems;
  }
}

/** Reports a problem against one member, or against the record itself. */
export type ReportProblem = (
  member: string | undefined,
  message: string,
) => void;

/**
 * A check one entity needs and the metadata cannot express — at most one
 * `ContactChannel` per type, a period whose `end` is not before its `start`.
 *
 * Registered by the caller, never by the adapter: the adapter knows no entity
 * of this site, and a rule that named one would end that.
 */
export type EntityRule = (
  records: ReadonlyArray<Readonly<Record<string, unknown>>>,
  report: (index: number, member: string | undefined, message: string) => void,
) => void;

export interface ValidateOptions {
  /** The file the records came from, for the path in a message. */
  readonly source: string;
  /** Every locale a localized member must carry. The adapter holds none itself. */
  readonly locales: readonly string[];
  /** Which `type: 'string'` members hold a `{ en, es }` object (entifix#36). */
  readonly localizedMembers?: readonly string[];
  /** The ids that exist for each `link` or `linkCollection` member. */
  readonly linkTargets?: Readonly<Record<string, ReadonlySet<EntityId>>>;
  readonly rules?: readonly EntityRule[];
}

export interface ValidationResult {
  readonly problems: readonly ValidationProblem[];
  /**
   * The records with their dates parsed, ready for entifix's mapping. Empty of
   * meaning when `problems` is not empty.
   */
  readonly records: ReadonlyArray<Record<string, unknown>>;
}

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

const isAbsent = (value: unknown): boolean =>
  value === undefined || value === null || value === '';

/** A localized member: an object with a non-empty string under every locale. */
function checkLocalized(
  value: unknown,
  locales: readonly string[],
  report: ReportProblem,
  member: string,
): void {
  if (!isPlainObject(value)) {
    report(member, 'is not a localized object');
    return;
  }
  for (const locale of locales) {
    const text = value[locale];
    if (text === undefined) {
      report(member, `is missing "${locale}"`);
    } else if (typeof text !== 'string') {
      report(member, `holds a ${typeof text} for "${locale}", not text`);
    } else if (text.trim() === '') {
      report(member, `is empty for "${locale}"`);
    }
  }
}

/** A date member: parsed here, because entifix's mapping leaves it a string. */
function checkDate(
  value: unknown,
  report: ReportProblem,
  member: string,
): Date | undefined {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      report(member, 'is an invalid date');
      return undefined;
    }
    return value;
  }
  if (typeof value !== 'string' && typeof value !== 'number') {
    report(member, `holds a ${typeof value}, not a date`);
    return undefined;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    report(member, `is not a date: ${JSON.stringify(value)}`);
    return undefined;
  }
  return parsed;
}

/** A link member: an id, and one that exists. */
function checkLink(
  value: unknown,
  column: EntityFieldDescriptor,
  known: ReadonlySet<EntityId> | undefined,
  report: ReportProblem,
): void {
  const ids = COLLECTION_TYPES.includes(column.type) ? value : [value];
  if (!Array.isArray(ids)) {
    report(column.name, 'is not a list of ids');
    return;
  }
  for (const id of ids) {
    if (isPlainObject(id)) continue; // An embedded record carries its own.
    if (typeof id !== 'string' && typeof id !== 'number') {
      report(column.name, `holds a ${typeof id} where an id was expected`);
      continue;
    }
    if (known !== undefined && !known.has(id)) {
      report(
        column.name,
        `points at ${JSON.stringify(id)}, which does not exist`,
      );
    }
  }
}

/** A scalar member: the type the metadata declares. */
function checkScalar(
  value: unknown,
  column: EntityFieldDescriptor,
  report: ReportProblem,
): void {
  switch (column.type) {
    case 'number':
      if (typeof value !== 'number' || Number.isNaN(value)) {
        report(column.name, `holds ${JSON.stringify(value)}, not a number`);
      }
      return;
    case 'boolean':
      if (typeof value !== 'boolean') {
        report(column.name, `holds ${JSON.stringify(value)}, not a boolean`);
      }
      return;
    case 'enum':
      if (!column.enumValues?.includes(value as string)) {
        report(
          column.name,
          `holds ${JSON.stringify(value)}, which is not one of ${JSON.stringify(
            column.enumValues ?? [],
          )}`,
        );
      }
      return;
    default:
      // `string` and `id`, the two that carry text.
      if (typeof value !== 'string' && typeof value !== 'number') {
        report(column.name, `holds a ${typeof value}, not text`);
      }
  }
}

/**
 * Checks every record of one entity and parses its dates.
 *
 * Nothing here names an entity of this site: what is localized, what ids exist
 * and what else must hold all arrive as arguments.
 */
export function validateRecords<TEntity extends Entity>(
  entityConstructor: EntityConstructor<TEntity>,
  records: readonly unknown[],
  {
    source,
    locales,
    localizedMembers = [],
    linkTargets = {},
    rules = [],
  }: ValidateOptions,
): ValidationResult {
  const problems: ValidationProblem[] = [];
  const columns = describeEntityColumns(entityConstructor);
  const parsed: Record<string, unknown>[] = [];
  const seen = new Set<unknown>();

  records.forEach((raw, index) => {
    const at = (id: unknown, member: string | undefined, message: string) => {
      const where = id === undefined ? `#${index}` : String(id);
      problems.push({
        path: [source, where, member].filter(Boolean).join(' › '),
        message,
      });
    };

    if (!isPlainObject(raw)) {
      at(undefined, undefined, 'is not a record');
      return;
    }

    const id = raw.id;
    const report: ReportProblem = (member, message) => at(id, member, message);

    if (isAbsent(id)) {
      report('id', 'is missing');
    } else if (seen.has(id)) {
      report('id', `is used more than once`);
    } else {
      seen.add(id);
    }

    const record: Record<string, unknown> = { ...raw };

    for (const column of columns) {
      const value = raw[column.key];
      const isRelation =
        column.type === 'link' || COLLECTION_TYPES.includes(column.type);

      if (isAbsent(value)) {
        if (column.required) report(column.name, 'is required, and is missing');
        continue;
      }

      if (localizedMembers.includes(column.name)) {
        checkLocalized(value, locales, report, column.name);
      } else if (isRelation) {
        checkLink(value, column, linkTargets[column.name], report);
      } else if (column.type === 'date') {
        const date = checkDate(value, report, column.name);
        if (date !== undefined) record[column.key] = date;
      } else {
        checkScalar(value, column, report);
      }
    }

    parsed.push(record);
  });

  for (const rule of rules) {
    rule(parsed, (index, member, message) => {
      const id = parsed[index]?.id;
      problems.push({
        path: [source, id === undefined ? `#${index}` : String(id), member]
          .filter(Boolean)
          .join(' › '),
        message,
      });
    });
  }

  return { problems, records: parsed };
}

/** The records, or a `ContentValidationError` naming everything wrong. */
export function validRecordsOrThrow<TEntity extends Entity>(
  entityConstructor: EntityConstructor<TEntity>,
  records: readonly unknown[],
  options: ValidateOptions,
): ReadonlyArray<Record<string, unknown>> {
  const { problems, records: parsed } = validateRecords(
    entityConstructor,
    records,
    options,
  );
  if (problems.length > 0) throw new ContentValidationError(problems);
  return parsed;
}
