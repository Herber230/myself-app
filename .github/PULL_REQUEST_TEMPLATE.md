## Summary

<!-- What changed and why. 1-3 bullets. -->

-

## Type of change

- [ ] feat — new feature
- [ ] fix — bug fix
- [ ] refactor — no behavior change
- [ ] perf — performance improvement
- [ ] docs — documentation only
- [ ] test — adding/updating tests
- [ ] build/ci/chore — tooling, dependencies, pipeline

## Test plan

<!-- How this was verified. Commands run, manual steps, screenshots if UI. -->

- [ ] `pnpm nx affected -t lint,typecheck,test,build,e2e --base=origin/main`
- [ ] Checked the export with `pnpm nx serve-out myself-app` (if UI-facing)

## Checklist

- [ ] Conventional commit messages, scoped to an Nx project when one applies (`type(scope): summary`)
- [ ] `docs/adr/` and `CLAUDE.md` updated if this changes a decision, a command or a convention
- [ ] No `--no-verify` / skipped hooks used to get here
- [ ] No AI attribution in the commits or in this description
- [ ] No secrets or `.env`-style values committed

## Related issues

<!-- Closes #123 / Refs #123 -->
