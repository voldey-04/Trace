# TRACE API Guide

## API Boundary

The Express server mounts the TRACE application API under `/api`. The API exposes structured investigation operations used by the React application and controlled AI tool gateway.

## Operation Groups

### Cases

- Search/filter investigation cases.
- Retrieve a case and investigation metrics.

### Entities

- Search investigative indicators.
- Inspect an entity and its cross-case occurrences.

### Relationships

- Find cross-case links.
- Inspect a specific relationship and its score breakdown.

### Evidence

- Retrieve evidence metadata, provenance fields, integrity status, and extracted entity summaries.

### Timelines

- Retrieve chronological investigation events for a case.

### Analysis

- Run the deterministic TRACE investigation analysis workflow on a case or supported forensic input.

## AI Tool Boundary

The AI tool gateway exposes explicit read-oriented investigation operations including case search, case retrieval, entity search, entity inspection, cross-case link discovery, relationship inspection, evidence metadata retrieval, timeline retrieval, and case analysis.

The exact request and response schemas are defined by the TypeScript tool and API implementations in the repository. This document intentionally describes the public architecture at a high level rather than duplicating generated schemas that can drift from code.

## Errors

The server returns structured JSON error responses with a request identifier. Client-facing error messages are designed to avoid exposing raw server stack traces.
