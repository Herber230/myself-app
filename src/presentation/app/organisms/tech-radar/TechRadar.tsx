import styled from '@emotion/styled';
import { useD3 } from '@utils/hooks/use-d3';

import { renderRadar } from './renderRadar';
import type { TechRadarProps } from './TechRadar.types';

const StyledMainContainer = styled.div`
  position: relative;
  border: 2px solid blue;
`;

export function TechRadar({
  entries,
  ringsDefinition,
  areas,
}: TechRadarProps): JSX.Element {
  const ref = useD3((svg) => renderRadar(svg, entries, ringsDefinition, areas));

  return (
    <StyledMainContainer>
      <svg ref={ref} />
    </StyledMainContainer>
  );
}
