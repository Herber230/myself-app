import { render } from '../../../../../test/test-utils';
import { NavigationBar } from './navigation-bar';

describe('presentation:components:organisms:navigation-bar', () => {
  test('It should render the NavigationBar without throwing any error', () => {
    expect(() => render(<NavigationBar />)).not.toThrow();
  });
});
