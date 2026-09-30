import type { EntityRule } from '@myself-app/entifix-incubator-static-adapter';

/**
 * The content rules only this site knows (ADR 0018), which neither entity
 * metadata nor the static adapter's factories can express. The domain says
 * what is valid; `implementation/adapters` applies them when content loads.
 */

/** At most one `ContactChannel` per type: the keys the reference app had. */
export const oneChannelPerType: EntityRule = (records, report) => {
  const seen = new Set<unknown>();
  records.forEach((record, index) => {
    if (seen.has(record.type)) {
      report(index, 'type', `is a second ${String(record.type)} channel`);
    }
    seen.add(record.type);
  });
};

/**
 * A CV variant's id is a URL segment beside `ats`, which is the ATS mode's
 * (ADR 0012): a variant named `ats` would be shadowed by it.
 */
export const variantIdNotReserved: EntityRule = (records, report) => {
  records.forEach((record, index) => {
    if (record.id === 'ats') {
      report(index, 'id', 'is "ats", which the CV reserves for its ATS mode');
    }
  });
};

/**
 * A decision's `supersedes` stays inside its project, whose records its id
 * starts with (`myself-app-0016`): a record of one repository cannot replace
 * another's.
 */
export const supersedesWithinProject: EntityRule = (records, report) => {
  records.forEach((record, index) => {
    const prefix = `${String(record.project)}-`;
    const outside = ((record.supersedes ?? []) as unknown[]).filter(
      id => !String(id).startsWith(prefix),
    );
    if (outside.length > 0) {
      report(
        index,
        'supersedes',
        `names ${outside.join(', ')}, outside project ${String(record.project)}`,
      );
    }
  });
};

/**
 * A decision is `superseded` or `superseded-in-part` exactly when another
 * names it in `supersedes`, so the status and the links never disagree.
 */
export const statusMatchesSupersession: EntityRule = (records, report) => {
  const replaced = new Set(
    records.flatMap(record => (record.supersedes ?? []) as unknown[]),
  );
  records.forEach((record, index) => {
    const superseded = String(record.status).startsWith('superseded');
    if (superseded && !replaced.has(record.id)) {
      report(
        index,
        'status',
        `is ${String(record.status)}, but nothing supersedes it`,
      );
    }
    if (!superseded && replaced.has(record.id)) {
      report(
        index,
        'status',
        `is ${String(record.status)}, but a later record supersedes it`,
      );
    }
  });
};
