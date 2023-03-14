import { render } from '../../../../../test/test-utils';
import { PlainSections } from './plain-sections';

describe('presentation:components:templates:plain-sections', () => {
  test('It should render the component without throwing any error', () => {
    expect(() =>
      render(
        <PlainSections header={<header>Dummy Header</header>}>
          <div>Dummy Section A</div>
          <div>Dummy Section B</div>
          <div>Dummy Section C</div>
        </PlainSections>,
      ),
    ).not.toThrow();
  });
});
