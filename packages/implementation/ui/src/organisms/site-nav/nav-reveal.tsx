'use client';

import { useEffect } from 'react';

/** Where the bar is shown, as a share of the viewport's height. */
const REVEAL_AT = 0.35;

/**
 * The landing bar's reveal where scroll timelines do not exist (Firefox): it
 * marks the bar `data-revealed` once the page has scrolled past the hero's
 * first third, and `global.css` fades it in. Where they exist the CSS animation
 * does it alone, and this does nothing. Renders nothing.
 */
export function NavReveal() {
  useEffect(() => {
    if (CSS.supports('animation-timeline: scroll()')) return;
    const bar = document.querySelector<HTMLElement>('.site-nav-reveal');
    if (!bar) return;
    const update = () => {
      bar.toggleAttribute(
        'data-revealed',
        window.scrollY >= window.innerHeight * REVEAL_AT,
      );
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);
  return null;
}
