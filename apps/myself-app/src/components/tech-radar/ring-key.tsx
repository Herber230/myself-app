/**
 * What each ring means on a one-person radar (#39, ADR 0014), innermost first.
 * The names are the chart's, from the catalog; the meanings are content.
 */
import { Text } from '@entifix/react-controls/primitives';

export interface RingKeyProps {
  readonly rings: readonly {
    readonly name: string;
    readonly meaning: string;
  }[];
}

export function RingKey({ rings }: RingKeyProps) {
  return (
    <dl className="radar-ring-key m-0 grid gap-x-m gap-y-2xs">
      {rings.map(ring => (
        <div key={ring.name} className="contents">
          <Text as="dt" weight="semibold">
            {ring.name}
          </Text>
          <Text as="dd" muted className="m-0">
            {ring.meaning}
          </Text>
        </div>
      ))}
    </dl>
  );
}
