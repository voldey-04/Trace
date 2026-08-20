# TRACE — Functional Testing Report

## Current Functional Audit

The supplied current audit reports that the following core areas are operational:

- Dashboard, case management and evidence view.
- Filters, search queries and status lifecycles.
- Evidence integrity checksum badges.
- Interactive topology graph and inspection drawers.
- Link explainability panels with provenance drill-down.
- Deterministic cross-case correlation using shared phones, UPI IDs, bank accounts and digital signatures.
- Investigative CLI core commands: `help`, `cases`, `inspect`, `correlate`, `evidence`, `audit`, `clear`, `ai`.

## Current API Validation

The audit reports validated input boundaries across routes including case identifiers, pagination ceilings and entity parameters. It also reports standardized JSON responses with request tracing IDs and sanitized error messages.

## Historical TestSprite Validation

The earlier TestSprite run reported 45/46 passed. It is retained as historical frontend/user-workflow evidence in [`testsprite-historical-report.md`](testsprite-historical-report.md).

The strongest historical functional coverage was:

- Investigation Overview: 14/14.
- Cases Repository: 6/6.
- Intelligence Graph: 5/6.
- Cross-Case Leads: 8/8.
- Investigative CLI: 6/6.
- Demo Investigation Flow: 6/6.

## Historical Failure

The only historical failure was `Open a connected case from the graph`, involving CASE-001. The node selection state changed, but the case detail transition did not occur.

The report identifies this as a graph-to-case transition problem and recommends wiring node selection to the same case-detail route/panel used by the repository.

The historical report does not independently verify the later implementation of that recommendation.

## Functional Evidence Boundary

Current audit claims and historical TestSprite claims are kept separate. A current audit result does not retroactively change what the older TestSprite run tested.
