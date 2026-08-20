# TRACE — Requirements

## Functional Requirements

| ID | Requirement | Status |
|---|---|---|
| FR-01 | Dashboard and system metrics | Implemented |
| FR-02 | Case listing and case inspection | Implemented |
| FR-03 | Entity listing, filtering and inspection | Implemented |
| FR-04 | Evidence metadata inspection | Implemented |
| FR-05 | Cross-case link listing | Implemented |
| FR-06 | Cross-case correlation | Implemented |
| FR-07 | Interactive investigation graph | Implemented |
| FR-08 | Evidence integrity/provenance concepts | Implemented |
| FR-09 | Investigation CLI | Implemented |
| FR-10 | AI investigation assistance | Implemented |
| FR-11 | API request validation | Implemented |
| FR-12 | Optional API-key authentication | Implemented |
| FR-13 | Request IDs and structured errors | Implemented |
| FR-14 | Rate limiting and payload limits | Implemented |

## Non-Functional Requirements

- **Explainability:** relationships must be inspectable rather than presented as unexplained conclusions.
- **Determinism:** repeated correlation should produce stable results.
- **Traceability:** evidence-related records should retain integrity metadata.
- **Security:** untrusted inputs and evidence must not become trusted instructions.
- **Usability:** investigators should be able to move between cases, entities, evidence and relationships without losing context.
- **Responsiveness:** the interface should remain usable across supported desktop and mobile states.
- **Deployability:** the project should build using the documented Node/Vite/Express workflow.

## Scope Boundary

TRACE is an investigation-assistance prototype. It does not autonomously determine guilt, identity or criminal-network membership, and a shared identifier is not treated as proof of criminal association.
