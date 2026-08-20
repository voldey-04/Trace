# TRACE — Evidence Intelligence & Cross-Case Investigation Platform

**Complete Technical, Product, Architecture, Development, Testing and Deployment Documentation**

**Documentation date:** 20 August 2026

---

# 1. Executive Summary

TRACE is an evidence-intelligence and cross-case investigation assistance platform designed to help investigators discover relationships that are difficult to see when cybercrime evidence is distributed across separate cases.

The central product idea is simple: instead of treating every investigation as an isolated record, TRACE organizes cases, digital entities, evidence, timelines and relationships into a common intelligence layer and surfaces recurring indicators across cases.

TRACE is intentionally human-in-the-loop. A relationship is an investigative lead, not a verdict. The investigator can inspect the underlying entities and evidence, understand why the relationship was surfaced, and decide whether it is operationally relevant.

The current implementation is a hackathon/MVP prototype using synthetic investigation data. The public repository contains a React 19 + TypeScript frontend, Vite build tooling, an Express backend, deterministic investigation services, evidence-integrity mechanisms, an interactive graph, a terminal-style interface and controlled server-side AI assistance using Gemini.

The backend also contains request identifiers, security headers, CORS controls, input validation, payload limits, rate limiting, optional API-key authentication and standardized error handling.

# 2. Project Identity

| Item | Value |
|---|---|
| Project | TRACE |
| Description | Evidence Intelligence & Cross-Case Investigation Platform |
| Repository | https://github.com/voldey-04/Trace |
| Live Demo | https://trace-kappa-indol.vercel.app/ |
| Repository Owner | voldey-04 |
| Default Branch | main |
| Visibility | Public |
| Documentation Date | 20 August 2026 |
| Demonstration Data | Synthetic investigation data |

# 3. Problem Definition

## 3.1 Investigation Context

Cybercrime investigations frequently contain identifiers that recur across incidents: telephone numbers, UPI IDs, bank accounts, email addresses, IP addresses, domains and other digital indicators.

In a case-by-case workflow, an investigator may see an indicator inside one case without having immediate visibility into where else the same indicator appears.

As the number of cases and evidence artifacts grows, manual comparison becomes increasingly difficult.

## 3.2 Core Problem

> Important relationships may already exist within available evidence, but remain hidden because that evidence is distributed across separate investigations.

The challenge is therefore not only storing evidence. It is finding relationships between evidence that already exists.

## 3.3 Design Question

How can a system reduce the time required to discover potentially relevant cross-case relationships while preserving explainability, evidence traceability and investigator control?

# 4. Product Goals and Non-Goals

## 4.1 Goals

- Centralize case, entity, evidence and relationship information.
- Identify repeated digital indicators across cases.
- Provide deterministic and explainable relationship scoring.
- Provide list-based and graph-based investigation views.
- Maintain a visible connection between investigative leads and supporting evidence.
- Provide SHA-256 evidence fingerprinting and custody-style provenance.
- Provide constrained AI assistance rather than unrestricted model access.
- Apply application-level security controls to API requests and untrusted evidence content.
- Demonstrate a complete end-to-end investigation workflow using synthetic data.

## 4.2 Non-Goals

- TRACE is not a replacement for an enterprise law-enforcement case-management platform.
- TRACE does not autonomously determine guilt, identity or criminal-network membership.
- A shared identifier is not treated as proof of criminal association.
- The current prototype is not a production evidence repository.
- The public demonstration should not process real sensitive personal, financial or law-enforcement data.
- The AI layer does not receive unrestricted database, shell, filesystem or external-network access.

# 5. Core Product Concept

TRACE introduces an intelligence layer between evidence and investigator decision-making.

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

The important product shift is from case-centric browsing to relationship-centric investigation.

> TRACE focuses on what connects investigations, not only what exists inside one investigation.

# 6. Development Journey

## 6.1 Initial Foundation

The repository history shows the project beginning with a foundational React, Tailwind CSS and TypeScript architecture. The first implementation established the application layout and core type definitions.

## 6.2 Responsive Interface

A later stage introduced mobile-responsive navigation, including mobile menu support, a bottom navigation pattern and responsive layout adjustments.

## 6.3 Evidence Integrity

The evidence layer was strengthened with cryptographically verifiable metadata, SHA-256 hashing and chronological chain-of-custody style logging. Application state handling was also improved to keep evidence operations consistent.

## 6.4 Documentation and Product Refinement

The README evolved from a basic project description into a structured technical/product overview covering the problem, solution, capabilities, security model, technology stack and setup.

## 6.5 Backend and Security Hardening

A major implementation milestone introduced a custom Express backend. This added request validation, safe body-size limits, API authorization support, security middleware and improvements to investigation graph navigation and UI state management.

## 6.6 Cross-Case Matching Hardening

The latest recorded repository change hardened cross-case matching so that it is deterministic and idempotent, legacy relationship records can be deduplicated, and investigator dispositions are preserved.

This is an important reliability improvement because repeated analysis should not create duplicate relationships or unexpectedly overwrite investigative decisions.

## 6.7 Documentation and Validation Hardening

The repository now includes a focused documentation tree covering architecture, requirements, investigation workflow, intelligence, evidence integrity, AI architecture, security, API behavior, development, deployment and testing. Historical TestSprite evidence and the current audit are kept in separate reports so that earlier results are not confused with current status.

# 7. Requirements Analysis

## 7.1 Functional Requirements

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

## 7.2 Non-Functional Requirements

- **Explainability:** relationships must be inspectable.
- **Determinism:** repeated correlation should produce stable results.
- **Traceability:** evidence-related records should retain integrity metadata.
- **Security:** untrusted inputs and evidence must not become trusted instructions.
- **Usability:** investigators should be able to move between cases, entities, evidence and relationships without losing context.
- **Responsiveness:** the interface should work across desktop and mobile layouts.
- **Deployability:** the project should build using the documented Node/Vite/Express workflow.

# 8. System Architecture

```text
                         TRACE
                           |
             +-------------+-------------+
             |                           |
             v                           v
      Presentation Layer          Intelligence Layer
             |                           |
     +-------+-------+           +-------+-------+
     |       |       |           |       |       |
 Dashboard  Cases   Graph      Extraction Correlation Scoring
     |       |       |           |       |       |
     +-------+-------+           +-------+-------+
             |                           |
             +-------------+-------------+
                           |
                           v
                Investigation Services
                           |
                           v
              Synthetic Investigation Data
                           |
              +------------+------------+
              |                         |
              v                         v
       Evidence Metadata        Relationships / Audit
              |
              v
        Controlled AI Gateway
              |
              v
       Read-only investigation tools
```

The current server bootstrap uses Express and mounts the TRACE API under `/api`. In development, Vite runs in middleware mode. In production, the compiled frontend is served from `dist`.

# 9. Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| UI | React 19 | Component-based investigation interface |
| Language | TypeScript | Typed frontend and backend |
| Styling | Tailwind CSS | Responsive styling |
| Build | Vite 6 | Frontend development/build |
| Server | Node.js + Express 4 | API/application server |
| AI | Google Gemini via `@google/genai` | Investigation assistance |
| Icons | Lucide React | UI iconography |
| Motion | Motion | Interface animation |
| Bundling | esbuild | Production server bundling |
| Runtime | tsx | TypeScript development runtime |
| Configuration | dotenv | Environment loading |

# 10. Repository Structure

```text
TRACE/
├── src/
│   ├── components/
│   │   ├── dashboard/
│   │   ├── cases/
│   │   ├── graph/
│   │   ├── evidence/
│   │   ├── terminal/
│   │   └── layout/
│   ├── context/
│   ├── data/
│   ├── engine/
│   ├── server/
│   │   ├── apiRouter.ts
│   │   ├── security.ts
│   │   └── validators.ts
│   ├── services/
│   │   ├── investigationService
│   │   └── aiToolGateway
│   ├── types/
│   ├── App.tsx
│   └── main.tsx
├── server.ts
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── .env.example
├── .gitignore
├── README.md
└── docs/
    ├── README.md
    ├── 01-project-overview.md
    ├── 02-requirements.md
    ├── 03-architecture.md
    ├── 04-investigation-workflow.md
    ├── 05-intelligence-engine.md
    ├── 06-evidence-integrity.md
    ├── 07-ai-architecture.md
    ├── 08-security.md
    ├── 09-api.md
    ├── 10-development.md
    ├── 11-deployment.md
    ├── 12-testing.md
    ├── reports/
    │   ├── audit-summary.md
    │   ├── functional-testing.md
    │   ├── security-testing.md
    │   ├── regression-testing.md
    │   ├── testsprite-historical-report.md
    │   └── test-results.json
    └── TRACE_Complete_Technical_Documentation.md
```

# 11. Core Domain Model

## 11.1 Case

A case represents an investigation and provides the primary context for evidence, entities, timelines and relationships.

## 11.2 Entity

An entity is a digital indicator extracted from or associated with evidence.

Examples include telephone numbers, UPI IDs, bank accounts, email addresses, IP addresses and domains.

## 11.3 Evidence

Evidence represents an investigation artifact or its metadata. Prototype scenarios include SMS records, bank records, server logs and CDR-style reports.

## 11.4 Relationship

A relationship represents a potentially meaningful connection between cases or entities. It should retain enough context to explain which indicators contributed to it.

## 11.5 Audit and Disposition

Audit and disposition information supports the human-in-the-loop workflow. Machine-generated relationship discovery should remain distinguishable from investigator decisions.

# 12. Intelligence Engine

## 12.1 Entity Extraction

The intelligence workflow begins by identifying supported digital indicators from structured investigation content.

## 12.2 Normalization

Normalization reduces presentation differences so logically equivalent identifiers can be compared consistently.

## 12.3 Cross-Case Correlation

The correlation engine compares normalized entities across cases and creates candidate relationships. The current hardening makes matching deterministic and idempotent, supports deduplication of legacy relationship records and preserves investigator dispositions.

## 12.4 Deterministic Relationship Scoring

The documented prototype uses weighted contributions for shared indicators.

```text
Shared phone number       +40
Shared UPI ID             +35
Shared bank account       +35
Shared domain             +25
Supporting context       additional evidence
```

These are explainability rules, not statistical probabilities.

## 12.5 Reliability Requirement

Repeated correlation should not create duplicate relationships or unexpectedly overwrite investigator decisions.

# 13. Investigation Graph

The graph is the visual expression and a navigation mechanism for TRACE's cross-case model.

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

Supported graph behaviors include exploration, search, filtering, reset, relationship inspection and navigation to supported case details.

# 14. Evidence Integrity and Provenance

## 14.1 SHA-256 Fingerprinting

Evidence records can be associated with a SHA-256 fingerprint as a deterministic integrity reference.

## 14.2 Chain of Custody

The prototype includes chronological chain-of-custody style records to demonstrate provenance and auditability. These should not be described as a certified legal evidence-management system.

## 14.3 Provenance Model

```text
Relationship
   |
   +-- Supporting Entity
   +-- Source Case
   +-- Evidence Artifact
   +-- Evidence Metadata
   +-- Correlation Rule
   +-- Score / Severity
   +-- Investigator Disposition
```

# 15. Backend and API Architecture

## 15.1 Request Pipeline

```text
Client
  |
  v
Express
  |
  +--> Request ID
  +--> Security Headers
  +--> CORS
  +--> Body Size Limits
  +--> /api Router
  +--> Authentication
  +--> Validation
  +--> Investigation Service / AI Gateway
  |
  v
Structured Response
```

## 15.2 API Areas

| Endpoint | Purpose |
|---|---|
| `GET /api/health` | Health/system metrics |
| `GET /api/cases` | Case listing, search, filters, pagination |
| `GET /api/cases/:id` | Case detail |
| `GET /api/entities` | Entity listing/search/filtering |
| `GET /api/entities/:id` | Entity inspection |
| `GET /api/evidence` | Evidence listing |
| `GET /api/evidence/:id` | Evidence detail |
| `GET /api/links` | Cross-case link listing |
| `GET /api/relationships/:id` | Relationship detail |
| `GET /api/ai/audit` | AI tool audit information, as documented by the current audit |

## 15.3 Standard Response Contract

```json
{
  "success": true,
  "data": {},
  "requestId": "..."
}
```

Errors use the same request-tracing identifier and controlled error codes.

# 16. Security Architecture

## 16.1 Implemented Controls

- Request IDs.
- `X-Content-Type-Options: nosniff`.
- `Referrer-Policy: strict-origin-when-cross-origin`.
- `Strict-Transport-Security`.
- `Permissions-Policy`.
- `X-Frame-Options: SAMEORIGIN`.
- Content Security Policy.
- Controlled CORS.
- 2 MB body limits.
- In-memory rate limiting.
- Optional `TRACE_API_KEY` authentication.
- Identifier, pagination, search, enum and score validation.
- Structured error responses.
- Disabled Express fingerprinting.

## 16.2 AI Security Boundary

The current audit reports nine read-only investigative tools and zero access to shell execution, arbitrary SQL, file modification or external network requests.

Evidence text is treated as untrusted content and separated from trusted system/tool instructions.

## 16.3 Current Security Audit

```text
106 / 106 automated tests passing
0 failures
```

The tested attack classes reported by the current audit are XSS injection, SQL injection syntax, path traversal payloads, command injection operators, prompt injection overrides and parameter privilege escalation attempts.

The audit also reports active structured AI tool audit logging at `GET /api/ai/audit`.

## 16.4 Secrets

The supplied audit reports zero hardcoded secrets/API keys, documented empty placeholders in `.env.example` and a clean production dependency graph.

## 16.5 Security Claim Boundary

The audit demonstrates successful results for the tested controls. It is not proof that TRACE is immune to all future vulnerabilities or untested attack paths.

# 17. AI-Assisted Investigation

## 17.1 Role

AI assists with search, explanation, summarization and analysis. It is not the authoritative source of evidence.

## 17.2 Current Tool Set

The supplied audit identifies nine approved read-only tools:

```text
search_cases
get_case
search_entities
inspect_entity
find_cross_case_links
get_relationship
get_evidence_metadata
get_case_timeline
analyze_case
```

## 17.3 Trust Boundary

```text
System Policy
     |
     v
Tool Authorization
     |
     v
AI Request
     |
     v
Approved Read-only Tool
     |
     v
Structured Investigation Data
     |
     v
AI Explanation
```

## 17.4 Human Oversight

AI assists the investigator. It does not independently modify evidence or make final investigative determinations.

# 18. CLI / Terminal Interface

TRACE includes a terminal-style investigation interface with documented commands including:

```text
help
cases
inspect <entity>
correlate
evidence
audit
clear
ai
```

# 19. Development and Build

## Local Setup

```bash
git clone https://github.com/voldey-04/Trace.git
cd Trace
npm install
cp .env.example .env
npm run dev
```

## Type Check

```bash
npm run lint
```

## Production Build

```bash
npm run build
npm start
```

The build runs the Vite frontend build and bundles `server.ts` with esbuild into `dist/server.cjs`.

# 20. Deployment

The public demonstration is deployed at:

https://trace-kappa-indol.vercel.app/

This is a demonstration environment using synthetic investigation data.

Production deployment would require persistent encrypted storage, identity/RBAC, durable audit logs, secure evidence storage, secrets management, centralized monitoring, backup/disaster recovery and formal retention policies.

# 21. Testing and Validation

TRACE uses multiple validation layers. Historical and current results are deliberately kept separate.

## 21.1 Historical TestSprite Validation

The Aug 17, 2026 TestSprite run is preserved as historical frontend/user-workflow evidence.

```text
46 total
45 passed
1 failed
0 skipped
0 blocked
97.8% pass rate
```

The run covered Investigation Overview, Cases Repository, Intelligence Graph, Cross-Case Leads, Investigative CLI and Demo Investigation Flow.

### Historical failure

`Open a connected case from the graph`

The affected path was Intelligence Graph → CASE-001 → Case detail. CASE-001 remained highlighted, but no detail panel/modal/navigation appeared.

The TestSprite report proposed verifying graph node handlers, route/modal wiring and deployment of the detail component. The report itself did not verify the subsequent fix.

See [`docs/reports/testsprite-historical-report.md`](reports/testsprite-historical-report.md).

## 21.2 Current Automated Audit

The supplied current audit reports:

```text
106 / 106 automated tests passing
0 failures
TypeScript linter: 0 errors
Production build: successfully compiled
```

The current audit reports successful functional operation across dashboard, case management, evidence view, graph topology and inspection, link explainability/provenance, deterministic correlation and the investigative CLI.

### Current API validation

The audit reports validated input boundaries across routes, standardized response envelopes, request tracing IDs and sanitized error handling.

### Current security validation

The audit reports successful tested protection for XSS injection, SQL injection syntax, path traversal, command injection operators, prompt injection overrides and parameter privilege escalation attempts.

### AI gateway validation

The audit reports exactly nine approved read-only tools, no shell/SQL/file/network access, clean negative results for non-existent identifiers, evidence-text isolation and active AI tool audit logging.

## 21.3 Regression Strategy

Historical failures become high-priority regression candidates. The graph-to-case navigation test is therefore retained as a high-priority regression requirement alongside graph exploration, link inspection, repository-to-detail navigation and core cross-case lead review.

The current cross-case matching hardening also creates regression requirements for deterministic repeated execution, deduplication and preservation of investigator dispositions.

## 21.4 Testing Gaps

The historical TestSprite evidence did not independently verify entity management/search, evidence and evidence-integrity workflows, timeline behavior, responsive device coverage, browser/device matrices or several navigation/error scenarios. The current audit should be interpreted according to its own documented scope.

## 21.5 Machine-Readable Evidence

See [`docs/reports/test-results.json`](reports/test-results.json) for the preserved summary of the historical TestSprite run and current aggregate audit evidence.

# 22. Current Audit Summary

| Area | Result |
|---|---|
| Functional core workflows | Reported operational |
| API validation | Validated |
| Security attack classes | Validated for tested classes |
| AI tool isolation | Validated |
| Secrets/dependency audit | Validated |
| TypeScript | 0 errors reported |
| Production build | Successfully compiled |
| Automated audit | 106/106 passed |
| Historical TestSprite | 45/46 passed, 1 failed |

# 23. Limitations

- TRACE uses synthetic data and is not a production law-enforcement platform.
- The current storage architecture is not an enterprise evidence repository.
- In-memory rate limiting is not sufficient for horizontally scaled production.
- Audit/custody mechanisms need durable storage and formal policy controls.
- AI output is probabilistic and must be verified against source evidence.
- Deterministic scoring is explainable but is not statistical certainty.
- Production identity, authorization and organizational policy layers remain necessary.

# 24. Future Roadmap

| Priority | Roadmap | Reason |
|---|---|---|
| P0 | Persistent secure data layer | Real multi-user investigations |
| P0 | Enterprise identity and RBAC | Controlled access |
| P0 | Durable audit/event store | Long-term accountability |
| P0 | Secure evidence object storage | Scalable evidence handling |
| P1 | Advanced entity normalization | Better cross-source correlation |
| P1 | Relationship provenance explorer | Better explainability |
| P1 | Test suite committed to repository | Reproducible validation |
| P2 | Advanced graph analytics | Larger networks |
| P2 | Case collaboration workflows | Team investigations |
| P2 | Production observability | Reliability and incident response |

# 25. Project Outcome

TRACE demonstrates a focused approach to cyber investigation assistance: turn distributed case evidence into a relationship layer that investigators can explore, verify and act upon.

The strongest MVP characteristics are cross-case correlation, deterministic relationship logic, evidence provenance, an interactive graph, a controlled AI gateway and deliberate security hardening.

The most important next step toward production is strengthening persistence, identity, authorization, audit durability, evidence storage, reproducible testing and operational security.

# 26. Appendix — Repository Documentation Map

The repository's focused documentation is under `docs/`. Start with `docs/README.md` for the map and use the consolidated master document when a single end-to-end record is required.
