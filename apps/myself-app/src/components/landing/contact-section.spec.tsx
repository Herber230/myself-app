import type { ContactChannel } from '@myself-app/domain';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { loadContactChannels } from '../../content/contact';
import { SITE_REPOSITORIES } from '../../content/repositories';
import { ContactSection } from './contact-section';

const channel = (fields: Partial<ContactChannel>) => fields as ContactChannel;

describe('the contact section', () => {
  it('lists every channel from content, in its order', async () => {
    const channels = await loadContactChannels(SITE_REPOSITORIES);
    render(<ContactSection locale="en" channels={channels} />);
    expect(
      screen.getAllByRole('link').map(link => link.getAttribute('href')),
    ).toEqual(channels.map(each => each.url));
  });

  it('names each link by its channel, then its handle', () => {
    render(
      <ContactSection
        locale="es"
        channels={[
          channel({
            id: 'email',
            type: 'email',
            displayName: 'a@b.c',
            url: 'mailto:a@b.c',
          }),
          channel({
            id: 'x',
            type: 'x',
            displayName: 'ab',
            url: 'https://x.com/ab',
          }),
        ]}
      />,
    );
    expect(screen.getByRole('link', { name: 'Correo: a@b.c' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'X: ab' })).toBeTruthy();
  });

  it('opens a web address safely, and leaves mail to the mail client', () => {
    render(
      <ContactSection
        locale="en"
        channels={[
          channel({
            id: 'email',
            type: 'email',
            displayName: 'a@b.c',
            url: 'mailto:a@b.c',
          }),
          channel({
            id: 'github',
            type: 'github',
            displayName: 'ab',
            url: 'https://github.com/ab',
          }),
        ]}
      />,
    );
    const mail = screen.getByRole('link', { name: 'Email: a@b.c' });
    expect(mail.getAttribute('target')).toBeNull();
    expect(mail.getAttribute('rel')).toBeNull();
    const web = screen.getByRole('link', { name: 'GitHub: ab' });
    expect(web.getAttribute('target')).toBe('_blank');
    expect(web.getAttribute('rel')).toBe('noopener noreferrer');
  });
});
