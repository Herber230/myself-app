import { render } from '../../../../../test/test-utils';
import { HeadingTwo } from './heading-two';

describe('presentation:components:atoms:heading-two', () => {
  test('It should render a heading', () => {
    const { getByText } = render(<HeadingTwo>HeadingText</HeadingTwo>);
    expect(getByText('HeadingText')).toBeInTheDocument();
  });
});
