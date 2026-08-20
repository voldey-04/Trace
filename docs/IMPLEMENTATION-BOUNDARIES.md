# TRACE — Implementation Boundaries

This document distinguishes the current public MVP from production infrastructure that is intentionally not part of the demonstration build.

## Implemented in the repository

- React 19 + TypeScript frontend
- Vite-based development and production build
- Express server and `/api` router
- Tailwind CSS, Motion and Lucide React
- Deterministic investigation/correlation services
- Entity normalization and cross-case relationship workflows
- Controlled AI tool gateway
- Google GenAI SDK integration
- Evidence metadata and provenance modeling
- Security middleware and bounded request parsing
- Synthetic investigation dataset for the public demo

## Represented as application-level prototype behavior

- Evidence integrity metadata, including SHA-256-related fields
- Chain-of-custody metadata and verification state
- Investigation records and relationship data that are currently demonstrated through the application's prototype data/service layer

## Not currently implemented as production infrastructure

- External persistent database service
- External object storage for forensic evidence
- Dedicated production evidence-ingestion pipeline
- Production-grade cryptographic hashing pipeline for uploaded evidence
- Immutable external audit storage
- Enterprise identity and RBAC system
- Production monitoring, backups, retention and legal-hold infrastructure

Keeping these boundaries explicit prevents the demonstration application from overstating its current production readiness.
