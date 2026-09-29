/**
 * What each ring of a radar means, innermost first: its name beside it.
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
    <dl className="m-0 grid grid-cols-[max-content_1fr] gap-x-m gap-y-2xs">
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
