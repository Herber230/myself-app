'use client';

import { ExternalLink } from '@myself-app/entifix-incubator-react-controls';
import {
  LayerDiagram,
  type LayerEdge,
} from '@myself-app/entifix-incubator-react-controls/diagrams';
import { useState } from 'react';

export interface LayersBox {
  readonly id: string;
  readonly label: string;
  readonly band: number;
  readonly column: number;
  /** Its folder, relative to the repository root. */
  readonly path?: string;
  readonly note: string;
}

export interface LayersView {
  /** Top first. */
  readonly bands: readonly string[];
  readonly boxes: readonly LayersBox[];
  readonly imports: readonly { readonly from: string; readonly to: string }[];
  readonly refused: readonly {
    readonly from: string;
    readonly to: string;
    readonly reason: string;
  }[];
  /** The project's folders no box names. */
  readonly around: readonly { readonly path: string; readonly note: string }[];
}

export interface PackageLayersCopy {
  readonly label: string;
  readonly hint: string;
  readonly showRefused: string;
  readonly allowed: string;
  readonly refused: string;
  readonly imports: string;
  readonly importedBy: string;
  readonly nothing: string;
  readonly around: string;
  /** A refused import: "{{from}} → {{to}}". */
  readonly pair: string;
}

/**
 * A project's packages in their layers (ADR 0022): the diagram, a switch that
 * draws the imports lint refuses with their reasons, the panel naming the
 * package pointed at, and the folders outside the graph. On a phone, the
 * diagram gives way to the same packages as a list, band by band.
 */
export function PackageLayers({
  view,
  copy,
  baseUrl,
}: {
  view: LayersView;
  copy: PackageLayersCopy;
  /** Where a path is browsed, its path appended. */
  baseUrl?: string;
}) {
  const [active, setActive] = useState<string>();
  const [showRefused, setShowRefused] = useState(false);
  const byId = new Map(view.boxes.map(box => [box.id, box]));
  // Every import names boxes of the view, so each id has a label.
  const labelOf = new Map(view.boxes.map(box => [box.id, box.label]));
  const edges: LayerEdge[] = [
    ...view.imports,
    ...(showRefused
      ? view.refused.map(({ from, to, reason }) => ({
          from,
          to,
          refused: reason,
        }))
      : []),
  ];
  const labels = (ids: readonly string[]) =>
    ids.map(id => labelOf.get(id)).join(', ') || copy.nothing;
  const importsOf = (id: string) =>
    view.imports.filter(edge => edge.from === id).map(edge => edge.to);
  const importedBy = (id: string) =>
    view.imports.filter(edge => edge.to === id).map(edge => edge.from);
  const current = active === undefined ? undefined : byId.get(active);
  const path = (each: string) =>
    baseUrl ? (
      <ExternalLink href={`${baseUrl}${each}`} className="architecture-path">
        {each}
      </ExternalLink>
    ) : (
      <code className="architecture-path">{each}</code>
    );

  return (
    <div className="layers">
      <div className="architecture-tools layers-tools">
        <button
          type="button"
          className="layers-toggle"
          aria-pressed={showRefused}
          onClick={() => setShowRefused(!showRefused)}
        >
          {copy.showRefused}
        </button>
        <span className="layers-legend">
          <span className="layers-key" data-kind="allowed" />
          {copy.allowed}
          <span className="layers-key" data-kind="refused" />
          {copy.refused}
        </span>
      </div>
      <LayerDiagram
        className="layers-diagram"
        label={copy.label}
        bands={view.bands}
        boxes={view.boxes}
        edges={edges}
        active={active}
        onActive={setActive}
      />
      <div className="architecture-panel layers-panel" aria-live="polite">
        {current ? (
          <>
            <p className="architecture-panel-title">
              {current.label}
              {current.path && path(current.path)}
            </p>
            <p>{current.note}</p>
            <p className="architecture-meta layers-relations">
              <span>
                {copy.imports} {labels(importsOf(current.id))}
              </span>
              <span>
                {copy.importedBy} {labels(importedBy(current.id))}
              </span>
            </p>
          </>
        ) : (
          <p className="architecture-hint">{copy.hint}</p>
        )}
        {showRefused && (
          <ul className="layers-refused">
            {view.refused.map(edge => (
              <li key={`${edge.from}>${edge.to}`}>
                <code>
                  {copy.pair
                    .replace('{{from}}', labels([edge.from]))
                    .replace('{{to}}', labels([edge.to]))}
                </code>{' '}
                {edge.reason}
              </li>
            ))}
          </ul>
        )}
      </div>
      <ol className="layers-list">
        {view.bands.map((band, index) => (
          <li key={band}>
            <p className="architecture-band">{band}</p>
            <ul>
              {view.boxes
                .filter(box => box.band === index)
                .map(box => (
                  <li key={box.id} className="layers-list-box">
                    <strong>{box.label}</strong>
                    {box.path && path(box.path)}
                    <span>{box.note}</span>
                    {importsOf(box.id).length > 0 && (
                      <span className="architecture-meta">
                        {copy.imports} {labels(importsOf(box.id))}
                      </span>
                    )}
                  </li>
                ))}
            </ul>
          </li>
        ))}
      </ol>
      {view.around.length > 0 && (
        <div className="layers-around">
          <p className="architecture-band">{copy.around}</p>
          <ul>
            {view.around.map(each => (
              <li key={each.path}>
                {path(each.path)}
                <span>{each.note}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
