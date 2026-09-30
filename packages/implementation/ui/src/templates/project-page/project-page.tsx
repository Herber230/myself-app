import {
  button,
  Center,
  Cluster,
  Lead,
  linkClassName,
  Stack,
  Text,
} from '@entifix/react-controls/primitives';
import { localize, type LocalizedText } from '@myself-app/domain';
import type { ProjectPage } from '@myself-app/domain/use-cases';
import { ExternalLink } from '@myself-app/entifix-incubator-react-controls';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { GitHubMark } from '../../atoms/icons/icons.js';
import { NavIcon } from '../../atoms/nav-icon/nav-icon.js';
import { ProjectGlyph } from '../../atoms/project-glyph/project-glyph.js';
import { siteT } from '../../i18n/server.js';
import { FileTree } from '../../molecules/file-tree/file-tree.js';
import { PatternList } from '../../molecules/pattern-list/pattern-list.js';
import { DecisionExplorer } from '../../organisms/decision-explorer/decision-explorer.js';
import {
  decisionExplorerCopyOf,
  decisionOptionsOf,
  decisionRowsOf,
} from '../../organisms/decision-explorer/decision-rows.js';
import { DecisionPractice } from '../../organisms/decision-practice/decision-practice.js';
import { SiteNav } from '../../organisms/site-nav/site-nav.js';
import { sectionPath } from '../../routing/landing-sections.js';
import { DECISIONS_ANCHOR } from '../../routing/project-paths.js';
import { technologyPath } from '../../routing/radar-paths.js';
import type { SiteLocale } from '../../routing/site-locales.js';

export interface ProjectPageData {
  readonly locale: SiteLocale;
  readonly page: ProjectPage;
  /** Its overview, rendered from Markdown (`renderMarkdownBody`). */
  readonly overview: ReactNode;
}

/** A section of the page: its heading, and what it holds. */
function Part({
  id,
  heading,
  children,
}: {
  id: string;
  heading: string;
  children: ReactNode;
}) {
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
 * A project's page (#77): what it is and what it is built with, its
 * overview, the patterns it is built on, its file structure, and its
 * architecture decisions in an explorer — the records in English, the page
 * around them in the reader's language (ADR 0020).
 */
export function ProjectPageView({ locale, page, overview }: ProjectPageData) {
  const t = siteT(locale);
  const { project, technologies, patterns, paths, decisions } = page;
  const id = String(project.id);
  const options = decisionOptionsOf(decisions, t);
  return (
    <>
      <SiteNav locale={locale} path={`/projects/${id}`} />
      <Center as="main" gutters className="project-page py-2xl">
        <Stack gap="2xl">
          <header className="project-page-header">
            <Stack gap="m">
              <Link
                href={sectionPath(locale, 'projects')}
                className={linkClassName}
              >
                {t('projectPage.back')}
              </Link>
              <div className="project-page-title">
                <ProjectGlyph project={id} />
                <Text as="h1" step={3} weight="semibold">
                  {project.name}
                </Text>
              </div>
              {/* Validation requires a summary in every locale. */}
              <Lead muted>
                {localize(project.summary as LocalizedText, locale)}
              </Lead>
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
            </Stack>
            {(project.url || project.repositoryUrl) && (
              <div className="project-actions">
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
              </div>
            )}
          </header>
          <Part id="overview" heading={t('projectPage.overview')}>
            {overview}
          </Part>
          <Part id="patterns" heading={t('projectPage.patterns')}>
            <PatternList
              patterns={patterns.map(pattern => ({
                id: String(pattern.id),
                // Validation requires both in every locale.
                name: localize(pattern.name as LocalizedText, locale),
                summary: localize(pattern.summary as LocalizedText, locale),
              }))}
            />
          </Part>
          <Part id="structure" heading={t('projectPage.structure')}>
            <FileTree
              label={t('projectPage.structure')}
              rows={paths.map(row => ({
                path: row.path,
                note: localize(row.note as LocalizedText, locale),
              }))}
            />
          </Part>
          <Part id={DECISIONS_ANCHOR} heading={t('projectPage.decisions')}>
            <Lead muted>{t('projectPage.decisionsLead')}</Lead>
            <p className="adr-language-note">{t('projectPage.englishOnly')}</p>
            <DecisionPractice locale={locale} decisions={decisions} />
            <DecisionExplorer
              decisions={decisionRowsOf(decisions, locale, t)}
              statuses={options.statuses}
              areas={options.areas}
              copy={decisionExplorerCopyOf(t)}
            />
          </Part>
        </Stack>
      </Center>
    </>
  );
}
