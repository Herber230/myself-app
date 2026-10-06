import type { CSSProperties, ReactNode } from 'react';

export interface PathState {
  readonly key: string;
  /** Its name under the node: "Revised". */
  readonly label: string;
  /** The number in the node. */
  readonly count: number;
  /** The count as a screen reader hears it: ": 3 records". */
  readonly countLabel: string;
  /** What choosing it shows. */
  readonly panel: ReactNode;
}

/**
 * States on a path, each a node with its count and a panel it shows when
 * chosen. The nodes are radio buttons, so choosing one needs no script: CSS
 * shows the panel in the chosen node's place, with a caret pointing up at it.
 * A state with nothing in it is drawn dashed. One under another in a narrow
 * container.
 */
export function StatePath({
  name,
  legend,
  hint,
  initial,
  states,
}: {
  /** The radio group's name: unique on the page. */
  name: string;
  /** Names the group for a screen reader. */
  legend: string;
  /** Above the path: what choosing a state does. */
  hint: string;
  /** The state chosen at first. */
  initial: string;
  states: readonly PathState[];
}) {
  return (
    <div
      className="state-path"
      style={{ '--path-states': states.length } as CSSProperties}
    >
      <p className="state-path-hint">{hint}</p>
      <fieldset className="state-path-states">
        <legend className="sr-only">{legend}</legend>
        {states.map(state => (
          <label
            key={state.key}
            className="state-path-state"
            data-empty={state.count === 0 ? '' : undefined}
          >
            <input
              type="radio"
              name={name}
              value={state.key}
              defaultChecked={state.key === initial}
            />
            <span className="state-path-node" aria-hidden="true">
              {state.count}
            </span>
            <span className="state-path-name">
              {state.label}
              <span className="sr-only">{state.countLabel}</span>
            </span>
          </label>
        ))}
      </fieldset>
      {states.map((state, index) => (
        <div
          key={state.key}
          className="state-path-panel"
          // Where its caret points: under the state it belongs to.
          style={{ '--at': index } as CSSProperties}
        >
          {state.panel}
        </div>
      ))}
    </div>
  );
}
