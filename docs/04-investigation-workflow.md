# TRACE — Investigation Workflow

## Investigation Flow

```text
Evidence
   |
   v
Entity Extraction
   |
   v
Entity Normalization
   |
   v
Cross-Case Correlation
   |
   v
Relationship Scoring
   |
   v
Graph / Case Views
   |
   v
Evidence Inspection
   |
   v
Human Verification
```

## Investigator Journey

1. Open the investigation overview.
2. Review summary metrics and active leads.
3. Open a case or search for an indicator.
4. Inspect entities associated with the case.
5. Review supporting evidence metadata.
6. Explore cross-case links generated from shared indicators.
7. Inspect the relationship and its supporting provenance/score.
8. Traverse the investigation graph to related cases and entities.
9. Use the investigative CLI for rapid lookup when appropriate.
10. Use constrained AI assistance for search, explanation or analysis.
11. Verify the underlying evidence.
12. Make the final investigative determination as an authorized human investigator.

## Human-in-the-Loop Rule

A TRACE relationship is an investigative lead, not a verdict. Shared identifiers should be interpreted in context and verified against supporting evidence before operational decisions are made.

## Example Relationship

```text
Case A
  |
  +---- Phone Number ---- Case B
  |
  +---- UPI ID --------- Case C
  |
  +---- Domain ---------- Case D
                           |
                           +---- Evidence
```

## Investigation Graph

The graph is both a visualization and a navigation mechanism. It supports relationship exploration, entity lookup, filtering, reset and inspection of supported links.
