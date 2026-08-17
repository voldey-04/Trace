import { Case, Connection, Entity, Evidence, TimelineEvent } from '../types';
import { extractEntitiesFromText } from '../engine/extractor';
import { matchCaseAgainstAll } from '../engine/matching';
import { computeDeterministicHash } from '../engine/crypto';

export const INITIAL_CASES: Case[] = [
  {
    id: 'c-001',
    case_number: 'CASE-001',
    title: 'Operation BlueLoot Telegram Investment Scam',
    description: 'Coordinated illicit investment channel luring retail victims with guaranteed 400% weekly returns. Deposits routed through shell merchant accounts.',
    crime_type: 'Investment Scam',
    status: 'UNDER_INVESTIGATION',
    priority: 'HIGH',
    created_at: '2026-08-01T09:30:00Z',
    updated_at: '2026-08-14T14:20:00Z',
    assigned_officer: 'Insp. R. Verma (Cyber Cell Unit 4)',
    jurisdiction: 'Metro Cyber Command',
    tags: ['Telegram', 'Mule Accounts', 'High Yield', 'UPI Routing'],
  },
  {
    id: 'c-002',
    case_number: 'CASE-002',
    title: 'FinBank Impersonation Phishing Ring',
    description: 'Automated SMS phishing campaign spoofing bank KYC renewal notices to compromise credentials and drain consumer savings.',
    crime_type: 'Bank Impersonation',
    status: 'UNDER_INVESTIGATION',
    priority: 'CRITICAL',
    created_at: '2026-08-03T11:15:00Z',
    updated_at: '2026-08-15T08:00:00Z',
    assigned_officer: 'Det. S. Mukherjee',
    jurisdiction: 'Financial Crime Wing',
    tags: ['KYC Spoof', 'Domain Fronting', 'Fake Gateway'],
  },
  {
    id: 'c-003',
    case_number: 'CASE-003',
    title: 'FastCash Instant Loan App Harassment Network',
    description: 'Predatory lending application harvesting contact address books to intimidate borrowers and extort exorbitant repayment sums.',
    crime_type: 'Loan App Harassment',
    status: 'OPEN',
    priority: 'MEDIUM',
    created_at: '2026-08-05T16:45:00Z',
    updated_at: '2026-08-12T10:10:00Z',
    assigned_officer: 'Sub-Insp. A. Nair',
    jurisdiction: 'Southern Cyber Zone',
    tags: ['Malicious APK', 'Contact Exfiltration', 'Extortion'],
  },
  {
    id: 'c-004',
    case_number: 'CASE-004',
    title: 'State Electricity Bill Disconnection APK Scam',
    description: 'Urgent notices warning power disconnection within 2 hours unless an embedded APK is installed to complete immediate pending payment.',
    crime_type: 'UPI Scam',
    status: 'UNDER_INVESTIGATION',
    priority: 'HIGH',
    created_at: '2026-08-06T14:00:00Z',
    updated_at: '2026-08-14T11:30:00Z',
    assigned_officer: 'Insp. R. Verma',
    jurisdiction: 'Public Utilities Cyber Desk',
    tags: ['APK Dropper', 'Electricity Scam', 'SMS Gateway'],
  },
  {
    id: 'c-005',
    case_number: 'CASE-005',
    title: 'Telegram VIP Job Rating & Task Booster Scam',
    description: 'Victims hired for fake e-commerce product liking tasks, forced to deposit increasing security bonds before fake bonus withdrawals.',
    crime_type: 'Job Task Fraud',
    status: 'OPEN',
    priority: 'HIGH',
    created_at: '2026-08-07T10:20:00Z',
    updated_at: '2026-08-13T16:00:00Z',
    assigned_officer: 'Det. K. Sharma',
    jurisdiction: 'Metro Cyber Command',
    tags: ['Work-from-Home', 'Task Scam', 'Escalating Deposits'],
  },
  {
    id: 'c-006',
    case_number: 'CASE-006',
    title: 'Aadhaar Biometric AEPS Unauthorized Withdrawal',
    description: 'Cloned silicon thumbprints used at merchant business correspondent kiosks to siphon rural pension distributions.',
    crime_type: 'Identity Theft',
    status: 'UNDER_INVESTIGATION',
    priority: 'CRITICAL',
    created_at: '2026-08-08T08:00:00Z',
    updated_at: '2026-08-14T17:40:00Z',
    assigned_officer: 'Insp. V. Joshi',
    jurisdiction: 'Rural Financial Intelligence',
    tags: ['AEPS', 'Biometric Clone', 'Kiosk Fraud'],
  },
  {
    id: 'c-007',
    case_number: 'CASE-007',
    title: 'Fake Airline Customer Support Refund Fraud',
    description: 'SEO-manipulated toll-free numbers redirecting passengers seeking flight cancellations to fake remote desktop AnyDesk screen-sharing sessions.',
    crime_type: 'Phishing Campaign',
    status: 'OPEN',
    priority: 'MEDIUM',
    created_at: '2026-08-09T13:30:00Z',
    updated_at: '2026-08-12T09:15:00Z',
    assigned_officer: 'Sub-Insp. A. Nair',
    jurisdiction: 'Aviation Consumer Desk',
    tags: ['Search Poisoning', 'Remote Access', 'Refund Trap'],
  },
  {
    id: 'c-008',
    case_number: 'CASE-008',
    title: 'Targeted Executive Smishing Campaign - Payroll Spoof',
    description: 'C-suite executives receiving urgent SMS alleging immediate payroll withholding requiring credential verification and clearance deposit.',
    crime_type: 'Smishing / SMS Spoofing',
    status: 'OPEN',
    priority: 'HIGH',
    created_at: '2026-08-15T04:00:00Z',
    updated_at: '2026-08-15T04:00:00Z',
    assigned_officer: 'Insp. R. Verma',
    jurisdiction: 'Corporate Cyber Defense',
    tags: ['Executive Spoof', 'Smishing', 'Golden Demo Candidate'],
  },
  {
    id: 'c-009',
    case_number: 'CASE-009',
    title: 'Crypto Arbitrage Cloud Mining Drainer',
    description: 'Web3 smart contract approval exploit masquerading as a high-APY staking decentralized finance application.',
    crime_type: 'Crypto Drainer',
    status: 'PENDING_REVIEW',
    priority: 'MEDIUM',
    created_at: '2026-08-10T15:10:00Z',
    updated_at: '2026-08-11T12:00:00Z',
    assigned_officer: 'Det. K. Sharma',
    jurisdiction: 'Web3 Intelligence Unit',
    tags: ['DApp Drainer', 'Smart Contract', 'USDT Approval'],
  },
  {
    id: 'c-010',
    case_number: 'CASE-010',
    title: 'Fake Customs Parcel Courier Seizure Extortion',
    description: 'Impostor law enforcement video calls threatening victims with fabricated narcotics parcel interception from international express shipping.',
    crime_type: 'Identity Theft',
    status: 'UNDER_INVESTIGATION',
    priority: 'CRITICAL',
    created_at: '2026-08-11T17:20:00Z',
    updated_at: '2026-08-14T19:00:00Z',
    assigned_officer: 'Insp. V. Joshi',
    jurisdiction: 'Inter-State Crime Branch',
    tags: ['Digital Arrest', 'Customs Impersonation', 'Mule Network'],
  },
  {
    id: 'c-011',
    case_number: 'CASE-011',
    title: 'International Sim-Box VoIP Bypass Gateway',
    description: 'Unlicensed GSM SIM-box rack converting illegal international VoIP traffic into local cellular calls to facilitate unmonitored spam routing.',
    crime_type: 'SIM Swap',
    status: 'CLOSED',
    priority: 'LOW',
    created_at: '2026-07-20T10:00:00Z',
    updated_at: '2026-08-05T18:00:00Z',
    assigned_officer: 'Det. S. Mukherjee',
    jurisdiction: 'Telecom Enforcement',
    tags: ['SIM Box', 'VoIP Bypass', 'Raid Complete'],
  },
  {
    id: 'c-012',
    case_number: 'CASE-012',
    title: 'Social Media Marketplace Dropship Scam',
    description: 'Flash sale luxury fashion advertisements on Instagram taking upfront UPI payments without fulfilling physical merchandise.',
    crime_type: 'E-Commerce Fraud',
    status: 'OPEN',
    priority: 'MEDIUM',
    created_at: '2026-08-12T11:45:00Z',
    updated_at: '2026-08-14T13:10:00Z',
    assigned_officer: 'Sub-Insp. A. Nair',
    jurisdiction: 'Consumer Protection Cell',
    tags: ['Instagram Ad', 'Fake Boutique', 'No Delivery'],
  },
];

export const INITIAL_EVIDENCE: Evidence[] = [
  // CASE-001 Evidence
  {
    id: 'ev-001',
    case_id: 'CASE-001',
    file_name: 'telegram_chat_export_blueloot.txt',
    file_type: 'TXT',
    uploaded_at: '2026-08-01T10:00:00Z',
    processing_status: 'PROCESSED',
    extracted_text: `[2026-07-31 14:22] BlueLoot Admin: Welcome to VIP BlueLoot Investment. 
To double your deposit in 24 hours, transfer minimum ₹150,000 to our verified desk UPI support@upi.test.
For priority phone verification contact +91 9000011111 or visit portal securebank.test for instant confirmation.
Transaction reference generated: UTR99281034.`,
    metadata: {
      fileSize: '4.2 KB',
      mimeType: 'text/plain',
      sourceDevice: 'Victim Samsung Galaxy S23',
      uploadedBy: 'Insp. R. Verma',
      victimName: 'Anil Kumar P.',
      incidentDate: '2026-07-31',
    },
    extracted_entity_count: 5,
  },
  {
    id: 'ev-002',
    case_id: 'CASE-001',
    file_name: 'bank_statement_dispute_c001.csv',
    file_type: 'CSV',
    uploaded_at: '2026-08-01T11:30:00Z',
    processing_status: 'PROCESSED',
    extracted_text: `Date,Txn_Type,Amount,Beneficiary_UPI,Reference,Status
31/07/2026,UPI_OUT,₹150000,support@upi.test,UTR99281034,SUCCESS
31/07/2026,UPI_OUT,₹25000,invest@upi.test,UTR99281099,SUCCESS
Portal Domain: securebank.test, Contact: +919000011111`,
    metadata: {
      fileSize: '1.8 KB',
      mimeType: 'text/csv',
      sourceDevice: 'HDFC Bank NetBanking Export',
      uploadedBy: 'Insp. R. Verma',
    },
    extracted_entity_count: 5,
  },

  // CASE-002 Evidence
  {
    id: 'ev-003',
    case_id: 'CASE-002',
    file_name: 'phishing_sms_intercept_dump.txt',
    file_type: 'TXT',
    uploaded_at: '2026-08-03T12:00:00Z',
    processing_status: 'PROCESSED',
    extracted_text: `URGENT: Dear Customer, Your FinBank NetBanking account will be suspended today. 
Update your KYC document immediately at securebank.test or login to example-store.in/kyc to prevent freeze.
For immediate assistance, dial customer care: 9000022222 or pay renewal verification fee ₹500 to invest@upi.test.
Hosting server IP: 198.51.100.42`,
    metadata: {
      fileSize: '2.9 KB',
      mimeType: 'text/plain',
      sourceDevice: 'Telecom SMS Filter Gateway',
      uploadedBy: 'Det. S. Mukherjee',
    },
    extracted_entity_count: 6,
  },
  {
    id: 'ev-004',
    case_id: 'CASE-002',
    file_name: 'fake_portal_server_access.log',
    file_type: 'LOG',
    uploaded_at: '2026-08-04T09:00:00Z',
    processing_status: 'PROCESSED',
    extracted_text: `2026-08-03 10:14:22 [INF] Incoming connection from IP 198.51.100.42 to domain securebank.test
Redirecting session to merchant partner example-store.in
Beneficiary UPI registered: invest@upi.test
Helpdesk routing mobile: +91 9000022222`,
    metadata: {
      fileSize: '5.1 KB',
      mimeType: 'text/plain',
      uploadedBy: 'Det. S. Mukherjee',
    },
    extracted_entity_count: 5,
  },

  // CASE-003 Evidence
  {
    id: 'ev-005',
    case_id: 'CASE-003',
    file_name: 'apk_decompile_threat_log.txt',
    file_type: 'TXT',
    uploaded_at: '2026-08-05T17:00:00Z',
    processing_status: 'PROCESSED',
    extracted_text: `FastCash APK v2.1 decompile analysis:
C2 Server Endpoint: http://fastcash-loan.top/api/sync
Admin Contact Email: contact@fastcash-loan.top
Harassment Recovery Desk WhatsApp: +91 9000033333
Recovery UPI Handle: quicksettle@paytm
Server Infrastructure IP: 203.0.113.88
Extortion demanding ₹35,000 for non-release of morph photos.`,
    metadata: {
      fileSize: '8.4 KB',
      mimeType: 'text/plain',
      uploadedBy: 'Sub-Insp. A. Nair',
    },
    extracted_entity_count: 6,
  },

  // CASE-004 Evidence
  {
    id: 'ev-006',
    case_id: 'CASE-004',
    file_name: 'electricity_bill_sms_notice.txt',
    file_type: 'TXT',
    uploaded_at: '2026-08-06T14:30:00Z',
    processing_status: 'PROCESSED',
    extracted_text: `Dear Consumer, Your Electricity power supply will be disconnected tonight at 09:30 PM from the electricity office.
Kindly pay your previous month bill ₹45,000 immediately to account A/C: 918273645012 or via UPI powerdesk@okhdfcbank.
Download official update bill tool at ebill-update.in or call officer at +91 9876500001.`,
    metadata: {
      fileSize: '2.1 KB',
      mimeType: 'text/plain',
      uploadedBy: 'Insp. R. Verma',
    },
    extracted_entity_count: 5,
  },

  // CASE-005 Evidence
  {
    id: 'ev-007',
    case_id: 'CASE-005',
    file_name: 'job_task_telegram_transcript.txt',
    file_type: 'TXT',
    uploaded_at: '2026-08-07T11:00:00Z',
    processing_status: 'PROCESSED',
    extracted_text: `Telegram Group: Global Tasks VIP Channel
Admin: @taskmaster_admin (Contact: hiring@globaltasks.vip)
Assigned Task: Rate e-commerce products on ebill-update.in/tasks
To release your commission of ₹80,000, send safety deposit to UPI: powerdesk@okhdfcbank.
Support helpline: 9876500002.`,
    metadata: {
      fileSize: '3.6 KB',
      mimeType: 'text/plain',
      uploadedBy: 'Det. K. Sharma',
    },
    extracted_entity_count: 5,
  },

  // CASE-006 Evidence
  {
    id: 'ev-008',
    case_id: 'CASE-006',
    file_name: 'aeps_withdrawal_dispute_memo.txt',
    file_type: 'TXT',
    uploaded_at: '2026-08-08T09:00:00Z',
    processing_status: 'PROCESSED',
    extracted_text: `Victim: Rameshwar Dayal (Farmer)
Account Debited: A/C 554433221100
Amount Siphoned: ₹10,000 (3 transactions, total ₹30,000)
Terminal Txn Ref: TXN882710492
Registered CSP Mobile: +91 9123456780
Kiosk Router IP: 192.0.2.14`,
    metadata: {
      fileSize: '2.0 KB',
      mimeType: 'text/plain',
      uploadedBy: 'Insp. V. Joshi',
    },
    extracted_entity_count: 5,
  },

  // CASE-007 Evidence
  {
    id: 'ev-009',
    case_id: 'CASE-007',
    file_name: 'airline_refund_spoof_complaint.txt',
    file_type: 'TXT',
    uploaded_at: '2026-08-09T14:00:00Z',
    processing_status: 'PROCESSED',
    extracted_text: `Victim sought refund for cancelled Indigo flight.
Called top Google sponsored phone: +91 9123456780.
Agent instructed to visit air-support-desk.online and transfer verification token of ₹32,500 to airlinerefund@ybl.`,
    metadata: {
      fileSize: '2.3 KB',
      mimeType: 'text/plain',
      uploadedBy: 'Sub-Insp. A. Nair',
    },
    extracted_entity_count: 4,
  },

  // CASE-010 Evidence
  {
    id: 'ev-010',
    case_id: 'CASE-010',
    file_name: 'customs_extortion_video_call_log.txt',
    file_type: 'TXT',
    uploaded_at: '2026-08-11T18:00:00Z',
    processing_status: 'PROCESSED',
    extracted_text: `Call from fake Mumbai Customs Officer.
Caller Mobile Number: +91 9988776655
Victim was coerced into transferring ₹95,000 to avoid arrest warrant.
Destination Account: A/C 112233445566, UPI: customsverify@okhdfcbank.`,
    metadata: {
      fileSize: '3.1 KB',
      mimeType: 'text/plain',
      uploadedBy: 'Insp. V. Joshi',
    },
    extracted_entity_count: 4,
  },

  // CASE-012 Evidence
  {
    id: 'ev-011',
    case_id: 'CASE-012',
    file_name: 'instagram_store_fake_receipt.txt',
    file_type: 'TXT',
    uploaded_at: '2026-08-12T12:00:00Z',
    processing_status: 'PROCESSED',
    extracted_text: `Order #88392 from trendyboutique.shop
Payment requested to UPI: customsverify@okhdfcbank
Customer care telephone: 9988776655
Amount charged: ₹4,999. Product never delivered.`,
    metadata: {
      fileSize: '1.9 KB',
      mimeType: 'text/plain',
      uploadedBy: 'Sub-Insp. A. Nair',
    },
    extracted_entity_count: 4,
  },
];

export const INITIAL_TIMELINE_EVENTS: TimelineEvent[] = [
  {
    id: 'tl-1',
    case_id: 'CASE-001',
    event_type: 'CASE_CREATED',
    event_time: '2026-08-01T09:30:00Z',
    description: 'Case CASE-001 registered: Operation BlueLoot Telegram Investment Scam',
    actor: 'Insp. R. Verma',
  },
  {
    id: 'tl-2',
    case_id: 'CASE-001',
    event_type: 'EVIDENCE_UPLOADED',
    event_time: '2026-08-01T10:00:00Z',
    description: 'Evidence telegram_chat_export_blueloot.txt uploaded by investigator',
    actor: 'Insp. R. Verma',
  },
  {
    id: 'tl-3',
    case_id: 'CASE-001',
    event_type: 'EVIDENCE_PROCESSED',
    event_time: '2026-08-01T10:01:00Z',
    description: 'Processed evidence ev-001: 5 entities extracted and normalized',
    actor: 'TRACE Engine',
  },
  {
    id: 'tl-4',
    case_id: 'CASE-002',
    event_type: 'CASE_CREATED',
    event_time: '2026-08-03T11:15:00Z',
    description: 'Case CASE-002 registered: FinBank Impersonation Phishing Ring',
    actor: 'Det. S. Mukherjee',
  },
  {
    id: 'tl-5',
    case_id: 'CASE-002',
    event_type: 'EVIDENCE_UPLOADED',
    event_time: '2026-08-03T12:00:00Z',
    description: 'Evidence phishing_sms_intercept_dump.txt uploaded',
    actor: 'Det. S. Mukherjee',
  },
  {
    id: 'tl-6',
    case_id: 'CASE-002',
    event_type: 'CONNECTION_DETECTED',
    event_time: '2026-08-03T12:02:00Z',
    description: 'Potential relationship detected between CASE-002 and CASE-001 (Shared indicator: securebank.test)',
    actor: 'TRACE Cross-Case Matcher',
  },
  {
    id: 'tl-7',
    case_id: 'CASE-004',
    event_type: 'CONNECTION_DETECTED',
    event_time: '2026-08-07T11:05:00Z',
    description: 'Potential relationship detected between CASE-004 and CASE-005 (Shared indicators: powerdesk@okhdfcbank, ebill-update.in)',
    actor: 'TRACE Cross-Case Matcher',
  },
  {
    id: 'tl-8',
    case_id: 'CASE-006',
    event_type: 'CONNECTION_DETECTED',
    event_time: '2026-08-09T14:05:00Z',
    description: 'Potential relationship detected between CASE-006 and CASE-007 (Shared indicator: +91 9123456780)',
    actor: 'TRACE Cross-Case Matcher',
  },
  {
    id: 'tl-9',
    case_id: 'CASE-010',
    event_type: 'CONNECTION_DETECTED',
    event_time: '2026-08-12T12:05:00Z',
    description: 'Potential relationship detected between CASE-010 and CASE-012 (Shared indicators: +91 9988776655, customsverify@okhdfcbank)',
    actor: 'TRACE Cross-Case Matcher',
  },
];

/**
 * Helper to build initial entities and cross-case connections from the seed evidence
 */
export function buildInitialSeedState() {
  const allEntities: Entity[] = [];

  // Enrich evidence with SHA-256 and Chain of Custody
  const enrichedEvidence: Evidence[] = INITIAL_EVIDENCE.map((ev, index) => {
    const hash = ev.metadata?.sha256 || computeDeterministicHash(ev.extracted_text);
    const dateStr = ev.uploaded_at.substring(0, 10);
    const timeStr = ev.uploaded_at.substring(11, 16);

    return {
      ...ev,
      metadata: {
        ...ev.metadata,
        sha256: hash,
        integrityStatus: 'VERIFIED' as const,
        chainOfCustody: [
          {
            timestamp: `${dateStr} ${timeStr} UTC`,
            action: 'Evidence Acquired from Source Endpoint',
            actor: ev.metadata?.uploadedBy || 'Investigator',
            status: 'SECURED' as const,
            details: ev.metadata?.sourceDevice || 'Physical Device Extraction',
          },
          {
            timestamp: `${dateStr} ${timeStr} UTC`,
            action: 'Uploaded & Cryptographically Hashed (SHA-256)',
            actor: 'TRACE Evidence Intake Gateway',
            status: 'COMPLETED' as const,
            details: `Checksum digest: ${hash.substring(0, 16)}...`,
          },
          {
            timestamp: `${dateStr} ${timeStr} UTC`,
            action: 'Deterministic Entity Extraction & Normalization',
            actor: 'TRACE Analysis Core',
            status: 'COMPLETED' as const,
            details: 'Pattern rules applied for phones, UPIs, URLs, IPs',
          },
          {
            timestamp: `${dateStr} ${timeStr} UTC`,
            action: 'Integrity Verification & Audit Check',
            actor: 'Forensic Verifier',
            status: 'VERIFIED' as const,
            details: 'Original payload matches cryptographic digest',
          },
        ],
      },
    };
  });

  // Extract entities for each seed evidence
  for (const ev of enrichedEvidence) {
    const extracted = extractEntitiesFromText(ev.extracted_text, ev.id, ev.case_id);
    allEntities.push(...extracted);
  }

  // Run cross-case matching across all seed cases
  let allConnections: Connection[] = [];
  for (const c of INITIAL_CASES) {
    allConnections = matchCaseAgainstAll(c.case_number, INITIAL_CASES, allEntities, enrichedEvidence, allConnections);
  }

  // Mark one connection as verified to show investigator verification workflow in initial state
  if (allConnections.length > 0) {
    const topConn = allConnections.find(c => c.case_a === 'CASE-004' && c.case_b === 'CASE-005');
    if (topConn) {
      topConn.status = 'VERIFIED';
      topConn.verified_at = '2026-08-08T15:00:00Z';
      topConn.investigator_notes = 'Verified by Det. K. Sharma: APK distribution server and task portal sharing identical payment aggregator wallet.';
    }
  }

  return {
    cases: INITIAL_CASES,
    evidence: enrichedEvidence,
    entities: allEntities,
    connections: allConnections,
    timeline: INITIAL_TIMELINE_EVENTS,
  };
}

/**
 * Synthetic evidence payload for the Golden Demo Scenario (CASE-008 receiving new evidence)
 */
export const GOLDEN_DEMO_EVIDENCE_PAYLOAD = {
  fileName: 'executive_smishing_evidence_c008.txt',
  fileType: 'TXT' as const,
  caseNumber: 'CASE-008',
  text: `[FORENSIC EVIDENCE ACQUISITION - CASE-008]
Source: Chief Financial Officer's Corporate Mobile (Extracted via Cellebrite UFED)
Incident: Urgent SMS claiming urgent salary tax withholding audit.

Received Message:
"URGENT: Executive Payroll Clearance Pending. Your monthly compensation of ₹25,000 has been held due to bank gateway failure.
Authorize immediate re-clearance by contacting desk at +91 9000011111 or pay processing clearance fee to traceuser@upi (backup UPI: invest@upi.test).
Confirm employee identity on corporate mirror: example-store.in/payroll."

Forensic Hash SHA256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
Officer in Charge: Insp. R. Verma`,
};
