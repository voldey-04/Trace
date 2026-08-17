# TRACE

### Evidence Intelligence & Cross-Case Investigation Platform

> **Internal Hackathon Prototype for Cybercrime Investigation Assistance**

TRACE is an evidence intelligence and cross-case investigation platform designed to help investigators identify relationships between seemingly disconnected digital fraud artifacts.

It transforms fragmented evidence such as phone numbers, UPI IDs, bank accounts, domains, IP addresses, and forensic records into structured intelligence that can be explored across multiple cases.

---

## 1. Overview

Modern cybercrime investigations often involve evidence distributed across multiple cases, systems, and reports. A single identifier may appear insignificant in isolation but become highly relevant when it is connected to evidence from another investigation.

**TRACE is built around this principle:**

> **One artifact may be a clue. A repeated artifact across cases may be a connection.**

TRACE helps investigators:

* Extract structured entities from digital evidence
* Detect repeated indicators across cases
* Visualize relationships between entities and cases
* Prioritize potentially significant investigative leads
* Inspect the provenance behind every detected connection
* Navigate investigations through both graphical and CLI-based workflows

TRACE is designed as a **decision-support prototype**, keeping the investigator in control of interpretation and action.

---

## 2. Core Capabilities

### Cross-Case Linkage Engine

TRACE compares extracted indicators across investigations to identify potential relationships.

Supported indicators include:

* Telephone numbers
* UPI IDs
* Bank account identifiers
* Phishing domains
* IP addresses
* Email addresses
* Other supported digital entities

When the same or related indicator appears across multiple cases, TRACE surfaces the connection for investigation.

---

### Deterministic Confidence Scoring

TRACE uses deterministic analysis rather than opaque or random scoring.

Detected relationships can be evaluated using factors such as:

* Entity overlap
* Number of supporting artifacts
* Cross-case recurrence
* Evidence source
* Relationship type
* Supporting provenance

Each result is intended to remain **traceable and explainable**.

> **No unexplained AI-generated conclusions. Evidence relationships remain inspectable.**

---

### Interactive Investigation Graph

TRACE provides an interactive SVG-based network visualization for exploring relationships.

The graph supports:

* Radial entity layouts
* Case-to-entity relationships
* Search and filtering
* Entity inspection
* Relationship visualization
* Investigation drawers
* High-clarity visual hierarchy

This allows investigators to move from:

**Case → Artifact → Entity → Related Case → Supporting Evidence**

without manually searching through multiple disconnected records.

---

### Forensic Evidence Ingestion

TRACE supports structured ingestion of common cybercrime evidence formats, including:

* SMS dumps
* Bank transaction records
* Server logs
* CDR reports
* Digital investigation records

The ingestion pipeline extracts recognizable entities and converts raw evidence into structured investigation data.

This reduces the need to manually identify recurring indicators across large evidence sets.

---

### Investigative CLI

TRACE includes a keyboard-driven terminal interface for investigators who prefer command-based workflows.

Example commands:

```text
cases
leads
inspect <entity>
link <entity>
analyze <case>
```

The CLI provides a rapid alternative to navigating through the graphical interface.

---

###  Responsive Investigation Interface

TRACE is designed for both desktop and mobile environments.

The interface includes:

* Responsive layouts
* Slide-out inspection drawers
* Mobile bottom navigation
* Fast global search
* Adaptive investigation views
* Desktop keyboard workflows

The goal is to preserve the investigation workflow regardless of screen size.

---

# 3. Investigation Workflow

TRACE follows a simplified evidence-to-intelligence workflow:

```text
┌─────────────────────┐
│   Evidence Sources  │
│ SMS / CDR / Logs /  │
│ Bank Records / etc. │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Entity Extraction   │
│ Phone / UPI / IP /  │
│ Domain / Account    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Cross-Case Analysis │
│ Detect recurring    │
│ indicators          │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Confidence &        │
│ Evidence Scoring    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Investigation Graph │
│ & Lead Discovery    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Human Investigator  │
│ Review & Decision    │
└─────────────────────┘
```

---

# 4. Example Investigation Scenario

Consider two seemingly unrelated cybercrime cases.

### Case A

A victim reports a phishing incident involving:

```text
Phone → +91 XXXXXXXX
UPI   → fraud@upi
Domain → example-phishing.com
```

### Case B

A separate investigation contains:

```text
Phone → +91 XXXXXXXX
Bank Account → XXXX1234
IP → 103.xxx.xxx.xxx
```

TRACE identifies the repeated telephone number and establishes a cross-case relationship.

Instead of treating the cases as completely independent, investigators can immediately inspect the shared indicator and review the supporting evidence.

This enables a workflow such as:

```text
Case A
   │
   └── Phone Number
          │
          └── Case B
                │
                ├── Bank Account
                └── IP Address
```

The connection becomes an **investigative lead**, not an automatic conclusion.

---

# 5. Evidence Provenance

A key design principle of TRACE is **provenance-first investigation**.

Every detected relationship should be capable of being traced back to its supporting evidence.

Conceptually:

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

This helps investigators answer:

> **"Why did TRACE identify this connection?"**

rather than simply:

> **"TRACE says these cases are connected."**

---

# 6. System Architecture

```text
                    TRACE
                      │
        ┌─────────────┴─────────────┐
        │                           │
   Presentation Layer          Intelligence Layer
        │                           │
 ┌──────┼───────┐          ┌────────┼────────┐
 │      │       │          │        │        │
Dashboard Graph  CLI     Extraction Correlation Scoring
 │      │       │          │        │        │
 └──────┴───────┘          └────────┴────────┘
                │
                ▼
          Investigation Data
                │
                ▼
          Synthetic Dataset
```

---

# 7. Technology Stack

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

TRACE currently operates on a **synthetic investigation dataset** for prototype and demonstration purposes.

---

# 8. Repository Structure

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
│   │   └── synthetic investigation dataset
│   │
│   ├── engine/
│   │   ├── entity extraction
│   │   └── cross-case correlation
│   │
│   ├── types/
│   │   └── TypeScript interfaces & entity definitions
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

# 9. Getting Started

## Prerequisites

Ensure the following are installed:

* Node.js 18+
* npm, Yarn, or pnpm
* Git

## Installation

Clone the repository:

```bash
git clone https://github.com/Voldey-04/Trace.git
```

Navigate into the project:

```bash
cd your-repo
```

Install dependencies:

```bash
npm install
```

Configure environment variables:

```bash
cp .env.example .env
```

Start the development server:

```bash
npm run dev
```

The application will typically be available at:

```text
http://localhost:3000
```

## Production Build

Create a production build:

```bash
npm run build
```

---

# 10. Design Principles

TRACE is built around five core principles:

### 01 — Evidence First

Every investigative lead should originate from identifiable evidence.

### 02 — Explainable Intelligence

Relationships should be understandable rather than hidden behind opaque scoring.

### 03 — Cross-Case Thinking

An indicator that appears in multiple investigations can reveal relationships that isolated case analysis may miss.

### 04 — Human-in-the-Loop

TRACE assists investigators; it does not replace investigative judgment.

### 05 — Speed of Investigation

Search, graph exploration, inspection, and CLI workflows are designed to reduce unnecessary manual navigation.

---

# 11. Prototype Scope

TRACE is currently an **internal hackathon prototype**.

The current implementation focuses on demonstrating:

* Evidence ingestion concepts
* Deterministic entity extraction
* Cross-case correlation
* Relationship scoring
* Investigation graph visualization
* Evidence provenance
* Investigator-oriented workflows

The prototype uses synthetic data and does not represent a production-ready law-enforcement system.

---

# 12. Future Development

Potential future extensions include:

* Secure role-based investigator access
* Encrypted evidence storage
* Real evidence-management integrations
* Advanced entity resolution
* Timeline reconstruction
* Relationship-based case clustering
* Evidence integrity verification
* Audit logs
* Advanced investigation reports
* Secure collaboration between investigation teams
* Controlled integrations with authorized data sources

Any real-world implementation would require appropriate legal, security, privacy, access-control, and evidentiary safeguards.

---

# 13. Security & Privacy

TRACE is intended to operate as an investigative assistance system.

A production implementation should incorporate:

* Strong authentication
* Role-based access control
* Encryption at rest and in transit
* Evidence integrity controls
* Immutable audit logging
* Access monitoring
* Data retention policies
* Secure evidence handling
* Appropriate legal authorization and compliance

The prototype intentionally avoids direct interaction with live banking infrastructure, live individuals, or unauthorized systems.

---

# 14. Operational Disclaimer

> **TRACE is an investigative assistance prototype. It organizes, correlates, and visualizes digital indicators to help human investigators identify potential relationships.**

TRACE:

* Does **not** independently determine guilt.
* Does **not** track live individuals.
* Does **not** access live banking systems.
* Does **not** make autonomous investigative decisions.
* Does **not** replace forensic examination or human judgment.
* Does **not** establish legal proof solely through a detected relationship.

All detected relationships should be treated as **investigative leads requiring human verification and appropriate evidentiary assessment**.

---

# 15. Project Status

**Status:** Internal Hackathon MVP
**Purpose:** Cybercrime Investigation Assistance
**Data:** Synthetic / Demonstration Data
**Architecture:** Frontend Intelligence Prototype
**Deployment:** Prototype-ready

---

# 16. Vision

TRACE is built around a simple idea:

> **Criminal networks rarely exist as isolated cases.**

The objective is to help investigators move beyond individual evidence artifacts and see the relationships that emerge when information is analyzed across cases.

**TRACE turns fragmented evidence into connected investigative context.**

---

## License

This project is currently intended for **internal hackathon and educational demonstration purposes**.

Add an appropriate open-source or proprietary license before public distribution.

---

### Built for investigation. Designed for clarity. Driven by evidence.
 without authorized warrants. All seeded data is synthetic.*
