import type { TechnologyStage } from '@domain-app/entities/technology-stage';
import { SelectMultiple } from '@presentation-core/molecules/select-multiple';
import { ingestCollectionSourceUC } from '@use-cases-generic/ingest-collection-source';
import { useEffect, useState } from 'react';

import type { TechnologyStageSelectMultipleProps } from './technology-stage-select-multiple.types';

export function TechnologyStageSelectMultiple({
  source,
  selection,
  onChange,
}: TechnologyStageSelectMultipleProps): JSX.Element {
  const [options, setOptions] = useState<Array<TechnologyStage>>([]);

  useEffect(() => {
    // TODO: handle errors
    ingestCollectionSourceUC(source).then(setOptions);
  }, [source]);

  return (
    <SelectMultiple
      keyProperty="id"
      displayProperty="name"
      options={options}
      selection={selection}
      onChange={onChange}
    />
  );
}
