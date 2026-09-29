import {
  Card,
  Center,
  Cluster,
  Lead,
  linkClassName,
  Stack,
  Text,
} from '@entifix/react-controls/primitives';
import { Technology } from '@myself-app/domain';
import { loadPostsForTechnology } from '@myself-app/domain/use-cases';
import { loadTechnologyDetail } from '@myself-app/domain/use-cases';
import { ExternalLink } from '@myself-app/entifix-incubator-react-controls';
import { siteT } from '@myself-app/implementation-ui/i18n';
import { postPath } from '@myself-app/implementation-ui/molecules';
import {
  formatPeriod,
  inLocale,
} from '@myself-app/implementation-ui/organisms';
import { projectAnchor } from '@myself-app/implementation-ui/organisms';
import { SiteNav } from '@myself-app/implementation-ui/organisms';
import { radarEntryPath } from '@myself-app/implementation-ui/routing';
import {
  isSiteLocale,
  localeAlternates,
  localePath,
} from '@myself-app/implementation-ui/routing';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { SITE_CONTENT } from '../../../../composition';
import { BLOG_READS } from '../../../../content/blog-reads';

/** One page per technology, and no other (#42, ADR 0014). */
export const dynamicParams = false;

export async function generateStaticParams() {
  const technologies = await SITE_CONTENT.ids(Technology);
  return technologies.map(technology => ({ technology }));
}

async function detailOf(
  params: PageProps<'/[locale]/tech-radar/[technology]'>['params'],
) {
  const { locale, technology } = await params;
  if (!isSiteLocale(locale)) notFound();
  const detail = await loadTechnologyDetail(SITE_CONTENT, technology);
  if (detail === undefined) notFound();
  return { locale, detail };
}

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/tech-radar/[technology]'>): Promise<Metadata> {
  const { locale, detail } = await detailOf(params);
  const t = siteT(locale);
  const name = inLocale(detail.technology.name, locale);
  return {
    title: `${name} — ${t('techRadar')} — ${t('siteName')}`,
    description: inLocale(detail.technology.description, locale),
    alternates: localeAlternates(
      locale,
      `/tech-radar/${String(detail.technology.id)}`,
    ),
  };
}

/**
 * A technology's page: what it is, where it sits, how it moved and where I
 * used it. Rendered at build, like the radar it links back to.
 */
export default async function TechnologyPage({
  params,
}: PageProps<'/[locale]/tech-radar/[technology]'>) {
  const { locale, detail } = await detailOf(params);
  const t = siteT(locale);
  const { technology, quadrant, ring, areas, history } = detail;
  // The landing page shows only the featured ones, and each links to its card.
  const projects = detail.projects.filter(project => project.featured);
  const id = String(technology.id);
  const posts = await loadPostsForTechnology(SITE_CONTENT, id, BLOG_READS);
  return (
    <>
      <SiteNav locale={locale} path={`/tech-radar/${id}`} />
      <Center as="main" gutters className="py-2xl">
        <Card>
          <Stack gap="l">
            <Link href={radarEntryPath(locale, id)} className={linkClassName}>
              {t('radar.detail.back')}
            </Link>
            <Stack gap="s">
              <Text as="h1" step={3} weight="semibold">
                {inLocale(technology.name, locale)}
              </Text>
              <Lead muted>{inLocale(technology.description, locale)}</Lead>
            </Stack>
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
              {projects.length === 0 ? (
                <Text muted>{t('radar.detail.noProjects')}</Text>
              ) : (
                <ul className="m-0 list-none p-0">
                  {projects.map(project => (
                    <li key={String(project.id)}>
                      <Link
                        href={`${localePath(locale, '/')}#${projectAnchor(String(project.id))}`}
                        className={linkClassName}
                      >
                        {project.name}
                      </Link>
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
