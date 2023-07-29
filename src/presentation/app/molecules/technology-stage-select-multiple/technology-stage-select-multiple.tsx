import { SelectMultiple } from '@presentation-core/molecules/select-multiple';

import { TechnologyStageSelectMultipleProps } from './technology-stage-select-multiple.types';

export function TechnologyStageSelectMultiple(
  props: TechnologyStageSelectMultipleProps,
): JSX.Element {
  return (
    <div>
      <SelectMultiple {...props} />
    </div>
  );
}
