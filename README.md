# TRACE

## Evidence Intelligence & Cross-Case Investigation Platform

> An explainable intelligence layer for discovering hidden relationships across cybercrime investigations.

TRACE is a cyber investigation assistance platform designed to help investigators identify relationships across otherwise isolated cybercrime cases.

The platform extracts and organizes digital indicators such as phone numbers, UPI IDs, bank accounts, domains, IP addresses, and other forensic entities, then correlates them across cases to surface potential investigative leads.

TRACE does not replace investigators or make autonomous conclusions. It helps investigators discover connections faster, understand why those connections exist, and verify them using the underlying evidence.

---

## Live Demo

**Live Application:**  
https://trace-kappa-indol.vercel.app/

**Source Code:**  
https://github.com/voldey-04/Trace

The live prototype operates using synthetic investigation data.

No real personal, financial, banking, or law-enforcement data is used.

> **Implementation note:** TRACE's current repository is an MVP/prototype. Some production concerns—such as durable evidence storage, persistent database infrastructure, enterprise identity/RBAC, and operational audit storage—are intentionally outside the current demonstration build.

---

# 1. Problem Statement

Cybercrime investigations are often handled as individual cases.

A phone number discovered in one complaint may also appear in another case. A UPI identifier may be associated with multiple victims. A phishing domain may occur across several incidents. A bank account or IP address may connect investigations that initially appear unrelated.

However, these relationships can remain difficult to discover when evidence is distributed across separate cases.

Traditional workflows often require investigators to manually compare:

- Phone numbers
- UPI IDs
- Bank accounts
- Email addresses
- IP addresses
- Domains
- Transaction identifiers
- Other digital indicators

As the number of cases and evidence artifacts increases, manually identifying recurring entities becomes increasingly difficult.

### Core Problem

> Important relationships may already exist within available evidence, but remain hidden because that evidence is distributed across separate investigations.

---

# 2. TRACE Solution

TRACE introduces a cross-case evidence intelligence layer between raw investigation data and investigator decision-making.

The system follows a structured workflow:

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
Evidence Overlap Analysis
   |
   v
Explainable Relationship Scoring
   |
   v
Investigator Verification
```

The current implementation demonstrates this workflow with synthetic investigation data and application-level investigation services.

---

# 3. Current Technology Stack

### Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Motion
- Lucide React

### Server

- Node.js
- Express
- TypeScript
- Vite middleware in development
- esbuild for production server bundling

### Intelligence / AI

- Deterministic investigation and correlation engine
- Entity extraction and normalization workflows
- Explainable relationship scoring
- Controlled AI tool gateway
- Google GenAI SDK (`@google/genai`)

### Deployment

- Vercel-hosted public demonstration
- GitHub source repository

### Important prototype boundary

The current repository does **not** depend on Supabase, Cloudinary, Firebase, or a dedicated external PostgreSQL service. Persistent production storage and secure evidence-object infrastructure are future production concerns rather than dependencies of the current demo build.

---

# 4. Evidence Integrity Model

TRACE represents evidence integrity and provenance metadata as part of the investigation model, including SHA-256-related evidence metadata and integrity status.

The current public prototype should be treated as a demonstration of the **evidence-integrity data model and verification workflow**, not as a claim that production-grade forensic hashing and evidence acquisition infrastructure has been completed.

A production deployment would add a dedicated cryptographic hashing pipeline, durable evidence storage, immutable audit trails, access controls, and secure chain-of-custody procedures.

---

# 5. Investigation Intelligence

TRACE exposes controlled investigation tools through its AI tool gateway. The gateway supports read-oriented operations for:

- Searching cases
- Retrieving case details
- Searching entities
- Inspecting entity provenance
- Discovering cross-case links
- Inspecting relationships
- Retrieving evidence metadata
- Retrieving case timelines
- Running case analysis

The goal is to make every surfaced relationship explainable and traceable to the underlying investigation data.

---

# 6. Prototype Data Boundary

The public demonstration uses synthetic investigation records.

This is intentional: TRACE can demonstrate the investigation workflow without exposing real personal, banking, financial, or law-enforcement information.

For a production deployment, the architecture would need durable encrypted persistence, secure evidence-object storage, identity and access management, RBAC, operational logging, retention policies, backups, monitoring, and legal/compliance controls.

---

# 7. Development

```bash
npm install
npm run dev
```

### Validation

```bash
npm run lint
npm run build
npm start
```

The development server uses Vite middleware through the Express bootstrap. The production server serves the compiled frontend from `dist` while keeping the API mounted under `/api`.

---

# 8. Repository Structure

```text
src/
├── components/    # UI and investigation views
├── context/       # application state
├── data/          # prototype investigation data
├── engine/        # deterministic intelligence and correlation logic
├── services/      # investigation and AI gateway services
├── server/        # API, security and request handling
└── types/         # shared TypeScript models
```

Additional technical documentation is available under `docs/`.

---

# 9. Security Posture of the Demo

The current server includes security-oriented middleware such as request IDs, security headers, CORS handling, bounded JSON/form payloads, disabled Express fingerprinting, structured API errors, and a controlled API router.

These controls improve the posture of the demonstration application, but they are not a substitute for the full security program required by a real investigative deployment.

---

# 10. Roadmap to Production

The next production-focused stages include:

1. Durable encrypted persistence
2. Secure evidence-object storage
3. Real evidence ingestion and cryptographic hashing
4. Identity, RBAC and investigator access controls
5. Immutable audit and chain-of-custody storage
6. Stronger observability, backup and retention controls
7. Expanded automated and adversarial testing

---

# 11. Disclaimer

TRACE is an investigation assistance prototype. It is designed to surface explainable investigative leads and correlations for human review.

It does not independently establish guilt, attribution, or legal conclusions.

Investigators remain responsible for validating evidence, context, provenance, and conclusions before taking action.
