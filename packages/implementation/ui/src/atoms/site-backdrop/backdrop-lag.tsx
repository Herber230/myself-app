'use client';

import { useEffect } from 'react';

/**
 * The backdrop's lag where scroll timelines do not exist (Firefox): it writes
 * how far the backdrop has crossed the viewport — the `cover` range the CSS
 * animation runs over, from 0 to 1 — as `--backdrop-progress` on the track,
 * and `site.css` turns it into the same translation. Where they exist the CSS
 * animation does it alone, and this does nothing. Renders nothing.
 */
export function BackdropLag() {
  useEffect(() => {
    if (CSS.supports('animation-timeline: scroll()')) return;
    const backdrop = document.querySelector<HTMLElement>('.site-backdrop');
    const track = backdrop?.querySelector<HTMLElement>('.site-backdrop-track');
    if (!backdrop || !track) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const { top, height } = backdrop.getBoundingClientRect();
      const viewport = window.innerHeight;
      const progress = (viewport - top) / (viewport + height);
      track.style.setProperty(
        '--backdrop-progress',
        String(Math.min(1, Math.max(0, progress))),
      );
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, []);
  return null;
}
