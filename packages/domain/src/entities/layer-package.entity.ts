import {
  accessor,
  type Entity,
  entity,
  EntityCollectionLink,
  type EntityId,
  EntityLink,
} from '@entifix/core';

import type { LocalizedText } from '../localized-text.js';
import { PackageLayer } from './package-layer.entity.js';
import { ProjectPath } from './project-path.entity.js';

/**
 * A package, or a group of them, in its layer (ADR 0022): its column across
 * the band (0 to 3; halves sit between), the folder it lives in, and what it
 * may import. Its note is its folder's, unless it has one of its own.
 */
@entity({ key: 'layer-package', domain: 'engineering' })
export class LayerPackage implements Entity {
  #id?: EntityId;
  #label = '';
  #column = 0;
  #note?: LocalizedText;
  #layer = new EntityLink(PackageLayer);
  #folder = new EntityLink(ProjectPath);
  #imports = new EntityCollectionLink(LayerPackage);

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

  @accessor({ type: 'number', required: true })
  get column(): number {
    return this.#column;
  }
  set column(value: number) {
    this.#column = value;
  }

  @accessor({
    type: 'string',
    required: false,
    filterable: false,
    sortable: false,
  })
  get note(): LocalizedText | undefined {
    return this.#note;
  }
  set note(value: LocalizedText | undefined) {
    this.#note = value;
  }

  @accessor({ type: 'link', required: true })
  get layer(): EntityLink<PackageLayer> {
    return this.#layer;
  }

  /** Its folder, when it has one: its row of the file tree. */
  @accessor({ type: 'link' })
  get folder(): EntityLink<ProjectPath> {
    return this.#folder;
  }

  /** What it may import: one arrow each. */
  @accessor({ type: 'linkCollection' })
  get imports(): EntityCollectionLink<LayerPackage> {
    return this.#imports;
  }
}
