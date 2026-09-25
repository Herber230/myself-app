import { EntityCollectionLink, EntityLink } from '@entifix/core';

/**
 * A member as the Mongo adapter stores it, and so as its queries see it: a
 * link is its target's id, a collection link the list of their ids.
 *
 * A deserialized entity holds an `EntityLink` or `EntityCollectionLink`
 * instead, which no operator can compare — `eq` against an id is never
 * `true` for an object — so every filter and sort reads a member through this
 * first (#66). Anything else comes back as it was.
 */
export function plainValue(value: unknown): unknown {
  if (value instanceof EntityLink) return value.id;
  if (value instanceof EntityCollectionLink) return value.ids;
  return value;
}
