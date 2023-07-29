import { SelectMultiple } from '@presentation-core/molecules/select-multiple';

import { TechnologyAreaSelectMultipleProps } from './technology-area-select-multiple.types';

export function TechnologyAreaSelectMultiple(
  props: TechnologyAreaSelectMultipleProps,
): JSX.Element {
  return (
    <div>
      <SelectMultiple {...props} />
    </div>
  );
}
