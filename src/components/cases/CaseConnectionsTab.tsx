import React from 'react';
import { Network, CheckCircle2, XCircle, AlertTriangle, ExternalLink, ShieldCheck } from 'lucide-react';
import { Connection } from '../../types';
import { useTrace } from '../../context/TraceContext';

interface Props {
  caseId: string;
}

export const CaseConnectionsTab: React.FC<Props> = ({ caseId }) => {
  const { connections, cases, verifyConnection, dismissConnection, setSelectedConnectionId, setActiveView } = useTrace();

  const caseConnections = connections.filter(c => c.case_a === caseId || c.case_b === caseId);

  return (
    <div className="space-y-4">
      {/* Overview Banner */}
      <div className="p-4 bg-[#121619] rounded-lg border border-[#242B30] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-bold text-[#F2F2F2]">Cross-Case Relationships & Leads</h3>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#060606] text-[#F5C451] border border-[#242B30]">
              {caseConnections.length} connection(s)
            </span>
          </div>
          <p className="text-xs text-[#8A9399] mt-0.5">
            Automated intelligence links based on normalized shared phone, UPI, domain, and account indicators
          </p>
        </div>
      </div>

      {caseConnections.length === 0 ? (
        <div className="p-8 text-center bg-[#121619] rounded-lg border border-[#242B30] space-y-2">
          <Network className="w-8 h-8 text-[#5F686E] mx-auto" />
          <div className="text-xs text-[#8A9399]">No cross-case relationships detected yet for {caseId}.</div>
          <p className="text-[11px] text-[#5F686E]">
            Add evidence or process existing files to discover potential links.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {caseConnections.map((conn) => {
            const otherCaseNumber = conn.case_a === caseId ? conn.case_b : conn.case_a;
            const otherCase = cases.find(c => c.case_number === otherCaseNumber);

            return (
              <div
                key={conn.id}
                className="p-5 rounded-lg bg-[#121619] border border-[#242B30] hover:border-[#454F56] transition-all space-y-4"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-[#F2F2F2] bg-[#060606] px-2 py-0.5 rounded border border-[#242B30]">
                        {caseId}
                      </span>
                      <span className="text-xs font-mono text-[#5F686E]">↔</span>
                      <button
                        onClick={() => {
                          setActiveView('case-detail', otherCaseNumber);
                        }}
                        className="font-mono text-xs font-bold text-[#81A2A2] hover:underline bg-[#060606] px-2 py-0.5 rounded border border-[#242B30]"
                      >
                        {otherCaseNumber}
                      </button>
                    </div>

                    <span className="text-xs text-[#8A9399] truncate max-w-xs">
                      • {otherCase?.title}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      conn.severity === 'HIGH' ? 'bg-[#FF4D4D]/10 text-[#FF4D4D] border border-[#FF4D4D]/30' :
                      conn.severity === 'MEDIUM' ? 'bg-[#F5C451]/10 text-[#F5C451] border border-[#F5C451]/30' :
                      'bg-[#81A2A2]/10 text-[#81A2A2] border border-[#81A2A2]/30'
                    }`}>
                      Score: {conn.score} / {conn.severity}
                    </span>

                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                      conn.status === 'VERIFIED' ? 'bg-[#B7FF3C]/10 text-[#B7FF3C] border border-[#B7FF3C]/30 font-bold' :
                      conn.status === 'DISMISSED' ? 'bg-[#5F686E]/10 text-[#5F686E] border border-[#5F686E]/30' :
                      'bg-[#F5C451]/10 text-[#F5C451] border border-[#F5C451]/30 font-bold'
                    }`}>
                      {conn.status}
                    </span>
                  </div>
                </div>

                {/* Shared Indicators Provenance Cards */}
                <div className="space-y-2">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#5F686E]">
                    Shared Investigative Indicators ({(conn.shared_entities || []).length}):
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {(conn.shared_entities || []).map((ind, idx) => (
                      <div key={idx} className="p-3 bg-[#060606] rounded border border-[#242B30] text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#121619] text-[#81A2A2] border border-[#81A2A2]/30">
                            {ind.type}
                          </span>
                          <span className="font-mono text-xs font-bold text-[#F2F2F2]">{ind.normalized_value}</span>
                        </div>

                        <div className="text-[10px] font-mono text-[#8A9399] space-y-0.5 border-t border-[#242B30]/40 pt-1">
                          <div className="truncate">In {conn.case_a}: {ind.source_evidence_a_name}</div>
                          <div className="truncate">In {conn.case_b}: {ind.source_evidence_b_name}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Score Math Summary */}
                {conn.breakdown && conn.breakdown.length > 0 && (
                  <div className="p-2.5 bg-[#060606]/60 rounded border border-[#242B30] text-xs">
                    <div className="text-[10px] font-mono text-[#5F686E] uppercase mb-1">
                      Score Calculation Breakdown:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(conn.breakdown || []).map((item, i) => (
                        <div key={i} className="text-[11px] font-mono text-[#8A9399] flex items-center space-x-1">
                          <span>{item.label}</span>
                          <span className="text-[#81A2A2] font-bold">+{item.points}</span>
                        </div>
                      ))}
                      <div className="text-[11px] font-mono font-bold text-[#F2F2F2]">
                        = Total {conn.score}/100
                      </div>
                    </div>
                  </div>
                )}

                {/* Verification Actions */}
                <div className="pt-2 border-t border-[#242B30] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <button
                    onClick={() => {
                      setSelectedConnectionId(conn.id);
                      setActiveView('connection-detail', undefined, conn.id);
                    }}
                    className="text-xs text-[#81A2A2] hover:underline flex items-center space-x-1"
                  >
                    <span>Inspect Full Relationship Provenance</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>

                  <div className="flex items-center space-x-2">
                    {conn.status !== 'VERIFIED' && (
                      <button
                        onClick={() => verifyConnection(conn.id)}
                        className="px-3 py-1.5 bg-[#B7FF3C] hover:bg-[#B7FF3C]/90 text-[#060606] font-semibold rounded text-xs transition-colors flex items-center space-x-1.5"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Verify Connection</span>
                      </button>
                    )}

                    {conn.status !== 'DISMISSED' && (
                      <button
                        onClick={() => dismissConnection(conn.id)}
                        className="px-3 py-1.5 text-xs text-[#8A9399] hover:text-[#FF4D4D] hover:bg-[#FF4D4D]/10 rounded border border-[#242B30] hover:border-[#FF4D4D]/30 transition-colors"
                      >
                        Dismiss
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
