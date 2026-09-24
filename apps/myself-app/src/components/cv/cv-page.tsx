import { button } from '@entifix/react-controls/primitives';
import {
  type CvVariant,
  localize,
  type LocalizedText,
} from '@myself-app/domain';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import {
  defaultCvVariantId,
  loadCvSheet,
  loadCvVariants,
} from '../../content/cv';
import { SITE_REPOSITORIES } from '../../content/repositories';
import { siteT } from '../../i18n/server';
import { isSiteLocale, localeAlternates, localePath } from '../../site-locales';
import { SiteNav } from '../site-nav';
import { CV_MODES, type CvMode, inLocale } from './cv-format';
import { cvPath, cvPdfName } from './cv-paths';
import { CvPrintButton } from './cv-print-button';
import { CvSheet } from './cv-sheet';

/**
 * Every CV route renders through here (ADR 0012): `/cv/`, `/cv/ats/`,
 * `/cv/[variant]/` and `/cv/[variant]/ats/`. `variant` is absent on the first
 * two, which show the default.
 */
interface CvRoute {
  readonly locale: string;
  readonly variant?: string;
  readonly mode: CvMode;
}

/** A variant's title: required, so validation has made it present. */
const titleOf = (variant: CvVariant, locale: Parameters<typeof localize>[1]) =>
  localize(variant.title as LocalizedText, locale);

/** The route's locale and variant, checked, or not found. */
async function resolve({ locale, variant }: CvRoute) {
  if (!isSiteLocale(locale)) notFound();
  const defaultVariant = String(await defaultCvVariantId(SITE_REPOSITORIES));
  const variantId = variant ?? defaultVariant;
  const sheet = await loadCvSheet(SITE_REPOSITORIES, variantId);
  if (sheet === undefined) notFound();
  return { locale, variantId, defaultVariant, sheet };
}

/**
 * The title names the variant and the mode, and the ATS page is not indexed:
 * its human page is the canonical one, so search shows one sheet per variant.
 */
export async function cvMetadata(route: CvRoute): Promise<Metadata> {
  const { locale, variantId, defaultVariant, sheet } = await resolve(route);
  const t = siteT(locale);
  const variantTitle = titleOf(sheet.variant, locale);
  const suffix = route.mode === 'ats' ? ` (${t('cvPage.atsTitle')})` : '';
  const human = cvPath(variantId, 'human', defaultVariant);
  const own = localeAlternates(
    locale,
    cvPath(variantId, route.mode, defaultVariant),
  );
  return {
    title: `${t('cv')}: ${variantTitle}${suffix} — ${t('siteName')}`,
    alternates:
      route.mode === 'ats'
        ? { ...own, canonical: localePath(locale, human) }
        : own,
    ...(route.mode === 'ats' && { robots: { index: false, follow: true } }),
  };
}

export async function CvPageView(route: CvRoute) {
  const { locale, variantId, defaultVariant, sheet } = await resolve(route);
  const { mode } = route;
  const t = siteT(locale);
  const variants = await loadCvVariants(SITE_REPOSITORIES);
  const path = cvPath(variantId, mode, defaultVariant);
  // What Chromium and Safari offer as the PDF's name when printing.
  const fileName = [
    `${t('siteName')} — ${t('cv')} (${titleOf(sheet.variant, locale)})`,
    mode === 'ats' && t('cvPage.atsTitle'),
  ]
    .filter(Boolean)
    .join(' — ');
  return (
    <>
      <SiteNav locale={locale} path={path} />
      <main className="cv-desk">
        <div className="cv-controls print:hidden">
          <p className="cv-lead">{t('cvLead')}</p>
          <CvSwitch label={t('cvPage.variants')}>
            {variants.map(variant => {
              const id = String(variant.id);
              return (
                <SwitchItem
                  key={id}
                  current={id === variantId}
                  href={localePath(locale, cvPath(id, mode, defaultVariant))}
                >
                  {titleOf(variant, locale)}
                </SwitchItem>
              );
            })}
          </CvSwitch>
          <CvSwitch label={t('cvPage.mode')}>
            {CV_MODES.map(each => (
              <SwitchItem
                key={each}
                current={each === mode}
                href={localePath(
                  locale,
                  cvPath(variantId, each, defaultVariant),
                )}
              >
                {t(`cvPage.modes.${each}`)}
              </SwitchItem>
            ))}
          </CvSwitch>
          <div className="cv-actions">
            <CvPrintButton label={t('cvPage.print')} fileName={fileName} />
            <a
              className={button({ variant: 'secondary', size: 'sm' })}
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
              {t('cvPage.download')}
            </a>
            <p className="cv-hint">{t('cvPage.printHint')}</p>
          </div>
        </div>
        <div className="cv-paper">
          <CvSheet sheet={sheet} locale={locale} mode={mode} />
        </div>
      </main>
    </>
  );
}

/** A labelled row of links, one of them the page itself. */
function CvSwitch({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <nav className="cv-switch" aria-label={label}>
      <span className="cv-switch-label" aria-hidden="true">
        {label}
      </span>
      <ul>{children}</ul>
    </nav>
  );
}

function SwitchItem({
  current,
  href,
  children,
}: {
  current: boolean;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      {current ? (
        <span className="cv-switch-item" aria-current="page">
          {children}
        </span>
      ) : (
        <Link className="cv-switch-item" href={href}>
          {children}
        </Link>
      )}
    </li>
  );
}
