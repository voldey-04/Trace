# TRACE — API Reference

## Base Path

The TRACE backend mounts its application API under `/api`.

## Core Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Health and system metrics |
| GET | `/api/cases` | Case listing, search, filtering and pagination |
| GET | `/api/cases/:id` | Case detail |
| GET | `/api/entities` | Entity listing, search, filtering and pagination |
| GET | `/api/entities/:id` | Entity inspection |
| GET | `/api/evidence` | Evidence listing |
| GET | `/api/evidence/:id` | Evidence detail |
| GET | `/api/links` | Cross-case links with filtering and score controls |
| GET | `/api/relationships/:id` | Relationship detail |
| GET | `/api/ai/audit` | AI tool audit information, as documented by the current audit |

Additional analysis/AI routes are mediated through backend services and validation controls.

## Validation

The API validates case IDs, entity identifiers, evidence IDs, relationship IDs, pagination values, search strings, minimum relationship scores and allowed enumerated fields before invoking investigation services.

## Authentication

When `TRACE_API_KEY` is configured, the API accepts a matching Bearer token or `X-API-Key` value.

## Response Contract

Success:

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

## Request Protection

The server applies request IDs, security headers, CORS handling, body size limits and API rate limiting before application service execution.
