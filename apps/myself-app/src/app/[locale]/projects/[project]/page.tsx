import { join } from 'node:path';

import type { LocalizedText } from '@myself-app/domain';
import { loadProjectIds, loadProjectPage } from '@myself-app/domain/use-cases';
import { siteT } from '@myself-app/implementation-ui/i18n';
import {
  inLocale,
  renderMarkdownBody,
} from '@myself-app/implementation-ui/organisms';
import {
  isSiteLocale,
  localeAlternates,
} from '@myself-app/implementation-ui/routing';
import { ProjectPageView } from '@myself-app/implementation-ui/templates';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { SITE_CONTENT } from '../../../../composition';
import { readReleasePolicy } from '../../../../content/release-policy';
import { loadSitePaths } from '../../../../content/site-paths';
import { BrowserSources } from '../../../../providers/browser-sources';

/** One page per featured project, and no other (#77). */
export const dynamicParams = false;

export async function generateStaticParams() {
  const projects = await loadProjectIds(SITE_CONTENT);
  return projects.map(project => ({ project }));
}

async function pageOf(
  params: PageProps<'/[locale]/projects/[project]'>['params'],
) {
  const { locale, project } = await params;
  if (!isSiteLocale(locale)) notFound();
  const page = await loadProjectPage(SITE_CONTENT, project);
  if (page === undefined) notFound();
  return { locale, page, id: project };
}

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/projects/[project]'>): Promise<Metadata> {
  const { locale, page, id } = await pageOf(params);
  const t = siteT(locale);
  return {
    title: `${page.project.name} — ${t('siteName')}`,
    description: inLocale(page.project.summary, locale),
    alternates: localeAlternates(locale, `/projects/${id}`),
  };
}

/**
 * A project's page (#77): the template, with its overview rendered from
 * Markdown at build, and the browser's sources for its decision explorer —
 * mounted here, never in a layout (ADR 0016).
 */
export default async function ProjectPage({
  params,
}: PageProps<'/[locale]/projects/[project]'>) {
  const { locale, page, id } = await pageOf(params);
  const overview = await renderMarkdownBody({
    source: `projects/${id}.${locale}.md`,
    id,
    // The build requires an overview in every locale.
    markdown: inLocale(page.project.overview as LocalizedText, locale),
    locale,
    sitePaths: await loadSitePaths(SITE_CONTENT),
    // The build runs from the app's folder, whose `public/` the export serves.
    publicDirectory: join(process.cwd(), 'public'),
  });
  // The release decision is this repository's, so only the project whose
  // repository it is gets one (ADR 0023).
  const policy = page.pipeline ? readReleasePolicy() : undefined;
  const release =
    policy?.repositoryUrl === page.project.repositoryUrl ? policy : undefined;
  return (
    <BrowserSources>
      <ProjectPageView
        locale={locale}
        page={page}
        overview={overview}
        release={release}
      />
    </BrowserSources>
  );
}
