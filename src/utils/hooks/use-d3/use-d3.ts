import { select } from 'd3';
import { useEffect, useRef } from 'react';

export type ChartRenderer = (svgNode: ReturnType<typeof select>) => void;

export const useD3 = (chartRenderer: ChartRenderer) => {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = select(ref.current) as unknown as ReturnType<typeof select>;
    chartRenderer(svg);

    return () => {
      svg.selectAll('*').remove();
    };
  }, [chartRenderer]);

  return ref;
};
