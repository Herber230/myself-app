import type { Entity, EntityConstructor } from '@entifix/core';

import { ContactChannel } from './entities/contact-channel.entity.js';
import { CvVariant } from './entities/cv-variant.entity.js';
import { Employer } from './entities/employer.entity.js';
import { EmploymentPeriod } from './entities/employment-period.entity.js';
import { Profile } from './entities/profile.entity.js';
import { Project } from './entities/project.entity.js';
import { Quadrant } from './entities/quadrant.entity.js';
import { Ring } from './entities/ring.entity.js';
import { Technology } from './entities/technology.entity.js';
import { TechnologyArea } from './entities/technology-area.entity.js';
import { TechnologyUsePeriod } from './entities/technology-use-period.entity.js';

/**
 * Which members of which entity carry a `LocalizedText` rather than a string.
 *
 * ⚠️ A list beside the classes, not an accessor option. `MetaAccessorOptions`
 * is a closed interface in `@entifix/core`, so an extra key on `@accessor` is a
 * type error, and `MetaAccessorTypes` is a closed `as const`, so there is no
 * `'localized'` to declare (entifix#36). Until entifix has a real type, this
 * list is how validation learns which `type: 'string'` members are objects.
 *
 * The adapter reads it as a parameter — it knows no entity of this site — and
 * fails the build on a record whose localized member is missing a locale.
 */
export const LOCALIZED_MEMBERS = new Map<
  EntityConstructor<Entity>,
  readonly string[]
>([
  [Profile, ['title', 'tagline', 'bio', 'pictureAlt']],
  [ContactChannel, []],
  [Employer, ['logoAlt']],
  [EmploymentPeriod, ['role', 'responsibilities']],
  [TechnologyArea, ['name', 'description']],
  [Quadrant, ['name', 'description']],
  [Ring, ['name', 'description']],
  [Technology, ['description']],
  [TechnologyUsePeriod, []],
  [Project, ['summary']],
  [CvVariant, ['title', 'summary']],
]);

/** The localized members of one entity, or none when it has none. */
export function localizedMembersOf(
  entityConstructor: EntityConstructor<Entity>,
): readonly string[] {
  return LOCALIZED_MEMBERS.get(entityConstructor) ?? [];
}
