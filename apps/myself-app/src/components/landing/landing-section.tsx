import { Center, Stack, Text } from '@entifix/react-controls/primitives';
import type { ReactNode } from 'react';

import { siteT } from '../../i18n/server';
import type { LandingSection as SectionId } from '../../landing-sections';
import type { SiteLocale } from '../../site-locales';

/**
 * One of the landing page's sections below the hero (ADR 0008): its anchor,
 * its heading from the catalog, and whatever it shows.
 */
export function LandingSection({
  id,
  locale,
  children,
}: {
  id: SectionId;
  locale: SiteLocale;
  children: ReactNode;
}) {
  const t = siteT(locale);
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className="landing-section"
    >
      <Center gutters>
        <Stack gap="l">
          <Text as="h2" id={`${id}-heading`} step={3} weight="semibold">
            {t(`landing.headings.${id}`)}
          </Text>
          {children}
        </Stack>
      </Center>
    </section>
  );
}
