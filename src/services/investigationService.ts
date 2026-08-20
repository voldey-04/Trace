import { Case, Connection, Entity, Evidence, TimelineEvent } from '../types';
import { buildInitialSeedState } from '../data/seedData';
import { extractEntitiesFromText } from '../engine/extractor';
import { matchCaseAgainstAll, getSeverityFromScore, ENTITY_WEIGHTS } from '../engine/matching';
import { normalizeEntityValue } from '../engine/normalization';
import { computeDeterministicHash } from '../engine/crypto';

export interface InvestigationStore {
  cases: Case[];
  evidence: Evidence[];
  entities: Entity[];
  connections: Connection[];
  timeline: TimelineEvent[];
}

export interface CaseFilterOptions {
  status?: string;
  priority?: string;
  crimeType?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface EntityFilterOptions {
  caseId?: string;
  type?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface LinkFilterOptions {
  caseId?: string;
  severity?: string;
  status?: string;
  minScore?: number;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface EvidenceFilterOptions {
  caseId?: string;
  fileType?: string;
  search?: string;
  limit?: number;
}

export interface AnalysisInput {
  caseId?: string;
  rawText?: string;
  entities?: Array<{ type: string; value: string }>;
}

export class InvestigationService {
  private store: InvestigationStore;

  constructor(initialStore?: InvestigationStore) {
    this.store = initialStore || buildInitialSeedState();
  }

  /**
   * Reset store to initial seed state
   */
  public resetToSeed(): void {
    this.store = buildInitialSeedState();
  }

  /**
   * Get all cases with optional filtering
   */
  public getCases(filters: CaseFilterOptions = {}): { total: number; cases: Case[] } {
    let result = [...this.store.cases];

    if (filters.status) {
      result = result.filter(c => c.status.toLowerCase() === filters.status?.toLowerCase());
    }

    if (filters.priority) {
      result = result.filter(c => c.priority.toLowerCase() === filters.priority?.toLowerCase());
    }

    if (filters.crimeType) {
      result = result.filter(c => c.crime_type.toLowerCase().includes(filters.crimeType!.toLowerCase()));
    }

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(c => 
        c.case_number.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        (c.tags && c.tags.some(t => t.toLowerCase().includes(q)))
      );
    }

    const total = result.length;
    const offset = Math.max(0, filters.offset || 0);
    const limit = Math.min(100, Math.max(1, filters.limit || 50));

    return {
      total,
      cases: result.slice(offset, offset + limit),
    };
  }

  /**
   * Get a single case by ID or Case Number with linked summary metrics
   */
  public getCaseById(identifier: string): (Case & {
    evidenceCount: number;
    entityCount: number;
    connectedCases: string[];
    verifiedConnectionsCount: number;
  }) | null {
    if (!identifier) return null;
    const q = identifier.trim().toLowerCase();
    const c = this.store.cases.find(item => 
      item.id.toLowerCase() === q || item.case_number.toLowerCase() === q
    );

    if (!c) return null;

    const caseEv = this.store.evidence.filter(e => e.case_id === c.case_number || e.case_id === c.id);
    const caseEnt = this.store.entities.filter(e => e.source_case_id === c.case_number || e.source_case_id === c.id);
    
    const activeConnections = this.store.connections.filter(conn => 
      (conn.case_a === c.case_number || conn.case_b === c.case_number) && conn.status !== 'DISMISSED'
    );

    const connectedCaseNumbers = Array.from(new Set(
      activeConnections.map(conn => conn.case_a === c.case_number ? conn.case_b : conn.case_a)
    ));

    const verifiedCount = activeConnections.filter(conn => conn.status === 'VERIFIED').length;

    return {
      ...c,
      evidenceCount: caseEv.length,
      entityCount: caseEnt.length,
      connectedCases: connectedCaseNumbers,
      verifiedConnectionsCount: verifiedCount,
    };
  }

  /**
   * Get entities with optional filtering
   */
  public getEntities(filters: EntityFilterOptions = {}): { total: number; entities: Entity[] } {
    let result = [...this.store.entities];

    if (filters.caseId) {
      const caseIdNorm = filters.caseId.trim().toUpperCase();
      result = result.filter(e => e.source_case_id.toUpperCase() === caseIdNorm);
    }

    if (filters.type) {
      const typeNorm = filters.type.trim().toUpperCase();
      result = result.filter(e => e.type.toUpperCase() === typeNorm);
    }

    if (filters.search) {
      const q = filters.search.trim().toLowerCase();
      result = result.filter(e => 
        e.value.toLowerCase().includes(q) ||
        e.normalized_value.toLowerCase().includes(q) ||
        (e.source_context && e.source_context.toLowerCase().includes(q))
      );
    }

    const total = result.length;
    const offset = Math.max(0, filters.offset || 0);
    const limit = Math.min(200, Math.max(1, filters.limit || 50));

    return {
      total,
      entities: result.slice(offset, offset + limit),
    };
  }

  /**
   * Get deep entity inspection with provenance and cross-case occurrences
   */
  public getEntityById(identifier: string): {
    entity: Entity | null;
    normalizedValue: string;
    type?: string;
    occurrences: Array<{
      caseId: string;
      caseTitle?: string;
      evidenceId: string;
      evidenceFileName?: string;
      context?: string;
      confidence?: number;
      extractedAt: string;
    }>;
    connectedCases: string[];
  } | null {
    if (!identifier) return null;
    const idClean = identifier.trim();

    // Check if identifier matches entity ID
    let matchedEntities = this.store.entities.filter(e => e.id.toLowerCase() === idClean.toLowerCase());

    // If not found by ID, try matching normalized value or exact value
    if (matchedEntities.length === 0) {
      matchedEntities = this.store.entities.filter(e => 
        e.normalized_value.toLowerCase() === idClean.toLowerCase() ||
        e.value.toLowerCase() === idClean.toLowerCase()
      );
    }

    // If still not found, run multi-type normalization candidate search
    if (matchedEntities.length === 0) {
      const candidates = [
        normalizeEntityValue('PHONE', idClean),
        normalizeEntityValue('UPI', idClean),
        normalizeEntityValue('EMAIL', idClean),
        normalizeEntityValue('WEBSITE', idClean),
        normalizeEntityValue('URL', idClean),
        normalizeEntityValue('ACCOUNT', idClean),
        normalizeEntityValue('IP_ADDRESS', idClean),
        normalizeEntityValue('USERNAME', idClean),
      ].filter(c => c && c.length > 1);

      matchedEntities = this.store.entities.filter(e => 
        candidates.some(cand => cand.toLowerCase() === e.normalized_value.toLowerCase())
      );
    }

    if (matchedEntities.length === 0) return null;

    const primaryEntity = matchedEntities[0];
    const normalizedVal = primaryEntity.normalized_value;
    const entityType = primaryEntity.type;

    // Find ALL occurrences across the entire corpus sharing this type and normalized value
    const allMatching = this.store.entities.filter(e => 
      e.type === entityType && e.normalized_value === normalizedVal
    );

    const occurrences = allMatching.map(e => {
      const sourceCase = this.store.cases.find(c => c.case_number === e.source_case_id || c.id === e.source_case_id);
      const sourceEvidence = this.store.evidence.find(ev => ev.id === e.source_evidence_id);
      return {
        caseId: e.source_case_id,
        caseTitle: sourceCase?.title,
        evidenceId: e.source_evidence_id,
        evidenceFileName: sourceEvidence?.file_name,
        context: e.source_context,
        confidence: e.confidence,
        extractedAt: e.extracted_at,
      };
    });

    const uniqueCases = Array.from(new Set(occurrences.map(o => o.caseId)));

    return {
      entity: primaryEntity,
      normalizedValue: normalizedVal,
      type: entityType,
      occurrences,
      connectedCases: uniqueCases,
    };
  }

  /**
   * Get evidence items with optional filtering
   */
  public getEvidence(filters: EvidenceFilterOptions = {}): { total: number; evidence: Evidence[] } {
    let result = [...this.store.evidence];

    if (filters.caseId) {
      const cId = filters.caseId.trim().toUpperCase();
      result = result.filter(e => e.case_id.toUpperCase() === cId);
    }

    if (filters.fileType) {
      result = result.filter(e => e.file_type.toLowerCase() === filters.fileType?.toLowerCase());
    }

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(e => 
        e.file_name.toLowerCase().includes(q) ||
        e.extracted_text.toLowerCase().includes(q)
      );
    }

    const total = result.length;
    const limit = Math.min(100, Math.max(1, filters.limit || 50));

    return {
      total,
      evidence: result.slice(0, limit),
    };
  }

  /**
   * Get single evidence item with extracted entities and chain of custody
   */
  public getEvidenceById(id: string): (Evidence & {
    extractedEntities: Entity[];
    caseTitle?: string;
  }) | null {
    if (!id) return null;
    const ev = this.store.evidence.find(e => e.id.toLowerCase() === id.trim().toLowerCase());
    if (!ev) return null;

    const extractedEntities = this.store.entities.filter(ent => ent.source_evidence_id === ev.id);
    const relatedCase = this.store.cases.find(c => c.case_number === ev.case_id || c.id === ev.case_id);

    return {
      ...ev,
      extractedEntities,
      caseTitle: relatedCase?.title,
    };
  }

  /**
   * Get cross-case links with filtering
   */
  public getLinks(filters: LinkFilterOptions = {}): { total: number; connections: Connection[] } {
    let result = [...this.store.connections];

    if (filters.caseId) {
      const cNum = filters.caseId.trim().toUpperCase();
      result = result.filter(c => c.case_a.toUpperCase() === cNum || c.case_b.toUpperCase() === cNum);
    }

    if (filters.severity) {
      result = result.filter(c => c.severity.toLowerCase() === filters.severity?.toLowerCase());
    }

    if (filters.status) {
      result = result.filter(c => c.status.toLowerCase() === filters.status?.toLowerCase());
    }

    if (typeof filters.minScore === 'number' && !isNaN(filters.minScore)) {
      result = result.filter(c => c.score >= filters.minScore!);
    }

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(c => 
        c.case_a.toLowerCase().includes(q) ||
        c.case_b.toLowerCase().includes(q) ||
        c.reason.toLowerCase().includes(q) ||
        c.shared_entities.some(s => s.value.toLowerCase().includes(q) || s.normalized_value.toLowerCase().includes(q))
      );
    }

    const total = result.length;
    const offset = Math.max(0, filters.offset || 0);
    const limit = Math.min(100, Math.max(1, filters.limit || 50));

    return {
      total,
      connections: result.slice(offset, offset + limit),
    };
  }

  /**
   * Get single relationship / connection by ID or case pair
   */
  public getRelationshipById(identifier: string): (Connection & {
    caseADetails?: Partial<Case>;
    caseBDetails?: Partial<Case>;
  }) | null {
    if (!identifier) return null;
    const idClean = identifier.trim().toUpperCase();

    let conn = this.store.connections.find(c => c.id.toUpperCase() === idClean);

    // If not found by CONN-id, check if identifier is "CASE-001:CASE-002"
    if (!conn && idClean.includes(':')) {
      const [a, b] = idClean.split(':');
      conn = this.store.connections.find(c => 
        (c.case_a === a && c.case_b === b) || (c.case_a === b && c.case_b === a)
      );
    }

    if (!conn) return null;

    const caseA = this.store.cases.find(c => c.case_number === conn!.case_a);
    const caseB = this.store.cases.find(c => c.case_number === conn!.case_b);

    return {
      ...conn,
      caseADetails: caseA ? {
        id: caseA.id,
        case_number: caseA.case_number,
        title: caseA.title,
        crime_type: caseA.crime_type,
        status: caseA.status,
        priority: caseA.priority,
      } : undefined,
      caseBDetails: caseB ? {
        id: caseB.id,
        case_number: caseB.case_number,
        title: caseB.title,
        crime_type: caseB.crime_type,
        status: caseB.status,
        priority: caseB.priority,
      } : undefined,
    };
  }

  /**
   * Get timeline events for a given case
   */
  public getTimeline(caseId: string): { caseId: string; totalEvents: number; events: TimelineEvent[] } {
    if (!caseId) return { caseId: '', totalEvents: 0, events: [] };
    const cIdNorm = caseId.trim().toUpperCase();

    const events = this.store.timeline.filter(t => t.case_id.toUpperCase() === cIdNorm);

    return {
      caseId: cIdNorm,
      totalEvents: events.length,
      events: events.sort((a, b) => new Date(b.event_time).getTime() - new Date(a.event_time).getTime()),
    };
  }

  /**
   * Deterministic cross-case analysis of a case or raw forensic input text against the investigation corpus
   */
  public analyze(input: AnalysisInput): {
    analyzedCaseId?: string;
    extractedEntities: Entity[];
    matchedCases: Array<{
      caseNumber: string;
      caseTitle: string;
      score: number;
      severity: string;
      sharedIndicatorsCount: number;
      sharedIndicators: Array<{
        type: string;
        value: string;
        normalizedValue: string;
        sourceEvidenceName?: string;
      }>;
      scoreBreakdown: Array<{
        label: string;
        points: number;
        type: string;
      }>;
      reason: string;
    }>;
    summary: {
      totalEntitiesExtracted: number;
      totalCorrelatedCases: number;
      highestConfidenceScore: number;
      dominantCrimeTypes: string[];
    };
  } {
    let entitiesToAnalyze: Entity[] = [];
    let targetCaseNumber = input.caseId ? input.caseId.trim().toUpperCase() : undefined;

    if (targetCaseNumber) {
      // Analyze existing case
      entitiesToAnalyze = this.store.entities.filter(e => 
        e.source_case_id.toUpperCase() === targetCaseNumber
      );
    }

    if (input.rawText) {
      const tempEvId = `TEMP-EV-${Date.now()}`;
      const tempCaseId = targetCaseNumber || 'INPUT_ANALYSIS';
      const extracted = extractEntitiesFromText(input.rawText, tempEvId, tempCaseId);
      entitiesToAnalyze = [...entitiesToAnalyze, ...extracted];
    }

    if (input.entities && Array.isArray(input.entities)) {
      const now = new Date().toISOString();
      const customEntities: Entity[] = input.entities.map((item, idx) => {
        const norm = normalizeEntityValue(item.type as any, item.value);
        return {
          id: `CUSTOM-ENT-${idx}`,
          type: item.type as any,
          value: item.value,
          normalized_value: norm,
          source_evidence_id: 'CUSTOM_INPUT',
          source_case_id: targetCaseNumber || 'INPUT_ANALYSIS',
          extracted_at: now,
          confidence: 0.95,
        };
      });
      entitiesToAnalyze = [...entitiesToAnalyze, ...customEntities];
    }

    // Match these entities against all other cases in corpus
    const matchedCasesMap = new Map<string, {
      caseNumber: string;
      caseTitle: string;
      score: number;
      severity: string;
      sharedIndicatorsCount: number;
      sharedIndicators: Array<{
        type: string;
        value: string;
        normalizedValue: string;
        sourceEvidenceName?: string;
      }>;
      scoreBreakdown: Array<{
        label: string;
        points: number;
        type: string;
      }>;
      reason: string;
    }>();

    const candidateCases = this.store.cases.filter(c => 
      !targetCaseNumber || c.case_number.toUpperCase() !== targetCaseNumber
    );

    for (const c of candidateCases) {
      const caseEntities = this.store.entities.filter(e => 
        e.source_case_id.toUpperCase() === c.case_number.toUpperCase()
      );
      if (caseEntities.length === 0) continue;

      let score = 0;
      const shared: Array<{
        type: string;
        value: string;
        normalizedValue: string;
        sourceEvidenceName?: string;
      }> = [];
      const breakdown: Array<{ label: string; points: number; type: string }> = [];
      const matchedTypes = new Set<string>();

      for (const tEnt of entitiesToAnalyze) {
        if (tEnt.type === 'DATE' || tEnt.type === 'AMOUNT') continue;

        for (const cEnt of caseEntities) {
          if (tEnt.type === cEnt.type && tEnt.normalized_value === cEnt.normalized_value) {
            const alreadyInShared = shared.some(s => s.type === tEnt.type && s.normalizedValue === tEnt.normalized_value);
            if (!alreadyInShared) {
              const weight = ENTITY_WEIGHTS[tEnt.type] || 10;
              score += weight;
              matchedTypes.add(tEnt.type);

              const ev = this.store.evidence.find(ev => ev.id === cEnt.source_evidence_id);

              shared.push({
                type: tEnt.type,
                value: tEnt.value,
                normalizedValue: tEnt.normalized_value,
                sourceEvidenceName: ev?.file_name || cEnt.source_evidence_id,
              });

              breakdown.push({
                label: `Shared ${tEnt.type.toLowerCase().replace('_', ' ')}`,
                points: weight,
                type: tEnt.type,
              });
            }
          }
        }
      }

      if (shared.length > 1) {
        score += 10;
        breakdown.push({
          label: 'Corroborating indicators multi-match bonus',
          points: 10,
          type: 'CORROBORATING',
        });
      }

      const finalScore = Math.min(100, score);

      if (finalScore >= 15 && shared.length > 0) {
        const severity = getSeverityFromScore(finalScore);
        const typesStr = Array.from(matchedTypes).map(t => t.toLowerCase()).join(', ');
        const reason = `Correlated ${shared.length} shared indicator(s) (${typesStr}) with case ${c.case_number}`;

        matchedCasesMap.set(c.case_number, {
          caseNumber: c.case_number,
          caseTitle: c.title,
          score: finalScore,
          severity,
          sharedIndicatorsCount: shared.length,
          sharedIndicators: shared,
          scoreBreakdown: breakdown,
          reason,
        });
      }
    }

    const matchedCasesList = Array.from(matchedCasesMap.values())
      .sort((a, b) => b.score - a.score);

    const highestScore = matchedCasesList.length > 0 ? matchedCasesList[0].score : 0;
    
    // Find dominant crime types of matched cases
    const crimeTypeCounts = new Map<string, number>();
    for (const mc of matchedCasesList) {
      const c = this.store.cases.find(item => item.case_number === mc.caseNumber);
      if (c) {
        crimeTypeCounts.set(c.crime_type, (crimeTypeCounts.get(c.crime_type) || 0) + 1);
      }
    }
    const dominantCrimeTypes = Array.from(crimeTypeCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0]);

    return {
      analyzedCaseId: targetCaseNumber,
      extractedEntities: entitiesToAnalyze,
      matchedCases: matchedCasesList,
      summary: {
        totalEntitiesExtracted: entitiesToAnalyze.length,
        totalCorrelatedCases: matchedCasesList.length,
        highestConfidenceScore: highestScore,
        dominantCrimeTypes,
      },
    };
  }

  /**
   * System metrics for AI telemetry & health check
   */
  public getSystemMetrics() {
    return {
      totalCases: this.store.cases.length,
      totalEvidenceFiles: this.store.evidence.length,
      totalEntities: this.store.entities.length,
      totalConnections: this.store.connections.length,
      verifiedConnections: this.store.connections.filter(c => c.status === 'VERIFIED').length,
      highPriorityConnections: this.store.connections.filter(c => c.severity === 'HIGH').length,
      status: 'OPERATIONAL',
      version: '1.0.0',
    };
  }
}

// Global singleton instance for server runtime
export const defaultInvestigationService = new InvestigationService();
