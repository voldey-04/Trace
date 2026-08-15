import React, { useState } from 'react';
import { 
  Network, 
  Search, 
  Filter, 
  ShieldCheck, 
  XCircle, 
  ExternalLink, 
  AlertTriangle, 
  Layers,
  ArrowRight,
  Info
} from 'lucide-react';
import { useTrace } from '../../context/TraceContext';
import { Connection, ConnectionSeverity, ConnectionStatus } from '../../types';
import { ConnectionDetailModal } from './ConnectionDetailModal';

export const ConnectionsView: React.FC = () => {
  const { connections, cases, verifyConnection, dismissConnection, setActiveView, setSelectedCaseId } = useTrace();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null);

  const filteredConnections = connections.filter((conn) => {
    const matchesSearch = 
      conn.case_a.toLowerCase().includes(search.toLowerCase()) ||
      conn.case_b.toLowerCase().includes(search.toLowerCase()) ||
      conn.reason.toLowerCase().includes(search.toLowerCase()) ||
      conn.shared_entities.some(s => 
        s.value.toLowerCase().includes(search.toLowerCase()) ||
        s.normalized_value.toLowerCase().includes(search.toLowerCase()) ||
        s.type.toLowerCase().includes(search.toLowerCase())
      );

    const matchesStatus = statusFilter === 'ALL' || conn.status === statusFilter;
    const matchesSeverity = severityFilter === 'ALL' || conn.severity === severityFilter;

    return matchesSearch && matchesStatus && matchesSeverity;
  });

  const suggestedCount = connections.filter(c => c.status === 'SUGGESTED').length;
  const verifiedCount = connections.filter(c => c.status === 'VERIFIED').length;
  const dismissedCount = connections.filter(c => c.status === 'DISMISSED').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#F2F2F2]">Cross-Case Investigation Leads</h2>
          <p className="text-xs text-[#8A9399]">
            Relationships discovered across independent cybercrime complaints via normalized shared indicators
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded bg-[#F5C451]/10 text-[#F5C451] border border-[#F5C451]/30">
            {suggestedCount} Suggested
          </span>
          <span className="px-2.5 py-1 rounded bg-[#B7FF3C]/10 text-[#B7FF3C] border border-[#B7FF3C]/30">
            {verifiedCount} Verified
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 bg-[#121619] rounded-lg border border-[#242B30] space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#8A9399] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search case #, indicator (e.g. 9000011111)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#060606] border border-[#242B30] focus:border-[#81A2A2] rounded pl-9 pr-3 py-1.5 text-xs text-[#F2F2F2] outline-none font-mono"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-[#060606] border border-[#242B30] focus:border-[#81A2A2] rounded p-1.5 text-xs text-[#F2F2F2] outline-none font-mono"
            >
              <option value="ALL">Status: All Leads ({connections.length})</option>
              <option value="SUGGESTED">SUGGESTED ({suggestedCount})</option>
              <option value="VERIFIED">VERIFIED ({verifiedCount})</option>
              <option value="DISMISSED">DISMISSED ({dismissedCount})</option>
            </select>
          </div>

          {/* Severity Filter */}
          <div>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full bg-[#060606] border border-[#242B30] focus:border-[#81A2A2] rounded p-1.5 text-xs text-[#F2F2F2] outline-none font-mono"
            >
              <option value="ALL">Severity: All Scores</option>
              <option value="HIGH">HIGH (Score 80–100)</option>
              <option value="MEDIUM">MEDIUM (Score 50–79)</option>
              <option value="LOW">LOW (Score 20–49)</option>
              <option value="INFORMATIONAL">INFORMATIONAL (Score &lt;20)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-[#8A9399]">
          <span>Displaying {filteredConnections.length} investigative lead(s)</span>
          {(search || statusFilter !== 'ALL' || severityFilter !== 'ALL') && (
            <button
              onClick={() => { setSearch(''); setStatusFilter('ALL'); setSeverityFilter('ALL'); }}
              className="text-[#81A2A2] hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Leads List */}
      {filteredConnections.length === 0 ? (
        <div className="p-8 text-center bg-[#121619] rounded-lg border border-[#242B30] space-y-2">
          <Network className="w-8 h-8 text-[#5F686E] mx-auto" />
          <div className="text-xs text-[#8A9399]">No relationships match the selected filter query.</div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredConnections.map((conn) => {
            const caseA = cases.find(c => c.case_number === conn.case_a);
            const caseB = cases.find(c => c.case_number === conn.case_b);

            return (
              <div
                key={conn.id}
                className="p-5 rounded-lg bg-[#121619] border border-[#242B30] hover:border-[#454F56] transition-all space-y-4"
              >
                {/* Top Row: Case Numbers, Score & Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedCaseId(conn.case_a);
                          setActiveView('case-detail', conn.case_a);
                        }}
                        className="font-mono text-xs font-bold text-[#81A2A2] hover:underline bg-[#060606] px-2.5 py-1 rounded border border-[#242B30]"
                      >
                        {conn.case_a}
                      </button>
                      <span className="text-xs text-[#5F686E] font-mono">↔</span>
                      <button
                        onClick={() => {
                          setSelectedCaseId(conn.case_b);
                          setActiveView('case-detail', conn.case_b);
                        }}
                        className="font-mono text-xs font-bold text-[#81A2A2] hover:underline bg-[#060606] px-2.5 py-1 rounded border border-[#242B30]"
                      >
                        {conn.case_b}
                      </button>
                    </div>

                    <div className="text-xs text-[#8A9399] truncate hidden md:block max-w-sm">
                      <span>{caseA?.title}</span> • <span>{caseB?.title}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded ${
                      conn.severity === 'HIGH' ? 'bg-[#FF4D4D]/10 text-[#FF4D4D] border border-[#FF4D4D]/30' :
                      conn.severity === 'MEDIUM' ? 'bg-[#F5C451]/10 text-[#F5C451] border border-[#F5C451]/30' :
                      'bg-[#81A2A2]/10 text-[#81A2A2] border border-[#81A2A2]/30'
                    }`}>
                      Score: {conn.score} / {conn.severity}
                    </span>

                    <span className={`text-[11px] font-mono px-2.5 py-0.5 rounded font-bold ${
                      conn.status === 'VERIFIED' ? 'bg-[#B7FF3C]/10 text-[#B7FF3C] border border-[#B7FF3C]/30' :
                      conn.status === 'DISMISSED' ? 'bg-[#5F686E]/10 text-[#5F686E] border border-[#5F686E]/30' :
                      'bg-[#F5C451]/10 text-[#F5C451] border border-[#F5C451]/30'
                    }`}>
                      {conn.status}
                    </span>
                  </div>
                </div>

                {/* Shared Indicators Grid */}
                <div className="space-y-2">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#5F686E]">
                    Identified Shared Indicators ({(conn.shared_entities || []).length}):
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {(conn.shared_entities || []).map((ind, idx) => (
                      <div key={idx} className="p-2.5 bg-[#060606] rounded border border-[#242B30] text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#121619] text-[#81A2A2] border border-[#81A2A2]/30">
                            {ind.type}
                          </span>
                          <span className="font-mono text-xs font-bold text-[#F2F2F2] truncate max-w-[160px]">{ind.normalized_value}</span>
                        </div>
                        <div className="text-[10px] font-mono text-[#8A9399] truncate">
                          {ind.source_evidence_a_name} ↔ {ind.source_evidence_b_name}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Score Calculation Summary */}
                {conn.breakdown && conn.breakdown.length > 0 && (
                  <div className="p-2.5 bg-[#060606]/60 rounded border border-[#242B30] text-xs flex flex-wrap items-center gap-3 text-[11px] font-mono">
                    <span className="text-[#5F686E] uppercase text-[10px]">Score Math:</span>
                    {(conn.breakdown || []).map((item, i) => (
                      <span key={i} className="text-[#8A9399]">
                        {item.label} <strong className="text-[#81A2A2]">+{item.points}</strong>
                      </span>
                    ))}
                    <span className="text-[#F2F2F2] font-bold">Total: {conn.score}/100</span>
                  </div>
                )}

                {/* Footer Controls */}
                <div className="pt-2 border-t border-[#242B30] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <button
                    onClick={() => setSelectedConnection(conn)}
                    className="text-xs text-[#81A2A2] hover:underline flex items-center space-x-1"
                  >
                    <span>Inspect Dual Provenance & Investigator Review</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>

                  <div className="flex items-center space-x-2">
                    {conn.status === 'SUGGESTED' && (
                      <>
                        <button
                          onClick={() => dismissConnection(conn.id)}
                          className="px-3 py-1.5 text-xs text-[#8A9399] hover:text-[#FF4D4D] hover:bg-[#FF4D4D]/10 rounded border border-[#242B30] hover:border-[#FF4D4D]/30 transition-colors"
                        >
                          Dismiss Lead
                        </button>
                        <button
                          onClick={() => verifyConnection(conn.id)}
                          className="px-3.5 py-1.5 bg-[#B7FF3C] hover:bg-[#B7FF3C]/90 text-[#060606] font-semibold rounded text-xs transition-colors flex items-center space-x-1"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Verify Connection</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConnectionDetailModal
        connection={selectedConnection}
        isOpen={!!selectedConnection}
        onClose={() => setSelectedConnection(null)}
      />
    </div>
  );
};
