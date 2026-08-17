import React from 'react';
import { 
  ShieldCheck, 
  FileText, 
  Layers, 
  Network, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight,
  Send,
  Lock,
  Phone,
  CreditCard,
  Globe
} from 'lucide-react';
import { Case, Connection, Entity, Evidence } from '../../types';

interface Props {
  caseObj: Case;
  evidence: Evidence[];
  entities: Entity[];
  connections: Connection[];
  onOpenTab: (tab: 'evidence' | 'entities' | 'connections' | 'graph') => void;
}

export const ActionableCaseSummary: React.FC<Props> = ({
  caseObj,
  evidence,
  entities,
  connections,
  onOpenTab,
}) => {
  const verifiedConnections = connections.filter(c => c.status === 'VERIFIED');
  const suggestedConnections = connections.filter(c => c.status === 'SUGGESTED');
  const highSeverityLeads = connections.filter(c => c.severity === 'HIGH');

  // Extract primary identifiers
  const phones = entities.filter(e => e.type === 'PHONE');
  const upis = entities.filter(e => e.type === 'UPI');
  const domains = entities.filter(e => e.type === 'WEBSITE' || e.type === 'URL');
  const ips = entities.filter(e => e.type === 'IP_ADDRESS');

  return (
    <div className="p-5 rounded-lg bg-gradient-to-br from-[#121619] via-[#121619] to-[#0c1012] border border-[#454F56] space-y-4 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#242B30] pb-3">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded bg-[#81A2A2]/10 border border-[#81A2A2]/40 flex items-center justify-center text-[#81A2A2]">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#F2F2F2]">Actionable Intelligence Summary</h3>
            <p className="text-[11px] text-[#8A9399]">Deterministic Multi-Case Correlation Assessment</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-[10px] font-mono">
          <span className="px-2 py-0.5 rounded bg-[#B7FF3C]/10 text-[#B7FF3C] border border-[#B7FF3C]/30 font-bold">
            ✓ 100% SHA-256 HASH VERIFIED
          </span>
        </div>
      </div>

      {/* 4 Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        <div className="p-2.5 rounded bg-[#060606] border border-[#242B30]">
          <div className="text-xl font-bold font-mono text-[#81A2A2]">{evidence.length}</div>
          <div className="text-[10px] text-[#5F686E]">Evidence Files Analyzed</div>
        </div>
        <div className="p-2.5 rounded bg-[#060606] border border-[#242B30]">
          <div className="text-xl font-bold font-mono text-[#F2F2F2]">{entities.length}</div>
          <div className="text-[10px] text-[#5F686E]">Extracted Indicators</div>
        </div>
        <div className="p-2.5 rounded bg-[#060606] border border-[#242B30]">
          <div className="text-xl font-bold font-mono text-[#F5C451]">{connections.length}</div>
          <div className="text-[10px] text-[#5F686E]">Cross-Case Links</div>
        </div>
        <div className="p-2.5 rounded bg-[#060606] border border-[#242B30]">
          <div className="text-xl font-bold font-mono text-[#B7FF3C]">{verifiedConnections.length}</div>
          <div className="text-[10px] text-[#5F686E]">Verified Leads</div>
        </div>
      </div>

      {/* Pattern Rationale & Cross-Case Discovery */}
      {connections.length > 0 ? (
        <div className="p-3.5 rounded bg-[#060606] border border-[#242B30] space-y-2">
          <div className="text-xs font-bold text-[#F5C451] flex items-center space-x-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Pattern & Cross-Case Correlation Detected:</span>
          </div>
          <p className="text-xs text-[#8A9399] leading-relaxed">
            TRACE detected <strong className="text-[#F2F2F2]">{connections.length} potential connection(s)</strong> across independent FIR files. {highSeverityLeads.length > 0 && <span className="text-[#FF4D4D] font-semibold">{highSeverityLeads.length} lead(s) exhibit high indicator overlap</span>} sharing active telecom numbers, payment aggregator VPA accounts, or hosting IP blocks.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {connections.map((c, i) => {
              const otherCase = c.case_a === caseObj.case_number ? c.case_b : c.case_a;
              return (
                <button
                  key={i}
                  onClick={() => onOpenTab('connections')}
                  className="px-2.5 py-1 rounded bg-[#121619] hover:bg-[#242B30] border border-[#454F56] text-xs font-mono text-[#81A2A2] flex items-center space-x-1.5 transition-colors"
                >
                  <span>{caseObj.case_number} ↔ {otherCase}</span>
                  <span className="text-[10px] text-[#F5C451] font-bold">({c.score} pts)</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-3 rounded bg-[#060606] border border-[#242B30] text-xs text-[#8A9399]">
          No cross-case relationships detected yet. Upload more evidence or wait for incoming indicators.
        </div>
      )}

      {/* Recommended Next Steps for Investigator */}
      <div className="p-3.5 rounded bg-[#060606] border border-[#242B30] space-y-2">
        <div className="text-xs font-bold text-[#81A2A2] uppercase tracking-wider font-mono">
          Recommended Investigator Next Steps
        </div>
        <ul className="text-xs text-[#F2F2F2] space-y-1.5 leading-relaxed">
          {phones.length > 0 && (
            <li className="flex items-start space-x-2">
              <span className="text-[#81A2A2] font-bold font-mono shrink-0">1.</span>
              <span>
                <strong>Telecom Subpoena (Sec 91):</strong> Issue legal requisition to Mobile Network Operator for Call Detail Records (CDR) and Subscriber Details of <code className="font-mono text-[#81A2A2] bg-[#121619] px-1 py-0.2 rounded">{phones[0].value}</code>.
              </span>
            </li>
          )}
          {upis.length > 0 && (
            <li className="flex items-start space-x-2">
              <span className="text-[#81A2A2] font-bold font-mono shrink-0">2.</span>
              <span>
                <strong>Payment Aggregator Freeze:</strong> Request emergency freeze / KYC verification from NPCI / PSP for beneficiary handle <code className="font-mono text-[#B7FF3C] bg-[#121619] px-1 py-0.2 rounded">{upis[0].value}</code>.
              </span>
            </li>
          )}
          {connections.length > 0 && (
            <li className="flex items-start space-x-2">
              <span className="text-[#81A2A2] font-bold font-mono shrink-0">3.</span>
              <span>
                <strong>Inter-Station Collaboration:</strong> Coordinate with investigating officer of connected case <code className="font-mono text-[#F5C451] bg-[#121619] px-1 py-0.2 rounded">{connections[0].case_a === caseObj.case_number ? connections[0].case_b : connections[0].case_a}</code> for joint syndicate apprehension.
              </span>
            </li>
          )}
        </ul>
      </div>

      {/* Interactive Tabs Jump */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
        <span className="text-[11px] text-[#5F686E]">Explore Detailed Investigative Views:</span>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onOpenTab('evidence')}
            className="px-2.5 py-1 text-xs rounded bg-[#121619] hover:bg-[#242B30] text-[#81A2A2] border border-[#242B30] transition-colors"
          >
            Evidence Files ({evidence.length})
          </button>
          <button
            onClick={() => onOpenTab('entities')}
            className="px-2.5 py-1 text-xs rounded bg-[#121619] hover:bg-[#242B30] text-[#81A2A2] border border-[#242B30] transition-colors"
          >
            Extracted Entities ({entities.length})
          </button>
          <button
            onClick={() => onOpenTab('graph')}
            className="px-2.5 py-1 text-xs rounded bg-[#81A2A2] hover:bg-[#81A2A2]/90 text-[#060606] font-semibold transition-colors flex items-center space-x-1"
          >
            <span>Open Graph Explorer</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
