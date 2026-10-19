'use client';

import { useEffect } from 'react';

/**
 * The backdrop's lag where CSS has no scroll timeline (Firefox): writes how
 * far the page has scrolled, from 0 to 1, as `--spooky-progress` on the
 * backdrop, and `spooky.css` moves each layer by it. Where the timeline
 * exists, the CSS animation does it alone, and this does nothing. Renders
 * nothing.
 */
export function ParallaxLag() {
  useEffect(() => {
    if (CSS.supports('animation-timeline: scroll()')) return;
    const backdrop = document.querySelector<HTMLElement>('.spooky-parallax');
    if (!backdrop) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const range = document.documentElement.scrollHeight - window.innerHeight;
      const progress = range > 0 ? window.scrollY / range : 0;
      backdrop.style.setProperty(
        '--spooky-progress',
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
