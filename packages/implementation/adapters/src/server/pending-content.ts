/**
 * Content still to be written, by path: every value that holds `TODO(#…)` (#26).
 *
 * Emptied when #26 closed; the blog's first posts are placeholders (#70).
 *
 * The list only shrinks. Writing a value means removing its line here, or
 * `assertNoUnlistedPlaceholders` stops the build; a new placeholder anywhere
 * else stops it too. The issue that decides each value is in the value itself.
 */
export const PENDING_CONTENT: readonly string[] = [
  // The blog's first posts (#70): placeholders until they are written.
  ...[
    'entifix-in-the-browser',
    'a-static-site-on-s3',
    'coverage-at-one-hundred',
    'effect-four',
  ].flatMap(post => [
    `posts.json › ${post} › summary`,
    `posts.json › ${post} › body`,
  ]),
];
