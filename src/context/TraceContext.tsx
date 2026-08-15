import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  ActiveView,
  Case,
  Connection,
  Entity,
  Evidence,
  FileType,
  TimelineEvent,
} from '../types';
import { buildInitialSeedState, GOLDEN_DEMO_EVIDENCE_PAYLOAD } from '../data/seedData';
import { extractEntitiesFromText } from '../engine/extractor';
import { matchCaseAgainstAll } from '../engine/matching';

interface TraceContextType {
  cases: Case[];
  evidence: Evidence[];
  entities: Entity[];
  connections: Connection[];
  timeline: TimelineEvent[];
  activeView: ActiveView;
  selectedCaseId: string | null;
  selectedConnectionId: string | null;
  selectedEvidenceId: string | null;
  searchQuery: string;
  isProcessing: boolean;
  activeNotification: { title: string; message: string; type: 'success' | 'info' | 'warning' } | null;
  mobileMenuOpen: boolean;

  // Actions
  setActiveView: (view: ActiveView, caseId?: string, connectionId?: string) => void;
  setSelectedCaseId: (id: string | null) => void;
  setSelectedConnectionId: (id: string | null) => void;
  setSelectedEvidenceId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setMobileMenuOpen: (open: boolean) => void;
  clearNotification: () => void;

  addCase: (data: Omit<Case, 'id' | 'case_number' | 'created_at' | 'updated_at'>) => Case;
  updateCase: (caseId: string, updates: Partial<Case>) => void;
  
  addEvidence: (caseId: string, fileData: {
    fileName: string;
    fileType: FileType;
    text: string;
    metadata?: any;
  }) => Evidence;
  
  processEvidence: (evidenceId: string) => Promise<{ newEntities: Entity[]; updatedConnections: Connection[] }>;
  
  verifyConnection: (connectionId: string, notes?: string) => void;
  dismissConnection: (connectionId: string, reason?: string) => void;
  
  runGoldenDemo: () => Promise<void>;
  resetToSeedData: () => void;
  executeTerminalCommand: (command: string) => string[];
}

const STORAGE_KEY = 'TRACE_PLATFORM_STATE_V1';

const sanitizeCases = (list: any): Case[] => {
  if (!Array.isArray(list)) return [];
  return list.map(c => ({
    ...c,
    tags: Array.isArray(c?.tags) ? c.tags : [],
  }));
};

const sanitizeConnections = (list: any): Connection[] => {
  if (!Array.isArray(list)) return [];
  return list.map(c => ({
    ...c,
    shared_entities: Array.isArray(c?.shared_entities) ? c.shared_entities : [],
    breakdown: Array.isArray(c?.breakdown) ? c.breakdown : [],
  }));
};

const sanitizeArray = <T,>(list: any): T[] => {
  return Array.isArray(list) ? list : [];
};

const TraceContext = createContext<TraceContextType | null>(null);

export const TraceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state from localStorage or initialize with seed data
  const [cases, setCases] = useState<Case[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_CASES`);
      if (saved) return sanitizeCases(JSON.parse(saved));
    } catch {}
    return sanitizeCases(buildInitialSeedState().cases);
  });

  const [evidence, setEvidence] = useState<Evidence[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_EVIDENCE`);
      if (saved) return sanitizeArray<Evidence>(JSON.parse(saved));
    } catch {}
    return sanitizeArray<Evidence>(buildInitialSeedState().evidence);
  });

  const [entities, setEntities] = useState<Entity[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_ENTITIES`);
      if (saved) return sanitizeArray<Entity>(JSON.parse(saved));
    } catch {}
    return sanitizeArray<Entity>(buildInitialSeedState().entities);
  });

  const [connections, setConnections] = useState<Connection[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_CONNECTIONS`);
      if (saved) return sanitizeConnections(JSON.parse(saved));
    } catch {}
    return sanitizeConnections(buildInitialSeedState().connections);
  });

  const [timeline, setTimeline] = useState<TimelineEvent[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_TIMELINE`);
      if (saved) return sanitizeArray<TimelineEvent>(JSON.parse(saved));
    } catch {}
    return sanitizeArray<TimelineEvent>(buildInitialSeedState().timeline);
  });

  const [activeView, setActiveViewInternal] = useState<ActiveView>('dashboard');
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeNotification, setActiveNotification] = useState<{ title: string; message: string; type: 'success' | 'info' | 'warning' } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_CASES`, JSON.stringify(cases));
      localStorage.setItem(`${STORAGE_KEY}_EVIDENCE`, JSON.stringify(evidence));
      localStorage.setItem(`${STORAGE_KEY}_ENTITIES`, JSON.stringify(entities));
      localStorage.setItem(`${STORAGE_KEY}_CONNECTIONS`, JSON.stringify(connections));
      localStorage.setItem(`${STORAGE_KEY}_TIMELINE`, JSON.stringify(timeline));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }, [cases, evidence, entities, connections, timeline]);

  const setActiveView = (view: ActiveView, caseId?: string, connectionId?: string) => {
    setActiveViewInternal(view);
    setMobileMenuOpen(false);
    if (caseId !== undefined) setSelectedCaseId(caseId);
    if (connectionId !== undefined) setSelectedConnectionId(connectionId);
  };

  const clearNotification = () => setActiveNotification(null);

  const addCase = (data: Omit<Case, 'id' | 'case_number' | 'created_at' | 'updated_at'>): Case => {
    // Generate next case number e.g. CASE-013
    const maxNum = cases.reduce((max, c) => {
      const match = c.case_number.match(/CASE-(\d+)/);
      if (match) {
        const n = parseInt(match[1], 10);
        return n > max ? n : max;
      }
      return max;
    }, 0);

    const nextNumber = `CASE-${String(maxNum + 1).padStart(3, '0')}`;
    const now = new Date().toISOString();
    const newCase: Case = {
      ...data,
      id: `c-${Date.now().toString(36)}`,
      case_number: nextNumber,
      created_at: now,
      updated_at: now,
    };

    setCases(prev => [newCase, ...prev]);

    // Timeline event
    const newEvent: TimelineEvent = {
      id: `tl-${Date.now()}`,
      case_id: nextNumber,
      event_type: 'CASE_CREATED',
      event_time: now,
      description: `Case ${nextNumber} registered: ${newCase.title}`,
      actor: 'Investigator',
    };
    setTimeline(prev => [newEvent, ...prev]);

    setActiveNotification({
      title: 'Case Created',
      message: `${nextNumber} has been added to the investigation repository.`,
      type: 'success',
    });

    return newCase;
  };

  const updateCase = (caseId: string, updates: Partial<Case>) => {
    const now = new Date().toISOString();
    setCases(prev => prev.map(c => {
      if (c.id === caseId || c.case_number === caseId) {
        return { ...c, ...updates, updated_at: now };
      }
      return c;
    }));
  };

  const addEvidence = (caseId: string, fileData: {
    fileName: string;
    fileType: FileType;
    text: string;
    metadata?: any;
  }): Evidence => {
    const now = new Date().toISOString();
    const newEvidence: Evidence = {
      id: `ev-${Date.now().toString(36)}`,
      case_id: caseId,
      file_name: fileData.fileName,
      file_type: fileData.fileType,
      uploaded_at: now,
      processing_status: 'UPLOADED',
      extracted_text: fileData.text,
      metadata: fileData.metadata || {
        fileSize: `${(fileData.text.length / 1024).toFixed(1)} KB`,
        uploadedBy: 'Investigator',
      },
    };

    setEvidence(prev => [newEvidence, ...prev]);

    // Record timeline
    const evEvent: TimelineEvent = {
      id: `tl-${Date.now()}`,
      case_id: caseId,
      event_type: 'EVIDENCE_UPLOADED',
      event_time: now,
      description: `Evidence file ${fileData.fileName} uploaded to ${caseId}`,
      actor: 'Investigator',
    };
    setTimeline(prev => [evEvent, ...prev]);

    return newEvidence;
  };

  const processEvidence = async (evidenceId: string): Promise<{ newEntities: Entity[]; updatedConnections: Connection[] }> => {
    setIsProcessing(true);

    const targetEvidence = evidence.find(e => e.id === evidenceId);
    if (!targetEvidence) {
      setIsProcessing(false);
      throw new Error(`Evidence ${evidenceId} not found`);
    }

    // Mark evidence as processing
    setEvidence(prev => prev.map(e => e.id === evidenceId ? { ...e, processing_status: 'PROCESSING' } : e));

    // Simulated short processing step
    await new Promise(res => setTimeout(res, 400));

    try {
      // 1. Extract and normalize entities
      const newExtracted = extractEntitiesFromText(
        targetEvidence.extracted_text,
        targetEvidence.id,
        targetEvidence.case_id
      );

      // Merge entities (avoid duplicates from this evidence)
      const otherEntities = entities.filter(e => e.source_evidence_id !== evidenceId);
      const combinedEntities = [...otherEntities, ...newExtracted];
      setEntities(combinedEntities);

      // 2. Update evidence item status
      const updatedEvidenceList = evidence.map(e => {
        if (e.id === evidenceId) {
          return {
            ...e,
            processing_status: 'PROCESSED' as const,
            extracted_entity_count: newExtracted.length,
          };
        }
        return e;
      });
      setEvidence(updatedEvidenceList);

      // 3. Cross-case matching against all other cases
      const updatedConnections = matchCaseAgainstAll(
        targetEvidence.case_id,
        cases,
        combinedEntities,
        updatedEvidenceList,
        connections
      );
      setConnections(updatedConnections);

      // 4. Record timeline events
      const now = new Date().toISOString();
      const newEvents: TimelineEvent[] = [
        {
          id: `tl-${Date.now()}-1`,
          case_id: targetEvidence.case_id,
          event_type: 'EVIDENCE_PROCESSED',
          event_time: now,
          description: `Processed evidence ${targetEvidence.file_name}: ${newExtracted.length} entities extracted and normalized`,
          actor: 'TRACE Engine',
        },
      ];

      // If new connections detected
      const newLinks = updatedConnections.filter(c => 
        (c.case_a === targetEvidence.case_id || c.case_b === targetEvidence.case_id) &&
        !connections.some(oc => oc.id === c.id)
      );

      if (newLinks.length > 0) {
        newLinks.forEach((nl, idx) => {
          const otherCase = nl.case_a === targetEvidence.case_id ? nl.case_b : nl.case_a;
          newEvents.push({
            id: `tl-${Date.now()}-${idx + 2}`,
            case_id: targetEvidence.case_id,
            event_type: 'CONNECTION_DETECTED',
            event_time: now,
            description: `Potential connection discovered: ${targetEvidence.case_id} ↔ ${otherCase} (Score: ${nl.score}/${nl.severity})`,
            actor: 'TRACE Cross-Case Matcher',
          });
        });

        setActiveNotification({
          title: 'Relationships Discovered',
          message: `TRACE identified ${newLinks.length} new potential relationship(s) for ${targetEvidence.case_id}.`,
          type: 'warning',
        });
      } else {
        setActiveNotification({
          title: 'Evidence Processed',
          message: `Extracted ${newExtracted.length} entities from ${targetEvidence.file_name}.`,
          type: 'success',
        });
      }

      setTimeline(prev => [...newEvents, ...prev]);
      setIsProcessing(false);

      return {
        newEntities: newExtracted,
        updatedConnections,
      };
    } catch (err: any) {
      setEvidence(prev => prev.map(e => e.id === evidenceId ? { ...e, processing_status: 'FAILED', processing_error: err.message } : e));
      setIsProcessing(false);
      throw err;
    }
  };

  const verifyConnection = (connectionId: string, notes?: string) => {
    const now = new Date().toISOString();
    let verifiedConn: Connection | undefined;

    setConnections(prev => prev.map(c => {
      if (c.id === connectionId) {
        verifiedConn = {
          ...c,
          status: 'VERIFIED',
          verified_at: now,
          investigator_notes: notes || c.investigator_notes || 'Verified by Investigator after indicator corroboration.',
        };
        return verifiedConn;
      }
      return c;
    }));

    if (verifiedConn) {
      const vEvent: TimelineEvent = {
        id: `tl-${Date.now()}`,
        case_id: verifiedConn.case_a,
        event_type: 'CONNECTION_VERIFIED',
        event_time: now,
        description: `Investigator verified connection: ${verifiedConn.case_a} ↔ ${verifiedConn.case_b}`,
        actor: 'Investigator',
      };
      setTimeline(prev => [vEvent, ...prev]);

      setActiveNotification({
        title: 'Connection Verified',
        message: `Relationship between ${verifiedConn.case_a} and ${verifiedConn.case_b} is now marked VERIFIED.`,
        type: 'success',
      });
    }
  };

  const dismissConnection = (connectionId: string, reason?: string) => {
    const now = new Date().toISOString();
    let dismissedConn: Connection | undefined;

    setConnections(prev => prev.map(c => {
      if (c.id === connectionId) {
        dismissedConn = {
          ...c,
          status: 'DISMISSED',
          dismissed_at: now,
          dismissal_reason: reason || 'Dismissed by Investigator upon review.',
        };
        return dismissedConn;
      }
      return c;
    }));

    if (dismissedConn) {
      const dEvent: TimelineEvent = {
        id: `tl-${Date.now()}`,
        case_id: dismissedConn.case_a,
        event_type: 'CONNECTION_DISMISSED',
        event_time: now,
        description: `Investigator dismissed connection: ${dismissedConn.case_a} ↔ ${dismissedConn.case_b} (${reason || 'No correlation'})`,
        actor: 'Investigator',
      };
      setTimeline(prev => [dEvent, ...prev]);

      setActiveNotification({
        title: 'Connection Dismissed',
        message: `Relationship between ${dismissedConn.case_a} and ${dismissedConn.case_b} moved to DISMISSED.`,
        type: 'info',
      });
    }
  };

  const runGoldenDemo = async () => {
    setIsProcessing(true);

    // 1. Check if CASE-008 exists, if not create it
    let targetCase = cases.find(c => c.case_number === 'CASE-008');
    if (!targetCase) {
      const seedCase = buildInitialSeedState().cases.find(c => c.case_number === 'CASE-008');
      if (seedCase) {
        setCases(prev => [seedCase, ...prev]);
        targetCase = seedCase;
      }
    }

    // 2. Add the Golden Demo Evidence payload to CASE-008
    const addedEvidence = addEvidence('CASE-008', {
      fileName: GOLDEN_DEMO_EVIDENCE_PAYLOAD.fileName,
      fileType: GOLDEN_DEMO_EVIDENCE_PAYLOAD.fileType,
      text: GOLDEN_DEMO_EVIDENCE_PAYLOAD.text,
      metadata: {
        fileSize: '3.4 KB',
        mimeType: 'text/plain',
        sourceDevice: 'CFO Mobile Phone (Forensic Extraction)',
        uploadedBy: 'Insp. R. Verma',
        sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        victimName: 'Sanjay Deshmukh (CFO)',
        incidentDate: '2026-08-15',
      },
    });

    // 3. Automatically process it through the pipeline
    await processEvidence(addedEvidence.id);

    // 4. Navigate investigator to CASE-008 detail view
    setActiveView('case-detail', 'CASE-008');
  };

  const resetToSeedData = () => {
    const seed = buildInitialSeedState();
    setCases(seed.cases);
    setEvidence(seed.evidence);
    setEntities(seed.entities);
    setConnections(seed.connections);
    setTimeline(seed.timeline);

    localStorage.removeItem(`${STORAGE_KEY}_CASES`);
    localStorage.removeItem(`${STORAGE_KEY}_EVIDENCE`);
    localStorage.removeItem(`${STORAGE_KEY}_ENTITIES`);
    localStorage.removeItem(`${STORAGE_KEY}_CONNECTIONS`);
    localStorage.removeItem(`${STORAGE_KEY}_TIMELINE`);

    setActiveNotification({
      title: 'Database Reset',
      message: 'Demonstration dataset reloaded to initial deterministic state.',
      type: 'info',
    });
  };

  // Real database-connected terminal command evaluator
  const executeTerminalCommand = (commandLine: string): string[] => {
    const trimmed = commandLine.trim();
    if (!trimmed) return [];

    const parts = trimmed.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const arg1 = parts[1];
    const arg2 = parts[2];

    switch (cmd) {
      case 'help':
        return [
          'TRACE Investigation Terminal — Available Commands:',
          '  help                        Show available commands and usage',
          '  clear                       Clear terminal screen',
          '  stats                       Display system-wide intelligence metrics',
          '  cases                       List all registered investigation cases',
          '  case <CASE_ID>              Show detailed summary for a specific case',
          '  evidence <CASE_ID>          List all evidence items associated with case',
          '  entities <CASE_ID>          Show extracted entities and indicators for case',
          '  connections [CASE_ID]       List potential/verified cross-case connections',
          '  search <QUERY>              Search across cases, entities, phones, UPIs, emails',
          '  timeline <CASE_ID>          Show chronological investigative timeline',
          '  process evidence <EVID_ID>  Trigger deterministic entity extraction pipeline',
          '  verify connection <CONN_ID> Mark a potential connection as VERIFIED',
          '  dismiss connection <CONN_ID> Mark a connection as DISMISSED',
          '  demo-golden                 Execute the Golden Demo Scenario (CASE-008)',
          '  reset                       Reset system to initial deterministic demonstration data',
        ];

      case 'stats': {
        const highLeads = connections.filter(c => c.severity === 'HIGH' && c.status !== 'DISMISSED').length;
        const verified = connections.filter(c => c.status === 'VERIFIED').length;
        const suggested = connections.filter(c => c.status === 'SUGGESTED').length;
        return [
          '═══════════════════════════════════════════════════════════',
          '  TRACE EVIDENCE INTELLIGENCE PLATFORM — TELEMETRY METRICS',
          '═══════════════════════════════════════════════════════════',
          `  Active Cases Registered:       ${cases.length}`,
          `  Total Evidence Files:          ${evidence.length}`,
          `  Processed Evidence Items:      ${evidence.filter(e => e.processing_status === 'PROCESSED').length}`,
          `  Extracted Normalized Entities: ${entities.length}`,
          `  Potential Cross-Case Links:    ${suggested} (SUGGESTED)`,
          `  Investigator Verified Links:   ${verified} (VERIFIED)`,
          `  High-Priority Leads (Score≥80): ${highLeads}`,
          '═══════════════════════════════════════════════════════════',
        ];
      }

      case 'cases':
        return [
          'REGISTERED INVESTIGATION CASES:',
          '-------------------------------------------------------------------------------------',
          'CASE ID    | PRIORITY | STATUS               | CRIME TYPE            | TITLE',
          '-------------------------------------------------------------------------------------',
          ...cases.map(c => 
            `${c.case_number.padEnd(10)} | ${c.priority.padEnd(8)} | ${c.status.padEnd(20)} | ${c.crime_type.padEnd(21)} | ${c.title}`
          ),
          '-------------------------------------------------------------------------------------',
          `Total: ${cases.length} cases`,
        ];

      case 'case': {
        if (!arg1) return ['Usage: case <CASE_ID> (e.g. case CASE-001)'];
        const target = cases.find(c => c.case_number.toLowerCase() === arg1.toLowerCase() || c.id.toLowerCase() === arg1.toLowerCase());
        if (!target) return [`Error: Case "${arg1}" not found in database.`];

        const caseEv = evidence.filter(e => e.case_id === target.case_number || e.case_id === target.id);
        const caseEnt = entities.filter(e => e.source_case_id === target.case_number || e.source_case_id === target.id);
        const caseConn = connections.filter(c => c.case_a === target.case_number || c.case_b === target.case_number);

        return [
          `CASE SUMMARY: ${target.case_number}`,
          '====================================================================',
          `Title:       ${target.title}`,
          `Crime Type:  ${target.crime_type}`,
          `Priority:    ${target.priority}`,
          `Status:      ${target.status}`,
          `Officer:     ${target.assigned_officer || 'Unassigned'}`,
          `Created:     ${target.created_at}`,
          `Description: ${target.description}`,
          '--------------------------------------------------------------------',
          `Evidence:    ${caseEv.length} items`,
          `Entities:    ${caseEnt.length} extracted indicators`,
          `Connections: ${caseConn.length} cross-case link(s)`,
          '====================================================================',
        ];
      }

      case 'evidence': {
        if (!arg1) return ['Usage: evidence <CASE_ID> (e.g. evidence CASE-001)'];
        const target = cases.find(c => c.case_number.toLowerCase() === arg1.toLowerCase() || c.id.toLowerCase() === arg1.toLowerCase());
        const caseNumber = target ? target.case_number : arg1.toUpperCase();
        const evList = evidence.filter(e => e.case_id === caseNumber);

        if (evList.length === 0) return [`No evidence found for ${caseNumber}.`];

        return [
          `EVIDENCE REPOSITORY FOR ${caseNumber}:`,
          '-------------------------------------------------------------------------------------------------',
          'EVID ID    | TYPE | STATUS    | ENTITIES | UPLOADED            | FILENAME',
          '-------------------------------------------------------------------------------------------------',
          ...evList.map(e => 
            `${e.id.padEnd(10)} | ${e.file_type.padEnd(4)} | ${e.processing_status.padEnd(9)} | ${String(e.extracted_entity_count || 0).padStart(8)} | ${e.uploaded_at.substring(0, 19)} | ${e.file_name}`
          ),
          '-------------------------------------------------------------------------------------------------',
        ];
      }

      case 'entities': {
        if (!arg1) return ['Usage: entities <CASE_ID> (e.g. entities CASE-001)'];
        const target = cases.find(c => c.case_number.toLowerCase() === arg1.toLowerCase() || c.id.toLowerCase() === arg1.toLowerCase());
        const caseNumber = target ? target.case_number : arg1.toUpperCase();
        const entList = entities.filter(e => e.source_case_id === caseNumber);

        if (entList.length === 0) return [`No entities extracted yet for ${caseNumber}. Run process evidence if pending.`];

        return [
          `EXTRACTED INDICATORS & PROVENANCE FOR ${caseNumber}:`,
          '-------------------------------------------------------------------------------------------------',
          'TYPE         | VALUE                     | NORMALIZED VALUE          | SOURCE EVIDENCE',
          '-------------------------------------------------------------------------------------------------',
          ...entList.map(e => {
            const ev = evidence.find(ev => ev.id === e.source_evidence_id);
            const evName = ev ? ev.file_name : e.source_evidence_id;
            return `${e.type.padEnd(12)} | ${e.value.padEnd(25).slice(0, 25)} | ${e.normalized_value.padEnd(25).slice(0, 25)} | ${evName}`;
          }),
          '-------------------------------------------------------------------------------------------------',
        ];
      }

      case 'connections': {
        let connList = connections;
        if (arg1) {
          const targetNum = arg1.toUpperCase();
          connList = connections.filter(c => c.case_a === targetNum || c.case_b === targetNum);
        }

        if (connList.length === 0) return ['No cross-case connections found for query.'];

        return [
          'CROSS-CASE RELATIONSHIPS & INVESTIGATIVE LEADS:',
          '----------------------------------------------------------------------------------------------------',
          'CONN ID     | RELATIONSHIP        | SCORE | SEVERITY | STATUS    | SHARED INDICATORS',
          '----------------------------------------------------------------------------------------------------',
          ...connList.map(c => 
            `${c.id.padEnd(11)} | ${(c.case_a + ' <-> ' + c.case_b).padEnd(19)} | ${String(c.score).padStart(5)} | ${c.severity.padEnd(8)} | ${c.status.padEnd(9)} | ${(c.shared_entities || []).map(s => s.type + ':' + s.normalized_value).join(', ')}`
          ),
          '----------------------------------------------------------------------------------------------------',
          'Note: All automated connections are SUGGESTED until verified by an investigator.',
        ];
      }

      case 'search': {
        if (!arg1) return ['Usage: search <QUERY> (e.g. search 9000011111 or search securebank.test)'];
        const q = arg1.toLowerCase();

        const matchedEnts = entities.filter(e => 
          e.value.toLowerCase().includes(q) || e.normalized_value.toLowerCase().includes(q)
        );

        const matchedCases = cases.filter(c => 
          c.case_number.toLowerCase().includes(q) || c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
        );

        const output = [`SEARCH RESULTS FOR "${arg1}":`, '===================================================================='];

        if (matchedEnts.length > 0) {
          output.push(`\n[INDICATOR MATCHES (${matchedEnts.length})]:`);
          const groupedByValue = new Map<string, { type: string; cases: Set<string>; evidence: Set<string> }>();
          
          matchedEnts.forEach(e => {
            if (!groupedByValue.has(e.normalized_value)) {
              groupedByValue.set(e.normalized_value, { type: e.type, cases: new Set(), evidence: new Set() });
            }
            groupedByValue.get(e.normalized_value)!.cases.add(e.source_case_id);
            groupedByValue.get(e.normalized_value)!.evidence.add(e.source_evidence_id);
          });

          groupedByValue.forEach((val, key) => {
            output.push(`  ${val.type} : ${key}`);
            output.push(`  -> Linked Cases:    ${Array.from(val.cases).join(', ')}`);
            output.push(`  -> Source Evidence: ${val.evidence.size} file(s)`);
            output.push('');
          });
        }

        if (matchedCases.length > 0) {
          output.push(`[CASE MATCHES (${matchedCases.length})]:`);
          matchedCases.forEach(c => {
            output.push(`  ${c.case_number} - ${c.title} (${c.crime_type} / ${c.priority})`);
          });
        }

        if (matchedEnts.length === 0 && matchedCases.length === 0) {
          output.push(`No indicators or cases matched query "${arg1}".`);
        }

        return output;
      }

      case 'timeline': {
        if (!arg1) return ['Usage: timeline <CASE_ID> (e.g. timeline CASE-001)'];
        const caseNumber = arg1.toUpperCase();
        const events = timeline.filter(t => t.case_id === caseNumber);

        if (events.length === 0) return [`No timeline events recorded for ${caseNumber}.`];

        return [
          `INVESTIGATION TIMELINE FOR ${caseNumber}:`,
          '--------------------------------------------------------------------------------',
          ...events.map(ev => 
            `[${ev.event_time.substring(11, 19)}] (${ev.actor || 'SYSTEM'}) ${ev.description}`
          ),
          '--------------------------------------------------------------------------------',
        ];
      }

      case 'process': {
        if (arg1 === 'evidence' && arg2) {
          const ev = evidence.find(e => e.id.toLowerCase() === arg2.toLowerCase());
          if (!ev) return [`Error: Evidence ID "${arg2}" not found.`];
          // Trigger async processing in background
          processEvidence(ev.id);
          return [`Started processing evidence ${ev.id} (${ev.file_name}). Entities will be extracted and cross-case matching executed.`];
        }
        return ['Usage: process evidence <EVIDENCE_ID>'];
      }

      case 'verify': {
        if (arg1 === 'connection' && arg2) {
          const conn = connections.find(c => c.id.toLowerCase() === arg2.toLowerCase());
          if (!conn) return [`Error: Connection ID "${arg2}" not found.`];
          verifyConnection(conn.id, 'Verified via Terminal Command');
          return [`Connection ${conn.id} (${conn.case_a} <-> ${conn.case_b}) successfully VERIFIED.`];
        }
        return ['Usage: verify connection <CONNECTION_ID>'];
      }

      case 'dismiss': {
        if (arg1 === 'connection' && arg2) {
          const conn = connections.find(c => c.id.toLowerCase() === arg2.toLowerCase());
          if (!conn) return [`Error: Connection ID "${arg2}" not found.`];
          dismissConnection(conn.id, 'Dismissed via Terminal Command');
          return [`Connection ${conn.id} (${conn.case_a} <-> ${conn.case_b}) DISMISSED.`];
        }
        return ['Usage: dismiss connection <CONNECTION_ID>'];
      }

      case 'clear':
        return ['__CLEAR__'];

      case 'demo':
      case 'golden':
      case 'demo-golden':
        runGoldenDemo();
        return [
          'EXECUTING GOLDEN DEMO SCENARIO (CASE-008)...',
          '1. Loading executive smishing forensic evidence payload.',
          '2. Extracting & normalizing phone, UPI, domain, and amount entities.',
          '3. Running deterministic cross-case matching against registered syndicate profiles.',
          '4. Navigating to CASE-008 view to inspect newly discovered relationships.',
        ];

      case 'reset':
        resetToSeedData();
        return ['Database reset to initial demonstration state.'];

      default:
        return [`Unknown command: "${cmd}". Type "help" to view available investigative commands.`];
    }
  };

  return (
    <TraceContext.Provider
      value={{
        cases,
        evidence,
        entities,
        connections,
        timeline,
        activeView,
        selectedCaseId,
        selectedConnectionId,
        selectedEvidenceId,
        searchQuery,
        isProcessing,
        activeNotification,
        mobileMenuOpen,
        setActiveView,
        setSelectedCaseId,
        setSelectedConnectionId,
        setSelectedEvidenceId,
        setSearchQuery,
        setMobileMenuOpen,
        clearNotification,
        addCase,
        updateCase,
        addEvidence,
        processEvidence,
        verifyConnection,
        dismissConnection,
        runGoldenDemo,
        resetToSeedData,
        executeTerminalCommand,
      }}
    >
      {children}
    </TraceContext.Provider>
  );
};

export const useTrace = () => {
  const context = useContext(TraceContext);
  if (!context) throw new Error('useTrace must be used within a TraceProvider');
  return context;
};
