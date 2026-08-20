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
└── README.md
```

# 11. Core Domain Model

## 11.1 Case

A case represents an investigation and provides the primary context for evidence, entities, timelines and relationships.

## 11.2 Entity

An entity is a digital indicator extracted from or associated with evidence.

Examples:

- Telephone number
- UPI ID
- Bank account
- Email address
- IP address
- Domain

## 11.3 Evidence

Evidence represents an investigation artifact or its metadata. Prototype scenarios include SMS records, bank records, server logs and CDR-style reports.

## 11.4 Relationship

A relationship represents a potentially meaningful connection between cases or entities. It should retain enough context to explain which indicators contributed to it.

## 11.5 Audit and Disposition

Audit and disposition information supports the human-in-the-loop workflow. Machine-generated relationship discovery should remain distinguishable from investigator decisions.

# 12. Intelligence Engine

## 12.1 Entity Extraction

The intelligence workflow begins by identifying supported digital indicators from structured investigation content.

Extraction transforms evidence content into normalized investigation entities.

## 12.2 Entity Normalization

Normalization reduces formatting differences so logically equivalent identifiers can be compared consistently.

## 12.3 Cross-Case Correlation

The correlation engine compares normalized entities across cases and creates candidate relationships.

The latest hardening specifically targets deterministic, idempotent behavior and deduplication of legacy relationship records.

## 12.4 Deterministic Relationship Scoring

The documented prototype uses weighted contributions for shared indicators.

Example conceptual weights:

```text
Shared phone number       +40
Shared UPI ID             +35
Shared bank account       +35
Shared domain             +25
Supporting context       additional evidence
```

The values are explainability rules. They should not be interpreted as statistical probability.

## 12.5 Why Determinism Matters

If the same correlation operation creates duplicate relationships or changes investigator dispositions each time it runs, the investigation system becomes difficult to trust.

Deterministic matching makes the intelligence layer repeatable.

# 13. Investigation Graph

The graph is the visual expression of TRACE's cross-case concept.

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

Key graph behaviors:

- Case-to-entity relationships.
- Entity-to-case traversal.
- Search/filtering.
- Zoom and pan.
- Relationship inspection.
- Navigation into case details.
- Context-preserving investigation panels.

The graph is not only a visualization. It is an investigation navigation mechanism.

# 14. Evidence Integrity and Provenance

## 14.1 SHA-256 Fingerprinting

Evidence records can be associated with a SHA-256 fingerprint. The purpose is to provide a deterministic integrity reference for the represented artifact or payload.

## 14.2 Chain of Custody

The prototype includes chronological chain-of-custody style records.

These demonstrate provenance and auditability but should not be described as a certified legal evidence-management system.

## 14.3 Evidence Traceability

```text
Relationship
   |
   +-- Supporting Entity
   |
   +-- Source Case
   |
   +-- Evidence Artifact
   |
   +-- Evidence Metadata
   |
   +-- Correlation Rule
   |
   +-- Score / Severity
   |
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
  |
  +--> Security Headers
  |
  +--> CORS
  |
  +--> Body Size Limits
  |
  +--> /api Router
  |
  +--> Authentication
  |
  +--> Validation
  |
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
| Analysis/AI routes | Controlled through backend services and validation |

## 15.3 Standard Response Contract

```json
{
  "success": true,
  "data": {},
  "requestId": "..."
}
```

Error:

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "..."
  },
  "requestId": "..."
}
```

# 16. Security Architecture

Security is treated as part of the architecture rather than as an afterthought.

## 16.1 Request IDs

Each request receives a sanitized request identifier or a newly generated identifier.

The ID is returned in the response and the `x-request-id` header.

This supports debugging and audit correlation.

## 16.2 Security Headers

The backend sets controls including:

- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Strict-Transport-Security`
- `Permissions-Policy`
- `X-Frame-Options: SAMEORIGIN`
- Content Security Policy

## 16.3 CORS

CORS is controlled through configured allowed origins. Local development and compatible Google AI Studio origins are supported by the prototype's default policy.

## 16.4 Payload Limits

The Express server limits JSON and URL-encoded request bodies to 2 MB.

This reduces exposure to basic payload-memory exhaustion patterns.

## 16.5 Rate Limiting

The backend contains in-memory sliding-window rate limiters.

- General API: 120 requests/minute per client key.
- Intensive analysis/AI flows: 40 requests/minute per client key.

For distributed production deployments, these should be replaced with a shared/distributed mechanism.

## 16.6 API-Key Authentication

When `TRACE_API_KEY` is configured, the API requires a matching Bearer token or `X-API-Key`.

This provides an additional deployment-level access control.

## 16.7 Input Validation

The API validates:

- Case IDs.
- Entity identifiers.
- Evidence IDs.
- Relationship IDs.
- Pagination.
- Search strings.
- Enumerated fields.
- Minimum relationship scores.
- Analysis payloads.

## 16.8 Safe Error Handling

Client-facing errors use controlled codes and messages.

Fatal server exceptions are logged server-side with a request ID and returned to the client as a generic `INTERNAL_SERVER_ERROR`.

# 17. AI-Assisted Investigation

## 17.1 AI Role

The AI layer supports investigation-oriented search, explanation, summarization and analysis.

The AI is not the source of truth for evidence.

## 17.2 Tool Gateway

TRACE uses a controlled AI tool gateway instead of unrestricted model access.

The documented read-oriented capabilities include operations for:

- Searching cases.
- Inspecting a case.
- Searching entities.
- Inspecting an entity.
- Finding cross-case links.
- Getting relationship information.
- Getting evidence metadata.
- Getting case timelines.
- Analyzing a case.

## 17.3 Security Boundary

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

## 17.4 Prompt-Injection Isolation

Evidence is treated as untrusted data.

Text inside evidence is not automatically treated as a system instruction. This separation reduces the risk that malicious evidence content can override the AI's trusted operating rules.

## 17.5 AI Principle

> AI assists the investigator. AI does not replace the investigator.

# 18. CLI / Terminal Interface

TRACE includes a terminal-style investigation interface.

Documented commands include:

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

The CLI provides a rapid alternative to purely graphical investigation.

# 19. User Interface and UX

## 19.1 Major Workspaces

- Dashboard.
- Case repository.
- Entity explorer.
- Evidence workspace.
- Cross-case relationship views.
- Interactive investigation graph.
- Terminal-style workflow.
- Responsive navigation.

## 19.2 UX Principle

The interface is designed around investigator context switching.

A user should be able to move from:

```text
Relationship
    -> Entity
        -> Related Cases
            -> Evidence
                -> Verification
```

without losing the investigative trail.

# 20. Development and Build Process

## 20.1 Prerequisites

- Node.js 18+
- npm, pnpm or yarn
- Git
- Gemini API credentials when AI functionality is enabled

## 20.2 Clone

```bash
git clone https://github.com/voldey-04/Trace.git
cd Trace
```

## 20.3 Install

```bash
npm install
```

## 20.4 Environment

```bash
cp .env.example .env
```

Configure required variables locally.

Never commit secrets or API keys.

## 20.5 Development

```bash
npm run dev
```

The development command starts the TypeScript Express server and enables Vite middleware.

## 20.6 Type Check

```bash
npm run lint
```

The repository's lint script currently runs TypeScript with `--noEmit`.

## 20.7 Production Build

```bash
npm run build
npm start
```

The build process runs the Vite frontend build and bundles `server.ts` with esbuild into `dist/server.cjs`.

# 21. Deployment

The public demonstration is deployed at:

https://trace-kappa-indol.vercel.app/

This should be treated as a demonstration environment, not as a production law-enforcement evidence environment.

## 21.1 Deployment Checklist

- Configure environment variables.
- Keep API keys server-side.
- Set `ALLOWED_ORIGINS`.
- Configure `TRACE_API_KEY` when API authentication is required.
- Confirm HTTPS.
- Run a production build.
- Validate `/api/health`.
- Run functional smoke tests.
- Confirm synthetic data is being used.

## 21.2 Production Architecture Required for Real Deployment

A production implementation would require:

- Persistent encrypted database.
- Secure object storage.
- Identity and access management.
- Role-based authorization.
- Durable audit logging.
- Centralized monitoring.
- Secrets management.
- Backup/disaster recovery.
- Evidence retention/legal-hold policies.
- Network segmentation.
- Secure private infrastructure.

# 22. Testing Strategy

## 22.1 Test Layers

| Layer | Purpose | Example Coverage |
|---|---|---|
| Unit/logic | Validate intelligence behavior | Normalization, matching, scoring, deduplication |
| API validation | Validate backend contracts | IDs, enums, pagination, search, payloads |
| Security | Probe attack classes | XSS, SQLi, traversal, command injection, prompt injection |
| Functional UI | Validate workflows | Cases, entities, evidence, graph, navigation |
| Integration | Validate service boundaries | Router, investigation service, AI gateway |
| Regression | Prevent repeated bugs | Graph navigation, relationship lifecycle |
| Deployment smoke | Validate public build | Startup, health, core workflows |

## 22.2 Historical Functional Test

An earlier external TestSprite run reported:

```text
46 total tests
45 passed
1 failed
97.8% pass rate
```

The failure involved:

```text
Intelligence Graph -> CASE-001 case-detail navigation
```

Equivalent navigation from the Cases Repository worked.

The graph/navigation issue was subsequently addressed, and later repository work explicitly improved graph navigation and UI state management.

## 22.3 Current Security Validation

The current project record reports:

```text
106 / 106 tests passing
0 failures
```

This result represents an automated security/validation run.

It should be described as validation of the tested attack classes and application behaviors, not proof that TRACE is immune to all future vulnerabilities.

The current public repository does not expose a conventional test directory containing those 106 tests, so the result should be retained as an external validation report unless the test suite is later committed to the repository.

## 22.4 Security Test Matrix

| Category | Expected Protection | Status |
|---|---|---|
| Cross-Site Scripting | Safe input/output handling | Validated |
| SQL Injection | Reject injection-style inputs | Validated |
| Path Traversal | Reject traversal patterns | Validated |
| Command Injection | Prevent command execution paths | Validated |
| Prompt Injection | Isolate untrusted evidence from trusted instructions | Validated |
| Privilege Escalation | Enforce authorization server-side | Validated |
| Data Exfiltration | Bound queries and pagination | Validated |
| Payload Exhaustion | Enforce body-size limits | Validated |
| Rate Abuse | Throttle repeated requests | Implemented/validated |
| Malformed JSON | Safe 400 response | Implemented |

## 22.5 Regression Philosophy

Every significant bug should become one of:

1. A regression test.
2. A deterministic validation rule.
3. A documented acceptance check.

This is especially important for the graph and correlation engine because both contain stateful relationship lifecycles.

# 23. Bug and Fix History

| Stage | Problem | Resolution |
|---|---|---|
| Early UI | Responsive navigation required improvement | Mobile navigation added |
| Graph testing | CASE-001 navigation failure from graph | Graph navigation/UI state improved |
| Evidence stage | Need stronger provenance | SHA-256 and custody-style records added |
| Backend stage | Need server-side security boundary | Express API, validation, limits and auth added |
| Correlation stage | Repeated matching could duplicate relationships | Deterministic/idempotent matching and disposition preservation |

# 24. Example Investigation

Consider two apparently unrelated cases.

### Case A

```text
Phone Number: +91 XXXXXXXX
UPI ID: fraud@upi
Domain: example-phishing.com
```

### Case B

```text
Phone Number: +91 XXXXXXXX
Bank Account: XXXX1234
IP Address: 103.xxx.xxx.xxx
```

TRACE identifies the repeated phone number.

The system can then surface:

```text
Shared Phone
    |
    +-- Case A
    |    +-- UPI
    |    +-- Domain
    |
    +-- Case B
         +-- Bank Account
         +-- IP Address
```

The output is an investigative lead.

TRACE does not conclude that the cases belong to the same criminal network.

The investigator verifies the underlying evidence and determines relevance.

# 25. Human-in-the-Loop Model

```text
TRACE identifies relationship
             |
             v
TRACE explains supporting indicators
             |
             v
Investigator reviews
             |
             v
Investigator verifies evidence
             |
             v
Investigator decides relevance
```

This design keeps the final investigative judgment with the authorized human investigator.

# 26. Data and Privacy Model

The public demonstration uses synthetic investigation data.

This is an intentional safety boundary.

## Recommended Production Principles

- Encrypt data in transit and at rest.
- Apply least-privilege access.
- Separate evidence content from application metadata.
- Log access to sensitive evidence.
- Retain immutable audit events.
- Define retention and deletion rules.
- Use secure secrets management.
- Avoid placing sensitive evidence into AI prompts unless explicitly authorized and controlled.

# 27. Demonstration Flow

A strong TRACE demonstration should tell one coherent investigation story.

1. Open the dashboard.
2. Establish the investigation context.
3. Open the case repository.
4. Select a case.
5. Inspect its entities and evidence.
6. Identify an indicator repeated in another case.
7. Open the cross-case relationship.
8. Explain the deterministic score.
9. Switch to the graph.
10. Traverse the relationship.
11. Inspect supporting evidence metadata and integrity information.
12. Use the terminal interface.
13. Use AI assistance for an explanation or summary.
14. Emphasize the read-only AI boundary.
15. Emphasize that the investigator remains the decision maker.

# 28. Evaluation Criteria

TRACE should be evaluated by asking:

- Can it reveal a relationship that would otherwise require manual cross-case comparison?
- Can the investigator understand why the relationship was surfaced?
- Can the investigator navigate from relationship to case and evidence?
- Is AI assistance separated from authoritative decision-making?
- Does repeated correlation remain deterministic?
- Do malicious or malformed inputs fail safely?
- Are oversized requests rejected?
- Are internal stack traces hidden from clients?
- Can the complete workflow be demonstrated using synthetic data?

# 29. Limitations

- The prototype uses synthetic data.
- It is not a production law-enforcement platform.
- The current data layer is not an enterprise-grade persistent evidence repository.
- In-memory rate limiting is not sufficient for horizontally scaled production.
- Audit/custody mechanisms need durable storage and formal policy controls.
- AI output is probabilistic and must be verified against source evidence.
- Deterministic scoring is explainable but is not statistical certainty.
- The public demo should not receive real sensitive investigation data.
- Production identity, authorization and organizational policy layers remain necessary.

# 30. Future Roadmap

| Priority | Roadmap | Reason |
|---|---|---|
| P0 | Persistent secure data layer | Required for real multi-user investigations |
| P0 | Enterprise identity and RBAC | Controlled access |
| P0 | Durable audit/event store | Long-term accountability |
| P0 | Secure evidence object storage | Scalable evidence handling |
| P1 | Advanced entity normalization | Better cross-source correlation |
| P1 | Relationship provenance explorer | Better explainability |
| P1 | Test suite committed to repository | Reproducible validation |
| P2 | Advanced graph analytics | Larger networks |
| P2 | Case collaboration workflows | Team investigations |
| P2 | Production observability | Reliability and incident response |

# 31. Project Outcome

TRACE demonstrates a focused approach to cyber investigation assistance: turn distributed case evidence into a relationship layer that investigators can explore, verify and act upon.

The strongest MVP characteristics are:

- Cross-case correlation.
- Deterministic relationship logic.
- Evidence provenance direction.
- Interactive investigation graph.
- Controlled AI gateway.
- Deliberate security hardening.
- Human-in-the-loop investigation workflow.

The most important next step toward production is not simply adding more UI features. It is strengthening persistence, identity, authorization, audit durability, evidence storage, reproducible testing and operational security.

# 32. Appendix A — Key Commands

```bash
npm install
npm run dev
npm run lint
npm run build
npm start
```

# 33. Appendix B — Environment Variables

| Variable | Purpose | Handling |
|---|---|---|
| `TRACE_API_KEY` | Optional API authentication | Secret |
| `ALLOWED_ORIGINS` | CORS allow-list | Deployment configuration |
| `GEMINI_API_KEY` | AI provider credential when required | Secret |
| `NODE_ENV` | Development/production behavior | Runtime configuration |

# 34. Appendix C — Technical Evidence Behind This Documentation

This documentation is grounded in:

- The current public GitHub repository.
- The project README.
- `package.json`.
- `server.ts`.
- `src/server/apiRouter.ts`.
- `src/server/security.ts`.
- Repository commit history from project initialization through the latest cross-case matching hardening.
- Previously recorded external functional testing.
- Previously recorded external security validation.

# 35. Appendix D — Documentation Status

This document describes the TRACE implementation and development state as of 20 August 2026.

Where a test result originates from an external validation run rather than a test suite visible in the repository, it is explicitly described as an external validation record. This distinction should be preserved in formal submissions so that the documentation does not overstate reproducibility.
