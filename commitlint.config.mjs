/**
 * Conventional commits, with the scope checked against the Nx project names.
 * The attribution check entifix and r10c add here arrives with the working
 * conventions (#20).
 */
export default {
  extends: ['@commitlint/config-conventional', '@commitlint/config-nx-scopes'],
};
