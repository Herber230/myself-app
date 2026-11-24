/**
 * Prints the sheet from the visitor's own browser (#36): the one way a sheet
 * becomes a PDF with whatever the visitor chose. Its output depends on their
 * browser and its settings, so the prebuilt PDF beside it is the guaranteed
 * one (ADR 0012).
 *
 * Before printing, the document title becomes the file name Chromium and
 * Safari offer (`Herber Colop — CV (Backend)`), and it is put back once the
 * dialog closes. Printing waits for the fonts, so a quick click never prints
 * a fallback.
 */
export async function printSheet(fileName: string): Promise<void> {
  const title = document.title;
  document.title = fileName;
  window.addEventListener(
    'afterprint',
    () => {
      document.title = title;
    },
    { once: true },
  );
  await document.fonts.ready;
  window.print();
}
