import { describe, expect, it } from 'vitest';

import { cvPart, hiddenCss, parseHidden, withHidden } from './cv-hidden';

describe('the parts a CV URL hides', () => {
  it('are read from `hide`, each once', () => {
    expect(
      parseHidden('?hide=tech:jest,section:education,tech:jest&lang=en'),
    ).toEqual(['tech:jest', 'section:education']);
  });

  it('are none without the parameter, or with it empty', () => {
    expect(parseHidden('')).toEqual([]);
    expect(parseHidden('?hide=')).toEqual([]);
  });

  it('drop a token that names no kind of part, or could break a selector', () => {
    expect(
      parseHidden(
        '?hide=tech:jest,photo:me,tech:a"]{},section:,section:Summary',
      ),
    ).toEqual(['tech:jest']);
  });

  it('name a part as the sheet does', () => {
    expect(cvPart('position', 'vana-frontend-engineer')).toBe(
      'position:vana-frontend-engineer',
    );
  });
});

describe('a search string with the hidden parts', () => {
  it('sets `hide` in a stable order, readable, keeping every other parameter', () => {
    expect(withHidden('?lang=en', ['tech:jest', 'section:education'])).toBe(
      '?lang=en&hide=section:education,tech:jest',
    );
  });

  it('drops `hide` when nothing is hidden', () => {
    expect(withHidden('?hide=tech:jest&lang=en', [])).toBe('?lang=en');
    expect(withHidden('?hide=tech:jest', [])).toBe('');
  });

  it('round-trips through parsing', () => {
    const parts = ['position:sisnova-analyst', 'tech:next-js'];
    expect(parseHidden(withHidden('', parts))).toEqual(parts);
  });
});

describe('the rules that hide parts', () => {
  it('hide every part in one rule', () => {
    expect(hiddenCss(['tech:jest', 'section:education'])).toBe(
      '[data-cv-part="tech:jest"],[data-cv-part="section:education"]{display:none!important}',
    );
  });

  it('are empty when nothing is hidden', () => {
    expect(hiddenCss([])).toBe('');
  });
});
