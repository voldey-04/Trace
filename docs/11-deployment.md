# TRACE — Deployment

## Public Demonstration

Live application:

https://trace-kappa-indol.vercel.app/

The public deployment is a demonstration environment using synthetic investigation data.

## Build

```bash
npm run build
```

The build runs the Vite production build and bundles the Express server with esbuild.

## Start

```bash
npm start
```

## Deployment Checklist

- Configure environment variables on the deployment platform.
- Keep API keys server-side.
- Set `ALLOWED_ORIGINS` to approved origins.
- Configure `TRACE_API_KEY` when API authentication is required.
- Confirm HTTPS.
- Validate `/api/health`.
- Run functional smoke tests.
- Confirm synthetic demonstration data.

## Production Readiness Gaps

A production investigation deployment would require persistent encrypted storage, identity and access management, RBAC, durable audit storage, secure evidence object storage, centralized monitoring, secrets management, backups, retention controls, legal-hold policies and stronger operational infrastructure.
