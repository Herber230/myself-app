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
  type Employer,
  EmploymentHighlight,
  type EmploymentPeriod,
  type Profile,
  type Technology,
} from '@myself-app/domain';
import {
  targetOf,
  targetsOf,
  type UnpagedRequest,
} from '@myself-app/entifix-incubator-static-adapter';

import { loadContactChannels } from './contact';
import { loadProfile } from './profile';
import type { SiteContent } from './site-content';

/** Variants by their order: the first is the one `/[locale]/cv/` shows. */
const BY_ORDER: UnpagedRequest<CvVariant> = {
  sorting: [{ 0: { property: 'order', type: 'asc' } }],
};

/** Every variant, by its order. The first is the one `/[locale]/cv/` shows. */
export function loadCvVariants(content: SiteContent): Promise<CvVariant[]> {
  return content.loadAll(CvVariant, BY_ORDER);
}

/** The id of the variant `/[locale]/cv/` shows. */
export async function defaultCvVariantId(
  content: SiteContent,
): Promise<EntityId> {
  // `cv-variants.json` has at least the default: the page has nothing to show
  // without it, and `cv.spec.ts` holds the content to it.
  const [first] = await loadCvVariants(content);
  return (first as CvVariant).id;
}

/**
 * `/[locale]/cv/[variant]/`'s static params: every variant but the default,
 * which lives at `/[locale]/cv/` only, so no two URLs show the same sheet.
 * The same in every locale.
 */
export async function cvVariantParams(
  content: SiteContent,
): Promise<{ variant: string }[]> {
  const [, ...others] = await content.ids(CvVariant, BY_ORDER);
  return others.map(variant => ({ variant }));
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
  content: SiteContent,
  variantId: string,
): Promise<CvSheet | undefined> {
  const [[variant], profile, channels, highlights, education, certificates] =
    await Promise.all([
      content.loadAll(
        CvVariant,
        { filtering: [{ property: 'id', operator: 'eq', value: variantId }] },
        { resolve: ['technologies', 'employments'] },
      ),
      loadProfile(content),
      loadContactChannels(content),
      content.loadAll(EmploymentHighlight, {
        sorting: [{ 0: { property: 'order', type: 'asc' } }],
      }),
      content.loadAll(Education, {
        sorting: [{ 0: { property: 'order', type: 'asc' } }],
      }),
      content.loadAll(Certificate, {
        sorting: [{ 0: { property: 'order', type: 'asc' } }],
      }),
    ]);
  if (variant === undefined) return undefined;

  // An employment's employer is a second step from the variant.
  const periods = await content.resolve(targetsOf(variant.employments), [
    'employer',
  ]);
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
    technologies: targetsOf(variant.technologies),
    employments: periods.map(period => ({
      period,
      employer: targetOf(period.employer),
      highlights: shown(period.id),
    })),
    education,
    certificates,
  };
}
