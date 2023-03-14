import { render } from '../../../../../test/test-utils';
import { HeadingOne } from './heading-one';

describe('presentation:components:atoms:heading-one', () => {
  test('It should render a heading', () => {
    const { getByText } = render(<HeadingOne>HeadingText</HeadingOne>);
    expect(getByText('HeadingText')).toBeInTheDocument();
  });
});
