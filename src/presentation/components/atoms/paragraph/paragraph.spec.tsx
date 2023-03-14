import { render } from '../../../../../test/test-utils';
import { Paragraph } from './paragraph';

describe('presentation:components:atoms:paragraph', () => {
  test('It should render a paragraph', () => {
    const { getByText } = render(<Paragraph>ParagraphText</Paragraph>);
    expect(getByText('ParagraphText')).toBeInTheDocument();
  });
});
