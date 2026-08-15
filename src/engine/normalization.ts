import { EntityType } from '../types';

/**
 * Deterministic Entity Normalization Engine for TRACE
 * Ensures disparate representations of the same investigative indicator resolve identically.
 */

export function normalizePhone(raw: string): string {
  if (!raw) return '';
  // Remove spaces, hyphens, brackets, dots
  let cleaned = raw.replace(/[\s\-\(\)\.]/g, '').trim();

  // If starts with 0091, replace with +91
  if (cleaned.startsWith('0091')) {
    cleaned = '+91' + cleaned.slice(4);
  }
  // If starts with +91
  if (cleaned.startsWith('+91')) {
    const digits = cleaned.slice(3).replace(/\D/g, '');
    if (digits.length === 10) {
      return `+91${digits}`;
    }
  }
  // If starts with leading 0 and 10 following digits
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    const digits = cleaned.slice(1);
    if (/^[6-9]\d{9}$/.test(digits)) {
      return `+91${digits}`;
    }
  }
  // If 10 standard digits starting with 6,7,8,9 (Standard Indian mobile)
  const onlyDigits = cleaned.replace(/\D/g, '');
  if (onlyDigits.length === 10 && /^[6-9]/.test(onlyDigits)) {
    return `+91${onlyDigits}`;
  } else if (onlyDigits.length === 12 && onlyDigits.startsWith('91')) {
    return `+${onlyDigits}`;
  }

  // Fallback: clean non-alphanumeric except leading +
  return cleaned.startsWith('+') ? `+${onlyDigits}` : onlyDigits;
}

export function normalizeUPI(raw: string): string {
  if (!raw) return '';
  // Lowercase, trim whitespace and punctuation at edges
  return raw.trim().toLowerCase().replace(/^[@\/]+|[@\/]+$/g, '');
}

export function normalizeEmail(raw: string): string {
  if (!raw) return '';
  return raw.trim().toLowerCase();
}

export function normalizeWebsite(raw: string): string {
  if (!raw) return '';
  let cleaned = raw.trim().toLowerCase();

  // Remove protocol
  cleaned = cleaned.replace(/^https?:\/\//, '');
  // Remove www.
  cleaned = cleaned.replace(/^www\./, '');
  // Remove port if present
  cleaned = cleaned.split(':')[0];
  // Remove path, query params, fragments
  cleaned = cleaned.split('/')[0].split('?')[0].split('#')[0];
  // Remove trailing slashes or dots
  cleaned = cleaned.replace(/[\/\.]+$/, '');

  return cleaned;
}

export function normalizeURL(raw: string): string {
  if (!raw) return '';
  let cleaned = raw.trim();
  try {
    if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
      cleaned = 'https://' + cleaned;
    }
    const url = new URL(cleaned);
    // Return canonical hostname + pathname without tracking query parameters
    const host = url.hostname.toLowerCase().replace(/^www\./, '');
    const pathname = url.pathname.replace(/\/+$/, '') || '/';
    return `${host}${pathname}`;
  } catch {
    return normalizeWebsite(raw);
  }
}

export function normalizeIP(raw: string): string {
  if (!raw) return '';
  // Strip port e.g. 192.168.1.1:8080 -> 192.168.1.1
  const cleaned = raw.trim().split(':')[0].replace(/[\[\]]/g, '');
  return cleaned;
}

export function normalizeTransaction(raw: string): string {
  if (!raw) return '';
  // Uppercase, strip dashes, spaces, colons
  return raw.trim().toUpperCase().replace(/[\s\-_:]/g, '');
}

export function normalizeAccount(raw: string): string {
  if (!raw) return '';
  // Digits only
  return raw.trim().replace(/\D/g, '');
}

export function normalizeUsername(raw: string): string {
  if (!raw) return '';
  // Lowercase, remove leading @
  return raw.trim().toLowerCase().replace(/^@+/, '');
}

export function normalizeAmount(raw: string): string {
  if (!raw) return '';
  // Extract clean number representation
  const match = raw.match(/[\d,]+(?:\.\d{1,2})?/);
  if (match) {
    const num = parseFloat(match[0].replace(/,/g, ''));
    if (!isNaN(num)) {
      return `INR_${num.toFixed(2)}`;
    }
  }
  return raw.trim();
}

export function normalizeDate(raw: string): string {
  if (!raw) return '';
  return raw.trim();
}

/**
 * Universal dispatcher for entity normalization
 */
export function normalizeEntityValue(type: EntityType, value: string): string {
  switch (type) {
    case 'PHONE':
      return normalizePhone(value);
    case 'UPI':
      return normalizeUPI(value);
    case 'EMAIL':
      return normalizeEmail(value);
    case 'WEBSITE':
      return normalizeWebsite(value);
    case 'URL':
      return normalizeURL(value);
    case 'IP_ADDRESS':
      return normalizeIP(value);
    case 'TRANSACTION':
      return normalizeTransaction(value);
    case 'ACCOUNT':
      return normalizeAccount(value);
    case 'USERNAME':
      return normalizeUsername(value);
    case 'AMOUNT':
      return normalizeAmount(value);
    case 'DATE':
      return normalizeDate(value);
    default:
      return value.trim().toLowerCase();
  }
}
