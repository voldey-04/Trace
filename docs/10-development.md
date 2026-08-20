# TRACE — Development

## Development Timeline

1. Initial React, Tailwind CSS and TypeScript foundation.
2. Responsive navigation and mobile layout improvements.
3. Evidence integrity and chain-of-custody style metadata.
4. README/product documentation refinement.
5. Express backend and security hardening.
6. Investigation graph navigation and UI state improvements.
7. Cross-case matching hardening for deterministic, idempotent and lifecycle-safe behavior.
8. Structured technical and testing documentation.

## Local Setup

```bash
git clone https://github.com/voldey-04/Trace.git
cd Trace
npm install
cp .env.example .env
npm run dev
```

## Type Check

```bash
npm run lint
```

The repository's lint script invokes TypeScript with `--noEmit`.

## Production Build

```bash
npm run build
npm start
```

## Environment

- `TRACE_API_KEY` — optional server API authentication.
- `ALLOWED_ORIGINS` — CORS allow-list.
- `GEMINI_API_KEY` — AI provider credential where required by deployment.
- `NODE_ENV` — development/production runtime behavior.

Secrets should never be committed.

## Repository Quality Notes

The project is an MVP/hackathon implementation. The next production-level steps are persistence, enterprise identity/RBAC, durable audit storage, secure evidence storage, reproducible test execution and production observability.
