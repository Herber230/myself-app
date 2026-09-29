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
