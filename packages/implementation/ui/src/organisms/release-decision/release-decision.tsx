'use client';

import { Switch } from '@myself-app/entifix-incubator-react-controls';
import { useEffect, useId, useState } from 'react';

import {
  changelogEntry,
  commitLine,
  levelOf,
  nextVersion,
  type ReleaseDecisionPolicy,
} from './release-rules.js';

export interface ReleaseDecisionCopy {
  readonly title: string;
  readonly lead: string;
  readonly type: string;
  readonly breaking: string;
  readonly description: string;
  /** The description the form starts with. */
  readonly example: string;
  readonly commit: string;
  readonly next: string;
  /** "{{from}} → {{to}}, a {{level}} release". */
  readonly bump: string;
  readonly levels: Readonly<Record<'major' | 'minor' | 'patch', string>>;
  readonly none: string;
  readonly deploys: string;
  readonly yes: string;
  readonly no: string;
  readonly changelog: string;
  readonly hidden: string;
}

/** Today, as the changelog writes a release's date. */
function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * What a squash commit would release (ADR 0023): pick its type, mark it
 * breaking, write its description, and see the next version, whether it
 * deploys, and the notes it would add to `CHANGELOG.md` — all from the
 * repository's own release config, read at build.
 */
export function ReleaseDecision({
  policy,
  copy,
}: {
  policy: ReleaseDecisionPolicy;
  copy: ReleaseDecisionCopy;
}) {
  const id = useId();
  const [type, setType] = useState(policy.types[0]?.type ?? 'feat');
  const [breaking, setBreaking] = useState(false);
  const [description, setDescription] = useState(copy.example);
  // The day is the reader's, read after hydration: the build's would be stale.
  const [date, setDate] = useState('YYYY-MM-DD');
  useEffect(() => setDate(today()), []);

  const commit = { type, breaking, description: description || copy.example };
  const level = levelOf(policy, commit);
  const entry = changelogEntry(policy, commit, date);

  return (
    <div className="release">
      <div className="release-head">
        <p className="architecture-panel-title">{copy.title}</p>
        <p className="architecture-meta">{copy.lead}</p>
      </div>
      <div className="release-form">
        <label className="architecture-field" htmlFor={`${id}-type`}>
          <span>{copy.type}</span>
          <select
            id={`${id}-type`}
            value={type}
            onChange={event => setType(event.target.value)}
          >
            {policy.types.map(each => (
              <option key={each.type} value={each.type}>
                {each.type}
              </option>
            ))}
          </select>
        </label>
        <Switch
          checked={breaking}
          onChange={event => setBreaking(event.target.checked)}
        >
          {copy.breaking}
        </Switch>
        <label className="architecture-field release-description">
          <span>{copy.description}</span>
          <input
            type="text"
            value={description}
            onChange={event => setDescription(event.target.value)}
          />
        </label>
      </div>
      <dl className="release-result" aria-live="polite">
        <div>
          <dt>{copy.commit}</dt>
          <dd>
            <code>{commitLine(commit)}</code>
          </dd>
        </div>
        <div>
          <dt>{copy.next}</dt>
          <dd data-level={level}>
            {level
              ? copy.bump
                  .replace('{{from}}', policy.version)
                  .replace('{{to}}', nextVersion(policy.version, level))
                  .replace('{{level}}', copy.levels[level])
              : copy.none}
          </dd>
        </div>
        <div>
          <dt>{copy.deploys}</dt>
          <dd>{level ? copy.yes : copy.no}</dd>
        </div>
      </dl>
      <div className="release-changelog">
        <p className="architecture-band">{copy.changelog}</p>
        {entry ? (
          <pre className="architecture-code">
            <code>{entry}</code>
          </pre>
        ) : (
          <p className="architecture-meta">{copy.hidden}</p>
        )}
      </div>
    </div>
  );
}
