import { render } from '@testing-library/react';

import { PostsPage } from './posts-page';

describe('pages:posts', () => {
  test('It should render', () => {
    const { getByText } = render(<PostsPage />);
    expect(getByText('Posts Page!!!')).toBeInTheDocument();
  });
});
