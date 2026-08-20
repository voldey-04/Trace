# TRACE Investigation Engine

## Investigation Pipeline

```text
Case / Evidence Data
        |
        v
Entity Extraction
        |
        v
Entity Normalization
        |
        v
Cross-Case Candidate Matching
        |
        v
Relationship Scoring
        |
        v
Explainable Investigation Lead
        |
        v
Human Verification
```

## Entity Handling

TRACE works with structured investigative indicators such as phone numbers, UPI identifiers, email addresses, URLs/domains, IP addresses, accounts, transactions, and usernames. Entity values can carry normalized representations so equivalent indicators can be compared consistently.

## Cross-Case Correlation

The investigation service compares supported indicators across cases and returns candidate relationships. Relationship results include the cases involved, shared indicators, score/severity information, provenance context, and investigator verification state where available.

## Explainability

A surfaced relationship is intended to be explainable through its shared indicators and scoring breakdown rather than being presented as an unexplained model probability.

## Determinism

The core correlation workflow is application-level logic. Given the same synthetic investigation inputs and configuration, deterministic operations are intended to produce repeatable results. Gemini is an assistance layer exposed through explicit investigation tools and is not the authoritative source of the underlying case relationship records.

## Human-in-the-Loop

TRACE surfaces potential relationships for investigator review. It does not autonomously decide that two investigations belong to the same criminal network.

## MVP Boundary

The current engine operates on synthetic demonstration data and application-level investigation services. A production implementation would add durable storage, real evidence ingestion and parsing, forensic acquisition workflows, and independently validated cryptographic evidence handling.
