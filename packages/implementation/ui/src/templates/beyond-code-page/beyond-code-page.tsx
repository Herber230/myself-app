import {
  Center,
  Cluster,
  Lead,
  linkClassName,
  Stack,
  Text,
} from '@entifix/react-controls/primitives';
import {
  type ContactChannel,
  localize,
  type LocalizedText,
} from '@myself-app/domain';
import type { InterestSection } from '@myself-app/domain/use-cases';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { InterestGlyph } from '../../atoms/interest-glyph/interest-glyph.js';
import { siteT } from '../../i18n/server.js';
import { ChannelLinks } from '../../molecules/channel-links/channel-links.js';
import { LinkCard } from '../../molecules/link-card/link-card.js';
import { MediaGallery } from '../../molecules/media-gallery/media-gallery.js';
import { postPath } from '../../molecules/post-card/post-cards.js';
import { channelLinksOf } from '../../organisms/beyond-code-teaser/beyond-code-teaser.js';
import { SiteNav } from '../../organisms/site-nav/site-nav.js';
import { localePath, type SiteLocale } from '../../routing/site-locales.js';

export interface BeyondCodePageData {
  readonly locale: SiteLocale;
  readonly sections: readonly InterestSection[];
  /** Each interest's body, rendered from Markdown, by its id. */
  readonly bodies: Readonly<Record<string, ReactNode>>;
  /** The personal channels, linked under the lead. */
  readonly channels: readonly ContactChannel[];
}

/**
 * "Beyond the code": who I am away from the keyboard. One page, one section
 * per interest in its order — its glyph and name, what it says, its photos
 * and videos, and the posts of the blog that grew out of it.
 */
export function BeyondCodePageView({
  locale,
  sections,
  bodies,
  channels,
}: BeyondCodePageData) {
  const t = siteT(locale);
  return (
    <>
      <SiteNav locale={locale} path="/beyond-code" />
      <Center as="main" gutters className="beyond-page py-2xl">
        <Stack gap="2xl">
          <header className="beyond-page-header">
            <Stack gap="m">
              <Link href={localePath(locale, '/')} className={linkClassName}>
                {t('beyondCode.back')}
              </Link>
              <Text as="h1" step={3} weight="semibold">
                {t('beyondCode.title')}
              </Text>
              <Lead muted>{t('beyondCode.lead')}</Lead>
              {channels.length > 0 && (
                <ChannelLinks
                  id="beyond-code-elsewhere"
                  label={t('beyondCode.elsewhere')}
                  channels={channelLinksOf(channels, t)}
                />
              )}
              <Cluster
                as="ul"
                gap="xs"
                className="landing-list"
                aria-label={t('beyondCode.jump')}
              >
                {sections.map(({ interest }) => (
                  <li key={String(interest.id)}>
                    <a
                      href={`#${String(interest.id)}`}
                      className="landing-chip"
                    >
                      {localize(interest.name as LocalizedText, locale)}
                    </a>
                  </li>
                ))}
              </Cluster>
            </Stack>
          </header>
          {sections.map(({ interest, media, posts }) => {
            const id = String(interest.id);
            const name = localize(interest.name as LocalizedText, locale);
            return (
              <section
                key={id}
                id={id}
                aria-labelledby={`${id}-heading`}
                className="beyond-section"
              >
                <Stack gap="l">
                  <div className="beyond-section-title">
                    <InterestGlyph interest={id} />
                    <Stack gap="2xs">
                      <Text
                        as="h2"
                        id={`${id}-heading`}
                        step={2}
                        weight="semibold"
                      >
                        {name}
                      </Text>
                      <Text muted>
                        {localize(interest.summary as LocalizedText, locale)}
                      </Text>
                    </Stack>
                  </div>
                  <div className="post-body beyond-section-body">
                    {bodies[id]}
                  </div>
                  {media.length > 0 && (
                    <MediaGallery
                      items={media.map(item => ({
                        id: String(item.id),
                        kind: item.kind,
                        src: item.src,
                        thumbnail: item.thumbnail,
                        poster: item.poster,
                        alt: localize(item.alt as LocalizedText, locale),
                      }))}
                      copy={{
                        label: t('beyondCode.gallery', { interest: name }),
                        previous: t('beyondCode.previous'),
                        next: t('beyondCode.next'),
                        close: t('beyondCode.close'),
                        position: t('beyondCode.position'),
                      }}
                    />
                  )}
                  {posts.length > 0 && (
                    <div className="beyond-posts">
                      <Text as="h3" step={0} weight="semibold">
                        {t('beyondCode.fromTheBlog')}
                      </Text>
                      <ul className="beyond-post-list">
                        {posts.map(post => (
                          <li key={String(post.id)}>
                            <LinkCard
                              size="compact"
                              href={postPath(locale, String(post.id))}
                              title={localize(
                                post.title as LocalizedText,
                                locale,
                              )}
                              description={localize(
                                post.summary as LocalizedText,
                                locale,
                              )}
                              titleAs="p"
                              cue=""
                            />
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Stack>
              </section>
            );
          })}
        </Stack>
      </Center>
    </>
  );
}
