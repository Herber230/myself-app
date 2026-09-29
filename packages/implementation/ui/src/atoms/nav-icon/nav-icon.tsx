/**
 * The navigation bar's icons (#75): 24×24 line icons for its links and
 * triggers, stroked by `.nav-icon`. The dropdown itself is the incubator's
 * `NavMenu`.
 */
/** 24×24 line icons for the bar's links and triggers, stroked by `.nav-icon`. */
export const NAV_ICONS = {
  menu: 'M4 7h16M4 12h16M4 17h16',
  close: 'M6 6l12 12M18 6 6 18',
  about:
    'M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM4.5 20.5c.9-3.7 3.9-6 7.5-6s6.6 2.3 7.5 6',
  projects:
    'M3.5 7.5h17v12h-17zM8.5 7.5V5.5a1.5 1.5 0 0 1 1.5-1.5h4a1.5 1.5 0 0 1 1.5 1.5v2M3.5 12.5h17',
  entifix:
    'M12 3.5 20.5 8 12 12.5 3.5 8 12 3.5ZM3.5 12 12 16.5 20.5 12M3.5 16l8.5 4.5 8.5-4.5',
  contact: 'M3.5 5.5h17v13h-17zM3.5 6.5l8.5 6.5 8.5-6.5',
  cv: 'M6 3.5h8.5l3.5 3.5v13.5H6zM14.5 3.5V7H18M9 11.5h6M9 14.5h6M9 17.5h4',
  techRadar:
    'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM12 7.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9ZM12 12l6.4-6.4',
  blog: 'M5.5 3.5h13v17h-13zM8.5 8h7M8.5 11.5h7M8.5 15h4',
  globe:
    'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z',
  blue: 'M12 3.5c3 3.6 6 6.9 6 10.5a6 6 0 0 1-12 0c0-3.6 3-6.9 6-10.5Z',
  light:
    'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4',
  dark: 'M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5Z',
} as const;

export function NavIcon({
  name,
  className,
}: {
  name: keyof typeof NAV_ICONS;
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className ? `nav-icon ${className}` : 'nav-icon'}
    >
      <path d={NAV_ICONS[name]} />
    </svg>
  );
}
