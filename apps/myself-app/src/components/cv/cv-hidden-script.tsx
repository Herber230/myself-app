import {
  HIDDEN_STYLE_ID,
  HIDE_PARAM,
  PART_ATTRIBUTE,
  PART_PATTERN,
} from './cv-hidden';

/**
 * Hides what a customized sheet's URL hides before the sheet paints (#38,
 * ADR 0015), as `ThemeScript` sets the palette: inline, ahead of the sheet in
 * the document, long before React hydrates. A shared link opens as it was
 * left, with no flash of the parts it hides.
 *
 * It writes what `applyHidden(parseHidden(location.search))` would; the
 * customizer takes over once hydrated.
 */
const script = `(function () {
  try {
    var raw = new URLSearchParams(window.location.search).get(${JSON.stringify(HIDE_PARAM)});
    if (!raw) return;
    var pattern = new RegExp(${JSON.stringify(PART_PATTERN.source)});
    var seen = {};
    var selectors = raw.split(',').filter(function (part) {
      if (!pattern.test(part) || seen[part]) return false;
      return (seen[part] = true);
    }).map(function (part) {
      return '[${PART_ATTRIBUTE}="' + part + '"]';
    });
    if (selectors.length === 0) return;
    var style = document.createElement('style');
    style.id = ${JSON.stringify(HIDDEN_STYLE_ID)};
    style.textContent = selectors.join(',') + '{display:none!important}';
    document.head.appendChild(style);
  } catch (error) {}
})();`;

export function CvHiddenScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
