import styled from '@emotion/styled';
import { useD3 } from '@utils/hooks/use-d3';
import { useElementSize } from 'usehooks-ts';

import type { RadarProps } from './radar.types';
import { renderRadar } from './svg-lib/render-radar';

const StyledMainContainer = styled.div`
  position: relative;
  border: ${({ theme }) => theme.border.line.sm};
`;

export function Radar({
  entries,
  ringsDefinition,
  areas,
}: RadarProps): JSX.Element {
  const [containerRef, { width: containerWidth }] = useElementSize();

  const ref = useD3(
    svg =>
      areas.length === 4 &&
      renderRadar(svg, entries, ringsDefinition, areas, {
        size: containerWidth - 4, // 4 is related to borders
      }),
  );

  return (
    <StyledMainContainer ref={containerRef}>
      <svg ref={ref} />
    </StyledMainContainer>
  );
}
