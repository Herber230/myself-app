/**
 * The diagrams (ADR 0022, 0023): a hexagon, packages in layers, a pipeline,
 * and the player that walks their scenarios. An entry of their own, apart
 * from the main one: a page that imports any control from the main entry
 * shares its client chunk, and these would ride along on every such page —
 * the CV among them — though only a project's page draws them.
 */
export * from './ui/molecules/step-player/index.js';
export * from './ui/organisms/hexagon-diagram/index.js';
export * from './ui/organisms/layer-diagram/index.js';
export * from './ui/organisms/pipeline-graph/index.js';
