import type { ContactChannelType } from '@myself-app/domain';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  ChannelIcon,
  ChannelMark,
  FeedIcon,
  GitHubMark,
  LinkedInMark,
  LocationIcon,
} from './icons.js';

const shapeOf = (container: HTMLElement) =>
  container.querySelector('svg')?.innerHTML;

describe('a contact icon', () => {
  it('is hidden from a screen reader, and carries no text a PDF would keep', () => {
    const { container } = render(
      <ChannelIcon type="email" className="cv-icon" />,
    );
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
    expect(svg?.querySelector('text')).toBeNull();
    expect(svg?.textContent).toBe('');
  });

  it('is drawn for each channel the site uses, and a link for the rest', () => {
    const drawn: readonly ContactChannelType[] = [
      'email',
      'linkedin',
      'github',
      'instagram',
      'facebook',
      'goodreads',
    ];
    const others: readonly ContactChannelType[] = ['medium', 'x'];
    const shapes = [...drawn, ...others].map(type =>
      shapeOf(
        render(<ChannelIcon type={type} className="cv-icon" />).container,
      ),
    );
    const [medium, x] = shapes.slice(drawn.length);
    expect(new Set(shapes.slice(0, drawn.length)).size).toBe(drawn.length);
    expect(medium).toBe(x);
    expect(shapes.slice(0, drawn.length)).not.toContain(medium);
  });

  it('takes its class from the caller', () => {
    const { container } = render(
      <ChannelIcon type="github" className="landing-icon" />,
    );
    expect(container.querySelector('svg')?.getAttribute('class')).toBe(
      'landing-icon',
    );
  });

  it('draws a feed as its waves', () => {
    const { container } = render(<FeedIcon className="feed" />);
    expect(container.querySelector('svg')?.getAttribute('class')).toBe('feed');
    expect(container.querySelector('circle')).not.toBeNull();
  });

  it('marks the location with a pin', () => {
    const { container } = render(<LocationIcon className="cv-icon" />);
    expect(container.querySelector('circle')).not.toBeNull();
  });
});

describe('the GitHub mark', () => {
  it('is filled, hidden from a screen reader, and takes its class', () => {
    const { container } = render(<GitHubMark className="source-icon" />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('class')).toBe('source-icon');
    expect(svg?.getAttribute('fill')).toBe('currentColor');
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
  });
});

describe('the LinkedIn mark', () => {
  it('is filled, hidden from a screen reader, and takes its class', () => {
    const { container } = render(<LinkedInMark className="card-logo" />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('class')).toBe('card-logo');
    expect(svg?.getAttribute('fill')).toBe('currentColor');
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
  });
});

describe("a channel's mark", () => {
  const markOf = (type: 'github' | 'linkedin' | 'email') =>
    render(<ChannelMark type={type} className="card-logo" />).container
      .innerHTML;

  it("is the brand's own logo for GitHub and LinkedIn", () => {
    expect(markOf('github')).toBe(
      render(<GitHubMark className="card-logo" />).container.innerHTML,
    );
    expect(markOf('linkedin')).toBe(
      render(<LinkedInMark className="card-logo" />).container.innerHTML,
    );
  });

  it("is the CV's line icon for any other channel", () => {
    expect(markOf('email')).toBe(
      render(<ChannelIcon type="email" className="card-logo" />).container
        .innerHTML,
    );
  });
});
