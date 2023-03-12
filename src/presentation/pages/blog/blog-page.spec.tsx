import { render } from '../../../../test/test-utils';
import { BlogPage } from './blog-page';

describe('pages:posts', () => {
  test('It should render', () => {
    const { getByText } = render(<BlogPage />);
    expect(getByText('Blog Page!!!')).toBeInTheDocument();
  });
});
