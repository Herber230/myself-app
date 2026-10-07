import {
  Card,
  Center,
  Cluster,
  linkClassName,
  Stack,
  Text,
} from '@entifix/react-controls/primitives';
import type { Post } from '@myself-app/domain';
import type { TechnologyDetail } from '@myself-app/domain/use-cases';
import { ExternalLink } from '@myself-app/entifix-incubator-react-controls';
import Link from 'next/link';

import { siteT } from '../../i18n/server.js';
import { PageHeader } from '../../molecules/page-header/page-header.js';
import { postPath } from '../../molecules/post-card/post-cards.js';
import { formatPeriod, inLocale } from '../../organisms/cv-sheet/cv-format.js';
import { SiteNav } from '../../organisms/site-nav/site-nav.js';
import { projectPath } from '../../routing/project-paths.js';
import { radarEntryPath } from '../../routing/radar-paths.js';
import type { SiteLocale } from '../../routing/site-locales.js';

export interface TechnologyPageData {
  readonly locale: SiteLocale;
  readonly detail: TechnologyDetail;
  /** The posts about it, newest first. */
  readonly posts: readonly Post[];
}

/**
 * A technology's page (#42, ADR 0014): what it is, where it sits, how it moved
 * and where I used it. Rendered at build, like the radar it links back to.
 */
export function TechnologyPageView({
  locale,
  detail,
  posts,
}: TechnologyPageData) {
  const t = siteT(locale);
  const { technology, quadrant, ring, areas, history, employments } = detail;
  // Only a featured project is on the landing page, with a page of its own (#77).
  const projects = detail.projects.filter(project => project.featured);
  const id = String(technology.id);
  return (
    <>
      <SiteNav locale={locale} path={`/tech-radar/${id}`} />
      <Center as="main" gutters className="py-2xl">
        <Card>
          <Stack gap="l">
            <PageHeader
              back={{
                href: radarEntryPath(locale, id),
                label: t('radar.detail.back'),
              }}
              title={inLocale(technology.name, locale)}
              lead={inLocale(technology.description, locale)}
            />
            <dl className="m-0 grid grid-cols-[max-content_1fr] gap-x-m gap-y-2xs">
              <Text as="dt" weight="semibold">
                {t('radar.detail.quadrant')}
              </Text>
              <Text as="dd" className="m-0">
                {inLocale(quadrant.name, locale)}
              </Text>
              <Text as="dt" weight="semibold">
                {t('radar.detail.ring')}
              </Text>
              <Text as="dd" className="m-0">
                {t('radar.detail.ringMeaning', {
                  ring: inLocale(ring.name, locale),
                  meaning: inLocale(ring.description, locale),
                })}
              </Text>
              {areas.length > 0 && (
                <>
                  <Text as="dt" weight="semibold">
                    {t('radar.detail.areas')}
                  </Text>
                  <Text as="dd" className="m-0">
                    {areas.map(area => inLocale(area.name, locale)).join(', ')}
                  </Text>
                </>
              )}
            </dl>
            {(technology.site || technology.repositoryUrl) && (
              <Cluster gap="m">
                {technology.site && (
                  <ExternalLink href={technology.site} className="landing-chip">
                    {t('radar.detail.site')}
                  </ExternalLink>
                )}
                {technology.repositoryUrl && (
                  <ExternalLink
                    href={technology.repositoryUrl}
                    className="landing-chip"
                  >
                    {t('radar.detail.repository')}
                  </ExternalLink>
                )}
              </Cluster>
            )}
            <Stack gap="s">
              <Text as="h2" step={2} weight="semibold">
                {t('radar.detail.history')}
              </Text>
              <ol className="m-0 list-none p-0">
                {history.map(stretch => (
                  <li
                    key={stretch.start.toISOString()}
                    className="flex flex-wrap gap-x-xs"
                  >
                    <Text as="span" weight="semibold">
                      {inLocale(stretch.ring.name, locale)}
                    </Text>
                    <Text as="span" muted>
                      {formatPeriod(
                        stretch.start,
                        stretch.end,
                        locale,
                        t('cvSheet.present'),
                      )}
                    </Text>
                  </li>
                ))}
              </ol>
            </Stack>
            <Stack gap="s">
              <Text as="h2" step={2} weight="semibold">
                {t('radar.detail.projects')}
              </Text>
              {employments.length === 0 && projects.length === 0 ? (
                <Text muted>{t('radar.detail.noProjects')}</Text>
              ) : (
                <ul className="m-0 list-none p-0">
                  {employments.map(({ period, employer }) => (
                    <li
                      key={String(period.id)}
                      className="flex flex-wrap gap-x-xs"
                    >
                      <Text as="span" weight="semibold">
                        {t('radar.detail.employment', {
                          role: inLocale(period.role, locale),
                          employer: employer.name,
                        })}
                      </Text>
                      <Text as="span" muted>
                        {formatPeriod(
                          period.start as Date,
                          period.end,
                          locale,
                          t('cvSheet.present'),
                        )}
                      </Text>
                    </li>
                  ))}
                  {projects.map(project => (
                    <li
                      key={String(project.id)}
                      className="flex flex-wrap gap-x-xs"
                    >
                      <Link
                        href={projectPath(locale, String(project.id))}
                        className={linkClassName}
                      >
                        {project.name}
                      </Link>
                      <Text as="span" muted>
                        {t('radar.detail.project')}
                      </Text>
                    </li>
                  ))}
                </ul>
              )}
            </Stack>
            {posts.length > 0 && (
              <Stack gap="s">
                <Text as="h2" step={2} weight="semibold">
                  {t('radar.detail.posts')}
                </Text>
                <ul className="m-0 list-none p-0">
                  {posts.map(post => (
                    <li key={String(post.id)}>
                      <Link
                        href={postPath(locale, String(post.id))}
                        className={linkClassName}
                      >
                        {inLocale(post.title, locale)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </Stack>
            )}
          </Stack>
        </Card>
      </Center>
    </>
  );
}
