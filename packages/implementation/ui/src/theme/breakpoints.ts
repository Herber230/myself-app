/**
 * The site's two screen widths, for what only the screen can decide (ADR
 * 0006): a layout a before-paint script folds (`FoldScript`), a sticky part,
 * a phone's view switch. Everything else is fluid (the Utopia scale) or
 * intrinsic (the layout primitives, container queries), and needs neither.
 *
 * `styles/site.css` and `styles/post-body.css` write the same two widths in
 * their `@media` rules, which cannot read these.
 */

/** A phone: below 40rem. */
export const NARROW = '(width < 40rem)';
/** Not a phone. */
export const NOT_NARROW = '(width >= 40rem)';
/** Room for a column beside the page: 64rem and up. */
export const WIDE = '(width >= 64rem)';
/** No room for a column beside the page. */
export const NOT_WIDE = '(width < 64rem)';
