import './global.css';

import { Center, Stack, Text } from '@entifix/react-controls/primitives';
import type { Metadata } from 'next';

import { ThemeScript } from '../components/theme-script';
import { fontVariables } from '../fonts';
import { PLACEHOLDER_COPY } from '../placeholder-copy';
import { localePath, SITE_LOCALES } from '../site-locales';

export const metadata: Metadata = {
  title: `404 — ${PLACEHOLDER_COPY.en.siteName}`,
  robots: { index: false },
};

/**
 * The export's `404.html`. It cannot know which locale the visitor wanted, so
 * it speaks both and links to each home.
 */
export default function GlobalNotFound() {
  return (
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>
        <Center as="main" gutters className="py-2xl">
          <Stack gap="2xl">
            {SITE_LOCALES.map(locale => (
              <section key={locale} lang={locale}>
                <Stack gap="xs">
                  <Text as="h1" step={3} weight="semibold">
                    {PLACEHOLDER_COPY[locale].notFoundTitle}
                  </Text>
                  <Text muted>{PLACEHOLDER_COPY[locale].notFoundLead}</Text>
                  <Text>
                    <a
                      className="text-primary underline focus-ring"
                      href={localePath(locale, '/')}
                    >
                      {PLACEHOLDER_COPY[locale].home}
                    </a>
                  </Text>
                </Stack>
              </section>
            ))}
          </Stack>
        </Center>
      </body>
    </html>
  );
}
