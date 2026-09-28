import {
  Card,
  Center,
  Lead,
  linkClassName,
  Stack,
  Text,
} from '@entifix/react-controls/primitives';
import { localize, type LocalizedText } from '@myself-app/domain';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { postCardOf } from '../../../components/blog/post-cards';
import { PostExplorer } from '../../../components/blog/post-explorer';
import { SiteNav } from '../../../components/site-nav';
import { loadPostPreviews } from '../../../content/blog';
import { SITE_REPOSITORIES } from '../../../content/repositories';
import { siteT } from '../../../i18n/server';
import { isSiteLocale, localeAlternates } from '../../../site-locales';

const PATH = '/blog';

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/blog'>): Promise<Metadata> {
  const { locale } = await params;
  if (!isSiteLocale(locale)) notFound();
  const t = siteT(locale);
  return {
    title: `${t('blog')} — ${t('siteName')}`,
    description: t('blogLead'),
    alternates: {
      ...localeAlternates(locale, PATH),
      types: { 'application/rss+xml': `/${locale}/blog/rss.xml` },
    },
  };
}

/** Names, in the reader's language, sorted as they would look them up. */
function namesOf(
  records: readonly { id: string; text: LocalizedText }[],
  locale: 'en' | 'es',
) {
  const unique = new Map(records.map(each => [each.id, each.text]));
  return [...unique]
    .map(([id, text]) => ({ id, name: localize(text, locale) }))
    .sort((a, b) => a.name.localeCompare(b.name, locale));
}

/**
 * The blog's home (ADR 0017): every post, newest first, and a filter by tag,
 * technology, year and title that runs in the browser (ADR 0016).
 */
export default async function BlogPage({
  params,
}: PageProps<'/[locale]/blog'>) {
  const { locale } = await params;
  if (!isSiteLocale(locale)) notFound();
  const t = siteT(locale);
  const previews = await loadPostPreviews(SITE_REPOSITORIES);
  const years = [
    ...new Set(previews.map(each => each.publishedAt.slice(0, 4))),
  ];
  return (
    <>
      <SiteNav locale={locale} path={PATH} />
      <Center as="main" gutters className="py-2xl">
        <Card>
          <Stack gap="l">
            <Stack gap="s">
              <Text as="h1" step={3} weight="semibold">
                {t('blog')}
              </Text>
              <Lead muted>{t('blogLead')}</Lead>
              <a
                href={`/${locale}/blog/rss.xml`}
                className={`${linkClassName} self-start`}
              >
                {t('blogPage.feed')}
              </a>
            </Stack>
            <PostExplorer
              posts={previews.map(preview => postCardOf(preview, locale, t))}
              locale={locale}
              tags={namesOf(
                previews.flatMap(each =>
                  each.tags.map(tag => ({ id: tag.id, text: tag.label })),
                ),
                locale,
              )}
              technologies={namesOf(
                previews.flatMap(each =>
                  each.technologies.map(technology => ({
                    id: technology.id,
                    text: technology.name,
                  })),
                ),
                locale,
              )}
              years={years}
              copy={{
                filters: t('blogPage.filter.label'),
                tag: t('blogPage.filter.tag'),
                technology: t('blogPage.filter.technology'),
                year: t('blogPage.filter.year'),
                search: t('blogPage.filter.search'),
                clear: t('blogPage.filter.clear'),
                showing: t('blogPage.filter.showing', {
                  shown: '{{shown}}',
                  total: '{{total}}',
                }),
                empty: t('blogPage.empty'),
              }}
            />
          </Stack>
        </Card>
      </Center>
    </>
  );
}
