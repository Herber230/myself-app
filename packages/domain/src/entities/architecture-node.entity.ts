import {
  accessor,
  type Entity,
  entity,
  EntityCollectionLink,
  type EntityId,
  EntityLink,
} from '@entifix/core';

import type { LocalizedText } from '../localized-text.js';
import { ArchitectureRuntime } from './architecture-runtime.entity.js';
import { Project } from './project.entity.js';

/** The hexagon's rings, from the centre out. */
export const ARCHITECTURE_RINGS = ['domain', 'ports', 'adapters'] as const;

export type ArchitectureRing = (typeof ARCHITECTURE_RINGS)[number];

/**
 * A part of a project's hexagon (ADR 0022): an entity or use case at its
 * centre, a port around it, or an adapter outside. `angle` places it on its
 * ring, in degrees clockwise from three o'clock; `connects` draws its lines.
 */
@entity({ key: 'architecture-node', domain: 'engineering' })
export class ArchitectureNode implements Entity {
  #id?: EntityId;
  #label = '';
  #ring: ArchitectureRing = 'domain';
  #angle = 0;
  #text?: LocalizedText;
  #path?: string;
  #project = new EntityLink(Project);
  #runtime = new EntityLink(ArchitectureRuntime);
  #connects = new EntityCollectionLink(ArchitectureNode);

  @accessor({ type: 'id' })
  get id(): EntityId {
    return this.#id;
  }
  set id(value: EntityId) {
    this.#id = value;
  }

  /** Its name as the code writes it, in every language. */
  @accessor({ type: 'string', required: true })
  get label(): string {
    return this.#label;
  }
  set label(value: string) {
    this.#label = value;
  }

  @accessor({
    type: 'enum',
    enumValues: ARCHITECTURE_RINGS,
    required: true,
    filterable: true,
  })
  get ring(): ArchitectureRing {
    return this.#ring;
  }
  set ring(value: ArchitectureRing) {
    this.#ring = value;
  }

  @accessor({ type: 'number', required: true })
  get angle(): number {
    return this.#angle;
  }
  set angle(value: number) {
    this.#angle = value;
  }

  @accessor({
    type: 'string',
    required: true,
    filterable: false,
    sortable: false,
  })
  get text(): LocalizedText | undefined {
    return this.#text;
  }
  set text(value: LocalizedText | undefined) {
    this.#text = value;
  }

  /** Where it lives, relative to the repository root. */
  @accessor({ type: 'string' })
  get path(): string | undefined {
    return this.#path;
  }
  set path(value: string | undefined) {
    this.#path = value;
  }

  @accessor({ type: 'link', required: true })
  get project(): EntityLink<Project> {
    return this.#project;
  }

  /** The one place it runs, if it runs in only one. */
  @accessor({ type: 'link' })
  get runtime(): EntityLink<ArchitectureRuntime> {
    return this.#runtime;
  }

  /** The parts it calls or plugs into: one line each. */
  @accessor({ type: 'linkCollection' })
  get connects(): EntityCollectionLink<ArchitectureNode> {
    return this.#connects;
  }
}
