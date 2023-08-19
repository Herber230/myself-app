import { Radar } from '@presentation-core/organisms/radar';
import { ingestCollectionSourceUC } from '@use-cases-generic/ingest-collection-source';
import { useEffect, useReducer } from 'react';

import {
  createFilters,
  initialState,
  parseAreas,
  parseEntries,
  parseRings,
} from './lib';
import type {
  TechRadarProps,
  TechRadarState,
  TechRadarStateUpdate,
} from './tech-radar.types';

//TODO: Validate that radar only render 4 quadrants
const reducer = (_: TechRadarState, payload: TechRadarStateUpdate) => {
  const radarAreas = parseAreas(payload.areas);
  const radarRings = parseRings(payload.stages);
  const radarEntries = parseEntries(
    payload.areas,
    payload.stages,
    payload.technologies,
  );
  const newState: TechRadarState = {
    ...payload,
    radarEntries,
    radarRings,
    radarAreas,
    ready: [radarRings, radarAreas, radarEntries].every(x => x.length > 0),
  };

  return newState;
};

export function TechRadar({
  areas,
  stages,
  technologySource,
}: TechRadarProps): JSX.Element {
  const [state, updateState] = useReducer(reducer, initialState);

  useEffect(() => {
    ingestCollectionSourceUC(technologySource, {
      filters: createFilters(areas, stages),
    }).then(technologies =>
      updateState({
        technologies,
        areas,
        stages,
      }),
    );
  }, [areas, stages, technologySource]);

  return state.ready ? (
    <Radar
      ringsDefinition={state.radarRings}
      areas={state.radarAreas}
      entries={state.radarEntries}
    />
  ) : (
    <></>
  );
}
