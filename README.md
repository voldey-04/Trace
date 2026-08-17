# TRACE

## Evidence Intelligence & Cross-Case Investigation Platform

> **An explainable intelligence layer for discovering hidden relationships across cybercrime investigations.**

TRACE is a specialized evidence intelligence platform designed to assist investigators in identifying cross-case relationships across digital fraud artifacts, cyber scams, mule account networks, and forensic leads.

Instead of analyzing every investigation in isolation, TRACE correlates digital indicators across cases and surfaces recurring entities as **explainable investigative leads**.

---

## Live Demo

**Demo:** https://trace-kappa-indol.vercel.app/

The live prototype uses **synthetic investigation data** for demonstration purposes.

> No real personal, financial, banking, or law-enforcement data is used in the prototype.

---

## 1. The Problem

Cybercrime investigations frequently operate in **case-by-case silos**.

A phone number, UPI ID, bank account, phishing domain, IP address, or other digital identifier may appear in multiple investigations without investigators immediately recognizing the relationship.

This creates several challenges:

* Evidence is distributed across different cases.
* Investigators may need to manually compare recurring identifiers.
* Relationships between seemingly unrelated cases can remain hidden.
* Large evidence sets increase the difficulty of finding meaningful overlaps.
* Existing investigation workflows can make relationship discovery time-consuming.

### The Core Problem

> **A critical connection may already exist in the evidence — but remain invisible because the evidence is distributed across separate cases.**

---

## 2. The TRACE Solution

TRACE introduces a **cross-case evidence intelligence layer**.

It extracts digital entities from investigation evidence, compares them across cases, identifies recurring indicators, calculates deterministic relationship scores, and presents the resulting connections through an interactive investigation graph.

### TRACE Workflow

```text
Evidence
   ↓
Entity Extraction
   ↓
Cross-Case Correlation
   ↓
Evidence Overlap Analysis
   ↓
Deterministic Confidence Scoring
   ↓
Relationship Visualization
   ↓
Investigative Lead
   ↓
Human Verification
```

TRACE does not attempt to replace the investigator.

It helps the investigator **see connections faster**.

---

## 3. Why TRACE?

Traditional investigation workflows often focus on:

```text
Case A → Investigate → Close
Case B → Investigate → Close
Case C → Investigate → Close
```

TRACE introduces a different perspective:

```text
Case A ─────┐
            │
Case B ─────┼──→ Shared Indicators → Potential Relationship
            │
Case C ─────┘
```

The objective is to transform isolated evidence into **connected investigative context**.

---

## 4. What Makes TRACE Different?

TRACE is not positioned as another generic case-management system.

Its core focus is **cross-case relationship discovery**.

| Traditional Workflow                  | TRACE                                |
| ------------------------------------- | ------------------------------------ |
| Case-by-case analysis                 | Cross-case correlation               |
| Manual identifier comparison          | Automated entity matching            |
| Evidence distributed across reports   | Structured evidence context          |
| Hidden relationships                  | Interactive relationship graph       |
| Manual lead discovery                 | Lead-oriented intelligence           |
| Difficult-to-explain scoring          | Deterministic scoring                |
| Evidence without context              | Evidence with provenance             |
| Investigator searches for connections | TRACE surfaces potential connections |

### Core Differentiator

> **TRACE focuses on what connects cases, not just what exists inside a case.**

---

## 5. Key Features

### Cross-Case Linkage Engine

TRACE identifies recurring digital indicators across investigations.

Supported entities include:

* Telephone numbers
* UPI IDs
* Bank accounts
* Phishing domains
* IP addresses
* Email addresses
* Other supported digital indicators

A recurring entity can become a candidate relationship between cases.

---

### Deterministic Confidence Scoring

TRACE uses deterministic analysis rather than relying on unexplained black-box predictions.

Relationship strength can be derived from factors such as:

* Entity overlap
* Number of supporting artifacts
* Cross-case recurrence
* Evidence source
* Relationship type
* Supporting provenance

This makes the result easier to inspect and explain.

> **TRACE identifies relationships. Investigators determine their significance.**

---

### Interactive Investigation Graph

TRACE provides an interactive SVG-based network visualization for exploring relationships between cases and digital entities.

The graph supports:

* Radial layouts
* Case-to-entity relationships
* Search filtering
* Entity inspection
* Relationship visualization
* Investigation drawers
* Interactive exploration

An investigator can move through:

```text
Case
 ↓
Entity
 ↓
Related Case
 ↓
Supporting Evidence
```

---

### Evidence Intelligence

TRACE is designed around structured evidence ingestion and entity extraction from common cybercrime investigation artifacts.

Prototype-supported evidence scenarios include:

* SMS dumps
* Bank records
* Server logs
* CDR reports
* Digital investigation records

The system converts relevant identifiers into structured entities that can be correlated across investigations.

---

### Investigative CLI

TRACE includes a terminal-style investigation interface for rapid keyboard-driven workflows.

Example commands:

```text
cases
leads
inspect <entity>
link <entity>
analyze <case>
```

This provides an alternative to purely graphical investigation workflows.

---

### Responsive Interface

TRACE is designed for both desktop and mobile environments.

The interface includes:

* Responsive layouts
* Slide-out drawers
* Mobile navigation
* Fast search
* Adaptive investigation views
* Desktop keyboard workflows

The investigation workflow remains accessible across different screen sizes.

---

## 6. Example Investigation Scenario

Imagine two cybercrime cases that initially appear unrelated.

### Case A

```text
Phone Number
+91 XXXXXXXX

UPI ID
fraud@upi

Domain
example-phishing.com
```

### Case B

```text
Phone Number
+91 XXXXXXXX

Bank Account
XXXX1234

IP Address
103.xxx.xxx.xxx
```

TRACE detects that the same phone number occurs across both cases.

Instead of treating the cases as completely independent, TRACE surfaces the repeated indicator as a potential connection.

The investigator can then inspect the relationship and supporting evidence.

```text
             Phone Number
                  │
          ┌───────┴───────┐
          │               │
        Case A          Case B
          │               │
      UPI / Domain    Bank / IP
```

The system does **not** automatically conclude that the cases belong to the same criminal network.

It produces an **investigative lead for human verification**.

---

## 7. Evidence Provenance

TRACE follows a **provenance-first** approach.

A detected relationship should remain traceable to the evidence that produced it.

```text
Relationship
     │
     ├── Entity
     │
     ├── Source Case
     │
     ├── Supporting Artifact
     │
     ├── Evidence Type
     │
     └── Confidence / Overlap Score
```

This allows investigators to ask:

> **"Why did TRACE identify this connection?"**

rather than simply:

> **"TRACE says these cases are connected."**

---

## 8. Human-in-the-Loop Intelligence

TRACE is intentionally designed as an **investigative assistance system**, not an autonomous decision-maker.

The intended workflow is:

```text
TRACE discovers a relationship
              ↓
TRACE explains the supporting evidence
              ↓
Investigator reviews the relationship
              ↓
Investigator validates the evidence
              ↓
Investigator determines investigative relevance
```

This keeps human judgment at the center of the investigation.

---

## 9. System Architecture

```text
                         TRACE
                           │
             ┌─────────────┴─────────────┐
             │                           │
      Presentation Layer          Intelligence Layer
             │                           │
      ┌──────┼──────┐             ┌─────┼─────┐
      │      │      │             │     │     │
 Dashboard Graph   CLI       Extraction Correlation Scoring
      │      │      │             │     │     │
      └──────┴──────┘             └─────┴─────┘
             │                           │
             └─────────────┬─────────────┘
                           │
                           ▼
                  Investigation Dataset
                           │
                           ▼
                    Structured Entities
```

---

## 10. Technology Stack

| Layer             | Technology                                               |
| ----------------- | -------------------------------------------------------- |
| Frontend          | React 19                                                 |
| Language          | TypeScript                                               |
| Styling           | Tailwind CSS                                             |
| Icons             | Lucide Icons                                             |
| Animation         | Motion                                                   |
| Build Tool        | Vite 6                                                   |
| Runtime Tooling   | tsx / esbuild                                            |
| Visualization     | SVG                                                      |
| Intelligence Core | Deterministic Entity Extraction & Cross-Case Correlation |
| Data              | Synthetic Investigation Dataset                          |

---

## 11. Repository Structure

```text
TRACE/
│
├── src/
│   ├── components/
│   │   ├── dashboard/
│   │   ├── cases/
│   │   ├── graph/
│   │   ├── evidence/
│   │   ├── terminal/
│   │   └── layout/
│   │
│   ├── context/
│   │   └── TraceContext
│   │
│   ├── data/
│   │   └── Synthetic Investigation Dataset
│   │
│   ├── engine/
│   │   ├── Entity Extraction
│   │   └── Cross-Case Correlation
│   │
│   ├── types/
│   │   └── TypeScript Interfaces & Entity Types
│   │
│   ├── App.tsx
│   └── main.tsx
│
├── index.html
├── metadata.json
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 12. Getting Started

### Prerequisites

* Node.js 18+
* npm, Yarn, or pnpm
* Git

### Clone the Repository

```bash
git clone https://github.com/voldey-04/Trace.git
cd Trace
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

```bash
cp .env.example .env
```

Configure the required values inside `.env` if applicable.

### Start Development Server

```bash
npm run dev
```

The development server will be available at the local URL provided by Vite.

### Production Build

```bash
npm run build
```

---

## 13. Design Principles

TRACE is built around five principles.

### 01 — Evidence First

Every investigative lead should originate from identifiable evidence.

### 02 — Explainable Intelligence

Relationships should be understandable rather than hidden behind opaque predictions.

### 03 — Cross-Case Thinking

Indicators should be analyzed beyond individual case boundaries.

### 04 — Human-in-the-Loop

TRACE assists investigators rather than replacing investigative judgment.

### 05 — Investigation Speed

Search, correlation, visualization, and CLI workflows are designed to reduce repetitive manual investigation.

---

## 14. Prototype Scope

TRACE is currently an **internal hackathon MVP**.

The prototype demonstrates:

* Deterministic entity extraction
* Cross-case correlation
* Evidence overlap analysis
* Relationship scoring
* Investigation graph visualization
* Evidence provenance
* Lead discovery
* Investigator-oriented workflows
* Responsive investigation interface
* CLI-based investigation commands

The current system uses synthetic data and is intended to demonstrate the underlying concept and workflow.

---

## 15. Future Roadmap

Potential future development includes:

### Evidence & Intelligence

* Advanced entity resolution
* Timeline reconstruction
* Relationship-based case clustering
* Evidence integrity verification
* Automated investigation report generation

### Security

* Role-based access control
* Strong investigator authentication
* Encrypted evidence storage
* Immutable audit trails
* Secure evidence handling

### Investigation

* Advanced graph analytics
* Case prioritization
* Pattern detection
* Evidence comparison
* Collaborative investigation workspaces

### Integration

* Authorized forensic data sources
* Secure evidence-management systems
* Controlled institutional integrations
* Enterprise investigation infrastructure

Any production implementation would require appropriate legal, privacy, security, and evidentiary safeguards.

---

## 16. Security & Privacy

TRACE is designed as an investigative assistance platform.

A production implementation should incorporate:

* Strong authentication
* Role-based access control
* Encryption at rest and in transit
* Evidence integrity controls
* Immutable audit logging
* Access monitoring
* Data retention policies
* Secure evidence handling
* Appropriate legal authorization

The current prototype does **not** interact with:

* Live banking infrastructure
* Real individuals
* Unauthorized systems
* Real law-enforcement databases

---

## 17. Operational Disclaimer

> **TRACE assists human investigators in organizing, correlating, and visualizing digital indicators.**

TRACE:

* Does **not** independently determine guilt.
* Does **not** track live individuals.
* Does **not** access live banking systems.
* Does **not** make autonomous investigative decisions.
* Does **not** replace forensic examination.
* Does **not** establish legal proof solely through a detected relationship.

All detected relationships should be treated as **investigative leads requiring human verification and appropriate evidentiary assessment**.

---

## 18. Project Status

| Category      | Status                              |
| ------------- | ----------------------------------- |
| Project       | TRACE                               |
| Type          | Cybercrime Investigation Assistance |
| Stage         | Internal Hackathon MVP              |
| Data          | Synthetic / Demonstration Data      |
| Intelligence  | Deterministic                       |
| Visualization | Interactive Investigation Graph     |
| Interface     | Desktop + Mobile                    |
| Deployment    | Prototype Ready                     |

---

## 19. Vision

Cybercrime investigations rarely exist as completely isolated events.

The same digital identifier may appear across different victims, complaints, transactions, domains, devices, or investigations.

The challenge is not always a lack of evidence.

Sometimes, the challenge is **finding the relationship between pieces of evidence that already exist.**

TRACE is built to address that gap.

> **From isolated evidence to connected intelligence.**

### TRACE

**Discover the connection. Verify the evidence. Advance the investigation.**

---

## License

This project is currently intended for **internal hackathon and educational demonstration purposes**.

An appropriate open-source or proprietary license should be added before public production distribution.

---

**Built for investigation. Designed for clarity. Driven by evidence.**
