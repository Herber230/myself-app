import { Cluster, Lead, Text } from '@entifix/react-controls/primitives';

import { siteT } from '../../i18n/server';
import type { SiteLocale } from '../../site-locales';
import { ExternalLink } from './external-link';
import { LandingSection } from './landing-section';

const REPOSITORY = 'https://github.com/r10c-technologies/entifix';
const NPM = 'https://www.npmjs.com/org/entifix';

/**
 * What entifix is, and how this page runs on it (#31). Copy, not content
 * (ADR 0008): it says nothing about Herber and answers no query. Every claim
 * in it is one `content/` makes true — the static repository, the metadata
 * that validates it, the localized fields and the `load` use case.
 */
export function EntifixSection({ locale }: { locale: SiteLocale }) {
  const t = siteT(locale);
  return (
    <LandingSection id="entifix" locale={locale}>
      <Lead className="landing-prose">{t('landing.entifix.what')}</Lead>
      <Text className="landing-prose">{t('landing.entifix.here')}</Text>
      <Cluster as="ul" gap="m" className="landing-list">
        <li>
          <ExternalLink href={REPOSITORY} className="landing-chip">
            {t('landing.entifix.repository')}
          </ExternalLink>
        </li>
        <li>
          <ExternalLink href={NPM} className="landing-chip">
            {t('landing.entifix.npm')}
          </ExternalLink>
        </li>
      </Cluster>
    </LandingSection>
  );
}
