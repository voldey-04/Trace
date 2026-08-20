# TRACE — Security Architecture

## Security Principles

TRACE treats application inputs, evidence content and AI interactions as security-sensitive boundaries.

## Implemented Controls

- Request IDs for traceable request lifecycle handling.
- `X-Content-Type-Options: nosniff`.
- `Referrer-Policy: strict-origin-when-cross-origin`.
- `Strict-Transport-Security`.
- `Permissions-Policy`.
- `X-Frame-Options: SAMEORIGIN`.
- Content Security Policy.
- Controlled CORS policy.
- 2 MB JSON and URL-encoded body limits.
- In-memory API rate limiting.
- Optional `TRACE_API_KEY` authentication.
- Case/entity/evidence/relationship identifier validation.
- Pagination and search validation.
- Enum validation.
- Structured error responses.
- Server-side handling of fatal exceptions.
- Disabled Express fingerprinting via `x-powered-by`.

## AI Security Boundary

The current audit states that nine read-only investigation tools are exposed and that the AI has zero access to shell execution, arbitrary SQL, file modification or external network requests.

## Evidence / Prompt Injection Boundary

Evidence content is untrusted. Its text is separated from trusted system/tool instructions so that malicious evidence cannot automatically become an instruction to the AI layer.

## Current Automated Security Audit

The supplied current audit reports:

```text
106 / 106 automated tests passing
0 failures
```

The tested attack classes include XSS injection, SQL injection syntax, path traversal payloads, command-injection operators, prompt-injection overrides and parameter privilege-escalation attempts.

The audit also records active structured AI tool audit logging at `GET /api/ai/audit`.

## Secrets and Dependencies

The supplied audit reports zero secrets or API keys hardcoded in the frontend or backend repositories, an `.env.example` containing empty placeholders and a clean production dependency graph.

## Security Claim Boundary

The audit result demonstrates successful validation of the tested attack classes and controls. It should not be interpreted as proof that TRACE is immune to all future vulnerabilities.

## Production Security Gaps

A real deployment would still require mature identity and access management, RBAC, durable audit storage, centralized monitoring, secret-management infrastructure, encrypted persistent storage, secure evidence repositories and production-grade distributed rate limiting.
