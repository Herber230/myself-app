import { render } from '../../../../test/test-utils';
import { TechRadarPage } from './tech-radar-page';

describe('presentation:pages:tech-radar', () => {
  test('It should render the component without throwing any error', () => {
    expect(() => render(<TechRadarPage />)).not.toThrow();
  });
});
