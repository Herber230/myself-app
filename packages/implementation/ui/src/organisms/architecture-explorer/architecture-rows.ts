/**
 * What the architecture explorer shows of a project's hexagon, translated at
 * build (ADR 0022).
 */
import type { Entity, EntityLink } from '@entifix/core';
import {
  ARCHITECTURE_RINGS,
  localize,
  type LocalizedText,
} from '@myself-app/domain';
import type { ProjectArchitecture } from '@myself-app/domain/use-cases';
import { targetsOf } from '@myself-app/entifix-incubator-static-adapter';

import type { siteT } from '../../i18n/server.js';
import type { SiteLocale } from '../../routing/site-locales.js';
import type {
  ArchitectureExplorerCopy,
  ArchitectureView,
} from './architecture-explorer.js';

type T = ReturnType<typeof siteT>;

/** An optional link's id, or nothing when it names none. */
function idOf<E extends Entity>(link: EntityLink<E>): string | undefined {
  return link.id === undefined ? undefined : String(link.id);
}

/**
 * The hexagon as the explorer draws it: its rings named, each part with its
 * runtime and text, one connection per line (each pair once), and the
 * scenarios with their steps. Validation requires every localized text.
 */
export function architectureViewOf(
  architecture: ProjectArchitecture,
  locale: SiteLocale,
  t: T,
): ArchitectureView {
  const text = (value: LocalizedText | undefined) =>
    localize(value as LocalizedText, locale);
  const seen = new Set<string>();
  const connections = architecture.nodes.flatMap(node =>
    targetsOf(node.connects).flatMap(target => {
      const [from, to] = [String(node.id), String(target.id)];
      const pair = [from, to].sort().join('>');
      if (seen.has(pair)) return [];
      seen.add(pair);
      return [{ from, to }];
    }),
  );
  return {
    rings: ARCHITECTURE_RINGS.map(ring => ({
      id: ring,
      label: t(`projectPage.hexagon.rings.${ring}`),
    })),
    runtimes: architecture.runtimes.map(runtime => ({
      id: String(runtime.id),
      label: text(runtime.label),
    })),
    parts: architecture.nodes.map(node => ({
      id: String(node.id),
      label: node.label,
      ring: node.ring,
      angle: node.angle,
      ...(idOf(node.runtime) && { runtime: idOf(node.runtime) }),
      text: text(node.text),
      ...(node.path && { path: node.path }),
    })),
    connections,
    scenarios: architecture.scenarios.map(({ scenario, steps }) => ({
      id: String(scenario.id),
      label: text(scenario.label),
      steps: steps.map(step => ({
        nodes: targetsOf(step.nodes).map(node => String(node.id)),
        ...(idOf(step.from) && { from: idOf(step.from) }),
        ...(idOf(step.to) && { to: idOf(step.to) }),
        ...(idOf(step.runtime) && { runtime: idOf(step.runtime) }),
        title: text(step.title),
        text: text(step.text),
        ...(step.code && { code: step.code }),
        fails: step.fails,
      })),
    })),
  };
}

/** The explorer's own words. */
export function architectureCopyOf(t: T): ArchitectureExplorerCopy {
  return {
    label: t('projectPage.hexagon.label'),
    scenario: t('projectPage.hexagon.scenario'),
    free: t('projectPage.hexagon.free'),
    runs: t('projectPage.hexagon.runs'),
    everywhere: t('projectPage.hexagon.everywhere'),
    hint: t('projectPage.hexagon.hint'),
    livesIn: t('projectPage.hexagon.livesIn'),
    player: {
      // `count` is i18next's plural option: the catalog says `total`.
      step: t('projectPage.hexagon.step', { n: '{{n}}', total: '{{count}}' }),
      previous: t('projectPage.hexagon.previous'),
      next: t('projectPage.hexagon.next'),
      play: t('projectPage.hexagon.play'),
      pause: t('projectPage.hexagon.pause'),
      restart: t('projectPage.hexagon.restart'),
    },
  };
}
