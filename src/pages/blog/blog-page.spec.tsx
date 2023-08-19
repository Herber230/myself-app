import { render } from '../../../test/test-utils';
import { BlogPage } from './blog-page';

describe('pages:posts', () => {
  test('It should render', () => {
    expect(() => render(<BlogPage />)).not.toThrow();
  });
});
