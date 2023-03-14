import { render } from '../../../../test/test-utils';
import { CareerPage } from './career-page';

describe('presentation:pages:career', () => {
  test('It should render the component without throwing any error', () => {
    expect(() => render(<CareerPage />)).not.toThrow();
  });
});
