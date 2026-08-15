export type CrimeType = 
  | 'Investment Scam'
  | 'Phishing Campaign'
  | 'Identity Theft'
  | 'Ransomware Extortion'
  | 'UPI Scam'
  | 'SIM Swap'
  | 'Crypto Drainer'
  | 'Loan App Harassment'
  | 'Bank Impersonation'
  | 'E-Commerce Fraud'
  | 'Smishing / SMS Spoofing'
  | 'Job Task Fraud';

export type CaseStatus = 'OPEN' | 'UNDER_INVESTIGATION' | 'PENDING_REVIEW' | 'CLOSED';
export type PriorityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface Case {
  id: string;
  case_number: string; // e.g., "CASE-001"
  title: string;
  description: string;
  crime_type: CrimeType;
  status: CaseStatus;
  priority: PriorityLevel;
  created_at: string;
  updated_at: string;
  assigned_officer?: string;
  jurisdiction?: string;
  tags?: string[];
}

export type FileType = 'TXT' | 'CSV' | 'PDF' | 'PNG' | 'JPG' | 'JPEG' | 'LOG';
export type ProcessingStatus = 'UPLOADED' | 'PROCESSING' | 'PROCESSED' | 'FAILED';

export interface EvidenceMetadata {
  fileSize?: string;
  mimeType?: string;
  sourceDevice?: string;
  uploadedBy?: string;
  sha256?: string;
  victimName?: string;
  incidentDate?: string;
  notes?: string;
}

export interface Evidence {
  id: string;
  case_id: string;
  file_name: string;
  file_type: FileType;
  storage_reference?: string;
  uploaded_at: string;
  processing_status: ProcessingStatus;
  extracted_text: string;
  processing_error?: string;
  metadata?: EvidenceMetadata;
  extracted_entity_count?: number;
}

export type EntityType = 
  | 'PHONE'
  | 'UPI'
  | 'EMAIL'
  | 'URL'
  | 'WEBSITE'
  | 'TRANSACTION'
  | 'ACCOUNT'
  | 'USERNAME'
  | 'AMOUNT'
  | 'DATE'
  | 'IP_ADDRESS';

export interface Entity {
  id: string;
  type: EntityType;
  value: string;
  normalized_value: string;
  source_evidence_id: string;
  source_case_id: string;
  source_context?: string; // Snippet where entity was extracted
  extracted_at: string;
  confidence?: number;
}

export interface CaseEntity {
  id: string;
  case_id: string;
  entity_id: string;
}

export type ConnectionStatus = 'SUGGESTED' | 'VERIFIED' | 'DISMISSED';
export type ConnectionSeverity = 'HIGH' | 'MEDIUM' | 'LOW' | 'INFORMATIONAL';

export interface ScoreBreakdownItem {
  label: string;
  points: number;
  type: EntityType | 'CORROBORATING';
  indicatorValue?: string;
}

export interface SharedIndicator {
  entity_id_a?: string;
  entity_id_b?: string;
  type: EntityType;
  value: string;
  normalized_value: string;
  source_evidence_a: string;
  source_evidence_a_name: string;
  source_evidence_b: string;
  source_evidence_b_name: string;
  context_a?: string;
  context_b?: string;
}

export interface Connection {
  id: string;
  case_a: string; // Case ID or Case Number
  case_b: string; // Case ID or Case Number
  score: number;
  severity: ConnectionSeverity;
  reason: string;
  breakdown: ScoreBreakdownItem[];
  shared_entities: SharedIndicator[];
  status: ConnectionStatus;
  created_at: string;
  verified_at?: string;
  dismissed_at?: string;
  investigator_notes?: string;
  dismissal_reason?: string;
}

export type TimelineEventType = 
  | 'CASE_CREATED'
  | 'EVIDENCE_UPLOADED'
  | 'EVIDENCE_PROCESSED'
  | 'ENTITIES_EXTRACTED'
  | 'CONNECTION_DETECTED'
  | 'CONNECTION_VERIFIED'
  | 'CONNECTION_DISMISSED'
  | 'NOTE_ADDED';

export interface TimelineEvent {
  id: string;
  case_id: string;
  event_type: TimelineEventType;
  event_time: string;
  description: string;
  actor?: string;
  details?: Record<string, any>;
}

export type ActiveView = 'dashboard' | 'cases' | 'case-detail' | 'connections' | 'connection-detail' | 'terminal' | 'graph-explorer';
