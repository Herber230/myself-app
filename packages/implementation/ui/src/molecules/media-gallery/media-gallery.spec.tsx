import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MediaGallery, type MediaItemData } from './media-gallery.js';

const COPY = {
  label: 'Photos and videos: Motorcycles',
  previous: 'Previous photo',
  next: 'Next photo',
  close: 'Close',
  position: '{at} of {of}',
};

const PHOTOS: MediaItemData[] = [
  {
    id: 'curve',
    kind: 'photo',
    src: '/beyond-code/curve.webp',
    thumbnail: '/beyond-code/curve-thumb.webp',
    alt: 'A curve',
  },
  { id: 'night', kind: 'photo', src: '/beyond-code/night.webp', alt: 'Night' },
];

const VIDEO: MediaItemData = {
  id: 'dance',
  kind: 'video',
  src: '/beyond-code/dance.mp4',
  poster: '/beyond-code/dance.webp',
  alt: 'A dance',
};

// jsdom has `<dialog>` but not its modal methods: open and close it as a
// browser would, and say when it closes.
beforeEach(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (
    this: HTMLDialogElement,
  ) {
    this.setAttribute('open', '');
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  });
});

const dialogOf = (container: HTMLElement) =>
  container.querySelector('dialog') as HTMLDialogElement;
const captionOf = (container: HTMLElement) =>
  container.querySelector('figcaption')?.textContent;

describe('a gallery', () => {
  it('lists its photos as links to their large copies, and its videos to play in place', () => {
    const { container } = render(
      <MediaGallery items={[...PHOTOS, VIDEO]} copy={COPY} />,
    );
    expect(
      screen.getByRole('list', { name: 'Photos and videos: Motorcycles' }),
    ).toBeTruthy();
    const curve = screen.getByRole('link', { name: 'A curve' });
    expect(curve.getAttribute('href')).toBe('/beyond-code/curve.webp');
    expect(curve.querySelector('img')?.getAttribute('src')).toBe(
      '/beyond-code/curve-thumb.webp',
    );
    // With no thumbnail, the tile shows the large copy.
    expect(
      screen
        .getByRole('link', { name: 'Night' })
        .querySelector('img')
        ?.getAttribute('src'),
    ).toBe('/beyond-code/night.webp');
    const video = container.querySelector('video');
    expect(video?.getAttribute('src')).toBe('/beyond-code/dance.mp4');
    expect(video?.getAttribute('poster')).toBe('/beyond-code/dance.webp');
    expect(video?.getAttribute('preload')).toBe('none');
    expect(video?.getAttribute('aria-label')).toBe('A dance');
    expect(dialogOf(container).open).toBe(false);
  });

  it('opens a photo whole in the lightbox, saying where it sits', () => {
    const { container } = render(<MediaGallery items={PHOTOS} copy={COPY} />);
    const link = screen.getByRole('link', { name: 'Night' });
    expect(fireEvent.click(link)).toBe(false);
    const dialog = dialogOf(container);
    expect(dialog.open).toBe(true);
    expect(dialog.getAttribute('aria-label')).toBe('Night');
    expect(dialog.querySelector('figure img')?.getAttribute('src')).toBe(
      '/beyond-code/night.webp',
    );
    expect(captionOf(container)).toBe('Night2 of 2');
  });

  it('leaves a click with a modifier to the browser, for a new tab', () => {
    const { container } = render(<MediaGallery items={PHOTOS} copy={COPY} />);
    const link = screen.getByRole('link', { name: 'A curve' });
    expect(fireEvent.click(link, { metaKey: true })).toBe(true);
    expect(fireEvent.click(link, { ctrlKey: true })).toBe(true);
    expect(fireEvent.click(link, { shiftKey: true })).toBe(true);
    expect(dialogOf(container).open).toBe(false);
  });

  it('steps through the photos with its buttons and the arrow keys, round the ends', () => {
    const { container } = render(<MediaGallery items={PHOTOS} copy={COPY} />);
    const dialog = dialogOf(container);
    // A key before anything is open does nothing.
    fireEvent.keyDown(dialog, { key: 'ArrowRight' });
    expect(dialog.open).toBe(false);

    fireEvent.click(screen.getByRole('link', { name: 'A curve' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next photo' }));
    expect(captionOf(container)).toBe('Night2 of 2');
    fireEvent.click(screen.getByRole('button', { name: 'Next photo' }));
    expect(captionOf(container)).toBe('A curve1 of 2');
    fireEvent.keyDown(dialog, { key: 'ArrowLeft' });
    expect(captionOf(container)).toBe('Night2 of 2');
    fireEvent.keyDown(dialog, { key: 'ArrowRight' });
    expect(captionOf(container)).toBe('A curve1 of 2');
    fireEvent.click(screen.getByRole('button', { name: 'Previous photo' }));
    expect(captionOf(container)).toBe('Night2 of 2');
    fireEvent.keyDown(dialog, { key: 'Enter' });
    expect(captionOf(container)).toBe('Night2 of 2');
    // Stepping shows another photo in the same open dialog.
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalledOnce();
  });

  it('closes with its button, a click on the backdrop, or Escape', () => {
    const { container } = render(<MediaGallery items={PHOTOS} copy={COPY} />);
    const dialog = dialogOf(container);
    const open = () =>
      fireEvent.click(screen.getByRole('link', { name: 'A curve' }));

    open();
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(dialog.open).toBe(false);
    expect(container.querySelector('figure')).toBeNull();

    open();
    // A click on the photo is not on the backdrop.
    fireEvent.click(dialog.querySelector('figure') as HTMLElement);
    expect(dialog.open).toBe(true);
    fireEvent.click(dialog);
    expect(dialog.open).toBe(false);

    open();
    // Escape closes the dialog natively, which then says so.
    dialog.removeAttribute('open');
    fireEvent(dialog, new Event('close'));
    expect(container.querySelector('figure')).toBeNull();
  });

  it('offers no steps when there is a single photo', () => {
    render(<MediaGallery items={[PHOTOS[0] as MediaItemData]} copy={COPY} />);
    fireEvent.click(screen.getByRole('link', { name: 'A curve' }));
    expect(screen.queryByRole('button', { name: 'Next photo' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Close' })).toBeTruthy();
  });
});
