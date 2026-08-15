import { Entity, EntityType } from '../types';
import { normalizeEntityValue } from './normalization';

export interface RawExtractedEntity {
  type: EntityType;
  value: string;
  context: string;
  confidence: number;
}

/**
 * Extracts a surrounding sentence or snippet around the match
 */
function extractContext(text: string, matchIndex: number, matchLength: number): string {
  const start = Math.max(0, matchIndex - 40);
  const end = Math.min(text.length, matchIndex + matchLength + 40);
  let snippet = text.slice(start, end).replace(/[\r\n]+/g, ' ').trim();
  if (start > 0) snippet = '...' + snippet;
  if (end < text.length) snippet = snippet + '...';
  return snippet;
}

/**
 * Deterministic Entity Extraction Engine for TRACE
 * Uses pattern matching and rule-based token analysis
 */
export function extractEntitiesFromText(
  text: string,
  evidenceId: string,
  caseId: string
): Entity[] {
  if (!text || typeof text !== 'string') return [];

  const rawResults: RawExtractedEntity[] = [];
  const now = new Date().toISOString();

  // 1. UPI ID Regex
  // Matches handles like traceuser@upi, user123@okhdfcbank, invest@paytm, support@ybl, etc.
  const upiRegex = /\b([a-zA-Z0-9.\-_]{2,40}@(upi|okhdfcbank|okaxis|okicici|oksbi|paytm|ybl|ibl|axl|apl|kotak|barodampay|federal|indus|postbank|aubank|airtel|fbl|idfcbank|freecharge|slice|gpay|phonepe|test))\b/gi;
  let match: RegExpExecArray | null;
  while ((match = upiRegex.exec(text)) !== null) {
    rawResults.push({
      type: 'UPI',
      value: match[1],
      context: extractContext(text, match.index, match[0].length),
      confidence: 0.98,
    });
  }

  // 2. Phone Numbers (Indian and International)
  // +91 90000 11111, +91-9876543210, 9000011111, 09000011111, etc.
  const phoneRegex = /(?:\+?91[\s\-]?)?(?:\b[6-9]\d{4}[\s\-]?\d{5}\b|\b0[6-9]\d{9}\b|\b9\d{9}\b)/g;
  while ((match = phoneRegex.exec(text)) !== null) {
    const rawVal = match[0].trim();
    // Ignore if inside an email address or transaction code
    const prevChar = match.index > 0 ? text[match.index - 1] : '';
    if (prevChar !== '@') {
      rawResults.push({
        type: 'PHONE',
        value: rawVal,
        context: extractContext(text, match.index, match[0].length),
        confidence: 0.95,
      });
    }
  }

  // 3. Email Addresses
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
  while ((match = emailRegex.exec(text)) !== null) {
    const emailVal = match[0].trim();
    // Filter out standard UPI handles if captured
    const upiSuffixes = ['@upi', '@okhdfcbank', '@okaxis', '@okicici', '@oksbi', '@paytm', '@ybl', '@ibl', '@axl', '@apl'];
    const isUpi = upiSuffixes.some(suffix => emailVal.toLowerCase().endsWith(suffix));
    if (!isUpi) {
      rawResults.push({
        type: 'EMAIL',
        value: emailVal,
        context: extractContext(text, match.index, match[0].length),
        confidence: 0.97,
      });
    }
  }

  // 4. URLs and Web Domains
  const urlRegex = /\b(?:https?:\/\/|www\.)[^\s<>"'{}|\\^`]+[^\s<>"'{}|\\^`.,;:()]/gi;
  while ((match = urlRegex.exec(text)) !== null) {
    const urlVal = match[0].trim();
    rawResults.push({
      type: 'URL',
      value: urlVal,
      context: extractContext(text, match.index, match[0].length),
      confidence: 0.96,
    });
  }

  // Standalone websites/domains e.g. securebank.test, example-store.in, quickcash-loan.top, fastloan.cc
  const domainRegex = /\b(?:[a-zA-Z0-9\-]{2,30}\.)+(?:com|in|test|top|xyz|online|cc|org|net|store|biz|info|site|tech|vip|app|loan|live)(?:\/[^\s<>"']*)?\b/gi;
  while ((match = domainRegex.exec(text)) !== null) {
    const domVal = match[0].trim();
    // Exclude if it's already an email domain
    const prevChar = match.index > 0 ? text[match.index - 1] : '';
    if (prevChar !== '@' && !domVal.startsWith('http://') && !domVal.startsWith('https://')) {
      rawResults.push({
        type: 'WEBSITE',
        value: domVal,
        context: extractContext(text, match.index, match[0].length),
        confidence: 0.94,
      });
    }
  }

  // 5. IP Addresses (IPv4)
  const ipRegex = /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(?::\d{1,5})?\b/g;
  while ((match = ipRegex.exec(text)) !== null) {
    const ipVal = match[0].trim();
    // Filter common broadcast / localhost unless relevant
    if (ipVal !== '127.0.0.1' && ipVal !== '0.0.0.0' && ipVal !== '255.255.255.255') {
      rawResults.push({
        type: 'IP_ADDRESS',
        value: ipVal,
        context: extractContext(text, match.index, match[0].length),
        confidence: 0.95,
      });
    }
  }

  // 6. Transaction & UTR References
  // e.g. UTR-982144129, TXN392019482, UPI Ref: 319204918291, IMPS Ref: 4829104812
  const txnRegex = /\b(?:UTR[\s\-_:]?|TXN[\s\-_:]?|REF[\s\-_:]?|UPI[\s\-_:]{1,3}Ref[\s\-_:]?|IMPS[\s\-_:]?)([A-Z0-9]{8,22})\b/gi;
  while ((match = txnRegex.exec(text)) !== null) {
    rawResults.push({
      type: 'TRANSACTION',
      value: match[0].trim(),
      context: extractContext(text, match.index, match[0].length),
      confidence: 0.92,
    });
  }

  // 7. Bank Account Numbers
  // e.g. A/C: 987654321012, Account Number: 109283746501
  const acctRegex = /\b(?:A\/C|Account|Acc|Acct)[\s\-_:#.]*([0-9]{9,18})\b/gi;
  while ((match = acctRegex.exec(text)) !== null) {
    rawResults.push({
      type: 'ACCOUNT',
      value: match[1].trim(),
      context: extractContext(text, match.index, match[0].length),
      confidence: 0.90,
    });
  }

  // 8. Usernames / Handles (@telegram_handle, @scam_support)
  const usernameRegex = /(?:^|\s)(@[a-zA-Z0-9_]{3,30})\b/g;
  while ((match = usernameRegex.exec(text)) !== null) {
    const rawUser = match[1].trim();
    if (!rawUser.includes('.')) {
      rawResults.push({
        type: 'USERNAME',
        value: rawUser,
        context: extractContext(text, match.index, match[0].length),
        confidence: 0.88,
      });
    }
  }

  // 9. Financial Amounts (e.g. ₹25,000, Rs. 50,000, INR 1,50,000)
  const amountRegex = /(?:₹|Rs\.?|INR|\$)\s*([\d,]+(?:\.\d{1,2})?)/gi;
  while ((match = amountRegex.exec(text)) !== null) {
    rawResults.push({
      type: 'AMOUNT',
      value: match[0].trim(),
      context: extractContext(text, match.index, match[0].length),
      confidence: 0.85,
    });
  }

  // Deduplicate entities with same type & normalized value within this evidence
  const uniqueEntitiesMap = new Map<string, Entity>();

  for (const raw of rawResults) {
    const normalized = normalizeEntityValue(raw.type, raw.value);
    if (!normalized || normalized.length < 2) continue;

    const key = `${raw.type}:${normalized}`;
    if (!uniqueEntitiesMap.has(key)) {
      const entityId = `ENT-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      uniqueEntitiesMap.set(key, {
        id: entityId,
        type: raw.type,
        value: raw.value,
        normalized_value: normalized,
        source_evidence_id: evidenceId,
        source_case_id: caseId,
        source_context: raw.context,
        extracted_at: now,
        confidence: raw.confidence,
      });
    }
  }

  return Array.from(uniqueEntitiesMap.values());
}
