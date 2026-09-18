import {
  ConfigurationRepositoryTag,
  createEntityLinkResolver,
  type EntityLinkResolverTag,
  type EntityRepository,
  EntityRepositoryTag,
} from '@entifix/business';
import {
  type ConfigurationClient,
  ConfigurationClientInMemory,
  type Entity,
  type EntityConstructor,
} from '@entifix/core';
import { Context } from 'effect';

/** One entity, and the static repository that serves it. */
export type StaticRepositoryRegistration = readonly [
  EntityConstructor<Entity>,
  EntityRepository,
];

/**
 * An `EntityLinkResolver` over static repositories, so an id in a JSON record
 * resolves to the record it names.
 *
 * `createEntityLinkResolver` is entifix's own and takes any `EntityRepository`,
 * so this is only the wiring: it puts each repository behind the tag the
 * resolver reads it through, and hands over one configuration store.
 */
export function makeStaticLinkResolver(
  registrations: ReadonlyArray<StaticRepositoryRegistration>,
  // Empty by default. A static source reads no base URL, but the port leaves
  // `ConfigurationRepositoryTag` on every method's requirement channel — real
  // adapters read theirs from it — so something has to discharge it.
  configuration: ConfigurationClient = new ConfigurationClientInMemory({}),
): Context.Context<EntityLinkResolverTag> {
  return createEntityLinkResolver(
    Context.make(ConfigurationRepositoryTag, configuration),
    registrations.map(
      ([entityConstructor, repository]) =>
        [
          entityConstructor,
          Context.make(EntityRepositoryTag, repository),
        ] as const,
    ),
  );
}
