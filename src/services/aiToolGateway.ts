import { InvestigationService, defaultInvestigationService } from './investigationService';

export interface ToolParameterSchema {
  type: string;
  description: string;
  enum?: string[];
  items?: { type: string };
  default?: any;
}

export interface ToolDefinition {
  name: string;
  description: string;
  authorization: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, ToolParameterSchema>;
    required?: string[];
  };
  execute: (params: any, service?: InvestigationService) => Promise<any> | any;
}

export class AiToolGateway {
  private service: InvestigationService;
  private tools: Map<string, ToolDefinition> = new Map();

  constructor(service: InvestigationService = defaultInvestigationService) {
    this.service = service;
    this.registerTools();
  }

  private registerTools() {
    // 1. search_cases
    this.registerTool({
      name: 'search_cases',
      description: 'Search and filter active cybercrime investigation cases by keyword, crime type, status, or priority level.',
      authorization: 'READ_INVESTIGATION_DATA',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Free-text search query across case titles, descriptions, case numbers (e.g. "CASE-001"), or tags.',
          },
          crimeType: {
            type: 'string',
            description: 'Filter by specific crime classification (e.g., "Investment Scam", "Phishing Campaign", "Bank Impersonation", "UPI Scam", "Loan App Harassment").',
          },
          status: {
            type: 'string',
            description: 'Filter by case status: OPEN, UNDER_INVESTIGATION, PENDING_REVIEW, CLOSED.',
            enum: ['OPEN', 'UNDER_INVESTIGATION', 'PENDING_REVIEW', 'CLOSED'],
          },
          priority: {
            type: 'string',
            description: 'Filter by priority level: CRITICAL, HIGH, MEDIUM, LOW.',
            enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
          },
          limit: {
            type: 'number',
            description: 'Maximum number of results to return (default 20, max 50).',
          },
        },
      },
      execute: (params) => {
        const res = this.service.getCases({
          search: params.query,
          crimeType: params.crimeType,
          status: params.status,
          priority: params.priority,
          limit: params.limit || 20,
        });

        return {
          totalMatches: res.total,
          returnedCount: res.cases.length,
          cases: res.cases.map(c => ({
            caseNumber: c.case_number,
            title: c.title,
            crimeType: c.crime_type,
            status: c.status,
            priority: c.priority,
            assignedOfficer: c.assigned_officer,
            jurisdiction: c.jurisdiction,
            tags: c.tags,
            createdAt: c.created_at,
          })),
        };
      },
    });

    // 2. get_case
    this.registerTool({
      name: 'get_case',
      description: 'Retrieve complete investigation file details for a specific case by case number (e.g. "CASE-001") or ID.',
      authorization: 'READ_INVESTIGATION_DATA',
      inputSchema: {
        type: 'object',
        properties: {
          caseNumber: {
            type: 'string',
            description: 'The standard case number (e.g., "CASE-001", "CASE-002") or case identifier.',
          },
        },
        required: ['caseNumber'],
      },
      execute: (params) => {
        if (!params.caseNumber) {
          throw new Error('Parameter "caseNumber" is required.');
        }

        const caseData = this.service.getCaseById(params.caseNumber);
        if (!caseData) {
          throw new Error(`Case not found for identifier "${params.caseNumber}".`);
        }

        return {
          caseNumber: caseData.case_number,
          title: caseData.title,
          description: caseData.description,
          crimeType: caseData.crime_type,
          status: caseData.status,
          priority: caseData.priority,
          assignedOfficer: caseData.assigned_officer,
          jurisdiction: caseData.jurisdiction,
          tags: caseData.tags,
          createdAt: caseData.created_at,
          updatedAt: caseData.updated_at,
          investigationMetrics: {
            evidenceFilesCount: caseData.evidenceCount,
            extractedEntitiesCount: caseData.entityCount,
            correlatedCases: caseData.connectedCases,
            verifiedConnectionsCount: caseData.verifiedConnectionsCount,
          },
        };
      },
    });

    // 3. search_entities
    this.registerTool({
      name: 'search_entities',
      description: 'Search for investigative indicators (phone numbers, UPI IDs, bank accounts, domains, URLs, emails, IP addresses) across the corpus or within a specific case.',
      authorization: 'READ_INVESTIGATION_DATA',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Indicator search term, phone number, UPI handle (e.g. "traceuser@upi"), domain, or account number.',
          },
          entityType: {
            type: 'string',
            description: 'Optional filter by entity type: PHONE, UPI, EMAIL, URL, WEBSITE, TRANSACTION, ACCOUNT, USERNAME, IP_ADDRESS.',
            enum: ['PHONE', 'UPI', 'EMAIL', 'URL', 'WEBSITE', 'TRANSACTION', 'ACCOUNT', 'USERNAME', 'IP_ADDRESS'],
          },
          caseId: {
            type: 'string',
            description: 'Optional filter by case number (e.g., "CASE-001").',
          },
          limit: {
            type: 'number',
            description: 'Maximum number of entity matches to return (default 30, max 100).',
          },
        },
      },
      execute: (params) => {
        const res = this.service.getEntities({
          search: params.query,
          type: params.entityType,
          caseId: params.caseId,
          limit: params.limit || 30,
        });

        return {
          totalMatches: res.total,
          returnedCount: res.entities.length,
          entities: res.entities.map(e => ({
            id: e.id,
            type: e.type,
            value: e.value,
            normalizedValue: e.normalized_value,
            caseId: e.source_case_id,
            evidenceId: e.source_evidence_id,
            contextSnippet: e.source_context,
            confidence: e.confidence,
          })),
        };
      },
    });

    // 4. inspect_entity
    this.registerTool({
      name: 'inspect_entity',
      description: 'Perform deep provenance inspection on an entity or indicator value to locate all cases and evidence files where this indicator appears.',
      authorization: 'READ_INVESTIGATION_DATA',
      inputSchema: {
        type: 'object',
        properties: {
          entityIdentifier: {
            type: 'string',
            description: 'The entity ID (e.g., "ENT-ABC123") or the raw/normalized indicator value (e.g., "+919000011111", "traceuser@upi").',
          },
        },
        required: ['entityIdentifier'],
      },
      execute: (params) => {
        if (!params.entityIdentifier) {
          throw new Error('Parameter "entityIdentifier" is required.');
        }

        const inspection = this.service.getEntityById(params.entityIdentifier);
        if (!inspection) {
          throw new Error(`No entity records or cross-case occurrences found for "${params.entityIdentifier}".`);
        }

        return {
          indicator: {
            primaryValue: inspection.entity?.value || inspection.normalizedValue,
            normalizedValue: inspection.normalizedValue,
            type: inspection.type,
          },
          crossCaseSummary: {
            totalOccurrences: inspection.occurrences.length,
            uniqueCasesCount: inspection.connectedCases.length,
            connectedCaseNumbers: inspection.connectedCases,
          },
          provenanceOccurrences: inspection.occurrences.map(occ => ({
            caseNumber: occ.caseId,
            caseTitle: occ.caseTitle,
            evidenceFileName: occ.evidenceFileName,
            extractedContext: occ.context,
            confidence: occ.confidence,
            extractedAt: occ.extractedAt,
          })),
        };
      },
    });

    // 5. find_cross_case_links
    this.registerTool({
      name: 'find_cross_case_links',
      description: 'Discover deterministic cross-case linkages and overlap scores across all cases or for a specific target case.',
      authorization: 'READ_INVESTIGATION_DATA',
      inputSchema: {
        type: 'object',
        properties: {
          caseNumber: {
            type: 'string',
            description: 'Optional case number (e.g., "CASE-001") to filter links involving this case.',
          },
          severity: {
            type: 'string',
            description: 'Filter by connection severity: HIGH, MEDIUM, LOW, INFORMATIONAL.',
            enum: ['HIGH', 'MEDIUM', 'LOW', 'INFORMATIONAL'],
          },
          status: {
            type: 'string',
            description: 'Filter by investigator verification status: SUGGESTED, VERIFIED, DISMISSED.',
            enum: ['SUGGESTED', 'VERIFIED', 'DISMISSED'],
          },
          minScore: {
            type: 'number',
            description: 'Minimum confidence score threshold (0-100).',
          },
          limit: {
            type: 'number',
            description: 'Maximum number of connections to return (default 25).',
          },
        },
      },
      execute: (params) => {
        const res = this.service.getLinks({
          caseId: params.caseNumber,
          severity: params.severity,
          status: params.status,
          minScore: params.minScore,
          limit: params.limit || 25,
        });

        return {
          totalLinks: res.total,
          returnedCount: res.connections.length,
          links: res.connections.map(c => ({
            connectionId: c.id,
            caseA: c.case_a,
            caseB: c.case_b,
            score: c.score,
            severity: c.severity,
            status: c.status,
            reason: c.reason,
            sharedIndicatorCount: c.shared_entities.length,
            sharedIndicatorTypes: Array.from(new Set(c.shared_entities.map(s => s.type))),
            scoreBreakdown: c.breakdown,
            verifiedAt: c.verified_at,
            investigatorNotes: c.investigator_notes,
          })),
        };
      },
    });

    // 6. get_relationship
    this.registerTool({
      name: 'get_relationship',
      description: 'Get an explainable breakdown of the relationship between two specific cases (e.g. "CASE-001:CASE-004") or by connection ID.',
      authorization: 'READ_INVESTIGATION_DATA',
      inputSchema: {
        type: 'object',
        properties: {
          relationshipIdentifier: {
            type: 'string',
            description: 'Connection ID (e.g. "CONN-XYZ123") OR colon-separated case pair (e.g. "CASE-001:CASE-004").',
          },
        },
        required: ['relationshipIdentifier'],
      },
      execute: (params) => {
        if (!params.relationshipIdentifier) {
          throw new Error('Parameter "relationshipIdentifier" is required.');
        }

        const rel = this.service.getRelationshipById(params.relationshipIdentifier);
        if (!rel) {
          throw new Error(`Relationship not found for identifier "${params.relationshipIdentifier}".`);
        }

        return {
          connectionId: rel.id,
          caseA: {
            caseNumber: rel.case_a,
            title: rel.caseADetails?.title,
            crimeType: rel.caseADetails?.crime_type,
          },
          caseB: {
            caseNumber: rel.case_b,
            title: rel.caseBDetails?.title,
            crimeType: rel.caseBDetails?.crime_type,
          },
          confidenceScore: rel.score,
          severity: rel.severity,
          status: rel.status,
          correlationReason: rel.reason,
          scoreBreakdown: rel.breakdown,
          sharedIndicators: rel.shared_entities.map(s => ({
            type: s.type,
            indicatorValue: s.value,
            normalizedValue: s.normalized_value,
            caseAEvidence: s.source_evidence_a_name,
            caseBEvidence: s.source_evidence_b_name,
            caseAContext: s.context_a,
            caseBContext: s.context_b,
          })),
          investigatorNotes: rel.investigator_notes,
          verifiedAt: rel.verified_at,
        };
      },
    });

    // 7. get_evidence_metadata
    this.registerTool({
      name: 'get_evidence_metadata',
      description: 'Retrieve forensic metadata, chain of custody logs, and SHA-256 cryptographic verification status for an evidence artifact.',
      authorization: 'READ_INVESTIGATION_DATA',
      inputSchema: {
        type: 'object',
        properties: {
          evidenceId: {
            type: 'string',
            description: 'The evidence identifier (e.g., "ev-001", "ev-002").',
          },
        },
        required: ['evidenceId'],
      },
      execute: (params) => {
        if (!params.evidenceId) {
          throw new Error('Parameter "evidenceId" is required.');
        }

        const ev = this.service.getEvidenceById(params.evidenceId);
        if (!ev) {
          throw new Error(`Evidence record not found for ID "${params.evidenceId}".`);
        }

        return {
          evidenceId: ev.id,
          caseNumber: ev.case_id,
          caseTitle: ev.caseTitle,
          fileName: ev.file_name,
          fileType: ev.file_type,
          uploadedAt: ev.uploaded_at,
          processingStatus: ev.processing_status,
          extractedEntitiesCount: ev.extractedEntities.length,
          metadata: {
            fileSize: ev.metadata?.fileSize,
            mimeType: ev.metadata?.mimeType,
            sha256Digest: ev.metadata?.sha256,
            sourceDevice: ev.metadata?.sourceDevice,
            uploadedBy: ev.metadata?.uploadedBy,
            integrityStatus: ev.metadata?.integrityStatus,
            chainOfCustody: ev.metadata?.chainOfCustody,
          },
          extractedEntitySummary: ev.extractedEntities.map(e => ({
            id: e.id,
            type: e.type,
            value: e.value,
            normalizedValue: e.normalized_value,
          })),
        };
      },
    });

    // 8. get_case_timeline
    this.registerTool({
      name: 'get_case_timeline',
      description: 'Retrieve the chronological chain of investigative events, evidence intake, and link discoveries for a case.',
      authorization: 'READ_INVESTIGATION_DATA',
      inputSchema: {
        type: 'object',
        properties: {
          caseNumber: {
            type: 'string',
            description: 'The case number (e.g., "CASE-001") to retrieve the timeline for.',
          },
        },
        required: ['caseNumber'],
      },
      execute: (params) => {
        if (!params.caseNumber) {
          throw new Error('Parameter "caseNumber" is required.');
        }

        const timeline = this.service.getTimeline(params.caseNumber);
        return {
          caseNumber: timeline.caseId,
          totalEvents: timeline.totalEvents,
          events: timeline.events.map(ev => ({
            eventId: ev.id,
            eventType: ev.event_type,
            timestamp: ev.event_time,
            description: ev.description,
            actor: ev.actor,
            details: ev.details,
          })),
        };
      },
    });

    // 9. analyze_case
    this.registerTool({
      name: 'analyze_case',
      description: 'Run the deterministic TRACE intelligence engine on a case number or raw forensic snippet to extract entities, correlate cross-case overlaps, and compute confidence scores.',
      authorization: 'READ_INVESTIGATION_DATA',
      inputSchema: {
        type: 'object',
        properties: {
          caseNumber: {
            type: 'string',
            description: 'Optional existing case number to analyze against all other cases in the system.',
          },
          rawEvidenceText: {
            type: 'string',
            description: 'Optional unparsed forensic text snippet (e.g. SMS message, CDR record, bank log) to extract and match.',
          },
          customEntities: {
            type: 'array',
            description: 'Optional list of specific indicators to match against the corpus.',
            items: { type: 'object' },
          },
        },
      },
      execute: (params) => {
        if (!params.caseNumber && !params.rawEvidenceText && (!params.customEntities || params.customEntities.length === 0)) {
          throw new Error('At least one of "caseNumber", "rawEvidenceText", or "customEntities" must be provided.');
        }

        const result = this.service.analyze({
          caseId: params.caseNumber,
          rawText: params.rawEvidenceText,
          entities: params.customEntities,
        });

        return {
          targetCase: result.analyzedCaseId || 'AD_HOC_EVIDENCE',
          summary: result.summary,
          extractedEntities: result.extractedEntities.map(e => ({
            id: e.id,
            type: e.type,
            value: e.value,
            normalizedValue: e.normalized_value,
            confidence: e.confidence,
          })),
          correlatedCases: result.matchedCases.map(mc => ({
            caseNumber: mc.caseNumber,
            caseTitle: mc.caseTitle,
            correlationScore: mc.score,
            severity: mc.severity,
            sharedIndicatorCount: mc.sharedIndicatorsCount,
            sharedIndicators: mc.sharedIndicators,
            scoreBreakdown: mc.scoreBreakdown,
            reason: mc.reason,
          })),
        };
      },
    });
  }

  public registerTool(tool: ToolDefinition) {
    this.tools.set(tool.name, tool);
  }

  public getToolList(): Array<Omit<ToolDefinition, 'execute'>> {
    return Array.from(this.tools.values()).map(t => ({
      name: t.name,
      description: t.description,
      authorization: t.authorization,
      inputSchema: t.inputSchema,
    }));
  }

  public getTool(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  /**
   * Execute a tool securely with strict validation and error wrapping
   */
  public async executeTool(toolName: string, params: any = {}): Promise<{
    toolName: string;
    success: boolean;
    result?: any;
    error?: string;
  }> {
    const tool = this.tools.get(toolName);
    if (!tool) {
      return {
        toolName,
        success: false,
        error: `Unknown AI tool "${toolName}". Available tools: ${Array.from(this.tools.keys()).join(', ')}`,
      };
    }

    try {
      if (params === null || typeof params !== 'object' || Array.isArray(params)) {
        return {
          toolName,
          success: false,
          error: 'Tool parameters must be a key-value object.',
        };
      }

      // 1. Validate required properties
      if (tool.inputSchema.required) {
        for (const req of tool.inputSchema.required) {
          if (params[req] === undefined || params[req] === null || params[req] === '') {
            return {
              toolName,
              success: false,
              error: `Missing required parameter "${req}" for tool "${toolName}".`,
            };
          }
        }
      }

      // 2. Validate parameter types and values against schema
      for (const [key, val] of Object.entries(params)) {
        const propSchema = tool.inputSchema.properties[key];
        if (!propSchema) {
          // Reject unexpected/unregistered parameter keys to prevent parameter pollution
          return {
            toolName,
            success: false,
            error: `Unexpected parameter "${key}" provided to tool "${toolName}".`,
          };
        }

        if (typeof val === 'string') {
          // Max string length safeguard
          const maxLen = key === 'rawEvidenceText' ? 500 * 1024 : 500;
          if (val.length > maxLen) {
            return {
              toolName,
              success: false,
              error: `Parameter "${key}" exceeds maximum allowed length of ${maxLen} characters.`,
            };
          }

          // Check for path traversal or malicious injection strings
          if (/(?:\.\.[\/\\]|\0|%00|;\s*rm\s+-rf|;\s*cat\s+\/etc\/|--\s*drop\s+table|\bexec\s*\(|\bchild_process\b|\bprocess\.env\b)/i.test(val)) {
            return {
              toolName,
              success: false,
              error: `Parameter "${key}" contains prohibited characters or unauthorized command structures.`,
            };
          }

          // Validate enum if declared
          if (propSchema.enum && propSchema.enum.length > 0) {
            const normalizedVal = val.trim().toUpperCase();
            const matched = propSchema.enum.find(e => e.toUpperCase() === normalizedVal);
            if (!matched) {
              return {
                toolName,
                success: false,
                error: `Invalid value "${val}" for parameter "${key}". Allowed values: ${propSchema.enum.join(', ')}`,
              };
            }
          }
        } else if (typeof val === 'number') {
          if (isNaN(val) || !isFinite(val)) {
            return {
              toolName,
              success: false,
              error: `Parameter "${key}" must be a valid finite number.`,
            };
          }
        }
      }

      const result = await tool.execute(params, this.service);
      return {
        toolName,
        success: true,
        result,
      };
    } catch (err: any) {
      return {
        toolName,
        success: false,
        error: err?.message || 'Tool execution failed.',
      };
    }
  }
}

// Global default gateway
export const defaultAiToolGateway = new AiToolGateway();
