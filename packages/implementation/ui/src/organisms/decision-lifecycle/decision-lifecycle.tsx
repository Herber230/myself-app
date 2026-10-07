import type { ArchitectureDecision } from '@myself-app/domain';
import { decisionNumber } from '@myself-app/domain/use-cases';

import { ExplorerLink } from '../../atoms/explorer-link/explorer-link.js';
import { RememberedDetails } from '../../atoms/remembered-details/remembered-details.js';
import { siteT } from '../../i18n/server.js';
import { StatePath } from '../../molecules/state-path/state-path.js';
import { StepLoop } from '../../molecules/step-loop/step-loop.js';
import { DECISIONS_ANCHOR } from '../../routing/project-paths.js';
import type { SiteLocale } from '../../routing/site-locales.js';

/**
 * The states a record lives through, in order. `revised` is not a status: a
 * record of any status is revised once its facts were corrected in place.
 * `promoted` has no record yet.
 */
export const LIFECYCLE_STATES = [
  'proposed',
  'accepted',
  'revised',
  'superseded-in-part',
  'superseded',
  'promoted',
] as const;

type LifecycleState = (typeof LIFECYCLE_STATES)[number];

/** The agent loop, in four beats. */
const LOOP = ['symptom', 'readWhen', 'rule', 'evolve'] as const;

/** 24×24 line icons, one per beat, stroked as the nav's are. */
const LOOP_ICONS: Readonly<Record<(typeof LOOP)[number], string>> = {
  // A warning: something failed, or looks wrong.
  symptom: 'M12 4 21 19.5H3L12 4ZM12 10v4.5M12 17v.01',
  // A lens over a line: the record whose Read when names it.
  readWhen:
    'M10.5 4a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM15.5 15.5 20 20M7.5 10.5h6',
  // A check: the rule, followed.
  rule: 'M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17ZM8 12.25l2.75 2.75L16 9.5',
  // Two arrows round: revised in place, or superseded.
  evolve:
    'M4 12a8 8 0 0 1 13.7-5.6L20 8.5M20 4v4.5h-4.5M20 12a8 8 0 0 1-13.7 5.6L4 15.5M4 20v-4.5h4.5',
};

/** A record's `- Revised:` lines, newest last, as its file writes them. */
function revisionsOf(decision: ArchitectureDecision): string[] {
  return (decision.body ?? '').match(/^- Revised: .*$/gm) ?? [];
}

/** Its newest Revised line, as text: a Markdown link reads as its words. */
function latestRevision(decision: ArchitectureDecision): string {
  return (revisionsOf(decision).at(-1) as string)
    .replace('- Revised: ', '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
}

/** The records in a state: `revised` is any record with a Revised line. */
function inState(
  decisions: readonly ArchitectureDecision[],
  state: LifecycleState,
): ArchitectureDecision[] {
  if (state === 'revised') {
    return decisions.filter(decision => revisionsOf(decision).length > 0);
  }
  return decisions.filter(decision => decision.status === state);
}

/**
 * A project's decisions as a life, not a list: each state a record can be in,
 * with how many are there, and one real record to show it. The states are
 * radio buttons, so choosing one needs no script; CSS shows its panel.
 * Closed by default, remembered per reader: closed, the title, the lead and
 * the totals still say how the work is done, and a cue asks to open it.
 */
export function DecisionLifecycle({
  locale,
  decisions,
}: {
  locale: SiteLocale;
  decisions: readonly ArchitectureDecision[];
}) {
  const t = siteT(locale);
  const revisions = decisions.reduce(
    (sum, decision) => sum + revisionsOf(decision).length,
    0,
  );
  const states = LIFECYCLE_STATES.map(state => {
    const records = inState(decisions, state);
    // The newest record in the state, or the most revised one.
    const example =
      state === 'revised'
        ? [...records].sort(
            (a, b) => revisionsOf(b).length - revisionsOf(a).length,
          )[0]
        : records.at(-1);
    return { state, count: records.length, example };
  });
  const initial =
    states.find(each => each.state === 'revised' && each.count > 0)?.state ??
    'accepted';
  return (
    <section
      id="lifecycle"
      aria-labelledby="lifecycle-heading"
      className="adr-life"
    >
      <RememberedDetails
        storageKey="decision-lifecycle"
        defaultOpen={false}
        className="adr-life-details"
        summary={
          <>
            <h2 id="lifecycle-heading" className="adr-life-title">
              {t('projectPage.lifecycle.title')}
            </h2>
            <span className="adr-life-totals">
              {t('projectPage.lifecycle.totals', {
                records: decisions.length,
                revisions,
              })}
            </span>
            <span className="adr-life-lead">
              {t('projectPage.lifecycle.lead')}
            </span>
            {/* Shown while closed: the call to open it. */}
            <span className="adr-life-expand" aria-hidden="true">
              {t('projectPage.lifecycle.expand')}
            </span>
          </>
        }
      >
        {/* Open: first, what a record is, and how an agent gets it. */}
        <p className="adr-life-about">{t('projectPage.lifecycle.about')}</p>
        <StatePath
          name="adr-life"
          legend={t('projectPage.lifecycle.legend')}
          hint={t('projectPage.lifecycle.pick')}
          initial={initial}
          states={states.map(({ state, count, example }) => ({
            key: state,
            label: t(`projectPage.lifecycle.states.${state}.name`),
            count,
            countLabel: t('projectPage.lifecycle.count', { count }),
            panel: (
              <>
                <p className="adr-life-meaning">
                  {t(`projectPage.lifecycle.states.${state}.meaning`)}
                </p>
                {example ? (
                  <p className="adr-life-example">
                    <ExplorerLink
                      search={`?adr=${decisionNumber(example)}`}
                      anchor={DECISIONS_ANCHOR}
                    >
                      {t('projectPage.lifecycle.example', {
                        number: decisionNumber(example),
                        title: example.title,
                      })}
                    </ExplorerLink>
                    {state === 'revised' && (
                      <span className="adr-life-quote">
                        {latestRevision(example)}
                      </span>
                    )}
                  </p>
                ) : (
                  <p className="adr-life-none">
                    {t('projectPage.lifecycle.none')}
                  </p>
                )}
                {count > 0 && state !== 'promoted' && (
                  <ExplorerLink
                    className="adr-life-all"
                    search={
                      state === 'revised' ? '?revised=yes' : `?status=${state}`
                    }
                    anchor={DECISIONS_ANCHOR}
                  >
                    {t('projectPage.lifecycle.all', { count })}
                  </ExplorerLink>
                )}
              </>
            ),
          }))}
        />
        <StepLoop
          label={t('projectPage.lifecycle.loopLabel')}
          steps={LOOP.map(step => ({
            key: step,
            label: t(`projectPage.lifecycle.loop.${step}`),
            icon: LOOP_ICONS[step],
          }))}
        />
      </RememberedDetails>
    </section>
  );
}
