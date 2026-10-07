'use client';

import {
  ExternalLink,
  PipelineGraph,
  type PipelineGraphJob,
  type PipelineJobState,
  StepPlayer,
  type StepPlayerCopy,
} from '@myself-app/entifix-incubator-react-controls';
import Link from 'next/link';
import { useState } from 'react';

export interface PipelineViewJob {
  readonly id: string;
  readonly label: string;
  readonly stage: string;
  readonly text: string;
  /** The file that defines it, relative to the repository root. */
  readonly workflow?: string;
  /** Where that file is read: the repository's copy on `main`. */
  readonly workflowUrl?: string;
  /** The records that decided it. */
  readonly decisions: readonly {
    readonly label: string;
    readonly href: string;
  }[];
}

export interface PipelineViewStep {
  readonly jobs: readonly string[];
  readonly skips: readonly string[];
  readonly title: string;
  readonly text: string;
  readonly code?: string;
  readonly fails: boolean;
}

export interface PipelineView {
  /** Left to right. */
  readonly stages: readonly { readonly id: string; readonly label: string }[];
  readonly jobs: readonly PipelineViewJob[];
  readonly needs: readonly { readonly from: string; readonly to: string }[];
  readonly scenarios: readonly {
    readonly id: string;
    readonly label: string;
    readonly steps: readonly PipelineViewStep[];
  }[];
}

export interface PipelineExplorerCopy {
  readonly label: string;
  readonly scenario: string;
  readonly free: string;
  readonly hint: string;
  readonly definedIn: string;
  readonly decidedIn: string;
  readonly player: StepPlayerCopy;
}

/** The scenario menu's value for none. */
const NONE = '';

/**
 * A project's delivery pipeline (ADR 0023): its stages and jobs as a graph,
 * a job chosen told in the panel beneath — what it does, the file that
 * defines it, the records that decided it — and scenarios that walk one
 * change through it a step at a time. On a phone the stages become rows of
 * the same jobs.
 *
 * Everything it shows was translated at build; it keeps only what is chosen.
 */
export function PipelineExplorer({
  view,
  copy,
}: {
  view: PipelineView;
  copy: PipelineExplorerCopy;
}) {
  const [selected, setSelected] = useState<string>();
  const [scenarioId, setScenarioId] = useState(NONE);
  const [index, setIndex] = useState(0);
  const scenario = view.scenarios.find(each => each.id === scenarioId);
  const step = scenario?.steps[index];
  const stateOf = (id: string): PipelineJobState | undefined =>
    step === undefined
      ? undefined
      : step.jobs.includes(id)
        ? step.fails
          ? 'fails'
          : 'lit'
        : step.skips.includes(id)
          ? 'dim'
          : undefined;
  const jobs: PipelineGraphJob[] = view.jobs.map(job => ({
    id: job.id,
    label: job.label,
    stage: job.stage,
    state: stateOf(job.id),
  }));
  const choose = (id: string) => {
    setScenarioId(NONE);
    setSelected(id);
  };
  const pick = (id: string) => {
    setScenarioId(id);
    setIndex(0);
    setSelected(undefined);
  };
  const current = view.jobs.find(job => job.id === selected);

  return (
    <div className="architecture pipeline">
      <div className="architecture-tools">
        <label className="architecture-field">
          <span>{copy.scenario}</span>
          <select
            value={scenarioId}
            onChange={event => pick(event.target.value)}
          >
            <option value={NONE}>{copy.free}</option>
            {view.scenarios.map(each => (
              <option key={each.id} value={each.id}>
                {each.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <PipelineGraph
        className="architecture-diagram"
        label={copy.label}
        stages={view.stages}
        jobs={jobs}
        needs={view.needs}
        selected={selected}
        onSelect={choose}
      />
      <ol className="architecture-rows">
        {view.stages.map(stage => (
          <li key={stage.id}>
            <p className="architecture-band">{stage.label}</p>
            <ul>
              {jobs
                .filter(job => job.stage === stage.id)
                .map(job => (
                  <li key={job.id}>
                    <button
                      type="button"
                      className="architecture-chip"
                      data-state={job.state}
                      aria-pressed={job.id === selected}
                      onClick={() => choose(job.id)}
                    >
                      {job.label}
                    </button>
                  </li>
                ))}
            </ul>
          </li>
        ))}
      </ol>
      <div
        className="architecture-panel"
        data-fails={step?.fails ? '' : undefined}
        aria-live="polite"
      >
        {scenario && step ? (
          <>
            <StepPlayer
              count={scenario.steps.length}
              index={index}
              onIndex={setIndex}
              failing={scenario.steps.flatMap((each, at) =>
                each.fails ? [at] : [],
              )}
              copy={copy.player}
            />
            <p className="architecture-panel-title">{step.title}</p>
            <p>{step.text}</p>
            {step.code && (
              <pre className="architecture-code">
                <code>{step.code}</code>
              </pre>
            )}
          </>
        ) : current ? (
          <>
            <p className="architecture-panel-title">
              {current.label}{' '}
              <span className="architecture-panel-kind">
                {
                  // A job's stage is one of the view's.
                  (
                    view.stages.find(stage => stage.id === current.stage) as {
                      label: string;
                    }
                  ).label
                }
              </span>
            </p>
            <p>{current.text}</p>
            {current.workflow && (
              <p className="architecture-meta">
                {copy.definedIn}{' '}
                {current.workflowUrl ? (
                  <ExternalLink
                    href={current.workflowUrl}
                    className="architecture-path"
                  >
                    {current.workflow}
                  </ExternalLink>
                ) : (
                  <code className="architecture-path">{current.workflow}</code>
                )}
              </p>
            )}
            {current.decisions.length > 0 && (
              <p className="architecture-meta pipeline-decisions">
                {copy.decidedIn}{' '}
                {current.decisions.map(decision => (
                  <Link
                    key={decision.href}
                    href={decision.href}
                    className="pipeline-decision"
                  >
                    {decision.label}
                  </Link>
                ))}
              </p>
            )}
          </>
        ) : (
          <p className="architecture-hint">{copy.hint}</p>
        )}
      </div>
    </div>
  );
}
