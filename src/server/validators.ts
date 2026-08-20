/**
 * TRACE Input Validation & Schema Hardening Utilities
 * Strictly checks and validates all API inputs, parameters, and payloads.
 */

export interface ValidationResult<T> {
  isValid: boolean;
  data?: T;
  error?: string;
  code?: string;
}

// ============================================================================
// 1. Whitelists & Enums
// ============================================================================

export const ALLOWED_CRIME_TYPES = [
  'INVESTMENT_FRAUD',
  'PHISHING',
  'MULE_NETWORK',
  'SMISHING',
  'IDENTITY_THEFT',
  'LOAN_APP_EXTORTION',
  'RANSOMWARE',
  'OTHER',
] as const;

export const ALLOWED_CASE_STATUSES = [
  'ACTIVE',
  'UNDER_REVIEW',
  'ESCALATED',
  'RESOLVED',
  'ARCHIVED',
  // Tool aliases
  'OPEN',
  'UNDER_INVESTIGATION',
  'PENDING_REVIEW',
  'CLOSED',
] as const;

export const ALLOWED_PRIORITIES = [
  'CRITICAL',
  'HIGH',
  'MEDIUM',
  'LOW',
] as const;

export const ALLOWED_ENTITY_TYPES = [
  'PHONE',
  'UPI',
  'ACCOUNT',
  'WEBSITE',
  'URL',
  'EMAIL',
  'IP_ADDRESS',
  'AMOUNT',
  'LOCATION',
  'USERNAME',
  'TRANSACTION',
] as const;

export const ALLOWED_SEVERITY_LEVELS = [
  'CRITICAL',
  'HIGH',
  'MEDIUM',
  'LOW',
] as const;

export const ALLOWED_CONNECTION_STATUSES = [
  'UNVERIFIED',
  'VERIFIED',
  'DISMISSED',
] as const;

export const ALLOWED_FILE_TYPES = [
  'TXT',
  'CSV',
  'LOG',
  'PDF',
  'PNG',
  'JPG',
  'JPEG',
] as const;

// ============================================================================
// 2. Dangerous Input / Path Traversal / Injection Detection
// ============================================================================

const PATH_TRAVERSAL_PATTERN = /(\.\.[\/\\]|\/\.\.|\0|%00|%2e%2e|\betc\/passwd\b|\bwindows[\\\/]system32\b)/i;
const COMMAND_INJECTION_PATTERN = /(?:;\s*rm\s+-rf|;\s*cat\s+\/etc\/|--\s*drop\s+table|\bexec\s*\(|\bchild_process\b|\bprocess\.env\b|<script\b)/i;

/**
 * Checks whether a string contains path traversal or command injection patterns
 */
export function hasDangerousPayload(input: string): boolean {
  if (!input || typeof input !== 'string') return false;
  return PATH_TRAVERSAL_PATTERN.test(input) || COMMAND_INJECTION_PATTERN.test(input);
}

// ============================================================================
// 3. ID and Identifier Validators
// ============================================================================

/**
 * Validates a case identifier (e.g. "CASE-001", "CASE-999")
 */
export function validateCaseId(id: unknown): ValidationResult<string> {
  if (typeof id !== 'string' || !id.trim()) {
    return { isValid: false, code: 'INVALID_ID', error: 'Case identifier must be a non-empty string.' };
  }
  const clean = id.trim();
  if (clean.length > 64) {
    return { isValid: false, code: 'INVALID_ID', error: 'Case identifier exceeds maximum allowed length (64 chars).' };
  }
  if (hasDangerousPayload(clean)) {
    return { isValid: false, code: 'SUSPICIOUS_PAYLOAD', error: 'Case identifier contains invalid or prohibited tokens.' };
  }
  if (!/^[a-zA-Z0-9_.-]{1,64}$/.test(clean)) {
    return { isValid: false, code: 'INVALID_ID_FORMAT', error: 'Case identifier must contain only alphanumeric characters, dashes, and underscores.' };
  }
  return { isValid: true, data: clean };
}

/**
 * Validates an entity identifier or indicator string (e.g. "ENT-001", "+91 90000 11111", "support@upi")
 */
export function validateEntityIdentifier(id: unknown): ValidationResult<string> {
  if (typeof id !== 'string' || !id.trim()) {
    return { isValid: false, code: 'INVALID_IDENTIFIER', error: 'Entity identifier must be a non-empty string.' };
  }
  const clean = id.trim();
  if (clean.length > 256) {
    return { isValid: false, code: 'INVALID_IDENTIFIER', error: 'Entity identifier exceeds maximum allowed length (256 chars).' };
  }
  if (hasDangerousPayload(clean)) {
    return { isValid: false, code: 'SUSPICIOUS_PAYLOAD', error: 'Entity identifier contains prohibited characters or command structures.' };
  }
  // Disallow control characters and null bytes
  if (/[\x00-\x1F\x7F]/.test(clean)) {
    return { isValid: false, code: 'INVALID_CHARACTERS', error: 'Entity identifier cannot contain control characters.' };
  }
  return { isValid: true, data: clean };
}

/**
 * Validates an evidence identifier (e.g. "ev-001", "ev-c001-01")
 */
export function validateEvidenceId(id: unknown): ValidationResult<string> {
  if (typeof id !== 'string' || !id.trim()) {
    return { isValid: false, code: 'INVALID_EVIDENCE_ID', error: 'Evidence identifier must be a non-empty string.' };
  }
  const clean = id.trim();
  if (clean.length > 64) {
    return { isValid: false, code: 'INVALID_EVIDENCE_ID', error: 'Evidence identifier exceeds maximum length (64 chars).' };
  }
  if (hasDangerousPayload(clean)) {
    return { isValid: false, code: 'SUSPICIOUS_PAYLOAD', error: 'Evidence identifier contains prohibited path traversal tokens.' };
  }
  if (!/^[a-zA-Z0-9_.-]{1,64}$/.test(clean)) {
    return { isValid: false, code: 'INVALID_ID_FORMAT', error: 'Evidence identifier must contain only alphanumeric characters, dashes, and underscores.' };
  }
  return { isValid: true, data: clean };
}

/**
 * Validates a relationship / connection identifier (e.g. "CONN-001" or "CASE-004:CASE-005")
 */
export function validateRelationshipId(id: unknown): ValidationResult<string> {
  if (typeof id !== 'string' || !id.trim()) {
    return { isValid: false, code: 'INVALID_RELATIONSHIP_ID', error: 'Relationship identifier must be a non-empty string.' };
  }
  const clean = id.trim();
  if (clean.length > 128) {
    return { isValid: false, code: 'INVALID_RELATIONSHIP_ID', error: 'Relationship identifier exceeds maximum length (128 chars).' };
  }
  if (hasDangerousPayload(clean)) {
    return { isValid: false, code: 'SUSPICIOUS_PAYLOAD', error: 'Relationship identifier contains prohibited tokens.' };
  }
  if (!/^[a-zA-Z0-9_:+\-. ]{1,128}$/.test(clean)) {
    return { isValid: false, code: 'INVALID_ID_FORMAT', error: 'Relationship identifier contains invalid characters.' };
  }
  return { isValid: true, data: clean };
}

// ============================================================================
// 4. Query, Search & Pagination Validators
// ============================================================================

export interface PaginationParams {
  limit: number;
  offset: number;
}

export function validatePagination(limitParam: unknown, offsetParam: unknown, defaultLimit = 20, maxLimit = 100): ValidationResult<PaginationParams> {
  let limit = defaultLimit;
  let offset = 0;

  if (limitParam !== undefined && limitParam !== null && limitParam !== '') {
    const parsedLimit = Number(limitParam);
    if (!Number.isInteger(parsedLimit) || isNaN(parsedLimit) || parsedLimit < 1) {
      return { isValid: false, code: 'INVALID_PAGINATION', error: 'Parameter "limit" must be a positive integer (minimum 1).' };
    }
    if (parsedLimit > maxLimit) {
      limit = maxLimit;
    } else {
      limit = parsedLimit;
    }
  }

  if (offsetParam !== undefined && offsetParam !== null && offsetParam !== '') {
    const parsedOffset = Number(offsetParam);
    if (!Number.isInteger(parsedOffset) || isNaN(parsedOffset) || parsedOffset < 0) {
      return { isValid: false, code: 'INVALID_PAGINATION', error: 'Parameter "offset" must be a non-negative integer (minimum 0).' };
    }
    if (parsedOffset > 10000) {
      return { isValid: false, code: 'INVALID_PAGINATION', error: 'Parameter "offset" cannot exceed maximum pagination depth of 10000.' };
    }
    offset = parsedOffset;
  }

  return { isValid: true, data: { limit, offset } };
}

export function validateSearchString(searchParam: unknown, maxLen = 200): ValidationResult<string | undefined> {
  if (searchParam === undefined || searchParam === null || searchParam === '') {
    return { isValid: true, data: undefined };
  }
  if (typeof searchParam !== 'string') {
    return { isValid: false, code: 'INVALID_SEARCH', error: 'Search query must be a string.' };
  }
  const clean = searchParam.trim();
  if (clean.length > maxLen) {
    return { isValid: false, code: 'INVALID_SEARCH', error: `Search query exceeds maximum length of ${maxLen} characters.` };
  }
  if (/[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(clean)) {
    return { isValid: false, code: 'INVALID_CHARACTERS', error: 'Search query contains illegal control characters.' };
  }
  return { isValid: true, data: clean };
}

export function validateEnumField<T extends string>(
  value: unknown,
  allowedValues: readonly T[],
  fieldName: string
): ValidationResult<T | undefined> {
  if (value === undefined || value === null || value === '') {
    return { isValid: true, data: undefined };
  }
  if (typeof value !== 'string') {
    return { isValid: false, code: 'INVALID_ENUM', error: `Field "${fieldName}" must be a string.` };
  }

  const normalized = value.trim().toUpperCase() as T;
  const matches = allowedValues.find(v => v.toUpperCase() === normalized);
  if (!matches) {
    return {
      isValid: false,
      code: 'INVALID_ENUM_VALUE',
      error: `Invalid value for "${fieldName}". Allowed values: ${allowedValues.join(', ')}`,
    };
  }

  return { isValid: true, data: matches };
}

export function validateMinScore(scoreParam: unknown): ValidationResult<number | undefined> {
  if (scoreParam === undefined || scoreParam === null || scoreParam === '') {
    return { isValid: true, data: undefined };
  }
  const parsed = Number(scoreParam);
  if (isNaN(parsed) || parsed < 0 || parsed > 100) {
    return { isValid: false, code: 'INVALID_SCORE', error: 'Parameter "minScore" must be a number between 0 and 100.' };
  }
  return { isValid: true, data: parsed };
}

// ============================================================================
// 5. Payload Validators (Analyze, Upload, etc.)
// ============================================================================

export interface ValidatedAnalyzePayload {
  caseId?: string;
  rawText?: string;
  entities?: Array<{ type: string; value: string }>;
}

export function validateAnalyzePayload(body: any): ValidationResult<ValidatedAnalyzePayload> {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { isValid: false, code: 'INVALID_BODY', error: 'Request body must be a valid JSON object.' };
  }

  const { caseId, rawText, entities } = body;

  let validatedCaseId: string | undefined = undefined;
  if (caseId !== undefined && caseId !== null && caseId !== '') {
    const caseIdRes = validateCaseId(caseId);
    if (!caseIdRes.isValid) return caseIdRes as any;
    validatedCaseId = caseIdRes.data;
  }

  let validatedRawText: string | undefined = undefined;
  if (rawText !== undefined && rawText !== null && rawText !== '') {
    if (typeof rawText !== 'string') {
      return { isValid: false, code: 'INVALID_TEXT', error: 'Field "rawText" must be a string.' };
    }
    // Limit raw evidence text to 500KB to prevent ReDoS / CPU starvation
    if (rawText.length > 500 * 1024) {
      return { isValid: false, code: 'PAYLOAD_TOO_LARGE', error: 'Field "rawText" exceeds maximum allowed size of 500KB.' };
    }
    validatedRawText = rawText;
  }

  let validatedEntities: Array<{ type: string; value: string }> | undefined = undefined;
  if (entities !== undefined && entities !== null) {
    if (!Array.isArray(entities)) {
      return { isValid: false, code: 'INVALID_ENTITIES', error: 'Field "entities" must be an array of objects.' };
    }
    if (entities.length > 100) {
      return { isValid: false, code: 'INVALID_ENTITIES', error: 'Entities array exceeds maximum limit of 100 indicators.' };
    }

    validatedEntities = [];
    for (let i = 0; i < entities.length; i++) {
      const ent = entities[i];
      if (!ent || typeof ent !== 'object') {
        return { isValid: false, code: 'INVALID_ENTITY_ITEM', error: `Entity item at index ${i} must be an object with "type" and "value".` };
      }
      if (typeof ent.type !== 'string' || typeof ent.value !== 'string') {
        return { isValid: false, code: 'INVALID_ENTITY_ITEM', error: `Entity item at index ${i} requires "type" and "value" strings.` };
      }
      const typeEnumRes = validateEnumField(ent.type, ALLOWED_ENTITY_TYPES, `entities[${i}].type`);
      if (!typeEnumRes.isValid) return typeEnumRes as any;

      const valRes = validateEntityIdentifier(ent.value);
      if (!valRes.isValid) return valRes as any;

      validatedEntities.push({
        type: typeEnumRes.data || 'PHONE',
        value: valRes.data || ent.value.trim(),
      });
    }
  }

  if (!validatedCaseId && !validatedRawText && (!validatedEntities || validatedEntities.length === 0)) {
    return {
      isValid: false,
      code: 'MISSING_ANALYSIS_TARGET',
      error: 'At least one of "caseId", "rawText", or "entities" must be provided for cross-case correlation.',
    };
  }

  return {
    isValid: true,
    data: {
      caseId: validatedCaseId,
      rawText: validatedRawText,
      entities: validatedEntities,
    },
  };
}
