# TRACE Data Model

## Core Investigation Objects

TRACE organizes investigation information around a small set of domain objects:

- **Case** — investigation metadata, status, priority, jurisdiction, tags, and related metrics.
- **Evidence** — an evidence artifact's metadata, processing state, provenance fields, and extracted entities.
- **Entity** — a normalized investigative indicator such as a phone number, UPI identifier, email, URL/domain, IP address, account, transaction, or username.
- **Relationship** — a candidate connection between cases supported by shared entities and a scoring breakdown.
- **Timeline Event** — a chronological investigative event associated with a case.

## Provenance

Relationships retain source context so investigators can trace a surfaced connection back to the cases and evidence records that contributed to it.

## Integrity Metadata

Evidence records can carry integrity-related metadata including a SHA-256 field and integrity status. In the current MVP this is part of the evidence data model; the repository should not be interpreted as a complete production forensic acquisition and cryptographic verification pipeline.

## Synthetic Data

The public demonstration is based on synthetic investigation data. No real personal, banking, financial, or law-enforcement evidence is required to operate the demo.

## Production Extension

A production deployment would map these application-level objects to durable, access-controlled storage with immutable audit records, retention policies, secure object storage, and independently validated evidence-processing workflows.
