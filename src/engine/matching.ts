import { Case, Connection, ConnectionSeverity, Entity, EntityType, Evidence, ScoreBreakdownItem, SharedIndicator } from '../types';

/**
 * Deterministic Cross-Case Matching & Explainable Scoring Engine for TRACE.
 *
 * Important invariants:
 * - A case pair has one canonical connection record.
 * - Re-running matching is idempotent.
 * - Investigator lifecycle state (VERIFIED / DISMISSED) is never silently reset.
 * - Connection IDs are deterministic for a case pair, so repeated processing cannot create duplicates.
 */

export const ENTITY_WEIGHTS: Record<EntityType, number> = {
  PHONE: 30,
  UPI: 30,
  TRANSACTION: 25,
  EMAIL: 20,
  WEBSITE: 20,
  URL: 20,
  ACCOUNT: 20,
  IP_ADDRESS: 15,
  USERNAME: 15,
  AMOUNT: 5,
  DATE: 0,
};

export function getSeverityFromScore(score: number): ConnectionSeverity {
  if (score >= 80) return 'HIGH';
  if (score >= 50) return 'MEDIUM';
  if (score >= 20) return 'LOW';
  return 'INFORMATIONAL';
}

/** Stable identifier for a canonical case pair. */
export function getConnectionId(caseA: string, caseB: string): string {
  const [a, b] = [caseA, caseB].sort();
  return `CONN-${a.replace(/[^A-Z0-9]/gi, '').toUpperCase()}-${b.replace(/[^A-Z0-9]/gi, '').toUpperCase()}`;
}

/**
 * Compare all entities belonging to targetCaseId against every other case.
 * The returned list is normalized so at most one connection exists per case pair.
 */
export function matchCaseAgainstAll(
  targetCaseId: string,
  allCases: Case[],
  allEntities: Entity[],
  allEvidence: Evidence[],
  existingConnections: Connection[]
): Connection[] {
  const targetCase = allCases.find(c => c.id === targetCaseId || c.case_number === targetCaseId);
  if (!targetCase) return dedupeConnections(existingConnections);

  const evidenceMap = new Map(allEvidence.map(ev => [ev.id, ev.file_name]));
  const updatedConnections = dedupeConnections(existingConnections);

  const targetEntities = allEntities.filter(
    e => (e.source_case_id === targetCase.id || e.source_case_id === targetCase.case_number) && e.type !== 'DATE' && e.type !== 'AMOUNT'
  );
  if (targetEntities.length === 0) return updatedConnections;

  const otherCases = allCases.filter(c => c.id !== targetCase.id && c.case_number !== targetCase.case_number);

  for (const otherCase of otherCases) {
    const otherEntities = allEntities.filter(
      e => (e.source_case_id === otherCase.id || e.source_case_id === otherCase.case_number) && e.type !== 'DATE' && e.type !== 'AMOUNT'
    );

    if (otherEntities.length === 0) continue;

    const sharedIndicators: SharedIndicator[] = [];
    const breakdown: ScoreBreakdownItem[] = [];
    const matchedKeys = new Set<string>();
    const matchedTypes = new Set<EntityType>();

    for (const tEnt of targetEntities) {
      for (const oEnt of otherEntities) {
        if (tEnt.type !== oEnt.type || tEnt.normalized_value !== oEnt.normalized_value) continue;

        const indicatorKey = `${tEnt.type}:${tEnt.normalized_value}`;
        if (matchedKeys.has(indicatorKey)) continue;
        matchedKeys.add(indicatorKey);

        const weight = ENTITY_WEIGHTS[tEnt.type] || 10;
        matchedTypes.add(tEnt.type);
        breakdown.push({
          label: `Shared ${tEnt.type.toLowerCase().replace('_', ' ')}`,
          points: weight,
          type: tEnt.type,
          indicatorValue: tEnt.value,
        });

        sharedIndicators.push({
          entity_id_a: tEnt.id,
          entity_id_b: oEnt.id,
          type: tEnt.type,
          value: tEnt.value,
          normalized_value: tEnt.normalized_value,
          source_evidence_a: tEnt.source_evidence_id,
          source_evidence_a_name: evidenceMap.get(tEnt.source_evidence_id) || 'Evidence File',
          source_evidence_b: oEnt.source_evidence_id,
          source_evidence_b_name: evidenceMap.get(oEnt.source_evidence_id) || 'Evidence File',
          context_a: tEnt.source_context,
          context_b: oEnt.source_context,
        });
      }
    }

    if (sharedIndicators.length === 0) continue;

    let totalScore = breakdown.reduce((sum, item) => sum + item.points, 0);
    if (sharedIndicators.length > 1) {
      totalScore += 10;
      breakdown.push({
        label: 'Corroborating indicators multi-match',
        points: 10,
        type: 'CORROBORATING',
      });
    }

    const finalScore = Math.min(100, totalScore);
    if (finalScore < 15) continue;

    const [caseA, caseB] = [targetCase.case_number, otherCase.case_number].sort();
    const connectionId = getConnectionId(caseA, caseB);
    const existingIndex = updatedConnections.findIndex(c => {
      if (c.id === connectionId) return true;
      const pairMatches = (c.case_a === caseA && c.case_b === caseB) || (c.case_a === caseB && c.case_b === caseA);
      return pairMatches;
    });

    const existing = existingIndex >= 0 ? updatedConnections[existingIndex] : undefined;
    const reasonSummary = `Potential relationship supported by ${sharedIndicators.length} shared indicator(s): ${Array.from(matchedTypes).map(t => t.toLowerCase().replace('_', ' ')).join(', ')}.`;
    const now = existing?.created_at || new Date().toISOString();

    const nextConnection: Connection = {
      id: existing?.id || connectionId,
      case_a: caseA,
      case_b: caseB,
      score: finalScore,
      severity: getSeverityFromScore(finalScore),
      reason: reasonSummary,
      breakdown,
      shared_entities: sharedIndicators,
      // Preserve investigator disposition exactly as it was.
      status: existing?.status || 'SUGGESTED',
      created_at: now,
      verified_at: existing?.verified_at,
      dismissed_at: existing?.dismissed_at,
      investigator_notes: existing?.investigator_notes,
      dismissal_reason: existing?.dismissal_reason,
    };

    if (existingIndex >= 0) {
      updatedConnections[existingIndex] = nextConnection;
    } else {
      updatedConnections.unshift(nextConnection);
    }
  }

  return dedupeConnections(updatedConnections);
}

/** Remove legacy duplicates while keeping the most recently useful connection state. */
export function dedupeConnections(connections: Connection[]): Connection[] {
  const byPair = new Map<string, Connection>();

  for (const connection of connections) {
    const [caseA, caseB] = [connection.case_a, connection.case_b].sort();
    const key = `${caseA}::${caseB}`;
    const normalized: Connection = { ...connection, case_a: caseA, case_b: caseB };
    const existing = byPair.get(key);

    if (!existing) {
      byPair.set(key, normalized);
      continue;
    }

    // Prefer a human-reviewed lifecycle state over an unreviewed duplicate.
    const reviewedRank = (status: Connection['status']) => status === 'VERIFIED' ? 3 : status === 'DISMISSED' ? 2 : 1;
    if (reviewedRank(normalized.status) > reviewedRank(existing.status)) {
      byPair.set(key, { ...existing, ...normalized });
    } else {
      byPair.set(key, { ...normalized, status: existing.status, verified_at: existing.verified_at, dismissed_at: existing.dismissed_at, investigator_notes: existing.investigator_notes, dismissal_reason: existing.dismissal_reason, created_at: existing.created_at });
    }
  }

  return Array.from(byPair.values());
}
