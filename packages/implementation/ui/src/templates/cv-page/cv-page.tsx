import { button } from '@entifix/react-controls/primitives';
import {
  type CvVariant,
  localize,
  type LocalizedText,
} from '@myself-app/domain';
import type { CvSheet as CvSheetContent } from '@myself-app/domain/use-cases';
import { SegmentedNav } from '@myself-app/entifix-incubator-react-controls';
import type { Metadata } from 'next';
import Link from 'next/link';

import { DownloadIcon } from '../../atoms/icons/icons.js';
import { siteT } from '../../i18n/server.js';
import {
  CvCustomizer,
  type CvCustomizerGroup,
} from '../../organisms/cv-customizer/cv-customizer.js';
import { cvPart } from '../../organisms/cv-customizer/cv-hidden.js';
import { CvHiddenScript } from '../../organisms/cv-customizer/cv-hidden-script.js';
import { CvDownloadMenu } from '../../organisms/cv-download-menu/cv-download-menu.js';
import {
  CV_MODES,
  type CvMode,
  inLocale,
} from '../../organisms/cv-sheet/cv-format.js';
import { CvSheet } from '../../organisms/cv-sheet/cv-sheet.js';
import { SiteNav } from '../../organisms/site-nav/site-nav.js';
import { cvPath, cvPdfName } from '../../routing/cv-paths.js';
import {
  localeAlternates,
  localePath,
  type SiteLocale,
} from '../../routing/site-locales.js';

/**
 * Every CV route renders through here (ADR 0012): `/cv/`, `/cv/ats/`,
 * `/cv/[variant]/` and `/cv/[variant]/ats/`, each with what its route loaded.
 */
export interface CvPageData {
  readonly locale: SiteLocale;
  readonly mode: CvMode;
  /** The variant shown: the route's, or the default. */
  readonly variantId: string;
  /** The variant `/cv/` shows, which has no segment of its own. */
  readonly defaultVariant: string;
  readonly sheet: CvSheetContent;
  /** Every variant, by its order, for the switch between them. */
  readonly variants: readonly CvVariant[];
}

/** A variant's title: required, so validation has made it present. */
const titleOf = (variant: CvVariant, locale: Parameters<typeof localize>[1]) =>
  localize(variant.title as LocalizedText, locale);

/**
 * The title names the variant and the mode, and the ATS page is not indexed:
 * its human page is the canonical one, so search shows one sheet per variant.
 */
export function cvMetadata({
  locale,
  mode,
  variantId,
  defaultVariant,
  sheet,
}: CvPageData): Metadata {
  const t = siteT(locale);
  const variantTitle = titleOf(sheet.variant, locale);
  const suffix = mode === 'ats' ? ` (${t('cvPage.atsTitle')})` : '';
  const human = cvPath(variantId, 'human', defaultVariant);
  const own = localeAlternates(locale, cvPath(variantId, mode, defaultVariant));
  return {
    title: `${t('cv')}: ${variantTitle}${suffix} — ${t('siteName')}`,
    alternates:
      mode === 'ats' ? { ...own, canonical: localePath(locale, human) } : own,
    ...(mode === 'ats' && { robots: { index: false, follow: true } }),
  };
}

export function CvPageView({
  locale,
  mode,
  variantId,
  defaultVariant,
  sheet,
  variants,
}: CvPageData) {
  const t = siteT(locale);
  const path = cvPath(variantId, mode, defaultVariant);
  // What Chromium and Safari offer as the PDF's name when printing.
  const fileName = [
    `${t('siteName')} — ${t('cv')} (${titleOf(sheet.variant, locale)})`,
    mode === 'ats' && t('cvPage.atsTitle'),
  ]
    .filter(Boolean)
    .join(' — ');
  const customizable = mode === 'human';
  return (
    <>
      <SiteNav locale={locale} path={path} />
      <main className="cv-desk">
        {/* A child of the desk itself, so it sticks the whole sheet down. */}
        <div className="cv-toolbar print:hidden">
          <SegmentedNav
            className="cv-toolbar-choice"
            label={t('cvPage.variants')}
            link={Link}
            items={variants.map(variant => {
              const id = String(variant.id);
              return {
                key: id,
                label: titleOf(variant, locale),
                href: localePath(locale, cvPath(id, mode, defaultVariant)),
                current: id === variantId,
              };
            })}
          />
          <SegmentedNav
            className="cv-toolbar-choice"
            label={t('cvPage.mode')}
            link={Link}
            items={CV_MODES.map(each => ({
              key: each,
              label: t(`cvPage.modes.${each}`),
              href: localePath(locale, cvPath(variantId, each, defaultVariant)),
              current: each === mode,
            }))}
          />
          <div className="cv-actions">
            <CvDownloadMenu
              fileName={fileName}
              copy={{
                more: t('cvPage.downloadMore'),
                print: t('cvPage.print'),
                printHint: t('cvPage.printHint'),
                copyLink: t('cvPage.copyLink'),
                linkCopied: t('cvPage.linkCopied'),
              }}
            >
              <a
                className={button({ variant: 'primary', size: 'sm' })}
                href={cvPdfName(variantId, locale, mode)}
                download
                // `tools/render-pdfs.mjs` writes the file this names, and sets
                // these on it, so the page and its PDF cannot disagree.
                data-cv-pdf
                data-pdf-title={fileName}
                data-pdf-author={`${sheet.profile.firstName} ${sheet.profile.lastName}`}
                data-pdf-subject={t('cvPage.pdfSubject')}
                data-pdf-keywords={sheet.technologies
                  .map(each => inLocale(each.name, locale))
                  .join(', ')}
                data-pdf-language={locale}
              >
                <DownloadIcon className="cv-action-icon" />
                {t('cvPage.download')}
              </a>
            </CvDownloadMenu>
          </div>
        </div>
        <div className="cv-controls print:hidden">
          {customizable && (
            <CvCustomizer
              groups={customizerGroups(sheet, locale, t)}
              copy={{
                label: t('cvPage.customize.label'),
                hidden: t('cvPage.customize.hidden', { n: '{{n}}' }),
                reset: t('cvPage.customize.reset'),
                downloadNote: t('cvPage.customize.downloadNote'),
              }}
            />
          )}
        </div>
        {/* Before the sheet, so a shared link's hidden parts never paint. */}
        {customizable && <CvHiddenScript />}
        <div className="cv-paper">
          <CvSheet sheet={sheet} locale={locale} mode={mode} />
        </div>
      </main>
    </>
  );
}

/**
 * What a visitor can hide of `sheet` (#38), labelled as the sheet labels it:
 * its sections — education and certificates only when it has them — its
 * positions, and its technologies.
 */
export function customizerGroups(
  sheet: CvSheetContent,
  locale: SiteLocale,
  t: ReturnType<typeof siteT>,
): CvCustomizerGroup[] {
  const sections = [
    'summary',
    'skills',
    'experience',
    ...(sheet.education.length > 0 ? ['education' as const] : []),
    ...(sheet.certificates.length > 0 ? ['certificates' as const] : []),
  ] as const;
  return [
    {
      legend: t('cvPage.customize.sections'),
      options: sections.map(section => ({
        part: cvPart('section', section),
        label: t(`cvSheet.headings.${section}`),
      })),
    },
    {
      legend: t('cvPage.customize.positions'),
      wide: true,
      options: sheet.employments.map(({ period, employer }) => ({
        part: cvPart('position', String(period.id)),
        label: `${inLocale(period.role, locale)} · ${employer.name}`,
      })),
    },
    {
      legend: t('cvPage.customize.technologies'),
      options: sheet.technologies.map(technology => ({
        part: cvPart('tech', String(technology.id)),
        label: inLocale(technology.name, locale),
      })),
    },
  ];
}
