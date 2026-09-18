/**
 * What each CV variant shows (#35): the technologies and employments it
 * selects, in the order the variant lists them, and one page per variant and
 * locale.
 */
import {
  CvVariant,
  EmploymentPeriod,
  type SiteLocale,
  Technology,
} from '@myself-app/domain';

import { loadEvery } from './queries';
import type { SiteRepositories } from './site-content';

/** Every variant, by its order. The first is the one `/[locale]/cv/` shows. */
export function loadCvVariants(
  repositories: SiteRepositories,
): Promise<CvVariant[]> {
  return loadEvery(repositories, CvVariant, {
    sorting: [{ 0: { property: 'order', type: 'asc' } }],
  });
}

/** `/[locale]/cv/[variant]`'s static params: every variant in every locale. */
export async function cvVariantParams(
  repositories: SiteRepositories,
  locales: readonly SiteLocale[],
): Promise<{ locale: SiteLocale; variant: string }[]> {
  const variants = await loadCvVariants(repositories);
  return locales.flatMap(locale =>
    variants.map(variant => ({ locale, variant: String(variant.id) })),
  );
}

export interface CvSelection {
  readonly variant: CvVariant;
  /** In the order the variant lists them. */
  readonly technologies: readonly Technology[];
  /** In the order the variant lists them. */
  readonly employments: readonly EmploymentPeriod[];
}

export async function loadCvSelection(
  repositories: SiteRepositories,
  variantId: string,
): Promise<CvSelection | undefined> {
  const [variants, technologies, employments] = await Promise.all([
    loadCvVariants(repositories),
    loadEvery(repositories, Technology),
    loadEvery(repositories, EmploymentPeriod),
  ]);
  const variant = variants.find(each => each.id === variantId);
  if (variant === undefined) return undefined;

  // Validation has checked every link, so each id below names a record.
  const technologyById = new Map(technologies.map(each => [each.id, each]));
  const employmentById = new Map(employments.map(each => [each.id, each]));
  return {
    variant,
    technologies: variant.technologies.ids.map(
      id => technologyById.get(id) as Technology,
    ),
    employments: variant.employments.ids.map(
      id => employmentById.get(id) as EmploymentPeriod,
    ),
  };
}
