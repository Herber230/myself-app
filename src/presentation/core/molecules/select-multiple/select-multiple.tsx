import { useTheme } from '@emotion/react';
import { DropDownPanel } from '@presentation-core/atoms/drop-down-panel';
import { useState } from 'react';

import {
  DropDownButton,
  DropDownContainer,
  DropDownOptions,
  MainContainer,
  SearchInput,
  SelectionChips,
} from './select-multiple.sections';
import { SelectMultipleProps } from './select-multiple.types';

//TODO: Implement theme parameters
export function SelectMultiple<TOption>({
  keyProperty,
  displayProperty,
  options,
  selection,
  onChange,
  palette = 'primary',
}: SelectMultipleProps<TOption>): JSX.Element {
  const theme = useTheme();
  const [dropDownOpen, setDropDownOpen] = useState(false);
  const [search, setSearch] = useState('');

  const radius = theme.border.radius.md;

  const handleRemove = () => {};

  return (
    <MainContainer>
      <SelectionChips
        keyProperty={keyProperty}
        displayProperty={displayProperty}
        selection={selection}
        onRemove={handleRemove}
      />
      <DropDownButton
        onClick={() => setDropDownOpen(true)}
        palette={palette}
        radius={radius}
      />
      <DropDownContainer>
        <DropDownPanel
          open={dropDownOpen}
          onClose={() => setDropDownOpen(false)}
        >
          <SearchInput
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <DropDownOptions
            keyProperty={keyProperty}
            displayProperty={displayProperty}
            options={options}
          />
        </DropDownPanel>
      </DropDownContainer>
    </MainContainer>
  );
}
