'use client';

import {
  ExternalLink,
  HexagonDiagram,
  type HexagonEdge,
  type HexagonNode,
  type HexagonNodeState,
  SegmentedControl,
  StepPlayer,
  type StepPlayerCopy,
} from '@myself-app/entifix-incubator-react-controls';
import { useState } from 'react';

export interface ArchitecturePart {
  readonly id: string;
  readonly label: string;
  readonly ring: string;
  readonly angle: number;
  /** The one place it runs, if only one. */
  readonly runtime?: string;
  readonly text: string;
  /** Where it lives, relative to the repository root. */
  readonly path?: string;
}

export interface ArchitectureStep {
  readonly nodes: readonly string[];
  readonly from?: string;
  readonly to?: string;
  readonly runtime?: string;
  readonly title: string;
  readonly text: string;
  readonly code?: string;
  readonly fails: boolean;
}

export interface ArchitectureView {
  /** The rings, innermost first, named. */
  readonly rings: readonly { readonly id: string; readonly label: string }[];
  readonly runtimes: readonly { readonly id: string; readonly label: string }[];
  readonly parts: readonly ArchitecturePart[];
  readonly connections: readonly {
    readonly from: string;
    readonly to: string;
  }[];
  readonly scenarios: readonly {
    readonly id: string;
    readonly label: string;
    readonly steps: readonly ArchitectureStep[];
  }[];
}

export interface ArchitectureExplorerCopy {
  readonly label: string;
  readonly scenario: string;
  readonly free: string;
  readonly runs: string;
  readonly everywhere: string;
  readonly hint: string;
  readonly livesIn: string;
  readonly player: StepPlayerCopy;
}

/** The switch's value for every runtime: no runtime's id is a single word. */
const EVERYWHERE = 'everywhere';
/** The scenario menu's value for none. */
const NONE = '';

/**
 * A project's ports and adapters (ADR 0022): the hexagon, a switch that fades
 * the adapters of the other runtimes, and scenarios that walk one request
 * through it a step at a time. A part chosen, or the step shown, is told in
 * the panel beneath. On a phone, the rings become rows of the same parts.
 *
 * Everything it shows was translated at build; it keeps only what is chosen.
 */
export function ArchitectureExplorer({
  view,
  copy,
  baseUrl,
}: {
  view: ArchitectureView;
  copy: ArchitectureExplorerCopy;
  /** Where a path is browsed, its path appended. */
  baseUrl?: string;
}) {
  const [selected, setSelected] = useState<string>();
  const [runtime, setRuntime] = useState(EVERYWHERE);
  const [scenarioId, setScenarioId] = useState(NONE);
  const [index, setIndex] = useState(0);
  const scenario = view.scenarios.find(each => each.id === scenarioId);
  const step = scenario?.steps[index];
  const place = step ? (step.runtime ?? EVERYWHERE) : runtime;
  const lit = new Set(step?.nodes ?? []);

  const away = (part: ArchitecturePart) =>
    place !== EVERYWHERE &&
    part.runtime !== undefined &&
    part.runtime !== place;
  const stateOf = (part: ArchitecturePart): HexagonNodeState | undefined =>
    lit.has(part.id)
      ? step?.fails
        ? 'fails'
        : 'lit'
      : away(part)
        ? 'dim'
        : undefined;
  const byId = new Map(view.parts.map(part => [part.id, part]));
  const nodes: HexagonNode[] = view.parts.map(part => ({
    id: part.id,
    label: part.label,
    ring: part.ring,
    angle: part.angle,
    state: stateOf(part),
  }));
  const edges: HexagonEdge[] = view.connections.map(({ from, to }) => ({
    from,
    to,
    travelled:
      step !== undefined &&
      ((step.from === from && step.to === to) ||
        (step.from === to && step.to === from)),
    dim: [from, to].some(id => {
      const part = byId.get(id);
      return part !== undefined && away(part);
    }),
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
  const switchTo = (id: string) => {
    setScenarioId(NONE);
    setRuntime(id);
  };
  const current = selected === undefined ? undefined : byId.get(selected);
  const path = (each: string) =>
    baseUrl ? (
      <ExternalLink href={`${baseUrl}${each}`} className="architecture-path">
        {each}
      </ExternalLink>
    ) : (
      <code className="architecture-path">{each}</code>
    );

  return (
    <div className="architecture">
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
        <div className="architecture-runtime">
          <span aria-hidden="true">{copy.runs}</span>
          <SegmentedControl
            label={copy.runs}
            value={place}
            onChange={switchTo}
            options={[
              { key: EVERYWHERE, label: copy.everywhere },
              ...view.runtimes.map(each => ({
                key: each.id,
                label: each.label,
              })),
            ]}
          />
        </div>
      </div>
      <HexagonDiagram
        className="architecture-diagram"
        label={copy.label}
        rings={view.rings}
        nodes={nodes}
        edges={edges}
        selected={selected}
        onSelect={choose}
      />
      <ol className="architecture-rows">
        {view.rings.map(ring => (
          <li key={ring.id}>
            <p className="architecture-band">{ring.label}</p>
            <ul>
              {nodes
                .filter(node => node.ring === ring.id)
                .map(node => (
                  <li key={node.id}>
                    <button
                      type="button"
                      className="architecture-chip"
                      data-state={node.state}
                      aria-pressed={node.id === selected}
                      onClick={() => choose(node.id)}
                    >
                      {node.label}
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
                  // A part's ring is one of the view's.
                  (
                    view.rings.find(ring => ring.id === current.ring) as {
                      label: string;
                    }
                  ).label
                }
              </span>
            </p>
            <p>{current.text}</p>
            {current.path && (
              <p className="architecture-meta">
                {copy.livesIn} {path(current.path)}
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
