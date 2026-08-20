# TRACE — Regression Testing Report

## Regression Philosophy

TRACE uses historical failures as high-priority regression candidates. A regression record should preserve the original failure, the affected workflow and the reason the path matters.

## Historical Regression Source

The Aug 17, 2026 TestSprite run is the primary historical functional source:

```text
46 total
45 passed
1 failed
97.8%
```

The only failed test was:

> `Open a connected case from the graph`

The affected path was Intelligence Graph → CASE-001 → Case detail.

## High-Priority Regression Set

| Regression | Priority | Coverage goal |
|---|---|---|
| Open a connected case from the graph | HIGH | Graph node selection must open the correct case detail |
| Explore the investigation graph | HIGH | Graph must load and remain navigable |
| Inspect a confirmed link in the graph | HIGH | Relationship inspection must remain functional |
| Browse cases and open a case detail | HIGH | Repository-to-detail navigation must remain functional |
| Review and verify a suggested cross-case lead | HIGH | Core lead-review workflow must remain functional |
| Open a specific case from the Investigative CLI | MEDIUM | CLI-to-case navigation must remain functional |
| Search for an indicator in the graph | MEDIUM | Graph search must remain functional |
| Filter the graph by indicator and type | MEDIUM | Graph filters must remain functional |

## Current Correlation Regression

The latest repository development history includes hardening for cross-case matching to make matching deterministic and idempotent, deduplicate legacy relationship records and preserve investigator dispositions.

The corresponding regression requirements are:

1. Running the same correlation operation repeatedly should not create duplicate relationships.
2. Existing investigator dispositions should remain preserved.
3. Legacy duplicate relationships should be normalized without creating new duplicates.
4. Matching results should be deterministic for the same input dataset.

## Current Audit

The supplied current audit reports 106/106 automated tests passing with zero failures. The summary also reports successful verification of deterministic rule-based scoring, API boundaries, AI tool isolation, tested security attack classes, TypeScript validation and production build compilation.

Individual current regression test IDs and raw execution traces for all 106 tests were not supplied, so this report does not fabricate them.

## Verification Boundary

Historical TestSprite evidence establishes the original failed behavior. Later repository commits demonstrate development work related to graph navigation and cross-case matching, while the current audit provides the latest aggregate validation result. The historical TestSprite report itself does not prove that its recommended fix was retested.
