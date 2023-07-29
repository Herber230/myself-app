import { select } from 'd3';
import { useEffect, useRef } from 'react';

export type ChartRenderer = (svgNode: ReturnType<typeof select>) => void;
export type Dependecies = Array<unknown>;

export const useD3 = (chartRenderer: ChartRenderer) => {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    chartRenderer(select(ref.current) as unknown as ReturnType<typeof select>);
  }, [chartRenderer]);

  return ref;
};
