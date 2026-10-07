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
 * app's composition root does, and attaches each to its post. So are a
 * project's overview (`projects/<id>.<locale>.md`) and a decision record's body
 * (`adrs/<id>.md`, English only), copied from `docs/adr` by
 * `tools/sync-adrs.mjs` (#77).
 */
import adrs from './adrs.json';
import architectureNodes from './architecture-nodes.json';
import architectureRuntimes from './architecture-runtimes.json';
import architectureScenarios from './architecture-scenarios.json';
import certificates from './certificates.json';
import contactChannels from './contact-channels.json';
import cvFocuses from './cv-focuses.json';
import cvVariants from './cv-variants.json';
import education from './education.json';
import employers from './employers.json';
import employmentHighlights from './employment-highlights.json';
import employmentPeriods from './employment-periods.json';
import interestMedia from './interest-media.json';
import interests from './interests.json';
import layerPackages from './layer-packages.json';
import packageLayers from './package-layers.json';
import pipelineJobs from './pipeline-jobs.json';
import pipelineScenarios from './pipeline-scenarios.json';
import pipelineStages from './pipeline-stages.json';
import pipelineSteps from './pipeline-steps.json';
import posts from './posts.json';
import profile from './profile.json';
import projectPaths from './project-paths.json';
import projectPatterns from './project-patterns.json';
import projects from './projects.json';
import quadrants from './quadrants.json';
import radarEditions from './radar-editions.json';
import refusedImports from './refused-imports.json';
import rings from './rings.json';
import scenarioSteps from './scenario-steps.json';
import tags from './tags.json';
import technologies from './technologies.json';
import technologyAreas from './technology-areas.json';
import technologyUsePeriods from './technology-use-periods.json';

/** Every record, by the file it came from — which is also the path in an error. */
export const CONTENT: Readonly<Record<string, readonly unknown[]>> = {
  'adrs.json': adrs,
  'architecture-nodes.json': architectureNodes,
  'architecture-runtimes.json': architectureRuntimes,
  'architecture-scenarios.json': architectureScenarios,
  'certificates.json': certificates,
  'contact-channels.json': contactChannels,
  'cv-focuses.json': cvFocuses,
  'cv-variants.json': cvVariants,
  'education.json': education,
  'employers.json': employers,
  'employment-highlights.json': employmentHighlights,
  'employment-periods.json': employmentPeriods,
  'interest-media.json': interestMedia,
  'interests.json': interests,
  'layer-packages.json': layerPackages,
  'package-layers.json': packageLayers,
  'pipeline-jobs.json': pipelineJobs,
  'pipeline-scenarios.json': pipelineScenarios,
  'pipeline-stages.json': pipelineStages,
  'pipeline-steps.json': pipelineSteps,
  'posts.json': posts,
  'profile.json': profile,
  'project-paths.json': projectPaths,
  'project-patterns.json': projectPatterns,
  'projects.json': projects,
  'quadrants.json': quadrants,
  'radar-editions.json': radarEditions,
  'refused-imports.json': refusedImports,
  'rings.json': rings,
  'scenario-steps.json': scenarioSteps,
  'tags.json': tags,
  'technologies.json': technologies,
  'technology-areas.json': technologyAreas,
  'technology-use-periods.json': technologyUsePeriods,
};
