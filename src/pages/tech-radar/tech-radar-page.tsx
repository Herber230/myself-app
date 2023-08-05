import styled from '@emotion/styled';
import { technologyAreaHardcodedAdapter } from '@implementation/hardcoded-adapters/technology-area-adapter';
import { technologyStageHardcodedAdapter } from '@implementation/hardcoded-adapters/technology-stage-adapter';
import { parseTechRadarRingsDefinition } from '@implementation/presentation-helpers';
import {
  TechRadar,
  TRRingDefinition,
} from '@presentation-app/organisms/tech-radar';
import { TechnologySearchPanel } from '@presentation-app/organisms/technology-search-panel';
import { NavigationWithBody } from '@presentation-app/templates';
import { useObjectReducer } from '@utils/hooks/use-object-reducer';
import { useEffect, useState } from 'react';

import type { TechRadarPageSearch } from './tech-radar-page.types';
import { areas, entries } from './temp';

const initialSearch: TechRadarPageSearch = {
  areaSelection: [],
  stageSelection: [],
};

const StyledTechRadarContainer = styled.div`
  position: relative;
  border: 2px solid red;

  > div {
    position: relative;
  }
`;

export function TechRadarPage(): JSX.Element {
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

  const [search, dispatchSearch] = useObjectReducer(initialSearch);

  return (
    <NavigationWithBody>
      <TechnologySearchPanel
        areaSource={technologyAreaHardcodedAdapter}
        stageSource={technologyStageHardcodedAdapter}
        state={search}
        onChange={newSearch => dispatchSearch({ op: 'set', with: newSearch })}
      />
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
    </NavigationWithBody>
  );
}
