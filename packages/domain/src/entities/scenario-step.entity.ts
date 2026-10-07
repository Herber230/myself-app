import {
  accessor,
  type Entity,
  entity,
  EntityCollectionLink,
  type EntityId,
  EntityLink,
} from '@entifix/core';

import type { LocalizedText } from '../localized-text.js';
import { ArchitectureNode } from './architecture-node.entity.js';
import { ArchitectureRuntime } from './architecture-runtime.entity.js';
import { ArchitectureScenario } from './architecture-scenario.entity.js';

/**
 * A step of a scenario (ADR 0022): the parts it lights, the line it travels
 * (`from` → `to`, one of the hexagon's), where it runs, what happens, and
 * the code that does it. `fails` marks the step where things go wrong.
 */
@entity({ key: 'scenario-step', domain: 'engineering' })
export class ScenarioStep implements Entity {
  #id?: EntityId;
  #order = 0;
  #title?: LocalizedText;
  #text?: LocalizedText;
  #code?: string;
  #fails = false;
  #scenario = new EntityLink(ArchitectureScenario);
  #nodes = new EntityCollectionLink(ArchitectureNode);
  #from = new EntityLink(ArchitectureNode);
  #to = new EntityLink(ArchitectureNode);
  #runtime = new EntityLink(ArchitectureRuntime);

  @accessor({ type: 'id' })
  get id(): EntityId {
    return this.#id;
  }
  set id(value: EntityId) {
    this.#id = value;
  }

  @accessor({ type: 'number', required: true, sortable: true })
  get order(): number {
    return this.#order;
  }
  set order(value: number) {
    this.#order = value;
  }

  @accessor({
    type: 'string',
    required: true,
    filterable: false,
    sortable: false,
  })
  get title(): LocalizedText | undefined {
    return this.#title;
  }
  set title(value: LocalizedText | undefined) {
    this.#title = value;
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

  /** One line of code, as written: never translated. */
  @accessor({ type: 'string' })
  get code(): string | undefined {
    return this.#code;
  }
  set code(value: string | undefined) {
    this.#code = value;
  }

  @accessor({ type: 'boolean' })
  get fails(): boolean {
    return this.#fails;
  }
  set fails(value: boolean) {
    this.#fails = value;
  }

  @accessor({ type: 'link', required: true })
  get scenario(): EntityLink<ArchitectureScenario> {
    return this.#scenario;
  }

  @accessor({ type: 'linkCollection', required: true })
  get nodes(): EntityCollectionLink<ArchitectureNode> {
    return this.#nodes;
  }

  @accessor({ type: 'link' })
  get from(): EntityLink<ArchitectureNode> {
    return this.#from;
  }

  @accessor({ type: 'link' })
  get to(): EntityLink<ArchitectureNode> {
    return this.#to;
  }

  @accessor({ type: 'link' })
  get runtime(): EntityLink<ArchitectureRuntime> {
    return this.#runtime;
  }
}
