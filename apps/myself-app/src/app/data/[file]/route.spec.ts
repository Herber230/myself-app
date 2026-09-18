/**
 * The route handler Next calls once per file while it exports. Its only jobs
 * are to name every file and to answer each with JSON; what is in the JSON is
 * `data-files.spec.ts`'s concern.
 */
import { describe, expect, it } from 'vitest';

import { DATA_FILES } from '../../../content/data-files';
import { dynamic, dynamicParams, generateStaticParams, GET } from './route';

describe('the data route', () => {
  it('is written once, at build, for every data file and no other', () => {
    expect(dynamic).toBe('force-static');
    expect(dynamicParams).toBe(false);
    expect(generateStaticParams()).toEqual(DATA_FILES.map(file => ({ file })));
  });

  it('answers a file with its records as JSON', async () => {
    const response = await GET(new Request('http://export/data/ring.json'), {
      params: Promise.resolve({ file: 'ring.json' }),
    });
    expect(response.headers.get('content-type')).toContain('application/json');
    const rings = (await response.json()) as { id: string }[];
    expect(rings.map(ring => ring.id)).toEqual([
      'adopt',
      'trial',
      'assess',
      'hold',
    ]);
  });
});
