# TRACE — Architecture

## High-Level Architecture

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

## Backend Request Flow

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
  +--> Authentication (when configured)
  +--> Validation
  +--> Investigation Service / AI Gateway
  |
  v
Structured Response
```

## Core Architectural Boundaries

### Presentation Layer

The React application provides the dashboard, case repository, evidence views, cross-case lead views, graph explorer and terminal-style investigation workflow.

### Investigation Services

Application services provide case, entity, evidence, relationship, metrics and analysis operations behind the API router.

### Intelligence Layer

The intelligence engine extracts and normalizes digital entities, compares entities across cases and generates deterministic candidate relationships.

### Evidence Layer

Evidence metadata carries identifiers, integrity-related information and provenance context so relationships can be traced back to source material.

### AI Gateway

AI access is mediated by approved investigation tools rather than unrestricted application access. The documented tool set is read-oriented.

## Development and Production Serving

The repository's server bootstrap uses Express. In development, Vite runs in middleware mode. In production, the compiled frontend is served from `dist`, while the API remains mounted under `/api`.
