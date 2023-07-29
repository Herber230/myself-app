import { render } from '../../../../../test/test-utils';
import { ScrollDownIndicator } from './scroll-down-indicator';

describe('presentation:components:atoms:scroll-down-indicator', () => {
  test('It should render', () => {
    expect(() => render(<ScrollDownIndicator />)).not.toThrow();
  });
});
