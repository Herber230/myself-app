import { Text } from '@entifix/react-controls/primitives';
import type { ContactChannel } from '@myself-app/domain';

import { DownloadIcon } from '../../atoms/icons/icons.js';
import { siteT } from '../../i18n/server.js';
import { ContactCard } from '../../molecules/contact-card/contact-card.js';
import { LandingSection } from '../../molecules/landing-section/landing-section.js';
import { cvPath, cvPdfName } from '../../routing/cv-paths.js';
import { localePath, type SiteLocale } from '../../routing/site-locales.js';

/**
 * Where to reach me, from `ContactChannel` (#32), in the order the content
 * gives: one card per channel. A handle alone says little to a screen reader,
 * so each link's name leads with the channel's — "GitHub: Herber230" — and
 * still contains the words on screen, for voice control. The email card also
 * offers its address for copying. Under the cards, the default CV's prebuilt
 * PDF, for whoever came to hire: the file `tools/render-pdfs.mjs` writes
 * beside the CV page.
 */
export function ContactSection({
  locale,
  channels,
  cvVariant,
}: {
  locale: SiteLocale;
  channels: readonly ContactChannel[];
  /** The default CV variant's id, whose PDF the section links to. */
  cvVariant?: string;
}) {
  const t = siteT(locale);
  return (
    <LandingSection id="contact" locale={locale}>
      <Text muted className="landing-prose">
        {t('landing.contact.lead')}
      </Text>
      <ul className="contact-card-list">
        {channels.map(channel => {
          const name = t(`channels.${channel.type}`);
          return (
            <li key={String(channel.id)}>
              <ContactCard
                type={channel.type}
                url={channel.url}
                channel={name}
                handle={channel.displayName}
                name={t('landing.contact.link', {
                  channel: name,
                  handle: channel.displayName,
                })}
                action={t(`landing.contact.actions.${channel.type}`)}
                copy={
                  channel.type === 'email'
                    ? {
                        value: channel.displayName,
                        label: t('landing.contact.copy'),
                        name: t('landing.contact.copyName'),
                        copiedLabel: t('landing.contact.copied'),
                      }
                    : undefined
                }
              />
            </li>
          );
        })}
      </ul>
      {cvVariant !== undefined && (
        <a
          className="contact-cv"
          href={`${localePath(locale, cvPath(cvVariant, 'human', cvVariant))}${cvPdfName(cvVariant, locale, 'human')}`}
          download
        >
          <DownloadIcon className="contact-cv-icon" />
          {t('landing.contact.cv')}
        </a>
      )}
    </LandingSection>
  );
}
