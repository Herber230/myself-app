import type { TechnologyArea } from '@domain-app/entities/technology-area';
import { SelectMultiple } from '@presentation-core/molecules/select-multiple';
import { ingestCollectionSourceUC } from '@use-cases-generic/ingest-collection-source';
import { useEffect, useState } from 'react';

import type { TechnologyAreaSelectMultipleProps } from './technology-area-select-multiple.types';

export function TechnologyAreaSelectMultiple({
  source,
  selection,
  onChange,
}: TechnologyAreaSelectMultipleProps): JSX.Element {
  const [options, setOptions] = useState<Array<TechnologyArea>>([]);

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
