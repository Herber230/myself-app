import styled from '@emotion/styled';
import { TechnologyAreaSelectMultiple } from '@presentation-app/molecules/technology-area-select-multiple';
import { TechnologyStageSelectMultiple } from '@presentation-app/molecules/technology-stage-select-multiple';
import { Button } from '@presentation-core/atoms/button';
import { HeadingFive } from '@presentation-core/atoms/heading-five';
import { Paragraph } from '@presentation-core/atoms/paragraph';
import { useObjectReducer } from '@utils/hooks/use-object-reducer';

import {
  TechnologySearchPanelProps,
  TechnologySearchPanelState,
} from './technology-search-panel.types';

const StyledTechnologySearchPanel = styled.div`
  border: ${({ theme }) => theme.border.line.sm};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  padding: ${({ theme }) => theme.spacing(3)};

  > h5 {
    margin-bottom: ${({ theme }) => theme.spacing(3)};
  }

  > div {
    display: flex;
    margin-bottom: ${({ theme }) => theme.spacing(3)};
    justify-content: center;

    > div {
      flex: 1;
      margin-right: ${({ theme }) => theme.spacing(3)};
      :last-child {
        margin-right: 0;
      }
    }

    > button {
      margin-right: ${({ theme }) => theme.spacing(3)};
      :last-child {
        margin-right: 0;
      }
    }
  }
`;

export function TechnologySearchPanel({
  areaSource,
  stageSource,
  state,
  onChange,
}: TechnologySearchPanelProps): JSX.Element {
  const [internalState, internalDispatch] =
    useObjectReducer<TechnologySearchPanelState>(state);

  const handleReset = () =>
    onChange({
      stageSelection: [],
      areaSelection: [],
    });

  const handleApply = () => onChange(internalState);

  return (
    <StyledTechnologySearchPanel>
      <HeadingFive>Search Technologies</HeadingFive>
      <div>
        <div>
          <Paragraph>Technology Areas</Paragraph>
          <TechnologyAreaSelectMultiple
            source={areaSource}
            selection={internalState.areaSelection}
            onChange={areaSelection =>
              internalDispatch({
                op: 'update',
                with: { areaSelection },
              })
            }
          />
        </div>
        <div>
          <Paragraph>Technology Stages</Paragraph>
          <TechnologyStageSelectMultiple
            source={stageSource}
            selection={internalState.stageSelection}
            onChange={stageSelection =>
              internalDispatch({
                op: 'update',
                with: { stageSelection },
              })
            }
          />
        </div>
      </div>
      <div>
        <Button type="button" onClick={handleReset}>
          Reset
        </Button>
        <Button type="button" onClick={handleApply}>
          Apply
        </Button>
      </div>
    </StyledTechnologySearchPanel>
  );
}
