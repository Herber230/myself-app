import { button, Center, Text } from '@entifix/react-controls/primitives';
import {
  type ContactChannel,
  localize,
  type LocalizedText,
} from '@myself-app/domain';
import type { BeyondCodeTeaser as TeaserData } from '@myself-app/domain/use-cases';
import type { TFunction } from 'i18next';
import Link from 'next/link';

import { InterestGlyph } from '../../atoms/interest-glyph/interest-glyph.js';
import { siteT } from '../../i18n/server.js';
import {
  type ChannelLinkData,
  ChannelLinks,
} from '../../molecules/channel-links/channel-links.js';
import { LinkCard } from '../../molecules/link-card/link-card.js';
import { localePath, type SiteLocale } from '../../routing/site-locales.js';

/** The personal channels as `ChannelLinks` shows them. */
export function channelLinksOf(
  channels: readonly ContactChannel[],
  t: TFunction<'site'>,
): ChannelLinkData[] {
  return channels.map(channel => {
    const label = t(`channels.${channel.type}`);
    return {
      id: String(channel.id),
      type: channel.type,
      url: channel.url,
      label,
      handle: channel.displayName,
      name: t('landing.contact.link', {
        channel: label,
        handle: channel.displayName,
      }),
    };
  });
}

/**
 * The landing page's door to "Beyond the code", after the contact section:
 * each interest in a line, and beside them a fanned stack of featured photos
 * that spreads when the section is hovered, with the personal channels under
 * it. In one column, where there is no room beside them, the photos come
 * right after the lead, and the channels last. The whole section leads to
 * one page.
 */
export function BeyondCodeTeaser({
  locale,
  teaser,
  channels,
}: {
  locale: SiteLocale;
  teaser: TeaserData;
  /** The personal channels, linked under the button. */
  channels: readonly ContactChannel[];
}) {
  const t = siteT(locale);
  const href = localePath(locale, '/beyond-code');
  return (
    <section
      id="beyond-code"
      aria-labelledby="beyond-code-heading"
      className="landing-section beyond-teaser"
    >
      <Center gutters>
        <div className="beyond-teaser-frame">
          <div className="beyond-teaser-body">
            <div className="beyond-teaser-intro">
              <Text as="h2" id="beyond-code-heading" step={3} weight="semibold">
                {t('beyondCode.title')}
              </Text>
              <Text muted className="landing-prose">
                {t('beyondCode.teaserLead')}
              </Text>
            </div>
            <div className="beyond-teaser-photos" aria-hidden="true">
              {teaser.media.slice(0, 3).map(media => (
                <img
                  key={String(media.id)}
                  src={media.thumbnail ?? media.src}
                  alt=""
                  loading="lazy"
                  decoding="async"
                />
              ))}
            </div>
            <ul className="beyond-teaser-list">
              {teaser.interests.map(interest => (
                <li key={String(interest.id)}>
                  <LinkCard
                    size="compact"
                    href={`${href}#${String(interest.id)}`}
                    // Validation requires both in every locale.
                    title={localize(interest.name as LocalizedText, locale)}
                    description={localize(
                      interest.summary as LocalizedText,
                      locale,
                    )}
                    cue=""
                    mark={<InterestGlyph interest={String(interest.id)} />}
                  />
                </li>
              ))}
            </ul>
            <Link
              href={href}
              className={`${button({ variant: 'primary', size: 'md' })} beyond-teaser-cta`}
            >
              {t('beyondCode.cta')}
            </Link>
            {channels.length > 0 && (
              <ChannelLinks
                id="beyond-code-elsewhere"
                label={t('beyondCode.elsewhere')}
                channels={channelLinksOf(channels, t)}
              />
            )}
          </div>
        </div>
      </Center>
    </section>
  );
}
