import {
  button,
  Center,
  Cluster,
  Stack,
  Text,
} from '@entifix/react-controls/primitives';
import { localize, type LocalizedText } from '@myself-app/domain';
import { decisionNumber, type ProjectPage } from '@myself-app/domain/use-cases';
import { ExternalLink } from '@myself-app/entifix-incubator-react-controls';
import { targetsOf } from '@myself-app/entifix-incubator-static-adapter';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { GitHubMark } from '../../atoms/icons/icons.js';
import { NavIcon } from '../../atoms/nav-icon/nav-icon.js';
import { ProjectGlyph } from '../../atoms/project-glyph/project-glyph.js';
import { siteT } from '../../i18n/server.js';
import { FileTree } from '../../molecules/file-tree/file-tree.js';
import { PageHeader } from '../../molecules/page-header/page-header.js';
import { PatternList } from '../../molecules/pattern-list/pattern-list.js';
import { ArchitectureExplorer } from '../../organisms/architecture-explorer/architecture-explorer.js';
import {
  architectureCopyOf,
  architectureViewOf,
} from '../../organisms/architecture-explorer/architecture-rows.js';
import { DecisionExplorer } from '../../organisms/decision-explorer/decision-explorer.js';
import {
  decisionExplorerCopyOf,
  decisionOptionsOf,
  decisionRowsOf,
} from '../../organisms/decision-explorer/decision-rows.js';
import { DecisionLifecycle } from '../../organisms/decision-lifecycle/decision-lifecycle.js';
import {
  layersCopyOf,
  layersViewOf,
} from '../../organisms/package-layers/layer-rows.js';
import { PackageLayers } from '../../organisms/package-layers/package-layers.js';
import { PipelineExplorer } from '../../organisms/pipeline-explorer/pipeline-explorer.js';
import {
  pipelineCopyOf,
  pipelineViewOf,
} from '../../organisms/pipeline-explorer/pipeline-rows.js';
import { releaseCopyOf } from '../../organisms/release-decision/release-copy.js';
import { ReleaseDecision } from '../../organisms/release-decision/release-decision.js';
import type { ReleaseDecisionPolicy } from '../../organisms/release-decision/release-rules.js';
import { SiteNav } from '../../organisms/site-nav/site-nav.js';
import { sectionPath } from '../../routing/landing-sections.js';
import { DECISIONS_ANCHOR } from '../../routing/project-paths.js';
import { technologyPath } from '../../routing/radar-paths.js';
import type { SiteLocale } from '../../routing/site-locales.js';
import { OutlineLayout } from '../outline-layout/outline-layout.js';

export interface ProjectPageData {
  readonly locale: SiteLocale;
  readonly page: ProjectPage;
  /** Its overview, rendered from Markdown (`renderMarkdownBody`). */
  readonly overview: ReactNode;
  /**
   * Its repository's release policy, for the release decision: given only
   * for the project whose repository the build runs in (ADR 0023).
   */
  readonly release?: ReleaseDecisionPolicy;
}

/** A section of the page: its anchor and its heading. */
interface Section {
  readonly id: string;
  readonly heading: string;
}

/** A section of the page: its heading, and what it holds. */
function Part({ id, heading, children }: Section & { children: ReactNode }) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className="project-page-part"
    >
      <Stack gap="m">
        <Text as="h2" id={`${id}-heading`} step={2} weight="semibold">
          {heading}
        </Text>
        {children}
      </Stack>
    </section>
  );
}

/**
 * A project's page (#77): what it is and what it is built with; first, how
 * it is built — its decisions as a lifecycle, collapsed until opened; then
 * its overview, the patterns it is built on (each linked to the records that
 * decided it), its file structure (each path linked into the repository),
 * and all its records in an explorer — the records in English, the page
 * around them in the reader's language (ADR 0020). A project with no records
 * here has neither the lifecycle nor the explorer, nor their outline entry.
 */
export function ProjectPageView({
  locale,
  page,
  overview,
  release,
}: ProjectPageData) {
  const t = siteT(locale);
  const {
    project,
    technologies,
    patterns,
    paths,
    decisions,
    architecture,
    pipeline,
  } = page;
  const id = String(project.id);
  const options = decisionOptionsOf(decisions, t);
  const recorded = decisions.length > 0;
  const parts = [
    { id: 'overview', heading: t('projectPage.overview') },
    { id: 'patterns', heading: t('projectPage.patterns') },
    { id: 'architecture', heading: t('projectPage.architecture') },
    { id: 'structure', heading: t('projectPage.structure') },
    { id: 'delivery', heading: t('projectPage.delivery') },
    { id: DECISIONS_ANCHOR, heading: t('projectPage.decisions') },
  ];
  const [
    overviewPart,
    patternsPart,
    architecturePart,
    structurePart,
    deliveryPart,
    decisionsPart,
  ] = parts as [Section, Section, Section, Section, Section, Section];
  const baseUrl = project.repositoryUrl
    ? `${project.repositoryUrl}/tree/main/`
    : undefined;
  const shown = parts.filter(
    part =>
      (part.id !== 'architecture' || architecture !== undefined) &&
      (part.id !== 'delivery' || pipeline !== undefined) &&
      (part.id !== DECISIONS_ANCHOR || recorded),
  );
  return (
    <>
      <SiteNav locale={locale} path={`/projects/${id}`} />
      <Center as="main" gutters className="project-page py-2xl">
        <Stack gap="2xl">
          <PageHeader
            className="project-page-header"
            back={{
              href: sectionPath(locale, 'projects'),
              label: t('projectPage.back'),
            }}
            glyph={<ProjectGlyph project={id} />}
            title={project.name}
            // Validation requires a summary in every locale.
            lead={localize(project.summary as LocalizedText, locale)}
            actions={
              project.url || project.repositoryUrl ? (
                <>
                  {project.url && (
                    <ExternalLink
                      href={project.url}
                      className={`${button({ variant: 'secondary', size: 'md' })} project-action`}
                    >
                      <NavIcon name="globe" className="project-action-icon" />
                      {t('projectPage.site')}
                    </ExternalLink>
                  )}
                  {project.repositoryUrl && (
                    <ExternalLink
                      href={project.repositoryUrl}
                      className={`${button({ variant: 'primary', size: 'md' })} project-action project-action-source`}
                    >
                      <GitHubMark className="project-action-icon" />
                      {t('projectPage.repository')}
                    </ExternalLink>
                  )}
                </>
              ) : undefined
            }
          >
            <Cluster
              as="ul"
              gap="xs"
              className="landing-list"
              aria-label={t('projectPage.technologies', {
                project: project.name,
              })}
            >
              {technologies.map(technology => (
                <li key={String(technology.id)}>
                  <Link
                    href={technologyPath(locale, String(technology.id))}
                    className="landing-chip"
                  >
                    {/* Validation requires a name in every locale. */}
                    {localize(technology.name as LocalizedText, locale)}
                  </Link>
                </li>
              ))}
            </Cluster>
          </PageHeader>
          <OutlineLayout
            entries={shown.map(part => ({
              id: part.id,
              text: part.heading,
              depth: 2,
            }))}
            label={t('outline')}
          >
            <Stack gap="2xl">
              {recorded && (
                <DecisionLifecycle locale={locale} decisions={decisions} />
              )}
              <Part {...overviewPart}>{overview}</Part>
              <Part {...patternsPart}>
                <PatternList
                  anchor={DECISIONS_ANCHOR}
                  patterns={patterns.map(pattern => ({
                    id: String(pattern.id),
                    // Validation requires both in every locale.
                    name: localize(pattern.name as LocalizedText, locale),
                    summary: localize(pattern.summary as LocalizedText, locale),
                    decisions: targetsOf(pattern.decisions).map(decision => ({
                      number: decisionNumber(decision),
                      label: t('projectPage.decisionLink', {
                        number: decisionNumber(decision),
                      }),
                    })),
                  }))}
                />
              </Part>
              {architecture && (
                <Part {...architecturePart}>
                  <ArchitectureExplorer
                    view={architectureViewOf(architecture, locale, t)}
                    copy={architectureCopyOf(t)}
                    baseUrl={baseUrl}
                  />
                </Part>
              )}
              <Part {...structurePart}>
                {page.layers ? (
                  <PackageLayers
                    view={layersViewOf(page.layers, paths, locale)}
                    copy={layersCopyOf(t)}
                    baseUrl={baseUrl}
                  />
                ) : (
                  <FileTree
                    label={t('projectPage.structure')}
                    baseUrl={baseUrl}
                    rows={paths.map(row => ({
                      path: row.path,
                      note: localize(row.note as LocalizedText, locale),
                    }))}
                  />
                )}
              </Part>
              {pipeline && (
                <Part {...deliveryPart}>
                  <PipelineExplorer
                    view={pipelineViewOf(pipeline, {
                      locale,
                      projectId: id,
                      repositoryUrl: project.repositoryUrl,
                      t,
                    })}
                    copy={pipelineCopyOf(t)}
                  />
                  {release && (
                    <ReleaseDecision policy={release} copy={releaseCopyOf(t)} />
                  )}
                </Part>
              )}
              {recorded && (
                <Part {...decisionsPart}>
                  <p className="adr-archive-lead">
                    {t('projectPage.archive', { project: project.name })}
                  </p>
                  <p className="adr-language-note">
                    {t('projectPage.englishOnly')} {t('projectPage.synced')}
                  </p>
                  <DecisionExplorer
                    decisions={decisionRowsOf(decisions, locale, t)}
                    statuses={options.statuses}
                    areas={options.areas}
                    copy={decisionExplorerCopyOf(t)}
                  />
                </Part>
              )}
            </Stack>
          </OutlineLayout>
        </Stack>
      </Center>
    </>
  );
}
