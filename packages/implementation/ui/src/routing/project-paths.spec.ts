import { describe, expect, it } from 'vitest';

import { decisionPath, isProjectPath, projectPath } from './project-paths.js';

describe('a project’s paths', () => {
  it('lead to its page, and to each of its records', () => {
    expect(projectPath('es', 'entifix')).toBe('/es/projects/entifix/');
    expect(decisionPath('en', 'myself-app', '0016')).toBe(
      '/en/projects/myself-app/adr/0016/',
    );
  });

  it('tell a project’s pages from another’s', () => {
    expect(isProjectPath('/projects/entifix', 'entifix')).toBe(true);
    expect(isProjectPath('/projects/entifix/adr/0001', 'entifix')).toBe(true);
    expect(isProjectPath('/projects/entifix-two', 'entifix')).toBe(false);
    expect(isProjectPath('/cv', 'entifix')).toBe(false);
  });
});
