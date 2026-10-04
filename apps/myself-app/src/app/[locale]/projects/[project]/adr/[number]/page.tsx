import { join } from 'node:path';

import {
  loadArchitectureDecision,
  loadDecisionRoutes,
} from '@myself-app/domain/use-cases';
import { siteT } from '@myself-app/implementation-ui/i18n';
import { outlineOf } from '@myself-app/implementation-ui/markdown';
import { renderMarkdownBody } from '@myself-app/implementation-ui/organisms';
import {
  isSiteLocale,
  localeAlternates,
} from '@myself-app/implementation-ui/routing';
import { DecisionPageView } from '@myself-app/implementation-ui/templates';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { SITE_CONTENT } from '../../../../../../composition';
import { loadSitePaths } from '../../../../../../content/site-paths';

type Params = PageProps<'/[locale]/projects/[project]/adr/[number]'>['params'];

/** One page per decision record, and no other (#77). */
export const dynamicParams = false;

export function generateStaticParams() {
  return loadDecisionRoutes(SITE_CONTENT);
}

async function pageOf(params: Params) {
  const { locale, project, number } = await params;
  if (!isSiteLocale(locale)) notFound();
  const page = await loadArchitectureDecision(SITE_CONTENT, {
    project,
    number,
  });
  if (page === undefined) notFound();
  return { locale, page, path: `/projects/${project}/adr/${number}` };
}

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/projects/[project]/adr/[number]'>): Promise<Metadata> {
  const { locale, page, path } = await pageOf(params);
  const t = siteT(locale);
  const { decision, project } = page;
  return {
    title: `${decision.title} — ${project.name} — ${t('siteName')}`,
    ...(decision.readWhen && { description: decision.readWhen }),
    alternates: localeAlternates(locale, path),
  };
}

/** A decision record's page (#77): its body, rendered from Markdown at build. */
export default async function DecisionPage({
  params,
}: PageProps<'/[locale]/projects/[project]/adr/[number]'>) {
  const { locale, page } = await pageOf(params);
  const id = String(page.decision.id);
  const source = `adrs/${id}.md`;
  // The build requires every record's body.
  const markdown = page.decision.body as string;
  const [body, outline] = await Promise.all([
    renderMarkdownBody({
      source,
      id,
      markdown,
      locale,
      sitePaths: await loadSitePaths(SITE_CONTENT),
      publicDirectory: join(process.cwd(), 'public'),
    }),
    outlineOf(markdown, source),
  ]);
  return (
    <DecisionPageView
      locale={locale}
      page={page}
      body={body}
      outline={outline}
    />
  );
}
