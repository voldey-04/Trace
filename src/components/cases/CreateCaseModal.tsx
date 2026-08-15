import React, { useState } from 'react';
import { X, FolderPlus, AlertCircle } from 'lucide-react';
import { useTrace } from '../../context/TraceContext';
import { CrimeType, PriorityLevel, CaseStatus } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const CRIME_TYPES: CrimeType[] = [
  'Investment Scam',
  'Phishing Campaign',
  'Identity Theft',
  'Ransomware Extortion',
  'UPI Scam',
  'SIM Swap',
  'Crypto Drainer',
  'Loan App Harassment',
  'Bank Impersonation',
  'E-Commerce Fraud',
  'Smishing / SMS Spoofing',
  'Job Task Fraud',
];

export const CreateCaseModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { addCase, setActiveView } = useTrace();

  const [title, setTitle] = useState('');
  const [crimeType, setCrimeType] = useState<CrimeType>('Investment Scam');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('HIGH');
  const [status, setStatus] = useState<CaseStatus>('OPEN');
  const [assignedOfficer, setAssignedOfficer] = useState('Insp. R. Verma');
  const [jurisdiction, setJurisdiction] = useState('Metro Cyber Command');
  const [tagsInput, setTagsInput] = useState('Telegram, UPI Routing, Priority');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);

    const created = addCase({
      title,
      crime_type: crimeType,
      description,
      priority,
      status,
      assigned_officer: assignedOfficer,
      jurisdiction,
      tags,
    });

    onClose();
    setActiveView('case-detail', created.case_number);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#060606]/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#121619] border border-[#454F56] rounded-lg max-w-xl w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-[#8A9399] hover:text-[#F2F2F2] p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-5">
          <div className="w-8 h-8 rounded bg-[#81A2A2]/10 border border-[#81A2A2]/40 flex items-center justify-center text-[#81A2A2]">
            <FolderPlus className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#F2F2F2]">Register New Cybercrime Investigation</h3>
            <p className="text-xs text-[#8A9399]">An automated CASE-XXX identifier will be assigned</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-[#8A9399] mb-1 font-medium">Case Title *</label>
            <input
              type="text"
              required
              placeholder="e.g., Operation DarkMirror Bank Trojan Outbreak"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#060606] border border-[#242B30] focus:border-[#81A2A2] rounded p-2 text-[#F2F2F2] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#8A9399] mb-1 font-medium">Crime Type *</label>
              <select
                value={crimeType}
                onChange={(e) => setCrimeType(e.target.value as CrimeType)}
                className="w-full bg-[#060606] border border-[#242B30] focus:border-[#81A2A2] rounded p-2 text-[#F2F2F2] outline-none"
              >
                {CRIME_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[#8A9399] mb-1 font-medium">Priority Level *</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                className="w-full bg-[#060606] border border-[#242B30] focus:border-[#81A2A2] rounded p-2 text-[#F2F2F2] outline-none"
              >
                <option value="CRITICAL">CRITICAL (Immediate Action)</option>
                <option value="HIGH">HIGH (Active Campaign)</option>
                <option value="MEDIUM">MEDIUM (Standard Queue)</option>
                <option value="LOW">LOW (Informational / Closed)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[#8A9399] mb-1 font-medium">Investigation Synopsis & Preliminary Facts *</label>
            <textarea
              required
              rows={3}
              placeholder="Summarize initial victim complaint, financial loss, initial indicators discovered..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#060606] border border-[#242B30] focus:border-[#81A2A2] rounded p-2 text-[#F2F2F2] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#8A9399] mb-1 font-medium">Assigned Officer</label>
              <input
                type="text"
                value={assignedOfficer}
                onChange={(e) => setAssignedOfficer(e.target.value)}
                className="w-full bg-[#060606] border border-[#242B30] focus:border-[#81A2A2] rounded p-2 text-[#F2F2F2] outline-none"
              />
            </div>
            <div>
              <label className="block text-[#8A9399] mb-1 font-medium">Jurisdiction Desk</label>
              <input
                type="text"
                value={jurisdiction}
                onChange={(e) => setJurisdiction(e.target.value)}
                className="w-full bg-[#060606] border border-[#242B30] focus:border-[#81A2A2] rounded p-2 text-[#F2F2F2] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#8A9399] mb-1 font-medium">Tags (Comma-separated)</label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full bg-[#060606] border border-[#242B30] focus:border-[#81A2A2] rounded p-2 text-[#F2F2F2] outline-none font-mono text-[11px]"
            />
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
              className="px-4 py-2 bg-[#81A2A2] hover:bg-[#81A2A2]/90 text-[#060606] font-semibold rounded transition-colors"
            >
              Register & Open Case
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
