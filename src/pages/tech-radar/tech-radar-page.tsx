import { retrieveEntitySet } from '@domain/use-cases';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { technologyStageHardcodedAdapter } from '@implementation/hardcoded-adapters';
import { parseTechRadarRingsDefinition } from '@implementation/presentation-helpers';
import {
  TechRadar,
  TRRingDefinition,
} from '@presentation-app/organisms/tech-radar';
import { TechnologySearchPanel } from '@presentation-app/organisms/technology-search-panel';
import { NavigationWithBody } from '@presentation-app/templates';
import { useBodyBackgroundColor } from '@utils/hooks';
import { useEffect, useState } from 'react';

import {
  allTechnologyAreas,
  allTechnologyStages,
  areas,
  entries,
  selectedTechnologyAreas,
  selectedTechnologyStages,
} from './temp';

const StyledTechRadarContainer = styled.div`
  position: relative;
  border: 2px solid red;

  > div {
    position: relative;
  }
`;

export function TechRadarPage(): JSX.Element {
  const theme = useTheme();
  useBodyBackgroundColor(theme.colors.white);

  const [techRadarRingsDefinition, setTechRadarRingsDefinition] = useState<
    TRRingDefinition[]
  >([]);

  useEffect(() => {
    // retrieveEntitySet(technologyStageHardcodedAdapter)
    //   .then((result) => {
    //     setTechRadarRingsDefinition(parseTechRadarRingsDefinition(result));
    //   })
    //   .catch((error) => {
    //     console.error(error);
    //   });
  }, []);

  return (
    <NavigationWithBody>
      <StyledTechRadarContainer>
        {techRadarRingsDefinition.length > 0 && (
          <div>
            <TechRadar
              entries={entries}
              ringsDefinition={techRadarRingsDefinition}
              areas={areas}
            />
          </div>
        )}
      </StyledTechRadarContainer>
      <br />
      <br />
      <br />
      <TechnologySearchPanel
        stageProps={{
          selection: selectedTechnologyStages,
          options: allTechnologyStages,
          keyProperty: 'id',
          displayProperty: 'name',
          onChange: () => {},
        }}
        areaProps={{
          selection: selectedTechnologyAreas,
          options: allTechnologyAreas,
          keyProperty: 'id',
          displayProperty: 'name',
          onChange: () => {},
        }}
      />
    </NavigationWithBody>
  );
}
