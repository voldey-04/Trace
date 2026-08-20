# Historical TestSprite Validation

> Historical evidence from an earlier TRACE frontend build. This report is not the current TRACE status.

## Run Identification

| Field | Value |
|---|---|
| TestSprite run ID | `7409cdb6-22b4-48fb-8c7f-e95b6cc88829` |
| Started | `2026-08-17T09:17:18.248Z` |
| Completed | `2026-08-17T09:31:27.045Z` |
| Environment | `default` |
| Project type | FRONTEND |
| Trigger | `Trace` |
| Strategy hash | `ff67de3a-5386-4c9a-a8db-26408a822bdd` |
| TRACE version/commit | NOT AVAILABLE in preserved evidence |
| Tested URL | NOT AVAILABLE in preserved evidence |
| Browser/device | NOT AVAILABLE in preserved evidence |

## Historical Result

```text
46 total
45 passed
1 failed
0 skipped
0 blocked
97.8% pass rate
```

A separate analysis artifact mentioned `47 of 48 executable tests` and `97.9%`, but the preserved raw run statistics verify **46 total / 45 passed / 1 failed / 97.8%** for this historical run. The alternate figure is not used as the run result.

## Coverage

| Category | Total | Passed | Failed |
|---|---:|---:|---:|
| Investigation Overview | 14 | 14 | 0 |
| Cases Repository | 6 | 6 | 0 |
| Intelligence Graph | 6 | 5 | 1 |
| Cross-Case Leads | 8 | 8 | 0 |
| Investigative CLI | 6 | 6 | 0 |
| Demo Investigation Flow | 6 | 6 | 0 |

## Historical Functional Evidence

### Investigation Overview — 14/14

The run recorded successful checks for the overview dashboard, summary metrics, case distribution summary, indicator search, active lead review, lead provenance, repository navigation, graph entry, cross-case lead views, CLI entry and guided/demo entry points.

### Cases Repository — 6/6

The run recorded successful status and priority filters, case search, case-detail opening, filtered-detail opening and combined repository filtering/search.

### Intelligence Graph — 5/6

Passing coverage included graph exploration, graph reset, confirmed-link inspection, indicator search and graph filtering.

The one failed test was graph-to-case navigation.

### Cross-Case Leads — 8/8

The run recorded successful filtering by status/severity, searching by case number or indicator, reviewing/verifying leads, dismissal, provenance and score-math inspection.

### Investigative CLI — 6/6

The run recorded successful stats, indicator search, case opening, clearing, case listing and help output.

### Demo Investigation Flow — 6/6

The run recorded successful demo overview inspection, guided demo launch, CASE-008 simulation, CLI demo and quick-run command.

## Failed Test

### `Open a connected case from the graph`

| Field | Evidence |
|---|---|
| Test ID | `47213b4f-1fc7-4229-9b7f-85dd5536064a` |
| Feature | Intelligence Graph |
| Severity | High |
| Expected | Selecting CASE-001 from the graph should navigate to the related case detail view |
| Actual | CASE-001 remained highlighted on the graph; no case-detail panel, modal or navigation appeared |
| Failure | `TEST FAILURE` — Clicking the CASE-001 graph node did not navigate to a case detail view as expected. |
| User action | Selected CASE-001 via search suggestion, pressed Enter, and clicked the graph SVG/node |
| Evidence | Direct failure text plus TestSprite video: `https://testsprite-videos.s3.us-east-1.amazonaws.com/20260817-092735-904e57a6.webm` |

TestSprite's recorded cause was that the site appeared to update visual selection state without completing the detail transition. The report proposed verifying the graph node click/keyboard handlers, route/modal wiring and deployed detail component.

The report does **not** verify that the recommended fix was subsequently implemented. Later repository changes may be discussed separately as development history, but this historical report remains the source of truth for the TestSprite run itself.

## Navigation Findings

Verified successful historical paths included:

- Overview → Cases Repository.
- Overview → Intelligence Graph.
- Overview → Cross-Case Leads.
- Overview → Investigative CLI.
- Overview → Guided/demo flows.
- Cases Repository → Case detail.
- Investigative CLI → specific case.

The only recorded failure was:

- Intelligence Graph → CASE-001 → Case detail.

## Testing Gaps

The preserved historical evidence does not establish standalone coverage for:

- Entity management/search.
- Evidence inspection/integrity workflows.
- Timeline behavior.
- Responsive desktop/tablet/mobile validation.
- Browser/device matrix.
- Header/sidebar/back navigation as distinct test groups.
- Broad error-handling validation.
- TRACE version/commit and tested URL.

## Regression Candidates

| Test | Priority | Reason |
|---|---|---|
| Open a connected case from the graph | HIGH | Directly protects the only historical failure path |
| Explore the investigation graph | HIGH | Core graph smoke test |
| Inspect a confirmed link in the graph | HIGH | Protects relationship inspection |
| Browse cases and open a case detail | HIGH | Core repository-to-detail workflow |
| Review and verify a suggested cross-case lead | HIGH | Core investigation workflow |
| Open a specific case from the Investigative CLI | MEDIUM | Protects CLI-to-detail navigation |
| Search for an indicator in the graph | MEDIUM | Protects graph search |
| Filter the graph by indicator and type | MEDIUM | Protects graph filtering |

## Evidence Quality

- Aggregate run statistics: **B — explicit recorded run result**.
- Passing test inventory: **B — explicit recorded result rows**.
- Failed CASE-001 test: **A — direct failure text and video evidence**.
- TestSprite root-cause statement: **B — recorded analysis, not an independently verified root-cause proof**.
- Later fix status: **NOT VERIFIED by this report**.
