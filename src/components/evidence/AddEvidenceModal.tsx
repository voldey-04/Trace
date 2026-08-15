import React, { useState } from 'react';
import { X, Upload, FileText, Sparkles, Check } from 'lucide-react';
import { useTrace } from '../../context/TraceContext';
import { FileType } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  caseId: string;
}

const TEMPLATE_PRESETS = [
  {
    name: 'SMS Smishing Dump (Bank KYC)',
    fileType: 'TXT' as FileType,
    fileName: 'smishing_intercept_kyc.txt',
    text: `URGENT NOTICE: Your NetBanking access will be terminated within 24 hours due to pending KYC re-verification.
Login immediately to secure portal: securebank.test or mirror: example-store.in to submit identity documents.
Helpline contact: +91 9000011111 or email security@securebank.test.
Verification deposit of ₹500 required to UPI: support@upi.test.`,
  },
  {
    name: 'Victim Bank Statement (CSV)',
    fileType: 'CSV' as FileType,
    fileName: 'statement_disputed_txns.csv',
    text: `Date,Type,Amount,Beneficiary_UPI,Reference_No,Description
12/08/2026,UPI_TRANSFER,₹25000,traceuser@upi,UTR99281034,Payroll Clearance Bond
12/08/2026,UPI_TRANSFER,₹15000,invest@upi.test,UTR99281099,Security Fee
Originating Mobile: +919000011111, Target Domain: example-store.in`,
  },
  {
    name: 'Electricity Disconnection Fraud SMS',
    fileType: 'TXT' as FileType,
    fileName: 'power_bill_scam_msg.txt',
    text: `Dear Consumer, Electricity power supply will be disconnected tonight at 9:30 PM from electricity office.
Kindly pay pending bill ₹45,000 to A/C: 918273645012 or UPI: powerdesk@okhdfcbank.
Download official bill update utility: ebill-update.in or call officer at +91 9876500001.`,
  },
];

export const AddEvidenceModal: React.FC<Props> = ({ isOpen, onClose, caseId }) => {
  const { addEvidence, processEvidence } = useTrace();

  const [fileName, setFileName] = useState('forensic_evidence_dump.txt');
  const [fileType, setFileType] = useState<FileType>('TXT');
  const [text, setText] = useState('');
  const [uploadedBy, setUploadedBy] = useState('Investigator (Cyber Cell)');
  const [victimName, setVictimName] = useState('');
  const [autoProcess, setAutoProcess] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleApplyTemplate = (tpl: typeof TEMPLATE_PRESETS[0]) => {
    setFileName(tpl.fileName);
    setFileType(tpl.fileType);
    setText(tpl.text);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const ext = file.name.split('.').pop()?.toUpperCase();
    if (ext === 'CSV') setFileType('CSV');
    else if (ext === 'LOG') setFileType('LOG');
    else if (ext === 'PDF') setFileType('PDF');
    else if (['PNG', 'JPG', 'JPEG'].includes(ext || '')) setFileType('PNG');
    else setFileType('TXT');

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setText(content || '');
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName.trim() || !text.trim()) return;

    setIsSubmitting(true);

    const newEv = addEvidence(caseId, {
      fileName,
      fileType,
      text,
      metadata: {
        fileSize: `${(text.length / 1024).toFixed(1)} KB`,
        uploadedBy,
        victimName: victimName || undefined,
        sha256: `sha256_${Math.random().toString(36).substring(2, 12)}`,
        incidentDate: new Date().toISOString().substring(0, 10),
      },
    });

    if (autoProcess) {
      await processEvidence(newEv.id);
    }

    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#060606]/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#121619] border border-[#454F56] rounded-lg max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-[#8A9399] hover:text-[#F2F2F2] p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-5">
          <div className="w-8 h-8 rounded bg-[#81A2A2]/10 border border-[#81A2A2]/40 flex items-center justify-center text-[#81A2A2]">
            <Upload className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#F2F2F2]">Add Forensic Evidence to {caseId}</h3>
            <p className="text-xs text-[#8A9399]">
              Ingest raw text, SMS intercepts, CSV bank ledgers, or OCR dumps for deterministic extraction
            </p>
          </div>
        </div>

        {/* Quick Demo Template Presets */}
        <div className="mb-4 p-3 bg-[#060606] rounded border border-[#242B30] space-y-2">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#8A9399]">
            Load Demonstration Indicator Presets:
          </div>
          <div className="flex flex-wrap gap-2">
            {TEMPLATE_PRESETS.map((tpl, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleApplyTemplate(tpl)}
                className="px-2.5 py-1 text-[11px] font-mono bg-[#121619] hover:bg-[#242B30] text-[#81A2A2] border border-[#242B30] hover:border-[#81A2A2] rounded transition-colors"
              >
                + {tpl.name}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* File Upload Trigger */}
          <div className="border border-dashed border-[#454F56] rounded p-4 text-center bg-[#060606]/40 hover:bg-[#060606] transition-colors relative">
            <input
              type="file"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <Upload className="w-5 h-5 mx-auto text-[#81A2A2] mb-1" />
            <div className="text-xs text-[#F2F2F2]">
              Drag & drop file here or <span className="text-[#81A2A2] underline">browse</span>
            </div>
            <div className="text-[10px] text-[#5F686E] mt-0.5">
              Supports .TXT, .CSV, .LOG, .PDF, .PNG
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#8A9399] mb-1 font-medium">Evidence File Name *</label>
              <input
                type="text"
                required
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="w-full bg-[#060606] border border-[#242B30] focus:border-[#81A2A2] rounded p-2 text-[#F2F2F2] font-mono outline-none"
              />
            </div>

            <div>
              <label className="block text-[#8A9399] mb-1 font-medium">File Format *</label>
              <select
                value={fileType}
                onChange={(e) => setFileType(e.target.value as FileType)}
                className="w-full bg-[#060606] border border-[#242B30] focus:border-[#81A2A2] rounded p-2 text-[#F2F2F2] outline-none font-mono"
              >
                <option value="TXT">TXT (Plain Text / Chat / Intercept)</option>
                <option value="CSV">CSV (Bank Ledger / CDR Table)</option>
                <option value="LOG">LOG (Server Access Log)</option>
                <option value="PDF">PDF (Forensic Document)</option>
                <option value="PNG">PNG / JPG (Screenshot OCR)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[#8A9399] mb-1 font-medium">
              Raw Evidence Content / Extracted Text *
            </label>
            <textarea
              required
              rows={6}
              placeholder="Paste chat transcripts, SMS intercepts, bank statements, server logs containing phones, UPIs, websites..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full bg-[#060606] border border-[#242B30] focus:border-[#81A2A2] rounded p-2.5 text-[#F2F2F2] font-mono text-[11px] leading-relaxed outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#8A9399] mb-1 font-medium">Acquiring Investigator</label>
              <input
                type="text"
                value={uploadedBy}
                onChange={(e) => setUploadedBy(e.target.value)}
                className="w-full bg-[#060606] border border-[#242B30] focus:border-[#81A2A2] rounded p-2 text-[#F2F2F2] outline-none"
              />
            </div>

            <div>
              <label className="block text-[#8A9399] mb-1 font-medium">Victim / Complainant Identifier</label>
              <input
                type="text"
                placeholder="Optional e.g. Rajesh Kumar"
                value={victimName}
                onChange={(e) => setVictimName(e.target.value)}
                className="w-full bg-[#060606] border border-[#242B30] focus:border-[#81A2A2] rounded p-2 text-[#F2F2F2] outline-none"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="autoProcess"
              checked={autoProcess}
              onChange={(e) => setAutoProcess(e.target.checked)}
              className="rounded bg-[#060606] border-[#242B30] text-[#81A2A2] focus:ring-0"
            />
            <label htmlFor="autoProcess" className="text-xs text-[#F2F2F2] cursor-pointer">
              Immediately run entity extraction and cross-case matching upon upload
            </label>
          </div>

          <div className="pt-3 border-t border-[#242B30] flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded text-[#8A9399] hover:text-[#F2F2F2] hover:bg-[#242B30] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-[#81A2A2] hover:bg-[#81A2A2]/90 text-[#060606] font-semibold rounded transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{autoProcess ? 'Upload & Extract Intelligence' : 'Save Evidence'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
