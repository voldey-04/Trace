# TRACE — Evidence Intelligence & Cross-Case Investigation Platform

> **Internal Hackathon Prototype for Cybercrime Investigation Assistance**

TRACE is a specialized evidence intelligence platform designed to assist investigators in uncovering cross-case linkages across digital fraud artifacts, cyber scams, mule account networks, and forensic leads.

---

## Key Features

- **Cross-Case Linkage Engine**: Automatically detects overlaps across cases based on shared telephone numbers, UPI IDs, bank accounts, phishing domains, and IP addresses.
- **Deterministic Confidence Scoring**: Calculates confidence levels and evidence overlap scores with complete provenance tracking and source attribution.
- **Interactive Radial Graph Canvas**: High-clarity SVG network graph with radial orbits, search filtering, and inspection drawers.
- **Forensic Evidence Ingestion**: Multi-format evidence parsing (SMS dumps, bank records, server logs, CDR reports) with instant entity extraction.
- **Investigative CLI**: Terminal console with built-in commands (`cases`, `leads`, `inspect`, `link`, `analyze`) for rapid keyboard-driven workflows.
- **Responsive Interface**: Mobile and desktop layouts with slide-out drawers, fast search, and bottom navigation.

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Motion
- **Tooling & Build**: Vite 6, tsx, esbuild
- **Intelligence Core**: Deterministic Entity Extraction & Cross-Case Link Analysis

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18+ recommended)
- `npm` or `yarn` or `pnpm`

### Installation & Run

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/your-repo.git
   cd your-repo
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   ```bash
   cp .env.example .env
   ```

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000`.

5. **Build for Production**:
   ```bash
   npm run build
   ```

---

## Repository Structure

```
├── src/
│   ├── components/       # UI modules (dashboard, cases, graph, evidence, terminal, layout)
│   ├── context/          # Global application state (TraceContext)
│   ├── data/             # Synthetic seed dataset for cybercrime investigation scenarios
│   ├── engine/           # Entity extraction and cross-case correlation algorithms
│   ├── types/            # TypeScript interfaces and entity types
│   ├── App.tsx           # Main application router and root layout
│   └── main.tsx          # Client entry point
├── index.html            # HTML entry template
├── metadata.json         # Platform metadata configuration
├── package.json          # Project manifest and dependencies
├── tsconfig.json         # TypeScript compiler configuration
└── vite.config.ts        # Vite build configuration
```

---

## Operational Disclaimer

*TRACE assists human investigators in organizing and visualizing digital indicators. TRACE does not independently determine guilt, track live individuals, or interface with live banking systems without authorized warrants. All seeded data is synthetic.*
