import { render } from '../../../../../test/test-utils';
import { PlainSections } from './plain-sections';

jest.mock('usehooks-ts', () => ({
  useElementSize: () => [{}, { height: 100 }],
}));
jest.mock('@utils/hooks/use-scroll', () => ({
  useScroll: () => ({ scrollPosition: 101 }),
}));

//TODO: Improve scenarios
describe('presentation:components:templates:plain-sections', () => {
  test('It should render the layout without throwing any error', () => {
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

  test('It should render the component with the scroll position greater than the navigation bar limit', () => {
    const { getByText } = render(
      <PlainSections
        header={<header>Dummy Header</header>}
        navigationBarLimit={100}
      >
        <div>Dummy Section A</div>
        <div>Dummy Section B</div>
        <div>Dummy Section C</div>
      </PlainSections>,
    );

    expect(getByText('Dummy Section A')).toBeInTheDocument();
    expect(getByText('Dummy Section B')).toBeInTheDocument();
    expect(getByText('Dummy Section C')).toBeInTheDocument();
  });
});
