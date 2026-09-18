/**
 * What is true about me, one JSON file per entity (ADR 0004).
 *
 * Plain records, typed as `unknown` on purpose: this package knows no entity
 * and imports nothing, so it cannot say what shape a record has. The app hands
 * each list to the static adapter, which checks it against the entity's own
 * metadata and fails the build on anything wrong (ADR 0002).
 *
 * ⚠️ Much of it is still placeholder, each marked `TODO(#26)` — or `TODO(#33)`
 * and `TODO(#39)` where a spec decides the words. `grep -r 'TODO(#' ` lists
 * every value left to write.
 */
import contactChannels from './contact-channels.json';
import cvVariants from './cv-variants.json';
import employers from './employers.json';
import employmentPeriods from './employment-periods.json';
import profile from './profile.json';
import projects from './projects.json';
import quadrants from './quadrants.json';
import rings from './rings.json';
import technologies from './technologies.json';
import technologyAreas from './technology-areas.json';
import technologyUsePeriods from './technology-use-periods.json';

/** Every record, by the file it came from — which is also the path in an error. */
export const CONTENT: Readonly<Record<string, readonly unknown[]>> = {
  'contact-channels.json': contactChannels,
  'cv-variants.json': cvVariants,
  'employers.json': employers,
  'employment-periods.json': employmentPeriods,
  'profile.json': profile,
  'projects.json': projects,
  'quadrants.json': quadrants,
  'rings.json': rings,
  'technologies.json': technologies,
  'technology-areas.json': technologyAreas,
  'technology-use-periods.json': technologyUsePeriods,
};
