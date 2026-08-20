import { Router, Request, Response, NextFunction } from 'express';
import { defaultInvestigationService, InvestigationService } from '../services/investigationService';
import { defaultAiToolGateway, AiToolGateway } from '../services/aiToolGateway';
import {
  validateCaseId,
  validateEntityIdentifier,
  validateEvidenceId,
  validateRelationshipId,
  validatePagination,
  validateSearchString,
  validateEnumField,
  validateMinScore,
  validateAnalyzePayload,
  ALLOWED_CRIME_TYPES,
  ALLOWED_CASE_STATUSES,
  ALLOWED_PRIORITIES,
  ALLOWED_ENTITY_TYPES,
  ALLOWED_SEVERITY_LEVELS,
  ALLOWED_CONNECTION_STATUSES,
  ALLOWED_FILE_TYPES,
} from './validators';
import {
  requestIdMiddleware,
  securityHeadersMiddleware,
  corsMiddleware,
  apiRateLimitMiddleware,
  intensiveRateLimitMiddleware,
  generateRequestId,
} from './security';

/**
 * Standard API success response builder
 */
function sendSuccess(res: Response, data: any, requestId: string, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    data,
    requestId,
  });
}

/**
 * Standard API error response builder (Safe client-facing errors)
 */
function sendError(res: Response, code: string, message: string, requestId: string, statusCode = 400) {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
    },
    requestId,
  });
}

export function createApiRouter(
  service: InvestigationService = defaultInvestigationService,
  aiGateway: AiToolGateway = defaultAiToolGateway
): Router {
  const router = Router();

  // 1. Core Security & Request Context Pipeline
  router.use(requestIdMiddleware);
  router.use(securityHeadersMiddleware);
  router.use(corsMiddleware);
  router.use(apiRateLimitMiddleware);

  // 2. Token Authentication Check (when TRACE_API_KEY environment variable is configured)
  router.use((req: Request, res: Response, next: NextFunction) => {
    const configuredKey = process.env.TRACE_API_KEY;
    if (configuredKey && configuredKey.trim().length > 0) {
      const authHeader = req.headers.authorization;
      const apiKeyHeader = req.headers['x-api-key'];

      let providedToken = '';
      if (authHeader && authHeader.startsWith('Bearer ')) {
        providedToken = authHeader.slice(7).trim();
      } else if (apiKeyHeader && typeof apiKeyHeader === 'string') {
        providedToken = apiKeyHeader.trim();
      }

      if (providedToken !== configuredKey) {
        return sendError(
          res,
          'UNAUTHORIZED',
          'Valid Bearer token or X-API-Key required for TRACE Investigation API access.',
          (req as any).requestId,
          401
        );
      }
    }
    next();
  });

  // ==========================================================================
  // 1. Health and Discovery
  // ==========================================================================
  router.get('/health', (req: Request, res: Response) => {
    try {
      const metrics = service.getSystemMetrics();
      sendSuccess(res, metrics, (req as any).requestId);
    } catch (e: any) {
      console.error(`[${(req as any).requestId}] Health check failed:`, e?.message);
      sendError(res, 'INTERNAL_ERROR', 'Service metrics unavailable.', (req as any).requestId, 500);
    }
  });

  // ==========================================================================
  // 2. Cases API
  // ==========================================================================
  // GET /api/cases
  router.get('/cases', (req: Request, res: Response) => {
    try {
      const { status, priority, crimeType, search, limit, offset } = req.query;

      // Validate pagination
      const pagRes = validatePagination(limit, offset, 20, 100);
      if (!pagRes.isValid) {
        return sendError(res, pagRes.code || 'INVALID_INPUT', pagRes.error || 'Invalid pagination', (req as any).requestId, 400);
      }

      // Validate search
      const searchRes = validateSearchString(search);
      if (!searchRes.isValid) {
        return sendError(res, searchRes.code || 'INVALID_INPUT', searchRes.error || 'Invalid search', (req as any).requestId, 400);
      }

      // Validate enums
      const statusRes = validateEnumField(status, ALLOWED_CASE_STATUSES, 'status');
      if (!statusRes.isValid) {
        return sendError(res, statusRes.code || 'INVALID_INPUT', statusRes.error || 'Invalid status', (req as any).requestId, 400);
      }

      const priorityRes = validateEnumField(priority, ALLOWED_PRIORITIES, 'priority');
      if (!priorityRes.isValid) {
        return sendError(res, priorityRes.code || 'INVALID_INPUT', priorityRes.error || 'Invalid priority', (req as any).requestId, 400);
      }

      const crimeTypeRes = validateEnumField(crimeType, ALLOWED_CRIME_TYPES, 'crimeType');
      if (!crimeTypeRes.isValid) {
        return sendError(res, crimeTypeRes.code || 'INVALID_INPUT', crimeTypeRes.error || 'Invalid crimeType', (req as any).requestId, 400);
      }

      const result = service.getCases({
        status: statusRes.data,
        priority: priorityRes.data,
        crimeType: crimeTypeRes.data,
        search: searchRes.data,
        limit: pagRes.data?.limit,
        offset: pagRes.data?.offset,
      });

      sendSuccess(res, result, (req as any).requestId);
    } catch (e: any) {
      console.error(`[${(req as any).requestId}] GET /cases error:`, e?.message);
      sendError(res, 'INTERNAL_ERROR', 'Failed to retrieve cases.', (req as any).requestId, 500);
    }
  });

  // GET /api/cases/:id
  router.get('/cases/:id', (req: Request, res: Response) => {
    try {
      const caseIdRes = validateCaseId(req.params.id);
      if (!caseIdRes.isValid) {
        return sendError(res, caseIdRes.code || 'INVALID_ID', caseIdRes.error || 'Invalid case ID', (req as any).requestId, 400);
      }

      const caseData = service.getCaseById(caseIdRes.data!);
      if (!caseData) {
        return sendError(res, 'NOT_FOUND', `Case with identifier "${caseIdRes.data}" was not found.`, (req as any).requestId, 404);
      }

      sendSuccess(res, caseData, (req as any).requestId);
    } catch (e: any) {
      console.error(`[${(req as any).requestId}] GET /cases/:id error:`, e?.message);
      sendError(res, 'INTERNAL_ERROR', 'Failed to retrieve case details.', (req as any).requestId, 500);
    }
  });

  // ==========================================================================
  // 3. Entities API
  // ==========================================================================
  // GET /api/entities
  router.get('/entities', (req: Request, res: Response) => {
    try {
      const { caseId, type, search, limit, offset } = req.query;

      // Validate pagination
      const pagRes = validatePagination(limit, offset, 20, 100);
      if (!pagRes.isValid) {
        return sendError(res, pagRes.code || 'INVALID_INPUT', pagRes.error || 'Invalid pagination', (req as any).requestId, 400);
      }

      // Validate search
      const searchRes = validateSearchString(search);
      if (!searchRes.isValid) {
        return sendError(res, searchRes.code || 'INVALID_INPUT', searchRes.error || 'Invalid search', (req as any).requestId, 400);
      }

      // Validate optional caseId
      let validatedCaseId: string | undefined = undefined;
      if (caseId) {
        const caseIdRes = validateCaseId(caseId);
        if (!caseIdRes.isValid) {
          return sendError(res, caseIdRes.code || 'INVALID_ID', caseIdRes.error || 'Invalid caseId', (req as any).requestId, 400);
        }
        validatedCaseId = caseIdRes.data;
      }

      // Validate entity type enum
      const typeRes = validateEnumField(type, ALLOWED_ENTITY_TYPES, 'type');
      if (!typeRes.isValid) {
        return sendError(res, typeRes.code || 'INVALID_INPUT', typeRes.error || 'Invalid entity type', (req as any).requestId, 400);
      }

      const result = service.getEntities({
        caseId: validatedCaseId,
        type: typeRes.data,
        search: searchRes.data,
        limit: pagRes.data?.limit,
        offset: pagRes.data?.offset,
      });

      sendSuccess(res, result, (req as any).requestId);
    } catch (e: any) {
      console.error(`[${(req as any).requestId}] GET /entities error:`, e?.message);
      sendError(res, 'INTERNAL_ERROR', 'Failed to retrieve entities.', (req as any).requestId, 500);
    }
  });

  // GET /api/entities/:id
  router.get('/entities/:id', (req: Request, res: Response) => {
    try {
      const entIdRes = validateEntityIdentifier(req.params.id);
      if (!entIdRes.isValid) {
        return sendError(res, entIdRes.code || 'INVALID_IDENTIFIER', entIdRes.error || 'Invalid entity identifier', (req as any).requestId, 400);
      }

      const inspection = service.getEntityById(entIdRes.data!);
      if (!inspection) {
        return sendError(res, 'NOT_FOUND', `Entity record for "${entIdRes.data}" was not found.`, (req as any).requestId, 404);
      }

      sendSuccess(res, inspection, (req as any).requestId);
    } catch (e: any) {
      console.error(`[${(req as any).requestId}] GET /entities/:id error:`, e?.message);
      sendError(res, 'INTERNAL_ERROR', 'Failed to inspect entity.', (req as any).requestId, 500);
    }
  });

  // ==========================================================================
  // 4. Evidence API
  // ==========================================================================
  // GET /api/evidence
  router.get('/evidence', (req: Request, res: Response) => {
    try {
      const { caseId, fileType, search, limit } = req.query;

      // Validate pagination
      const pagRes = validatePagination(limit, 0, 50, 100);
      if (!pagRes.isValid) {
        return sendError(res, pagRes.code || 'INVALID_INPUT', pagRes.error || 'Invalid limit', (req as any).requestId, 400);
      }

      // Validate search
      const searchRes = validateSearchString(search);
      if (!searchRes.isValid) {
        return sendError(res, searchRes.code || 'INVALID_INPUT', searchRes.error || 'Invalid search', (req as any).requestId, 400);
      }

      // Validate optional caseId
      let validatedCaseId: string | undefined = undefined;
      if (caseId) {
        const caseIdRes = validateCaseId(caseId);
        if (!caseIdRes.isValid) {
          return sendError(res, caseIdRes.code || 'INVALID_ID', caseIdRes.error || 'Invalid caseId', (req as any).requestId, 400);
        }
        validatedCaseId = caseIdRes.data;
      }

      // Validate fileType
      const fileTypeRes = validateEnumField(fileType, ALLOWED_FILE_TYPES, 'fileType');
      if (!fileTypeRes.isValid) {
        return sendError(res, fileTypeRes.code || 'INVALID_INPUT', fileTypeRes.error || 'Invalid fileType', (req as any).requestId, 400);
      }

      const result = service.getEvidence({
        caseId: validatedCaseId,
        fileType: fileTypeRes.data,
        search: searchRes.data,
        limit: pagRes.data?.limit,
      });

      sendSuccess(res, result, (req as any).requestId);
    } catch (e: any) {
      console.error(`[${(req as any).requestId}] GET /evidence error:`, e?.message);
      sendError(res, 'INTERNAL_ERROR', 'Failed to retrieve evidence list.', (req as any).requestId, 500);
    }
  });

  // GET /api/evidence/:id
  router.get('/evidence/:id', (req: Request, res: Response) => {
    try {
      const evIdRes = validateEvidenceId(req.params.id);
      if (!evIdRes.isValid) {
        return sendError(res, evIdRes.code || 'INVALID_EVIDENCE_ID', evIdRes.error || 'Invalid evidence ID', (req as any).requestId, 400);
      }

      const ev = service.getEvidenceById(evIdRes.data!);
      if (!ev) {
        return sendError(res, 'NOT_FOUND', `Evidence artifact "${evIdRes.data}" was not found.`, (req as any).requestId, 404);
      }

      sendSuccess(res, ev, (req as any).requestId);
    } catch (e: any) {
      console.error(`[${(req as any).requestId}] GET /evidence/:id error:`, e?.message);
      sendError(res, 'INTERNAL_ERROR', 'Failed to retrieve evidence artifact.', (req as any).requestId, 500);
    }
  });

  // ==========================================================================
  // 5. Links / Cross-Case Connections API
  // ==========================================================================
  // GET /api/links
  router.get('/links', (req: Request, res: Response) => {
    try {
      const { caseId, severity, status, minScore, search, limit, offset } = req.query;

      // Validate pagination
      const pagRes = validatePagination(limit, offset, 20, 100);
      if (!pagRes.isValid) {
        return sendError(res, pagRes.code || 'INVALID_INPUT', pagRes.error || 'Invalid pagination', (req as any).requestId, 400);
      }

      // Validate search
      const searchRes = validateSearchString(search);
      if (!searchRes.isValid) {
        return sendError(res, searchRes.code || 'INVALID_INPUT', searchRes.error || 'Invalid search', (req as any).requestId, 400);
      }

      // Validate optional caseId
      let validatedCaseId: string | undefined = undefined;
      if (caseId) {
        const caseIdRes = validateCaseId(caseId);
        if (!caseIdRes.isValid) {
          return sendError(res, caseIdRes.code || 'INVALID_ID', caseIdRes.error || 'Invalid caseId', (req as any).requestId, 400);
        }
        validatedCaseId = caseIdRes.data;
      }

      // Validate severity
      const sevRes = validateEnumField(severity, ALLOWED_SEVERITY_LEVELS, 'severity');
      if (!sevRes.isValid) {
        return sendError(res, sevRes.code || 'INVALID_INPUT', sevRes.error || 'Invalid severity', (req as any).requestId, 400);
      }

      // Validate status
      const statusRes = validateEnumField(status, ALLOWED_CONNECTION_STATUSES, 'status');
      if (!statusRes.isValid) {
        return sendError(res, statusRes.code || 'INVALID_INPUT', statusRes.error || 'Invalid connection status', (req as any).requestId, 400);
      }

      // Validate minScore
      const scoreRes = validateMinScore(minScore);
      if (!scoreRes.isValid) {
        return sendError(res, scoreRes.code || 'INVALID_INPUT', scoreRes.error || 'Invalid minScore', (req as any).requestId, 400);
      }

      const result = service.getLinks({
        caseId: validatedCaseId,
        severity: sevRes.data,
        status: statusRes.data,
        minScore: scoreRes.data,
        search: searchRes.data,
        limit: pagRes.data?.limit,
        offset: pagRes.data?.offset,
      });

      sendSuccess(res, result, (req as any).requestId);
    } catch (e: any) {
      console.error(`[${(req as any).requestId}] GET /links error:`, e?.message);
      sendError(res, 'INTERNAL_ERROR', 'Failed to retrieve cross-case links.', (req as any).requestId, 500);
    }
  });

  // GET /api/relationships/:id
  router.get('/relationships/:id', (req: Request, res: Response) => {
    try {
      const relIdRes = validateRelationshipId(req.params.id);
      if (!relIdRes.isValid) {
        return sendError(res, relIdRes.code || 'INVALID_RELATIONSHIP_ID', relIdRes.error || 'Invalid relationship ID', (req as any).requestId, 400);
      }

      const rel = service.getRelationshipById(relIdRes.data!);
      if (!rel) {
        return sendError(res, 'NOT_FOUND', `Relationship with ID "${relIdRes.data}" was not found.`, (req as any).requestId, 404);
      }

      sendSuccess(res, rel, (req as any).requestId);
    } catch (e: any) {
      console.error(`[${(req as any).requestId}] GET /relationships/:id error:`, e?.message);
      sendError(res, 'INTERNAL_ERROR', 'Failed to retrieve relationship details.', (req as any).requestId, 500);
    }
  });

  // ==========================================================================
  // 6. Timeline API
  // ==========================================================================
  // GET /api/timeline/:caseId
  router.get('/timeline/:caseId', (req: Request, res: Response) => {
    try {
      const caseIdRes = validateCaseId(req.params.caseId);
      if (!caseIdRes.isValid) {
        return sendError(res, caseIdRes.code || 'INVALID_ID', caseIdRes.error || 'Invalid caseId', (req as any).requestId, 400);
      }

      const timeline = service.getTimeline(caseIdRes.data!);
      sendSuccess(res, timeline, (req as any).requestId);
    } catch (e: any) {
      console.error(`[${(req as any).requestId}] GET /timeline/:caseId error:`, e?.message);
      sendError(res, 'INTERNAL_ERROR', 'Failed to retrieve case timeline.', (req as any).requestId, 500);
    }
  });

  // ==========================================================================
  // 7. Intelligence Analysis API (Strict Rate Limit & Payload Size Controls)
  // ==========================================================================
  // POST /api/analyze
  router.post('/analyze', intensiveRateLimitMiddleware, (req: Request, res: Response) => {
    try {
      const validation = validateAnalyzePayload(req.body);
      if (!validation.isValid) {
        return sendError(
          res,
          validation.code || 'INVALID_REQUEST',
          validation.error || 'Invalid analysis payload.',
          (req as any).requestId,
          400
        );
      }

      const analysis = service.analyze(validation.data!);
      sendSuccess(res, analysis, (req as any).requestId);
    } catch (e: any) {
      console.error(`[${(req as any).requestId}] POST /analyze error:`, e?.message);
      sendError(res, 'INTERNAL_ERROR', 'Deterministic cross-case analysis failed.', (req as any).requestId, 500);
    }
  });

  // ==========================================================================
  // 8. AI Tool Gateway Schema & Execution API
  // ==========================================================================
  // GET /api/ai/tools — Expose machine-readable tool schemas for LLMs
  router.get('/ai/tools', (req: Request, res: Response) => {
    try {
      const toolList = aiGateway.getToolList();
      sendSuccess(res, {
        gatewayVersion: '1.0.0',
        architecture: 'TRACE Sandboxed AI Tool Gateway',
        securityConstraints: [
          'READ_ONLY_ACCESS',
          'NO_SHELL_EXECUTION',
          'NO_ARBITRARY_SQL',
          'NO_FILE_SYSTEM_MUTATION',
          'DETERMINISTIC_EVALUATION',
          'STRICT_INPUT_VALIDATION',
          'RATE_LIMITING_PROTECTION',
        ],
        availableToolsCount: toolList.length,
        tools: toolList,
      }, (req as any).requestId);
    } catch (e: any) {
      console.error(`[${(req as any).requestId}] GET /ai/tools error:`, e?.message);
      sendError(res, 'INTERNAL_ERROR', 'Failed to retrieve AI tool definitions.', (req as any).requestId, 500);
    }
  });

  // POST /api/ai/tools/execute — Execute an authorized AI tool
  router.post('/ai/tools/execute', intensiveRateLimitMiddleware, async (req: Request, res: Response) => {
    try {
      const body = req.body;
      if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return sendError(
          res,
          'INVALID_REQUEST',
          'Request body must be a JSON object containing "tool" and "parameters".',
          (req as any).requestId,
          400
        );
      }

      const { tool, parameters } = body;

      if (!tool || typeof tool !== 'string' || !/^[a-z0-9_]{1,64}$/.test(tool.trim())) {
        return sendError(
          res,
          'INVALID_TOOL_NAME',
          'Field "tool" must be a valid tool name identifier (lowercase letters, numbers, underscores).',
          (req as any).requestId,
          400
        );
      }

      if (parameters !== undefined && parameters !== null && (typeof parameters !== 'object' || Array.isArray(parameters))) {
        return sendError(
          res,
          'INVALID_PARAMETERS',
          'Field "parameters" must be a JSON object.',
          (req as any).requestId,
          400
        );
      }

      const execution = await aiGateway.executeTool(tool.trim(), parameters || {});

      if (!execution.success) {
        return sendError(
          res,
          'TOOL_EXECUTION_ERROR',
          execution.error || 'Tool execution encountered an error.',
          (req as any).requestId,
          400
        );
      }

      sendSuccess(res, execution, (req as any).requestId);
    } catch (e: any) {
      console.error(`[${(req as any).requestId}] POST /ai/tools/execute error:`, e?.message);
      sendError(res, 'INTERNAL_ERROR', 'AI tool execution failed.', (req as any).requestId, 500);
    }
  });

  // ==========================================================================
  // 9. Central Safe Error Handler for API Routes
  // ==========================================================================
  router.use((err: any, req: Request, res: Response, next: NextFunction) => {
    const reqId = (req as any).requestId || generateRequestId();
    console.error(`[${reqId}] Unhandled API Exception:`, err?.stack || err?.message || err);

    if (err instanceof SyntaxError && 'body' in err) {
      return sendError(res, 'MALFORMED_JSON', 'Malformed JSON payload in request body.', reqId, 400);
    }

    sendError(res, 'INTERNAL_SERVER_ERROR', 'An unexpected error occurred during request processing.', reqId, 500);
  });

  return router;
}
