import type { EntityId } from '@entifix/core';
import {
  type StaticContent,
  targetOf,
  targetsOf,
} from '@myself-app/entifix-incubator-static-adapter';

import { Certificate } from '../../entities/certificate.entity.js';
import { CvVariant } from '../../entities/cv-variant.entity.js';
import { Education } from '../../entities/education.entity.js';
import { EmploymentHighlight } from '../../entities/employment-highlight.entity.js';
import { loadContactChannels } from '../load-contact-channels/index.js';
import { loadProfile } from '../load-profile/index.js';
import type { CvSheet } from './load-cv-sheet.types.js';

/**
 * What one CV sheet shows (ADR 0012): the variant's technologies and
 * employments in the order it lists them, and inside each employment the
 * technologies used there and the highlights that share one of the variant's
 * focuses. Nothing for an id that names no variant.
 */
export async function loadCvSheet(
  content: StaticContent,
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

  // An employment's employer and technologies are a second step from the
  // variant.
  const periods = await content.resolve(targetsOf(variant.employments), [
    'employer',
    'technologies',
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
      technologies: targetsOf(period.technologies),
      highlights: shown(period.id),
    })),
    education,
    certificates,
  };
}
