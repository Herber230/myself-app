import type { InterestMedia } from '@myself-app/domain';
import {
  loadBeyondCodeTeaser,
  loadPersonalChannels,
} from '@myself-app/domain/use-cases';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SITE_CONTENT } from '../../test/shipped-content.js';
import { BeyondCodeTeaser } from './beyond-code-teaser.js';

async function teaserOf(locale: 'en' | 'es', withChannels = true) {
  const [teaser, channels] = await Promise.all([
    loadBeyondCodeTeaser(SITE_CONTENT),
    loadPersonalChannels(SITE_CONTENT),
  ]);
  return render(
    <BeyondCodeTeaser
      locale={locale}
      teaser={teaser}
      channels={withChannels ? channels : []}
    />,
  );
}

describe('the "Beyond the code" teaser', () => {
  it('is a section named by its heading, each interest a card to its part of the page', async () => {
    await teaserOf('en');
    const section = screen.getByRole('region', { name: 'Beyond the code' });
    const cards = within(section)
      .getAllByRole('heading', { level: 3 })
      .map(heading => heading.textContent);
    expect(cards).toEqual(['Motorcycles', 'Reading', 'Salsa']);
    expect(
      screen.getByRole('link', { name: 'Reading' }).getAttribute('href'),
    ).toBe('/en/beyond-code/#reading');
    expect(
      screen
        .getByRole('link', { name: 'Get to know me better' })
        .getAttribute('href'),
    ).toBe('/en/beyond-code/');
  });

  it('shows the featured photos as decoration only', async () => {
    const { container } = await teaserOf('en');
    const photos = container.querySelector('.beyond-teaser-photos');
    expect(photos?.getAttribute('aria-hidden')).toBe('true');
    const images = [...(photos?.querySelectorAll('img') ?? [])];
    expect(images.length).toBeGreaterThan(0);
    expect(images.length).toBeLessThanOrEqual(3);
    expect(images.every(image => image.getAttribute('alt') === '')).toBe(true);
  });

  it('shows the large copy of a photo that has no thumbnail', () => {
    const { container } = render(
      <BeyondCodeTeaser
        locale="en"
        teaser={{
          interests: [],
          media: [{ id: 'board', src: '/board.webp' } as InterestMedia],
        }}
        channels={[]}
      />,
    );
    expect(
      container.querySelector('.beyond-teaser-photos img')?.getAttribute('src'),
    ).toBe('/board.webp');
  });

  it('links the personal channels, each named by network and handle', async () => {
    await teaserOf('es');
    const list = screen.getByRole('list', { name: 'Encuéntrame también en' });
    expect(
      within(list)
        .getAllByRole('link')
        .map(link => link.getAttribute('aria-label')),
    ).toEqual([
      'Instagram: herbercolop',
      'Facebook: HerberColop',
      'Goodreads: Herber Colop',
    ]);
  });

  it('leaves the channels out when there are none', async () => {
    const { container } = await teaserOf('en', false);
    expect(container.querySelector('.channel-links')).toBeNull();
  });
});
