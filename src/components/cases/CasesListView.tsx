import React, { useState } from 'react';
import { 
  FolderArchive, 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  Layers, 
  Network, 
  ChevronRight,
  ShieldAlert,
  SlidersHorizontal
} from 'lucide-react';
import { useTrace } from '../../context/TraceContext';
import { CaseStatus, CrimeType, PriorityLevel } from '../../types';
import { CreateCaseModal } from './CreateCaseModal';

export const CasesListView: React.FC = () => {
  const { cases, evidence, entities, connections, setActiveView, setSelectedCaseId } = useTrace();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [crimeTypeFilter, setCrimeTypeFilter] = useState<string>('ALL');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const filteredCases = cases.filter((c) => {
    const matchesSearch = 
      c.case_number.toLowerCase().includes(search.toLowerCase()) ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase()) ||
      c.assigned_officer?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || c.priority === priorityFilter;
    const matchesCrime = crimeTypeFilter === 'ALL' || c.crime_type === crimeTypeFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesCrime;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#F2F2F2]">Cases Repository</h2>
          <p className="text-xs text-[#8A9399]">
            Active cybercrime investigations, evidence logs, and cross-case relationship status
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center space-x-2 px-3.5 py-2 bg-[#81A2A2] hover:bg-[#81A2A2]/90 text-[#060606] font-semibold text-xs rounded transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Register Case</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-lg bg-[#121619] border border-[#242B30] space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Text Search */}
          <div className="relative md:col-span-1">
            <Search className="w-4 h-4 text-[#8A9399] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search case #, title, officer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#060606] border border-[#242B30] focus:border-[#81A2A2] rounded pl-9 pr-3 py-1.5 text-xs text-[#F2F2F2] outline-none"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-[#060606] border border-[#242B30] focus:border-[#81A2A2] rounded p-1.5 text-xs text-[#F2F2F2] outline-none"
            >
              <option value="ALL">Status: All Statuses</option>
              <option value="OPEN">OPEN</option>
              <option value="UNDER_INVESTIGATION">UNDER INVESTIGATION</option>
              <option value="PENDING_REVIEW">PENDING REVIEW</option>
              <option value="CLOSED">CLOSED</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full bg-[#060606] border border-[#242B30] focus:border-[#81A2A2] rounded p-1.5 text-xs text-[#F2F2F2] outline-none"
            >
              <option value="ALL">Priority: All Levels</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
          </div>

          {/* Crime Type Filter */}
          <div>
            <select
              value={crimeTypeFilter}
              onChange={(e) => setCrimeTypeFilter(e.target.value)}
              className="w-full bg-[#060606] border border-[#242B30] focus:border-[#81A2A2] rounded p-1.5 text-xs text-[#F2F2F2] outline-none"
            >
              <option value="ALL">Crime Type: All Types</option>
              <option value="Investment Scam">Investment Scam</option>
              <option value="Phishing Campaign">Phishing Campaign</option>
              <option value="Identity Theft">Identity Theft</option>
              <option value="Bank Impersonation">Bank Impersonation</option>
              <option value="UPI Scam">UPI Scam</option>
              <option value="Loan App Harassment">Loan App Harassment</option>
              <option value="Smishing / SMS Spoofing">Smishing / SMS Spoofing</option>
              <option value="Job Task Fraud">Job Task Fraud</option>
              <option value="Crypto Drainer">Crypto Drainer</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-[#8A9399] pt-1">
          <span>Showing {filteredCases.length} of {cases.length} investigations</span>
          {(search || statusFilter !== 'ALL' || priorityFilter !== 'ALL' || crimeTypeFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearch('');
                setStatusFilter('ALL');
                setPriorityFilter('ALL');
                setCrimeTypeFilter('ALL');
              }}
              className="text-[#81A2A2] hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Cases List */}
      <div className="space-y-3">
        {filteredCases.map((c) => {
          const caseEv = evidence.filter(e => e.case_id === c.case_number || e.case_id === c.id);
          const caseEnt = entities.filter(e => e.source_case_id === c.case_number || e.source_case_id === c.id);
          const caseConn = connections.filter(conn => (conn.case_a === c.case_number || conn.case_b === c.case_number) && conn.status !== 'DISMISSED');

          const verifiedConnCount = caseConn.filter(conn => conn.status === 'VERIFIED').length;
          const suggestedConnCount = caseConn.filter(conn => conn.status === 'SUGGESTED').length;

          return (
            <div
              key={c.id}
              onClick={() => {
                setSelectedCaseId(c.case_number);
                setActiveView('case-detail', c.case_number);
              }}
              className="p-4 rounded-lg bg-[#121619] border border-[#242B30] hover:border-[#454F56] transition-all cursor-pointer group"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Left: Identifiers & Description */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#81A2A2] bg-[#060606] px-2 py-0.5 rounded border border-[#242B30]">
                      {c.case_number}
                    </span>

                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      c.priority === 'CRITICAL' ? 'bg-[#FF4D4D]/10 text-[#FF4D4D] border border-[#FF4D4D]/30' :
                      c.priority === 'HIGH' ? 'bg-[#F5C451]/10 text-[#F5C451] border border-[#F5C451]/30' :
                      'bg-[#242B30] text-[#8A9399]'
                    }`}>
                      {c.priority}
                    </span>

                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#242B30] text-[#8A9399]">
                      {c.status.replace('_', ' ')}
                    </span>

                    <span className="text-[11px] text-[#8A9399] font-medium">
                      • {c.crime_type}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-[#F2F2F2] group-hover:text-[#81A2A2] transition-colors">
                    {c.title}
                  </h3>

                  <p className="text-xs text-[#8A9399] line-clamp-2 leading-relaxed">
                    {c.description}
                  </p>

                  {/* Tags */}
                  {c.tags && c.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {(c.tags || []).map((tag, i) => (
                        <span key={i} className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#060606] text-[#5F686E] border border-[#242B30]">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right: Metrics & Linkage */}
                <div className="flex items-center justify-between sm:justify-start space-x-2 sm:space-x-4 border-t lg:border-t-0 pt-3 lg:pt-0 border-[#242B30] shrink-0">
                  <div className="flex-1 sm:flex-initial text-center px-2 sm:px-3 py-1 bg-[#060606] rounded border border-[#242B30]">
                    <div className="text-[10px] font-mono text-[#5F686E]">Evidence</div>
                    <div className="text-xs font-mono font-bold text-[#F2F2F2]">{caseEv.length}</div>
                  </div>

                  <div className="flex-1 sm:flex-initial text-center px-2 sm:px-3 py-1 bg-[#060606] rounded border border-[#242B30]">
                    <div className="text-[10px] font-mono text-[#5F686E]">Entities</div>
                    <div className="text-xs font-mono font-bold text-[#81A2A2]">{caseEnt.length}</div>
                  </div>

                  <div className="flex-1 sm:flex-initial text-center px-2 sm:px-3 py-1 bg-[#060606] rounded border border-[#242B30]">
                    <div className="text-[10px] font-mono text-[#5F686E]">Cross-Links</div>
                    <div className="text-xs font-mono font-bold text-[#F5C451]">
                      {suggestedConnCount + verifiedConnCount}
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-[#5F686E] group-hover:text-[#81A2A2] transition-colors shrink-0" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <CreateCaseModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </div>
  );
};
