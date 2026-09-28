/**
 * What is true about me, one JSON file per entity (ADR 0004).
 *
 * Plain records, typed as `unknown` on purpose: this package knows no entity
 * and imports nothing, so it cannot say what shape a record has. The app hands
 * each list to the static adapter, which checks it against the entity's own
 * metadata and fails the build on anything wrong (ADR 0002).
 *
 * A placeholder is marked `TODO(#<issue>)` and listed in the app's
 * `src/content/pending-content.ts`; the build fails on one it does not list.
 *
 * A post's body is Markdown, one file per locale in `posts/<id>.<locale>.md`
 * (ADR 0017). This package imports nothing, so it does not read them: the
 * app's composition root does, and attaches each to its post.
 */
import certificates from './certificates.json';
import contactChannels from './contact-channels.json';
import cvFocuses from './cv-focuses.json';
import cvVariants from './cv-variants.json';
import education from './education.json';
import employers from './employers.json';
import employmentHighlights from './employment-highlights.json';
import employmentPeriods from './employment-periods.json';
import posts from './posts.json';
import profile from './profile.json';
import projects from './projects.json';
import quadrants from './quadrants.json';
import radarEditions from './radar-editions.json';
import rings from './rings.json';
import tags from './tags.json';
import technologies from './technologies.json';
import technologyAreas from './technology-areas.json';
import technologyUsePeriods from './technology-use-periods.json';

/** Every record, by the file it came from — which is also the path in an error. */
export const CONTENT: Readonly<Record<string, readonly unknown[]>> = {
  'certificates.json': certificates,
  'contact-channels.json': contactChannels,
  'cv-focuses.json': cvFocuses,
  'cv-variants.json': cvVariants,
  'education.json': education,
  'employers.json': employers,
  'employment-highlights.json': employmentHighlights,
  'employment-periods.json': employmentPeriods,
  'posts.json': posts,
  'profile.json': profile,
  'projects.json': projects,
  'quadrants.json': quadrants,
  'radar-editions.json': radarEditions,
  'rings.json': rings,
  'tags.json': tags,
  'technologies.json': technologies,
  'technology-areas.json': technologyAreas,
  'technology-use-periods.json': technologyUsePeriods,
};
