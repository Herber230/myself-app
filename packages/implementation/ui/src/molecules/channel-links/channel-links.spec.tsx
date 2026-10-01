import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ChannelLinks } from './channel-links.js';

describe('the channel links', () => {
  it('are a list named by its heading, each opening its network safely', () => {
    const { container } = render(
      <ChannelLinks
        id="elsewhere"
        label="Find me elsewhere"
        channels={[
          {
            id: 'instagram',
            type: 'instagram',
            url: 'https://www.instagram.com/ab/',
            label: 'Instagram',
            handle: 'ab',
            name: 'Instagram: ab',
          },
          {
            id: 'goodreads',
            type: 'goodreads',
            url: 'https://www.goodreads.com/ab',
            label: 'Goodreads',
            handle: 'Ab',
            name: 'Goodreads: Ab',
          },
        ]}
      />,
    );
    expect(
      screen.getByRole('list', { name: 'Find me elsewhere' }),
    ).toBeTruthy();
    const instagram = screen.getByRole('link', { name: 'Instagram: ab' });
    expect(instagram.getAttribute('href')).toBe(
      'https://www.instagram.com/ab/',
    );
    expect(instagram.getAttribute('target')).toBe('_blank');
    expect(instagram.getAttribute('rel')).toBe('noopener noreferrer');
    expect(instagram.getAttribute('data-channel')).toBe('instagram');
    expect(instagram.querySelector('.channel-link-name')?.textContent).toBe(
      'Instagram',
    );
    expect(instagram.querySelector('.channel-link-handle')?.textContent).toBe(
      'ab',
    );
    expect(container.querySelectorAll('.channel-link-icon')).toHaveLength(2);
  });
});
