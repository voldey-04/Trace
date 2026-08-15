import React from 'react';
import { X, FileText, Download, Play, Layers, Calendar, User, Shield, CheckCircle2 } from 'lucide-react';
import { Evidence, Entity } from '../../types';
import { useTrace } from '../../context/TraceContext';

interface Props {
  evidence: Evidence | null;
  entities: Entity[];
  isOpen: boolean;
  onClose: () => void;
}

export const EvidencePreviewModal: React.FC<Props> = ({ evidence, entities, isOpen, onClose }) => {
  const { processEvidence, isProcessing } = useTrace();

  if (!isOpen || !evidence) return null;

  const evidenceEntities = entities.filter(e => e.source_evidence_id === evidence.id);

  return (
    <div className="fixed inset-0 z-50 bg-[#060606]/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#121619] border border-[#454F56] rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-[#242B30] flex items-center justify-between bg-[#060606]">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded bg-[#121619] border border-[#242B30] flex items-center justify-center text-[#81A2A2]">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-mono text-sm font-bold text-[#F2F2F2]">{evidence.file_name}</h3>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#242B30] text-[#81A2A2]">
                  {evidence.file_type}
                </span>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                  evidence.processing_status === 'PROCESSED' ? 'bg-[#B7FF3C]/10 text-[#B7FF3C] border border-[#B7FF3C]/30' :
                  evidence.processing_status === 'FAILED' ? 'bg-[#FF4D4D]/10 text-[#FF4D4D] border border-[#FF4D4D]/30' :
                  'bg-[#F5C451]/10 text-[#F5C451] border border-[#F5C451]/30'
                }`}>
                  {evidence.processing_status}
                </span>
              </div>
              <p className="text-[11px] text-[#8A9399]">Evidence ID: {evidence.id} • Attached to {evidence.case_id}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {evidence.processing_status !== 'PROCESSED' && (
              <button
                onClick={() => processEvidence(evidence.id)}
                disabled={isProcessing}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#81A2A2] hover:bg-[#81A2A2]/90 text-[#060606] font-semibold text-xs rounded transition-colors disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Process Intelligence</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="text-[#8A9399] hover:text-[#F2F2F2] p-1.5"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-[#060606] p-3 rounded border border-[#242B30]">
            <div>
              <span className="text-[#5F686E] block text-[10px] uppercase font-mono">Uploaded</span>
              <span className="text-[#F2F2F2] font-mono">{evidence.uploaded_at.substring(0, 19).replace('T', ' ')}</span>
            </div>
            <div>
              <span className="text-[#5F686E] block text-[10px] uppercase font-mono">File Size</span>
              <span className="text-[#F2F2F2] font-mono">{evidence.metadata?.fileSize || '3.2 KB'}</span>
            </div>
            <div>
              <span className="text-[#5F686E] block text-[10px] uppercase font-mono">Acquired By</span>
              <span className="text-[#F2F2F2]">{evidence.metadata?.uploadedBy || 'Investigator'}</span>
            </div>
            <div>
              <span className="text-[#5F686E] block text-[10px] uppercase font-mono">Extracted Indicators</span>
              <span className="text-[#81A2A2] font-mono font-bold">{evidenceEntities.length}</span>
            </div>
          </div>

          {/* Raw Text Content */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-[#8A9399]">
              <span className="font-mono uppercase tracking-wider text-[10px]">Forensic Content / Raw Text Stream:</span>
              <span className="font-mono text-[10px]">{evidence.extracted_text.length} characters</span>
            </div>
            <div className="bg-[#060606] border border-[#242B30] rounded p-4 font-mono text-xs text-[#F2F2F2] whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
              {evidence.extracted_text}
            </div>
          </div>

          {/* Extracted Indicators Provenance Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-[#8A9399]">
              <span className="font-mono uppercase tracking-wider text-[10px]">
                Extracted Indicators & Provenance Snippets ({(evidenceEntities || []).length}):
              </span>
            </div>

            {(evidenceEntities || []).length === 0 ? (
              <div className="p-4 bg-[#060606] rounded border border-[#242B30] text-center text-xs text-[#5F686E]">
                No entities extracted yet. Click "Process Intelligence" to extract indicators.
              </div>
            ) : (
              <div className="space-y-2">
                {(evidenceEntities || []).map((ent) => (
                  <div key={ent.id} className="p-3 bg-[#060606] rounded border border-[#242B30] text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#121619] text-[#81A2A2] border border-[#81A2A2]/30">
                          {ent.type}
                        </span>
                        <span className="font-mono text-[#F2F2F2] font-semibold">{ent.value}</span>
                        <span className="text-[10px] text-[#5F686E] font-mono">→ norm: {ent.normalized_value}</span>
                      </div>
                      <span className="text-[10px] font-mono text-[#5F686E]">
                        conf: {Math.round((ent.confidence || 0.95) * 100)}%
                      </span>
                    </div>
                    {ent.source_context && (
                      <div className="text-[11px] text-[#8A9399] italic bg-[#121619]/60 p-1.5 rounded font-mono">
                        "{ent.source_context}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#242B30] bg-[#060606] flex items-center justify-between text-xs text-[#8A9399]">
          <span className="text-[11px] text-[#5F686E]">
            Forensic Integrity: Deterministic regex and token normalization
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#121619] hover:bg-[#242B30] text-[#F2F2F2] rounded border border-[#242B30] transition-colors"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
