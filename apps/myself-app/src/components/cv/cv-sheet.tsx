import type { ContactChannel } from '@myself-app/domain';

import type { CvEmployment, CvSheet as CvSheetContent } from '../../content/cv';
import { siteT } from '../../i18n/server';
import type { SiteLocale } from '../../site-locales';
import { ChannelIcon, LocationIcon } from '../icons';
import {
  type CvMode,
  formatPeriod,
  formatYears,
  inLocale,
  readableUrl,
} from './cv-format';
import { cvPart, type CvPartKind } from './cv-hidden';

type T = ReturnType<typeof siteT>;

/** A label as the ATS mode writes it before a value: `Email: `. */
const labelled = (label: string) => `${label}: `;

/** Words joined as one line of a sheet: `Universidad · 2007 – 2014`. */
const line = (...parts: (string | false | undefined)[]) =>
  parts.filter(Boolean).join(' · ');

/**
 * The CV as one A4 sheet (#34, ADR 0012): the same markup on screen, in print
 * and in the prebuilt PDF. Its tokens are always the light palette, because it
 * is paper.
 *
 * The two modes share the order of every word, which is the order an ATS reads
 * them in. What differs is only decoration, and it never replaces text:
 *
 * - **human**: an icon beside each contact and its handle, one accent colour,
 *   dates aligned right, technologies as chips;
 * - **ats**: each contact as a label and its address, no colour, dates inline,
 *   technologies on one comma-separated line.
 *
 * Every link's target is the full URL in both.
 *
 * On the human sheet, each part a visitor can hide (#38, ADR 0015) — a section,
 * a position, a technology — carries `data-cv-part` naming it. The ATS sheet
 * is never customized, and carries none.
 */
export function CvSheet({
  sheet,
  locale,
  mode,
}: {
  sheet: CvSheetContent;
  locale: SiteLocale;
  mode: CvMode;
}) {
  const t = siteT(locale);
  const { profile, variant } = sheet;
  const part = (kind: CvPartKind, id: unknown) =>
    mode === 'human' ? cvPart(kind, String(id)) : undefined;
  return (
    <article className="cv-sheet" data-theme="light" data-mode={mode}>
      <header className="cv-header">
        <h1 className="cv-name">
          {profile.firstName} {profile.lastName}
        </h1>
        <p className="cv-headline">{inLocale(variant.title, locale)}</p>
        <ul className="cv-contact">
          <li>
            {mode === 'human' ? (
              <LocationIcon className="cv-icon" />
            ) : (
              <span>{labelled(t('cvSheet.location'))}</span>
            )}
            {inLocale(profile.location, locale)}
          </li>
          {sheet.channels.map(channel => (
            <li key={String(channel.id)}>
              <Channel channel={channel} mode={mode} t={t} />
            </li>
          ))}
        </ul>
      </header>

      <CvSection
        id="summary"
        part={part('section', 'summary')}
        title={t('cvSheet.headings.summary')}
      >
        <p>{inLocale(variant.summary, locale)}</p>
      </CvSection>

      <CvSection
        id="skills"
        part={part('section', 'skills')}
        title={t('cvSheet.headings.skills')}
      >
        {mode === 'human' ? (
          <ul className="cv-chips">
            {sheet.technologies.map(technology => (
              <li
                key={String(technology.id)}
                data-cv-part={part('tech', technology.id)}
              >
                {inLocale(technology.name, locale)}
              </li>
            ))}
          </ul>
        ) : (
          <p>
            {sheet.technologies
              .map(each => inLocale(each.name, locale))
              .join(', ')}
          </p>
        )}
      </CvSection>

      <CvSection
        id="experience"
        part={part('section', 'experience')}
        title={t('cvSheet.headings.experience')}
      >
        {sheet.employments.map(employment => (
          <Employment
            key={String(employment.period.id)}
            part={part('position', employment.period.id)}
            employment={employment}
            locale={locale}
            t={t}
          />
        ))}
      </CvSection>

      {sheet.education.length > 0 && (
        <CvSection
          id="education"
          part={part('section', 'education')}
          title={t('cvSheet.headings.education')}
        >
          {sheet.education.map(study => (
            <div key={String(study.id)} className="cv-entry">
              <h3 className="cv-role">
                {[
                  inLocale(study.degree, locale),
                  inLocale(study.field, locale),
                ].join(', ')}
              </h3>
              <p className="cv-meta">
                {line(
                  study.institution,
                  formatYears(study.start as Date, study.end),
                  !study.completed && t('cvSheet.notCompleted'),
                )}
              </p>
            </div>
          ))}
        </CvSection>
      )}

      {sheet.certificates.length > 0 && (
        <CvSection
          id="certificates"
          part={part('section', 'certificates')}
          title={t('cvSheet.headings.certificates')}
        >
          <ul className="cv-list">
            {sheet.certificates.map(certificate => (
              <li key={String(certificate.id)}>
                {line(
                  certificate.name,
                  certificate.issuer,
                  certificate.issued &&
                    String(certificate.issued.getUTCFullYear()),
                )}
              </li>
            ))}
          </ul>
        </CvSection>
      )}
    </article>
  );
}

function CvSection({
  id,
  part,
  title,
  children,
}: {
  id: string;
  part: string | undefined;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className="cv-section"
      aria-labelledby={`cv-${id}`}
      data-cv-part={part}
    >
      <h2 id={`cv-${id}`} className="cv-heading">
        {title}
      </h2>
      {children}
    </section>
  );
}

/** One contact: a link whose target is always the full URL. */
function Channel({
  channel,
  mode,
  t,
}: {
  channel: ContactChannel;
  mode: CvMode;
  t: T;
}) {
  // Validation requires a URL on every channel.
  const url = channel.url as string;
  if (mode === 'human') {
    return (
      <a href={url}>
        <ChannelIcon type={channel.type} className="cv-icon" />
        {channel.displayName}
      </a>
    );
  }
  return (
    <>
      <span>{labelled(t(`channels.${channel.type}`))}</span>
      <a href={url}>{readableUrl(url)}</a>
    </>
  );
}

/**
 * The role, then the employer and dates, then what was done — each on its
 * own line, the order a parser expects its fields in.
 */
function Employment({
  part,
  employment,
  locale,
  t,
}: {
  part: string | undefined;
  employment: CvEmployment;
  locale: SiteLocale;
  t: T;
}) {
  const { period, employer, highlights } = employment;
  return (
    <div className="cv-entry" data-cv-part={part}>
      <div className="cv-entry-head">
        <h3 className="cv-role">{inLocale(period.role, locale)}</h3>
        <p className="cv-employer">{employer.name}</p>
        <p className="cv-dates">
          {formatPeriod(
            period.start as Date,
            period.end,
            locale,
            t('cvSheet.present'),
          )}
        </p>
      </div>
      <p className="cv-responsibilities">
        {inLocale(period.responsibilities, locale)}
      </p>
      {highlights.length > 0 && (
        <ul className="cv-list">
          {highlights.map(highlight => (
            <li key={String(highlight.id)}>
              {inLocale(highlight.text, locale)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
