# TRACE — Intelligence Engine

## Entity Extraction

TRACE identifies supported digital indicators from structured investigation content and turns them into normalized investigation entities.

Supported prototype indicator categories include telephone numbers, UPI IDs, bank accounts, email addresses, IP addresses and domains.

## Normalization

Normalization reduces presentation differences so logically equivalent identifiers can be compared consistently.

## Cross-Case Correlation

The correlation engine compares normalized entities across cases and creates candidate relationships. The current implementation has been hardened for deterministic and idempotent matching, deduplication of legacy relationship records and preservation of investigator dispositions.

## Deterministic Scoring

The documented prototype uses weighted explainability rules for shared indicators.

```text
Shared phone number       +40
Shared UPI ID             +35
Shared bank account       +35
Shared domain             +25
Supporting context       additional evidence
```

These values are correlation rules, not statistical probabilities.

## Explainability

Every candidate relationship should be inspectable through its contributing entities, source cases, supporting evidence and relationship scoring context.

## Reliability Requirements

Repeated correlation should not create duplicate relationships or unexpectedly overwrite investigator decisions. Deterministic behavior is therefore a core reliability requirement of the intelligence layer.
