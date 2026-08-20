# TRACE Security Model

## Scope

This document describes security controls present in the current MVP. It is not a claim of production forensic compliance.

## Server Controls

TRACE's Express server applies request identifiers, security headers, CORS handling, disabled `x-powered-by` fingerprinting, and bounded JSON/form request bodies.

## AI Boundary

Gemini access is mediated through a controlled tool gateway. The gateway exposes explicit investigation operations rather than unrestricted shell, filesystem, database, or arbitrary network access.

## Input Handling

Investigation identifiers and API parameters are handled through application-level validation and bounded query parameters. Invalid or missing identifiers are rejected by the relevant service/tool operation.

## Secrets

The Gemini API credential is provided through environment configuration and is intended to remain server-side. Secrets must not be committed to the repository.

## Evidence Boundary

The public MVP uses synthetic investigation data. Evidence-related fields are treated as untrusted application data and are represented through provenance and integrity metadata. Production deployment would require stronger identity, access control, immutable audit storage, encrypted persistent storage, retention controls, and operational monitoring.

## Threat-Model Position

The MVP is designed to reduce common application risks such as oversized request bodies, uncontrolled AI tool access, accidental secret exposure, and overly permissive server behavior. These controls should not be interpreted as proof that the system is secure against every possible attack.
