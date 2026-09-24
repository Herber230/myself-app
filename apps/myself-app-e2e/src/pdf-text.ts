/**
 * What a PDF says, as a parser reads it: its pages, its metadata, and its text
 * in the order the file carries it. An applicant tracking system reads the
 * same text layer, so this is the check that the ATS mode is what it claims.
 */
export interface PdfReading {
  readonly pages: number;
  readonly info: Record<string, unknown>;
  /** Every page's text, in content order, one space between runs. */
  readonly text: string;
}

export async function readPdf(bytes: Buffer): Promise<PdfReading> {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const task = pdfjs.getDocument({
    data: new Uint8Array(bytes),
    useSystemFonts: false,
  });
  const document = await task.promise;
  const runs: string[] = [];
  for (let number = 1; number <= document.numPages; number++) {
    const content = await (await document.getPage(number)).getTextContent();
    for (const item of content.items) {
      if ('str' in item) runs.push(item.str);
    }
  }
  const { info } = await document.getMetadata();
  const reading = {
    pages: document.numPages,
    info: info as Record<string, unknown>,
    text: runs.join(' ').replace(/\s+/g, ' '),
  };
  await task.destroy();
  return reading;
}

/** Text with no whitespace, so a line break in the PDF is not a difference. */
export const squeezed = (text: string) => text.replace(/\s+/g, '');
