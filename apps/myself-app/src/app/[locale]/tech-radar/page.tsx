import {
  Card,
  Center,
  Lead,
  Small,
  Stack,
  Text,
} from '@entifix/react-controls/primitives';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { SiteNav } from '../../../components/site-nav';
import { layoutRadar } from '../../../components/tech-radar/layout';
import { RadarChart } from '../../../components/tech-radar/radar-chart';
import { RadarLegend } from '../../../components/tech-radar/radar-legend';
import { loadRadarEntries } from '../../../content/radar';
import { SITE_REPOSITORIES } from '../../../content/repositories';
import { siteT } from '../../../i18n/server';
import { isSiteLocale, localeAlternates } from '../../../site-locales';

const PATH = '/tech-radar';

/**
 * Read from content and laid out once, while `next build` runs, and shared by
 * both locales: the layout does not depend on the language (ADR 0003, and
 * `layout.ts` on why the numbering is sorted by the default locale). A promise
 * rather than a value, because the entries arrive through entifix's `load`
 * use case.
 */
const LAYOUT = loadRadarEntries(SITE_REPOSITORIES).then(entries =>
  layoutRadar(entries),
);

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/tech-radar'>): Promise<Metadata> {
  const { locale } = await params;
  if (!isSiteLocale(locale)) notFound();
  const t = siteT(locale);
  return {
    title: `${t('techRadar')} — ${t('siteName')}`,
    alternates: localeAlternates(locale, PATH),
  };
}

export default async function TechRadarPage({
  params,
}: PageProps<'/[locale]/tech-radar'>) {
  const { locale } = await params;
  if (!isSiteLocale(locale)) notFound();
  const t = siteT(locale);
  const layout = await LAYOUT;
  const quadrants = [
    t('radar.quadrants.techniques'),
    t('radar.quadrants.tools'),
    t('radar.quadrants.platforms'),
    t('radar.quadrants.languages'),
  ];
  const rings = [
    t('radar.rings.adopt'),
    t('radar.rings.trial'),
    t('radar.rings.assess'),
    t('radar.rings.hold'),
  ];
  return (
    <>
      <SiteNav locale={locale} path={PATH} />
      <Center as="main" gutters className="py-2xl">
        <Card>
          <Stack gap="l">
            <Stack gap="s">
              <Text as="h1" step={3} weight="semibold">
                {t('techRadar')}
              </Text>
              <Lead muted>{t('techRadarLead')}</Lead>
              <Small muted>{t('radar.placeholder')}</Small>
            </Stack>
            <div>
              <RadarChart
                layout={layout}
                quadrants={quadrants}
                rings={rings}
                label={t('radar.chartLabel')}
              />
            </div>
            <Stack gap="s">
              <Text as="h2" step={2} weight="semibold">
                {t('radar.legend')}
              </Text>
              <RadarLegend
                layout={layout}
                locale={locale}
                quadrants={quadrants}
                rings={rings}
              />
            </Stack>
          </Stack>
        </Card>
      </Center>
    </>
  );
}
