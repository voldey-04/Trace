# TRACE Architecture

## Purpose

TRACE is an evidence-intelligence and cross-case investigation assistance platform. The MVP separates presentation, API handling, investigation services, deterministic intelligence, and controlled AI tooling.

## Runtime Flow

```text
React UI
   |
   v
Express API
   |
   +--> security middleware
   +--> request validation
   +--> investigation API router
   |
   v
Investigation Services
   |
   +--> cases
   +--> entities
   +--> evidence metadata
   +--> relationships
   +--> timelines
   |
   v
Deterministic Intelligence Engine
   |
   +--> entity extraction / normalization
   +--> cross-case matching
   +--> explainable relationship scoring
   |
   v
Controlled AI Tool Gateway
   |
   v
Google GenAI / Gemini
```

## Frontend

The presentation layer is implemented with React and TypeScript and built with Vite. UI components are organized by investigation domain rather than placing all behavior in a single component.

## Server

The server bootstrap uses Express. It mounts the TRACE API under `/api`, applies request IDs, security headers, CORS handling, and request-size limits, and then serves the Vite application in development or the compiled `dist` output in production.

## Intelligence Boundary

The deterministic investigation layer is separate from the AI layer. Core case/entity/correlation operations are implemented as application services and intelligence logic. Gemini is exposed through an explicit tool gateway instead of unrestricted access to application internals.

## Prototype Boundary

The public demonstration uses synthetic investigation data. Persistent production storage, enterprise identity/RBAC, secure evidence-object storage, immutable audit storage, and operational monitoring are future production concerns and are not required dependencies of the current demo build.
