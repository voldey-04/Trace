# TRACE — Testing Strategy

## Validation Layers

TRACE uses multiple validation layers rather than relying on a single testing run.

| Layer | Purpose | Evidence |
|---|---|---|
| Historical TestSprite | Frontend/user-workflow validation on an earlier build | 46 tests, 45 passed, 1 failed, 97.8% |
| Current automated audit | Functional, API, security, AI and regression verification | 106/106 passed, 0 failures |
| TypeScript validation | Static type correctness | 0 errors reported by current audit |
| Production build | Build/deployment verification | Successfully compiled |

## Evidence Rules

Testing documentation distinguishes:

- **Historical evidence:** results from the earlier TestSprite run.
- **Current audit evidence:** results from the later audit supplied for the current TRACE implementation.
- **Implementation claims:** functionality present in the repository without a directly supplied test result.

Recommendations from historical reports are not treated as confirmed fixes unless later evidence supports that conclusion.

## Historical TestSprite

The historical TestSprite run is documented separately in [`reports/testsprite-historical-report.md`](reports/testsprite-historical-report.md).

The raw run statistics are:

```text
46 total
45 passed
1 failed
0 skipped
0 blocked
97.8%
```

The single historical failure involved graph-to-case navigation for CASE-001.

## Current Automated Audit

The supplied current audit reports:

```text
106 / 106 automated tests passing
0 failures
```

The audit covers application behavior and tested security classes including XSS injection, SQL injection syntax, path traversal payloads, command injection operators, prompt-injection overrides and parameter privilege escalation attempts.

## Static and Build Validation

The same current audit reports:

```text
TypeScript Linter: 0 errors
Production Build: Successfully compiled
```

## Regression Principle

Historical failures become high-priority regression candidates. In particular, graph-to-case navigation should remain covered because it was the only failed test in the historical TestSprite run.

## Test Gaps

The historical TestSprite evidence did not independently verify entity management/search, evidence and evidence-integrity workflows, timeline behavior, responsive device matrix, or several navigation/error scenarios. Current audit evidence should be interpreted according to its own tested scope rather than retroactively assigning coverage to the older TestSprite run.
