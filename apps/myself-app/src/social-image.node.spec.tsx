import { describe, expect, it } from 'vitest';

import { renderSocialImage, SOCIAL_IMAGE_SIZE } from './social-image';

/** A PNG's width and height, from its IHDR chunk. */
function pngSize(bytes: Uint8Array) {
  const view = new DataView(bytes.buffer, bytes.byteOffset);
  return { width: view.getUint32(16), height: view.getUint32(20) };
}

describe('the social preview image', () => {
  it.each(['en', 'es'] as const)('is drawn as a PNG for %s', async locale => {
    const response = await renderSocialImage(locale);
    expect(response.headers.get('content-type')).toBe('image/png');
    const bytes = new Uint8Array(await response.arrayBuffer());
    expect([...bytes.subarray(1, 4)]).toEqual([0x50, 0x4e, 0x47]);
    expect(pngSize(bytes)).toEqual(SOCIAL_IMAGE_SIZE);
  });
});
