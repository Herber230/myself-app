import {
  Card,
  Cluster,
  Grid,
  linkClassName,
  Stack,
  Text,
} from '@entifix/react-controls/primitives';
import {
  localize,
  type LocalizedText,
  type Project,
  type Technology,
} from '@myself-app/domain';
import Link from 'next/link';

import { siteT } from '../../i18n/server';
import type { SiteLocale } from '../../site-locales';
import { radarEntryPath } from '../tech-radar/radar-paths';
import { ExternalLink } from './external-link';
import { LandingSection } from './landing-section';

/**
 * The featured projects (#30), in their order: what each is, where it lives,
 * and what it is built with. Each technology links to its entry on the radar.
 */
export function ProjectsSection({
  locale,
  projects,
  technologies,
}: {
  locale: SiteLocale;
  projects: readonly Project[];
  /** Every technology, by id, to name a project's links. */
  technologies: ReadonlyMap<string, Technology>;
}) {
  const t = siteT(locale);
  return (
    <LandingSection id="projects" locale={locale}>
      <Grid as="ul" min="18rem" gap="l" className="landing-list">
        {projects.map(project => (
          <li key={String(project.id)}>
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
                  {project.technologies.ids.map(String).map(id => (
                    <li key={id}>
                      <Link
                        href={radarEntryPath(locale, id)}
                        className="landing-chip"
                      >
                        {/* Validation has checked every link to a technology. */}
                        {localize(
                          technologies.get(id)?.name as LocalizedText,
                          locale,
                        )}
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
