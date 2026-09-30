import type { ArchitectureDecision } from '@myself-app/domain';
import { decisionNumber } from '@myself-app/domain/use-cases';

import { RememberedDetails } from '../../atoms/remembered-details/remembered-details.js';
import { siteT } from '../../i18n/server.js';
import type { SiteLocale } from '../../routing/site-locales.js';

/** The life of a record, in the order it is lived. */
export const PRACTICE_STEPS = [
  'decide',
  'record',
  'point',
  'match',
  'evolve',
] as const;

/** 24×24 line icons, one per step, stroked as the nav's are. */
const STEP_ICONS: Readonly<Record<(typeof PRACTICE_STEPS)[number], string>> = {
  decide: 'M12 20v-6M12 14 6 8M12 14l6-6M6 8V4M18 8V4',
  record: 'M6 3.5h8.5l3.5 3.5v13.5H6zM14.5 3.5V7H18M9 11.5h6M9 14.5h6M9 17.5h4',
  point: 'M3.5 12h11M11 8l4 4-4 4M17.5 5.5h3v13h-3',
  match: 'M10.5 4a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM15.5 15.5 20 20',
  evolve:
    'M4 12a8 8 0 0 1 13.7-5.6L20 8.5M20 4v4.5h-4.5M20 12a8 8 0 0 1-13.7 5.6L4 15.5M4 20v-4.5h4.5',
};

/** The header lines of a record, as its file writes them. */
const ANATOMY_LINES = ['title', 'status', 'date', 'area', 'readWhen'] as const;

/** A status as the record's own English writes it: `Superseded in part`. */
function statusText(status: string) {
  const words = status.replaceAll('-', ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/** The newest record with a `Read when` line: the one the anatomy shows. */
export function sampleDecision(
  decisions: readonly ArchitectureDecision[],
): ArchitectureDecision | undefined {
  return [...decisions]
    .filter(decision => decision.readWhen)
    .sort(
      (a, b) =>
        (b.date as Date).getTime() - (a.date as Date).getTime() ||
        b.number - a.number,
    )[0];
}

/**
 * How a project's decision records are written, found and kept (#77): the
 * life of a record in five steps, then a real record's header, line by line,
 * with what each line is for. It says what makes the records worth reading
 * for an agent: the symptom that should send one to a rule before it breaks
 * it. Open until a reader closes it, and closed for them after.
 */
export function DecisionPractice({
  locale,
  decisions,
}: {
  locale: SiteLocale;
  decisions: readonly ArchitectureDecision[];
}) {
  const t = siteT(locale);
  const sample = sampleDecision(decisions);
  const header = sample && {
    title: `# ${sample.number}. ${sample.title}`,
    status: `- Status: ${statusText(sample.status)}`,
    // Validation has made every date and area present.
    date: `- Date: ${(sample.date as Date).toISOString().slice(0, 10)}`,
    area: `- Area: ${sample.area as string}`,
    readWhen: `- Read when: ${sample.readWhen as string}`,
  };
  return (
    <RememberedDetails
      storageKey="decision-practice"
      className="adr-practice"
      summary={t('projectPage.practice.summary')}
    >
      <p className="adr-practice-lead">{t('projectPage.practice.lead')}</p>
      <ol className="adr-steps">
        {PRACTICE_STEPS.map((step, index) => (
          <li key={step} className="adr-step">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="adr-step-icon"
            >
              <path d={STEP_ICONS[step]} />
            </svg>
            <span className="adr-step-number">{index + 1}</span>
            <strong className="adr-step-name">
              {t(`projectPage.practice.steps.${step}.name`)}
            </strong>
            <span className="adr-step-text">
              {t(`projectPage.practice.steps.${step}.text`)}
            </span>
          </li>
        ))}
      </ol>
      <p className="adr-practice-synced">{t('projectPage.practice.synced')}</p>
      {sample && header && (
        <figure className="adr-anatomy">
          <figcaption>
            {t('projectPage.practice.anatomy', {
              number: decisionNumber(sample),
            })}
          </figcaption>
          <ol className="adr-anatomy-lines">
            {ANATOMY_LINES.map(line => (
              <li key={line} className="adr-anatomy-line" data-line={line}>
                {/* As the file writes it, backticks and all. */}
                <code className="adr-anatomy-code">{header[line]}</code>
                <span className="adr-anatomy-note">
                  {t(`projectPage.practice.callouts.${line}`)}
                </span>
              </li>
            ))}
          </ol>
        </figure>
      )}
    </RememberedDetails>
  );
}
