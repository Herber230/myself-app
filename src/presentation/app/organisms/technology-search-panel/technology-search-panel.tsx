import styled from '@emotion/styled';
import { TechnologyAreaSelectMultiple } from '@presentation-app/molecules/technology-area-select-multiple';
import { TechnologyStageSelectMultiple } from '@presentation-app/molecules/technology-stage-select-multiple';

import { TechnologySearchPanelProps } from './technology-search-panel.types';

const StyledTechnologySearchPanel = styled.div`
  display: flex;
`;

export function TechnologySearchPanel({
  areaProps,
  stageProps,
}: TechnologySearchPanelProps): JSX.Element {
  return (
    <StyledTechnologySearchPanel>
      <TechnologyAreaSelectMultiple {...areaProps} />
      <TechnologyStageSelectMultiple {...stageProps} />
    </StyledTechnologySearchPanel>
  );
}
