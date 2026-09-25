import { Cluster, linkClassName } from '@entifix/react-controls/primitives';
import type { ContactChannel } from '@myself-app/domain';

import { siteT } from '../../i18n/server';
import type { SiteLocale } from '../../site-locales';
import { ChannelIcon } from '../icons';
import { ExternalLink } from './external-link';
import { LandingSection } from './landing-section';

const LINK = `${linkClassName} landing-link`;

/**
 * Where to reach me, from `ContactChannel` (#32), in the order the content
 * gives. A handle alone says little to a screen reader, so each link's name
 * leads with the channel's — "GitHub: Herber230" — and still contains the
 * words on screen, for voice control.
 */
export function ContactSection({
  locale,
  channels,
}: {
  locale: SiteLocale;
  channels: readonly ContactChannel[];
}) {
  const t = siteT(locale);
  return (
    <LandingSection id="contact" locale={locale}>
      <Cluster as="ul" gap="l" className="landing-list">
        {channels.map(channel => {
          const Anchor = /^https?:/.test(channel.url) ? ExternalLink : 'a';
          return (
            <li key={String(channel.id)}>
              <Anchor
                href={channel.url}
                className={LINK}
                aria-label={t('landing.contact.link', {
                  channel: t(`channels.${channel.type}`),
                  handle: channel.displayName,
                })}
              >
                <ChannelIcon type={channel.type} className="landing-icon" />
                {channel.displayName}
              </Anchor>
            </li>
          );
        })}
      </Cluster>
    </LandingSection>
  );
}
