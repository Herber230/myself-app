'use client';

import { useEffect } from 'react';

const OPEN = 'details.nav-menu[open]';

/**
 * What a dropdown is expected to do, over the bar's `<details>` menus: one
 * open at a time, closed by a click outside it, by following a link in it, or
 * by Escape, which hands focus
 * back to its trigger. Without scripting they still open and close by their
 * own trigger. Renders nothing.
 */
export function NavMenus() {
  useEffect(() => {
    const closeOthers = (keep: Element | null) => {
      for (const menu of document.querySelectorAll<HTMLDetailsElement>(OPEN)) {
        if (menu !== keep) menu.open = false;
      }
    };
    const click = (event: MouseEvent) => {
      // A click on the document itself has no element to look up from.
      const target =
        event.target instanceof Element ? event.target : document.body;
      // A link followed from a menu closes it too: a section anchor keeps the
      // page, and would otherwise leave the panel covering it.
      closeOthers(target.closest('a') ? null : target.closest(OPEN));
    };
    const key = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      const menu = document.querySelector<HTMLDetailsElement>(OPEN);
      if (!menu) return;
      menu.open = false;
      menu.querySelector('summary')?.focus();
    };
    document.addEventListener('click', click);
    document.addEventListener('keydown', key);
    return () => {
      document.removeEventListener('click', click);
      document.removeEventListener('keydown', key);
    };
  }, []);
  return null;
}
