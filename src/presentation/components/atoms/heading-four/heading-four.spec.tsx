import { render } from '../../../../../test/test-utils';
import { HeadingFour } from './heading-four';

describe('presentation:components:atoms:heading-four', () => {
  test('It should render a heading', () => {
    const { getByText } = render(<HeadingFour>HeadingText</HeadingFour>);
    expect(getByText('HeadingText')).toBeInTheDocument();
  });
});
