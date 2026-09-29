import type { EntityId } from '@entifix/core';
import type {
  StaticContent,
  UnpagedRequest,
} from '@myself-app/entifix-incubator-static-adapter';

import { CvVariant } from '../../entities/cv-variant.entity.js';

/** Variants by their order: the first is the one `/[locale]/cv/` shows. */
const BY_ORDER: UnpagedRequest<CvVariant> = {
  sorting: [{ 0: { property: 'order', type: 'asc' } }],
};

/** Every variant, by its order. The first is the one `/[locale]/cv/` shows. */
export function loadCvVariants(content: StaticContent): Promise<CvVariant[]> {
  return content.loadAll(CvVariant, BY_ORDER);
}

/** The id of the variant `/[locale]/cv/` shows. */
export async function defaultCvVariantId(
  content: StaticContent,
): Promise<EntityId> {
  // `cv-variants.json` has at least the default: the page has nothing to show
  // without it, and the content's own specs hold it to that.
  const [first] = await loadCvVariants(content);
  return (first as CvVariant).id;
}

/**
 * `/[locale]/cv/[variant]/`'s static params: every variant but the default,
 * which lives at `/[locale]/cv/` only, so no two URLs show the same sheet.
 * The same in every locale.
 */
export async function cvVariantParams(
  content: StaticContent,
): Promise<{ variant: string }[]> {
  const [, ...others] = await content.ids(CvVariant, BY_ORDER);
  return others.map(variant => ({ variant }));
}
