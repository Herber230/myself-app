'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * An interest's photos and videos. A photo is a thumbnail linking to its
 * large copy, so it opens with scripting off; with it, the link opens a
 * lightbox instead (a modal `<dialog>`: focus held, Escape closes), with the
 * previous and next photos a button or an arrow key away. A video plays in
 * place, loading nothing until asked.
 *
 * The tiles share one shape and crop to it, so the grid is known before any
 * file arrives; the lightbox shows each photo whole.
 */
export interface MediaItemData {
  readonly id: string;
  readonly kind: 'photo' | 'video';
  readonly src: string;
  readonly thumbnail?: string;
  readonly poster?: string;
  readonly alt: string;
}

export interface MediaGalleryCopy {
  /** The list's name: "Photos of Motorcycles". */
  readonly label: string;
  readonly previous: string;
  readonly next: string;
  readonly close: string;
  /**
   * Where a photo sits among the rest, with `{at}` and `{of}` to fill in:
   * "{at} of {of}". A string, since a server page passes it to the browser.
   */
  readonly position: string;
}

export function MediaGallery({
  items,
  copy,
}: {
  items: readonly MediaItemData[];
  copy: MediaGalleryCopy;
}) {
  const photos = items.filter(item => item.kind === 'photo');
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState<number | undefined>(undefined);

  useEffect(() => {
    // Effects run after the ref is set, and the dialog is always rendered.
    const element = dialog.current as HTMLDialogElement;
    if (open === undefined) {
      if (element.open) element.close();
    } else if (!element.open) {
      element.showModal();
    }
  }, [open]);

  const step = (by: number) =>
    setOpen(at =>
      at === undefined ? at : (at + by + photos.length) % photos.length,
    );
  const shown = open === undefined ? undefined : photos[open];

  return (
    <>
      <ul className="media-gallery" aria-label={copy.label}>
        {items.map(item =>
          item.kind === 'video' ? (
            <li key={item.id} className="media-tile media-tile-video">
              <video
                className="media-video"
                src={item.src}
                poster={item.poster}
                controls
                preload="none"
                playsInline
                aria-label={item.alt}
              />
            </li>
          ) : (
            <li key={item.id} className="media-tile">
              <a
                href={item.src}
                className="media-open"
                onClick={event => {
                  if (event.metaKey || event.ctrlKey || event.shiftKey) return;
                  event.preventDefault();
                  setOpen(photos.indexOf(item));
                }}
              >
                <img
                  src={item.thumbnail ?? item.src}
                  alt={item.alt}
                  loading="lazy"
                  decoding="async"
                />
              </a>
            </li>
          ),
        )}
      </ul>
      <dialog
        ref={dialog}
        className="media-lightbox"
        aria-label={shown?.alt}
        onClose={() => setOpen(undefined)}
        onClick={event => {
          // A click on the backdrop lands on the dialog itself.
          if (event.target === event.currentTarget) setOpen(undefined);
        }}
        onKeyDown={event => {
          if (event.key === 'ArrowLeft') step(-1);
          if (event.key === 'ArrowRight') step(1);
        }}
      >
        {shown && open !== undefined && (
          <>
            <figure className="media-lightbox-figure">
              <img key={shown.id} src={shown.src} alt={shown.alt} />
              <figcaption>
                <span>{shown.alt}</span>
                <span className="media-lightbox-position">
                  {copy.position
                    .replace('{at}', String(open + 1))
                    .replace('{of}', String(photos.length))}
                </span>
              </figcaption>
            </figure>
            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  className="media-lightbox-step media-lightbox-previous"
                  aria-label={copy.previous}
                  onClick={() => step(-1)}
                />
                <button
                  type="button"
                  className="media-lightbox-step media-lightbox-next"
                  aria-label={copy.next}
                  onClick={() => step(1)}
                />
              </>
            )}
            <button
              type="button"
              className="media-lightbox-close"
              aria-label={copy.close}
              onClick={() => setOpen(undefined)}
            />
          </>
        )}
      </dialog>
    </>
  );
}
