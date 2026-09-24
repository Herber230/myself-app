/**
 * What each CV sheet shows (ADR 0012): the variant's technologies and
 * employments in the order it lists them, and inside each employment the
 * highlights that share one of the variant's focuses.
 */
import type { EntityId } from '@entifix/core';
import {
  Certificate,
  type ContactChannel,
  CvVariant,
  Education,
  Employer,
  EmploymentHighlight,
  EmploymentPeriod,
  type Profile,
  type SiteLocale,
  Technology,
} from '@myself-app/domain';

import { loadContactChannels } from './contact';
import { loadProfile } from './profile';
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

/** The id of the variant `/[locale]/cv/` shows. */
export async function defaultCvVariantId(
  repositories: SiteRepositories,
): Promise<EntityId> {
  // `cv-variants.json` has at least the default: the page has nothing to show
  // without it, and `cv.spec.ts` holds the content to it.
  const [first] = await loadCvVariants(repositories);
  return (first as CvVariant).id;
}

/**
 * `/[locale]/cv/[variant]/`'s static params: every variant but the default,
 * which lives at `/[locale]/cv/` only, so no two URLs show the same sheet.
 */
export async function cvVariantParams(
  repositories: SiteRepositories,
  locales: readonly SiteLocale[],
): Promise<{ locale: SiteLocale; variant: string }[]> {
  const [, ...others] = await loadCvVariants(repositories);
  return locales.flatMap(locale =>
    others.map(variant => ({ locale, variant: String(variant.id) })),
  );
}

export interface CvEmployment {
  readonly period: EmploymentPeriod;
  readonly employer: Employer;
  /** The ones sharing a focus with the variant, by their order. */
  readonly highlights: readonly EmploymentHighlight[];
}

export interface CvSheet {
  readonly profile: Profile;
  readonly channels: readonly ContactChannel[];
  readonly variant: CvVariant;
  /** In the order the variant lists them. */
  readonly technologies: readonly Technology[];
  /** In the order the variant lists them. */
  readonly employments: readonly CvEmployment[];
  readonly education: readonly Education[];
  readonly certificates: readonly Certificate[];
}

/** Everything one variant's sheet shows, or nothing for an unknown variant. */
export async function loadCvSheet(
  repositories: SiteRepositories,
  variantId: string,
): Promise<CvSheet | undefined> {
  const [
    variants,
    profile,
    channels,
    technologies,
    periods,
    employers,
    highlights,
    education,
    certificates,
  ] = await Promise.all([
    loadCvVariants(repositories),
    loadProfile(repositories),
    loadContactChannels(repositories),
    loadEvery(repositories, Technology),
    loadEvery(repositories, EmploymentPeriod),
    loadEvery(repositories, Employer),
    loadEvery(repositories, EmploymentHighlight, {
      sorting: [{ 0: { property: 'order', type: 'asc' } }],
    }),
    loadEvery(repositories, Education, {
      sorting: [{ 0: { property: 'order', type: 'asc' } }],
    }),
    loadEvery(repositories, Certificate, {
      sorting: [{ 0: { property: 'order', type: 'asc' } }],
    }),
  ]);
  const variant = variants.find(each => each.id === variantId);
  if (variant === undefined) return undefined;

  // Validation has checked every link, so each id below names a record.
  const technologyById = byId(technologies);
  const periodById = byId(periods);
  const employerById = byId(employers);
  const focuses = new Set(variant.focuses.ids);
  const shown = (period: EntityId) =>
    highlights.filter(
      each =>
        each.period.id === period &&
        each.focuses.ids.some(focus => focuses.has(focus)),
    );

  return {
    profile,
    channels,
    variant,
    technologies: variant.technologies.ids.map(
      id => technologyById.get(id) as Technology,
    ),
    employments: variant.employments.ids.map(id => {
      const period = periodById.get(id) as EmploymentPeriod;
      return {
        period,
        employer: employerById.get(period.employer.id) as Employer,
        highlights: shown(id),
      };
    }),
    education,
    certificates,
  };
}

function byId<T extends { id: EntityId }>(
  records: readonly T[],
): ReadonlyMap<EntityId, T> {
  return new Map(records.map(each => [each.id, each]));
}
