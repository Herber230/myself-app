/**
 * A catalog string with its `{{name}}` placeholders filled in, for the copy a
 * client component receives already translated: `fill('{{n}} active',
 * { n: 2 })`. A placeholder with no value stays as written.
 *
 * Pure, and imported by path rather than through `./i18n`, whose barrel
 * installs the catalogs.
 */
export function fill(
  template: string,
  values: Readonly<Record<string, string | number>>,
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (placeholder, name: string) =>
    name in values ? String(values[name]) : placeholder,
  );
}
