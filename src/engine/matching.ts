import { Case, Connection, ConnectionSeverity, Entity, EntityType, Evidence, ScoreBreakdownItem, SharedIndicator } from '../types';

/**
 * Deterministic Cross-Case Matching & Explainable Scoring Engine for TRACE
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

/**
 * Compare all entities belonging to `targetCaseId` against all other cases in the system.
 * Returns newly detected and updated connections.
 */
export function matchCaseAgainstAll(
  targetCaseId: string,
  allCases: Case[],
  allEntities: Entity[],
  allEvidence: Evidence[],
  existingConnections: Connection[]
): Connection[] {
  const targetCase = allCases.find(c => c.id === targetCaseId || c.case_number === targetCaseId);
  if (!targetCase) return existingConnections;

  // Filter entities belonging to target case
  const targetEntities = allEntities.filter(e => e.source_case_id === targetCase.id || e.source_case_id === targetCase.case_number);
  if (targetEntities.length === 0) return existingConnections;

  // Build evidence name lookup map
  const evidenceMap = new Map<string, string>();
  allEvidence.forEach(ev => evidenceMap.set(ev.id, ev.file_name));

  // Map other cases
  const otherCases = allCases.filter(c => c.id !== targetCase.id && c.case_number !== targetCase.case_number);
  const updatedConnections = [...existingConnections];

  for (const otherCase of otherCases) {
    const otherEntities = allEntities.filter(e => e.source_case_id === otherCase.id || e.source_case_id === otherCase.case_number);
    if (otherEntities.length === 0) continue;

    const sharedIndicators: SharedIndicator[] = [];
    const breakdown: ScoreBreakdownItem[] = [];
    const matchedTypes = new Set<EntityType>();

    let totalScore = 0;

    // Compare normalized values
    for (const tEnt of targetEntities) {
      // Ignore low-signal entities for primary matching if isolated
      if (tEnt.type === 'DATE' || tEnt.type === 'AMOUNT') continue;

      for (const oEnt of otherEntities) {
        if (tEnt.type === oEnt.type && tEnt.normalized_value === oEnt.normalized_value) {
          // Avoid duplicate indicator registration
          const alreadyMatched = sharedIndicators.some(
            s => s.type === tEnt.type && s.normalized_value === tEnt.normalized_value
          );

          if (!alreadyMatched) {
            const weight = ENTITY_WEIGHTS[tEnt.type] || 10;
            totalScore += weight;
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
      }
    }

    // If there are matches, check for corroborating bonus
    if (sharedIndicators.length > 1) {
      const bonus = 10;
      totalScore += bonus;
      breakdown.push({
        label: 'Corroborating indicators multi-match',
        points: bonus,
        type: 'CORROBORATING',
      });
    }

    // Cap score at 100
    const finalScore = Math.min(100, totalScore);

    if (finalScore >= 15 && sharedIndicators.length > 0) {
      // Canonical ordering for pair key: sort case numbers
      const caseA = targetCase.case_number < otherCase.case_number ? targetCase.case_number : otherCase.case_number;
      const caseB = targetCase.case_number < otherCase.case_number ? otherCase.case_number : targetCase.case_number;

      // Format reason
      const indicatorsList = Array.from(matchedTypes).map(t => t.toLowerCase()).join(', ');
      const reasonSummary = `Identified ${sharedIndicators.length} shared indicator(s) (${indicatorsList}) across evidence files`;

      const existingIndex = updatedConnections.findIndex(
        c => (c.case_a === caseA && c.case_b === caseB) || (c.case_a === caseB && c.case_b === caseA)
      );

      const now = new Date().toISOString();

      if (existingIndex >= 0) {
        // Keep verification state if verified/dismissed
        const existing = updatedConnections[existingIndex];
        updatedConnections[existingIndex] = {
          ...existing,
          score: finalScore,
          severity: getSeverityFromScore(finalScore),
          reason: reasonSummary,
          breakdown,
          shared_entities: sharedIndicators,
        };
      } else {
        const newConnection: Connection = {
          id: `CONN-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
          case_a: caseA,
          case_b: caseB,
          score: finalScore,
          severity: getSeverityFromScore(finalScore),
          reason: reasonSummary,
          breakdown,
          shared_entities: sharedIndicators,
          status: 'SUGGESTED',
          created_at: now,
        };
        updatedConnections.unshift(newConnection);
      }
    }
  }

  return updatedConnections;
}
