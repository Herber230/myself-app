import {
  Card,
  Cluster,
  Grid,
  linkClassName,
  Stack,
  Text,
} from '@entifix/react-controls/primitives';
import { localize, type LocalizedText, type Project } from '@myself-app/domain';
import { targetsOf } from '@myself-app/static-adapter';
import Link from 'next/link';

import { siteT } from '../../i18n/server';
import type { SiteLocale } from '../../site-locales';
import { radarEntryPath } from '../tech-radar/radar-paths';
import { ExternalLink } from './external-link';
import { LandingSection } from './landing-section';

/** A project card's `id`, linked to from a technology's page (#42). */
export function projectAnchor(projectId: string): string {
  return `project-${projectId}`;
}

/**
 * The featured projects (#30), in their order: what each is, where it lives,
 * and what it is built with. Each technology links to its entry on the radar.
 */
export function ProjectsSection({
  locale,
  projects,
}: {
  locale: SiteLocale;
  /** With their technologies resolved (`loadFeaturedProjects`). */
  projects: readonly Project[];
}) {
  const t = siteT(locale);
  return (
    <LandingSection id="projects" locale={locale}>
      <Grid as="ul" min="18rem" gap="l" className="landing-list">
        {projects.map(project => (
          <li
            key={String(project.id)}
            id={projectAnchor(String(project.id))}
            className="landing-project"
          >
            <Card className="h-full">
              <Stack gap="m">
                <Text as="h3" step={2} weight="semibold">
                  {project.name}
                </Text>
                {/* Validation requires a summary in every locale. */}
                <Text>
                  {localize(project.summary as LocalizedText, locale)}
                </Text>
                <Cluster
                  as="ul"
                  gap="xs"
                  className="landing-list"
                  aria-label={t('landing.projects.technologies', {
                    project: project.name,
                  })}
                >
                  {targetsOf(project.technologies).map(technology => (
                    <li key={String(technology.id)}>
                      <Link
                        href={radarEntryPath(locale, String(technology.id))}
                        className="landing-chip"
                      >
                        {/* Validation requires a name in every locale. */}
                        {localize(technology.name as LocalizedText, locale)}
                      </Link>
                    </li>
                  ))}
                </Cluster>
                <Cluster gap="m">
                  {project.url && (
                    <ExternalLink href={project.url} className={linkClassName}>
                      {t('landing.projects.site')}
                    </ExternalLink>
                  )}
                  {project.repositoryUrl && (
                    <ExternalLink
                      href={project.repositoryUrl}
                      className={linkClassName}
                    >
                      {t('landing.projects.repository')}
                    </ExternalLink>
                  )}
                </Cluster>
              </Stack>
            </Card>
          </li>
        ))}
      </Grid>
    </LandingSection>
  );
}
