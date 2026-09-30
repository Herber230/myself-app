import { describe, expect, it } from 'vitest';

import { decisionPath, projectPath } from './project-paths.js';

describe('a project’s paths', () => {
  it('lead to its page, and to each of its records', () => {
    expect(projectPath('es', 'entifix')).toBe('/es/projects/entifix/');
    expect(decisionPath('en', 'myself-app', '0016')).toBe(
      '/en/projects/myself-app/adr/0016/',
    );
  });
});
