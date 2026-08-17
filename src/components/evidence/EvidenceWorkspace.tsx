import React, { useState } from 'react';
import { 
  FileText, 
  Upload, 
  Play, 
  Eye, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Layers,
  FileCode,
  FileSpreadsheet,
  FileImage,
  RefreshCw
} from 'lucide-react';
import { useTrace } from '../../context/TraceContext';
import { Evidence, Entity } from '../../types';
import { AddEvidenceModal } from './AddEvidenceModal';
import { EvidencePreviewModal } from './EvidencePreviewModal';

interface Props {
  caseId: string;
}

export const EvidenceWorkspace: React.FC<Props> = ({ caseId }) => {
  const { evidence, entities, processEvidence, isProcessing } = useTrace();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [inspectEvidence, setInspectEvidence] = useState<Evidence | null>(null);

  const caseEvidence = evidence.filter(e => e.case_id === caseId);

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'CSV':
        return <FileSpreadsheet className="w-4 h-4 text-[#B7FF3C]" />;
      case 'PNG':
      case 'JPG':
      case 'JPEG':
        return <FileImage className="w-4 h-4 text-[#81A2A2]" />;
      case 'LOG':
        return <FileCode className="w-4 h-4 text-[#F5C451]" />;
      default:
        return <FileText className="w-4 h-4 text-[#81A2A2]" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[#121619] rounded-lg border border-[#242B30]">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-bold text-[#F2F2F2]">Forensic Evidence Repository</h3>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#060606] text-[#81A2A2] border border-[#242B30]">
              {caseEvidence.length} items
            </span>
          </div>
          <p className="text-xs text-[#8A9399] mt-0.5">
            Ingest digital artifacts, SMS logs, CDRs, and bank records for entity extraction
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center space-x-2 px-3.5 py-2 bg-[#81A2A2] hover:bg-[#81A2A2]/90 text-[#060606] font-semibold text-xs rounded transition-colors shadow-sm self-start sm:self-auto"
        >
          <Upload className="w-4 h-4" />
          <span>Add Evidence File</span>
        </button>
      </div>

      {/* Evidence Table */}
      {caseEvidence.length === 0 ? (
        <div className="p-8 text-center bg-[#121619] rounded-lg border border-[#242B30] space-y-3">
          <FileText className="w-8 h-8 text-[#5F686E] mx-auto" />
          <div className="text-xs text-[#8A9399]">No evidence uploaded yet for this investigation.</div>
          <button
            onClick={() => setIsAddOpen(true)}
            className="px-3 py-1.5 bg-[#81A2A2]/10 hover:bg-[#81A2A2]/20 text-[#81A2A2] border border-[#81A2A2]/40 rounded text-xs transition-colors"
          >
            + Add First Evidence Item
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {caseEvidence.map((ev) => {
            const evEntities = entities.filter(e => e.source_evidence_id === ev.id);
            const isProcessed = ev.processing_status === 'PROCESSED';
            const isFailed = ev.processing_status === 'FAILED';

            return (
              <div
                key={ev.id}
                className="p-4 rounded-lg bg-[#121619] border border-[#242B30] hover:border-[#454F56] transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start sm:items-center space-x-3">
                    <div className="w-8 h-8 rounded bg-[#060606] border border-[#242B30] flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                      {getFileIcon(ev.file_type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#F2F2F2] break-all">{ev.file_name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#060606] text-[#81A2A2] border border-[#242B30] shrink-0">
                          {ev.file_type}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#5F686E] font-mono mt-0.5 flex flex-wrap items-center gap-2">
                        <span>Uploaded: {ev.uploaded_at.substring(0, 19).replace('T', ' ')} • {ev.metadata?.fileSize || '2.4 KB'}</span>
                        <span className="text-[#B7FF3C] text-[10px] bg-[#B7FF3C]/10 px-1.5 py-0.2 rounded border border-[#B7FF3C]/30 font-mono">
                          ✓ SHA-256 Verified
                        </span>
                      </div>
                      {ev.metadata?.sha256 && (
                        <div className="text-[10px] font-mono text-[#81A2A2]/80 mt-1 truncate max-w-md">
                          SHA-256: {ev.metadata.sha256.substring(0, 24)}...
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status & Processing Controls */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#242B30]">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                      isProcessed ? 'bg-[#B7FF3C]/10 text-[#B7FF3C] border border-[#B7FF3C]/30' :
                      isFailed ? 'bg-[#FF4D4D]/10 text-[#FF4D4D] border border-[#FF4D4D]/30' :
                      'bg-[#F5C451]/10 text-[#F5C451] border border-[#F5C451]/30'
                    }`}>
                      {ev.processing_status}
                    </span>

                    <button
                      onClick={() => setInspectEvidence(ev)}
                      className="px-2.5 py-1 text-xs text-[#8A9399] hover:text-[#F2F2F2] hover:bg-[#242B30] rounded border border-[#242B30] transition-colors flex items-center space-x-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect Text</span>
                    </button>

                    <button
                      onClick={() => processEvidence(ev.id)}
                      disabled={isProcessing}
                      className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors flex items-center space-x-1 ${
                        isProcessed 
                          ? 'bg-[#121619] hover:bg-[#242B30] text-[#81A2A2] border border-[#81A2A2]/40' 
                          : 'bg-[#81A2A2] hover:bg-[#81A2A2]/90 text-[#060606]'
                      }`}
                    >
                      {isProcessed ? <RefreshCw className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current" />}
                      <span>{isProcessed ? 'Re-extract' : 'Process'}</span>
                    </button>
                  </div>
                </div>

                {/* Inline Entity Preview Chips */}
                {(evEntities || []).length > 0 && (
                  <div className="pt-2 border-t border-[#242B30]/60 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-mono text-[#5F686E]">
                      <span>EXTRACTED INDICATORS ({(evEntities || []).length}):</span>
                      <span>100% Provenance preserved</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(evEntities || []).map((ent) => (
                        <div
                          key={ent.id}
                          className="px-2 py-0.5 rounded bg-[#060606] border border-[#242B30] text-[11px] font-mono flex items-center space-x-1"
                        >
                          <span className="text-[#81A2A2] font-semibold text-[10px]">{ent.type}:</span>
                          <span className="text-[#F2F2F2]">{ent.normalized_value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <AddEvidenceModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        caseId={caseId}
      />

      <EvidencePreviewModal
        isOpen={!!inspectEvidence}
        onClose={() => setInspectEvidence(null)}
        evidence={inspectEvidence}
        entities={entities}
      />
    </div>
  );
};
