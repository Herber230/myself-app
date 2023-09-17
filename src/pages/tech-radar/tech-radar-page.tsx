import { technologyHardcodedAdapter } from '@implementation/hardcoded-adapters/technology-adapter';
import { technologyAreaHardcodedAdapter } from '@implementation/hardcoded-adapters/technology-area-adapter';
import { technologyStageHardcodedAdapter } from '@implementation/hardcoded-adapters/technology-stage-adapter';
import { TechRadar } from '@presentation-app/organisms/tech-radar';
import { TechnologySearchPanel } from '@presentation-app/organisms/technology-search-panel';
import { NavigationWithBody } from '@presentation-app/templates';
import { useObjectReducer } from '@utils/hooks/use-object-reducer';

import type { TechRadarPageSearch } from './tech-radar-page.types';

const initialSearch: TechRadarPageSearch = {
  areaSelection: [],
  stageSelection: [],
};

export function TechRadarPage(): JSX.Element {
  const [search, dispatchSearch] = useObjectReducer(initialSearch);

  return (
    <NavigationWithBody>
      <TechnologySearchPanel
        areaSource={technologyAreaHardcodedAdapter}
        stageSource={technologyStageHardcodedAdapter}
        state={search}
        onChange={newSearch => {
          dispatchSearch({ op: 'set', with: newSearch });
        }}
      />
      <TechRadar
        areas={search.areaSelection}
        stages={search.stageSelection}
        technologySource={technologyHardcodedAdapter}
      />
    </NavigationWithBody>
  );
}
