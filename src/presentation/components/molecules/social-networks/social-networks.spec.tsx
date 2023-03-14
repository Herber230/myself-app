import { render } from '../../../../../test/test-utils';
import { SocialNetworks } from './social-networks';

describe('presentation:components:molecules:social-networks', () => {
  test('It should render the component without throwing any error', () => {
    expect(() => render(<SocialNetworks />)).not.toThrow();
  });

  test('It should render the component with the correct number of buttons', () => {
    const { getAllByTestId } = render(<SocialNetworks />);
    const buttons = getAllByTestId(/button/i);
    expect(buttons).toHaveLength(7);
  });

  test('It should render the linkedin button', () => {
    const { getByTestId } = render(<SocialNetworks />);
    const linkedinButton = getByTestId('linkedin-button');
    expect(linkedinButton).toBeInTheDocument();
  });

  test('It should render the github button', () => {
    const { getByTestId } = render(<SocialNetworks />);
    const githubButton = getByTestId('github-button');
    expect(githubButton).toBeInTheDocument();
  });

  test('It should render the stackoverflow button', () => {
    const { getByTestId } = render(<SocialNetworks />);
    const stackoverflowButton = getByTestId('stackoverflow-button');
    expect(stackoverflowButton).toBeInTheDocument();
  });

  test('It should render the medium button', () => {
    const { getByTestId } = render(<SocialNetworks />);
    const mediumButton = getByTestId('medium-button');
    expect(mediumButton).toBeInTheDocument();
  });

  test('It should render the goodreads button', () => {
    const { getByTestId } = render(<SocialNetworks />);
    const goodreadsButton = getByTestId('goodreads-button');
    expect(goodreadsButton).toBeInTheDocument();
  });

  test('It should render the twitter button', () => {
    const { getByTestId } = render(<SocialNetworks />);
    const twitterButton = getByTestId('twitter-button');
    expect(twitterButton).toBeInTheDocument();
  });

  test('It should render the facebook button', () => {
    const { getByTestId } = render(<SocialNetworks />);
    const facebookButton = getByTestId('facebook-button');
    expect(facebookButton).toBeInTheDocument();
  });
});
