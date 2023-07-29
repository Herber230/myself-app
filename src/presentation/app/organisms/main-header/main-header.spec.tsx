import { render } from '../../../../../test/test-utils';
import { MainHeader } from './main-header';

describe('presentation:components:organisms:main-header', () => {
  test('It should render the component without throwing any error', () => {
    expect(() => render(<MainHeader />)).not.toThrow();
  });
});
