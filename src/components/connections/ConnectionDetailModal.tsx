import React, { useState } from 'react';
import { 
  X, 
  Network, 
  ShieldCheck, 
  XCircle, 
  FileText, 
  Calculator, 
  Info, 
  AlertTriangle, 
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { Connection, Case } from '../../types';
import { useTrace } from '../../context/TraceContext';

interface Props {
  connection: Connection | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ConnectionDetailModal: React.FC<Props> = ({ connection, isOpen, onClose }) => {
  const { cases, verifyConnection, dismissConnection, setActiveView, setSelectedCaseId } = useTrace();

  const [notes, setNotes] = useState('');
  const [dismissReason, setDismissReason] = useState('Indicators determined coincidental upon review');

  if (!isOpen || !connection) return null;

  const caseA = cases.find(c => c.case_number === connection.case_a);
  const caseB = cases.find(c => c.case_number === connection.case_b);

  const handleVerify = () => {
    verifyConnection(connection.id, notes.trim() || undefined);
    onClose();
  };

  const handleDismiss = () => {
    dismissConnection(connection.id, dismissReason.trim() || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#060606]/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#121619] border border-[#454F56] rounded-lg max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[#242B30] bg-[#060606] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded bg-[#121619] border border-[#242B30] flex items-center justify-center text-[#F5C451]">
              <Network className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-sm font-bold text-[#81A2A2]">{connection.case_a}</span>
                <span className="text-xs text-[#5F686E] font-mono">↔</span>
                <span className="font-mono text-sm font-bold text-[#81A2A2]">{connection.case_b}</span>
                <span className="text-xs text-[#8A9399]">Potential Relationship Analysis</span>
              </div>
              <div className="text-[11px] text-[#5F686E] font-mono">
                Connection ID: {connection.id} • Detected: {connection.created_at.substring(0, 19).replace('T', ' ')}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded ${
              connection.severity === 'HIGH' ? 'bg-[#FF4D4D]/10 text-[#FF4D4D] border border-[#FF4D4D]/30' :
              connection.severity === 'MEDIUM' ? 'bg-[#F5C451]/10 text-[#F5C451] border border-[#F5C451]/30' :
              'bg-[#81A2A2]/10 text-[#81A2A2] border border-[#81A2A2]/30'
            }`}>
              Score: {connection.score} / {connection.severity}
            </span>

            <span className={`text-xs font-mono px-2.5 py-1 rounded font-bold ${
              connection.status === 'VERIFIED' ? 'bg-[#B7FF3C]/10 text-[#B7FF3C] border border-[#B7FF3C]/30' :
              connection.status === 'DISMISSED' ? 'bg-[#5F686E]/10 text-[#5F686E] border border-[#5F686E]/30' :
              'bg-[#F5C451]/10 text-[#F5C451] border border-[#F5C451]/30'
            }`}>
              {connection.status}
            </span>

            <button onClick={onClose} className="text-[#8A9399] hover:text-[#F2F2F2] p-1.5">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Linked Case Summaries */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3.5 bg-[#060606] rounded border border-[#242B30] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#81A2A2]">{connection.case_a}</span>
                <button
                  onClick={() => {
                    onClose();
                    setSelectedCaseId(connection.case_a);
                    setActiveView('case-detail', connection.case_a);
                  }}
                  className="text-[11px] text-[#81A2A2] hover:underline flex items-center space-x-0.5"
                >
                  <span>Open Case</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
              <div className="text-[#F2F2F2] font-semibold">{caseA?.title || connection.case_a}</div>
              <div className="text-[11px] text-[#8A9399]">{caseA?.crime_type} • {caseA?.priority} Priority</div>
            </div>

            <div className="p-3.5 bg-[#060606] rounded border border-[#242B30] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#81A2A2]">{connection.case_b}</span>
                <button
                  onClick={() => {
                    onClose();
                    setSelectedCaseId(connection.case_b);
                    setActiveView('case-detail', connection.case_b);
                  }}
                  className="text-[11px] text-[#81A2A2] hover:underline flex items-center space-x-0.5"
                >
                  <span>Open Case</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
              <div className="text-[#F2F2F2] font-semibold">{caseB?.title || connection.case_b}</div>
              <div className="text-[11px] text-[#8A9399]">{caseB?.crime_type} • {caseB?.priority} Priority</div>
            </div>
          </div>

          {/* Explainable Score Math Breakdown */}
          <div className="p-4 bg-[#060606] rounded border border-[#242B30] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 font-mono uppercase text-[10px] text-[#8A9399]">
                <Calculator className="w-3.5 h-3.5 text-[#81A2A2]" />
                <span>Deterministic Score Calculation & Weights:</span>
              </div>
              <span className="font-mono font-bold text-xs text-[#F2F2F2]">
                Total Match Score: {connection.score}/100
              </span>
            </div>

            <div className="space-y-1.5">
              {(connection.breakdown || []).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-1 border-b border-[#242B30]/40 text-xs">
                  <div className="flex items-center space-x-2 font-mono">
                    <span className="text-[#F2F2F2]">{item.label}</span>
                    {item.indicatorValue && (
                      <span className="text-[#5F686E]">({item.indicatorValue})</span>
                    )}
                  </div>
                  <span className="font-mono font-bold text-[#81A2A2]">+{item.points}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Shared Indicators with Evidence Provenance */}
          <div className="space-y-3">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#8A9399]">
              Shared Investigative Indicators & Dual Evidence Provenance ({(connection.shared_entities || []).length}):
            </div>

            <div className="space-y-3">
              {(connection.shared_entities || []).map((ind, i) => (
                <div key={i} className="p-4 bg-[#060606] rounded border border-[#242B30] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#121619] text-[#81A2A2] border border-[#81A2A2]/30">
                        {ind.type}
                      </span>
                      <span className="font-mono text-xs font-bold text-[#F2F2F2]">{ind.normalized_value}</span>
                    </div>
                    <span className="text-[10px] font-mono text-[#5F686E]">Exact Normalized Match</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-[#242B30]/60">
                    <div className="space-y-1">
                      <div className="text-[10px] font-mono text-[#81A2A2] flex items-center space-x-1">
                        <FileText className="w-3 h-3" />
                        <span>Source in {connection.case_a}: {ind.source_evidence_a_name}</span>
                      </div>
                      {ind.context_a && (
                        <div className="text-[11px] font-mono text-[#8A9399] italic bg-[#121619] p-2 rounded">
                          "{ind.context_a}"
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="text-[10px] font-mono text-[#81A2A2] flex items-center space-x-1">
                        <FileText className="w-3 h-3" />
                        <span>Source in {connection.case_b}: {ind.source_evidence_b_name}</span>
                      </div>
                      {ind.context_b && (
                        <div className="text-[11px] font-mono text-[#8A9399] italic bg-[#121619] p-2 rounded">
                          "{ind.context_b}"
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mandatory Positioning & Warning Notice */}
          <div className="p-3 rounded bg-[#121619] border border-[#242B30] text-[11px] text-[#8A9399] flex items-start space-x-2">
            <Info className="w-4 h-4 text-[#81A2A2] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#F2F2F2]">Investigative Assistance Positioning:</strong> TRACE identifies shared technical indicators between evidence files. TRACE does not determine guilt, identify criminals, or replace human detective judgment.
            </div>
          </div>

          {/* Verification Notes / Existing Notes */}
          {connection.investigator_notes && (
            <div className="p-3 bg-[#B7FF3C]/5 border border-[#B7FF3C]/20 rounded text-xs space-y-1">
              <div className="text-[10px] font-mono text-[#B7FF3C] uppercase">Investigator Notes:</div>
              <p className="text-[#F2F2F2] font-mono">{connection.investigator_notes}</p>
            </div>
          )}

          {connection.status === 'SUGGESTED' && (
            <div className="space-y-2 pt-2 border-t border-[#242B30]">
              <label className="block text-[#8A9399] font-medium">Investigator Verification Notes (Optional):</label>
              <input
                type="text"
                placeholder="e.g. Corroborated with bank UTR settlement report..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-[#060606] border border-[#242B30] focus:border-[#81A2A2] rounded p-2 text-[#F2F2F2] outline-none font-mono text-xs"
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#242B30] bg-[#060606] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded text-[#8A9399] hover:text-[#F2F2F2] hover:bg-[#121619] transition-colors"
          >
            Close
          </button>

          {connection.status === 'SUGGESTED' && (
            <div className="flex items-center space-x-3">
              <button
                onClick={handleDismiss}
                className="px-3.5 py-2 text-xs text-[#8A9399] hover:text-[#FF4D4D] hover:bg-[#FF4D4D]/10 rounded border border-[#242B30] hover:border-[#FF4D4D]/40 transition-colors"
              >
                Dismiss Connection
              </button>
              <button
                onClick={handleVerify}
                className="px-4 py-2 bg-[#B7FF3C] hover:bg-[#B7FF3C]/90 text-[#060606] font-semibold rounded text-xs transition-colors flex items-center space-x-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Verify Connection</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
