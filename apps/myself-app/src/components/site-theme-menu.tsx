'use client';

import { useTheme } from '@entifix/react-controls/primitives';
import { useSyncExternalStore } from 'react';

import { SITE_THEMES, type SiteTheme } from '../theme';
import { NavIcon, NavMenu, NavMenuCheck } from './nav-menu';

const subscribe = () => () => undefined;

const isSiteTheme = (theme: string): theme is SiteTheme =>
  (SITE_THEMES as readonly string[]).includes(theme);

/**
 * The theme dropdown, rendered once the page is hydrated.
 *
 * The export is built without knowing a visitor's theme, so a menu in the
 * static HTML would mark the wrong one for everyone, and without scripting
 * there is nothing a theme choice could do.
 */
export function SiteThemeMenu({ label }: { label: string }) {
  const { theme, setTheme, themes } = useTheme();
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  // Holds the trigger's place, so the bar does not shift when it appears.
  if (!hydrated)
    return <span aria-hidden="true" className="nav-menu-placeholder" />;
  return (
    <NavMenu
      label={label}
      icon={<NavIcon name={isSiteTheme(theme) ? theme : 'blue'} />}
    >
      <ul>
        {themes.map(option => (
          <li key={option.id}>
            <button
              type="button"
              className="nav-menu-item"
              aria-pressed={option.id === theme}
              onClick={event => {
                setTheme(option.id);
                event.currentTarget.closest('details')?.removeAttribute('open');
              }}
            >
              <NavMenuCheck checked={option.id === theme} />
              {option.label}
            </button>
          </li>
        ))}
      </ul>
    </NavMenu>
  );
}
