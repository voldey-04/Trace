import React, { useState } from 'react';
import { 
  FolderArchive, 
  FileText, 
  Layers, 
  Network, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Play, 
  ShieldAlert, 
  ExternalLink,
  Clock,
  Sparkles,
  Info,
  Compass,
  ShieldCheck
} from 'lucide-react';
import { useTrace } from '../../context/TraceContext';
import { Connection } from '../../types';
import { GuidedDemoModal } from '../demo/GuidedDemoModal';

export const DashboardView: React.FC = () => {
  const { 
    cases, 
    evidence, 
    entities, 
    connections, 
    timeline, 
    setActiveView, 
    setSelectedCaseId, 
    setSelectedConnectionId,
    runGoldenDemo,
    verifyConnection,
    dismissConnection,
    isProcessing
  } = useTrace();

  const [guidedDemoOpen, setGuidedDemoOpen] = useState(false);

  const processedEvidenceCount = evidence.filter(e => e.processing_status === 'PROCESSED').length;
  const suggestedConnections = connections.filter(c => c.status === 'SUGGESTED');
  const verifiedConnections = connections.filter(c => c.status === 'VERIFIED');
  const highPriorityLeads = connections.filter(c => c.severity === 'HIGH' && c.status !== 'DISMISSED');

  // Distribution by crime type
  const crimeTypeCounts = cases.reduce((acc, c) => {
    acc[c.crime_type] = (acc[c.crime_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner: Primary Intelligence Pipeline & Golden Demo Trigger */}
      <div className="p-5 rounded-lg bg-gradient-to-r from-[#121619] via-[#121619] to-[#1e2429] border border-[#454F56]/60 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#81A2A2] px-2 py-0.5 rounded bg-[#81A2A2]/10 border border-[#81A2A2]/30">
                Core Workflow
              </span>
              <span className="text-xs text-[#8A9399]">Evidence In → Entity Extraction → Normalization → Cross-Case Match</span>
            </div>
            <h2 className="text-lg font-bold text-[#F2F2F2]">
              Cross-Case Cybercrime Relationship Discovery Engine
            </h2>
            <p className="text-xs text-[#8A9399] leading-relaxed">
              TRACE automatically identifies hidden shared indicators (phones, UPI handles, fake domains, bank accounts) across separate FIR complaints. All matches are deterministic and require investigator verification.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setGuidedDemoOpen(true)}
              disabled={isProcessing}
              className="flex items-center space-x-2 px-4 py-2.5 bg-[#81A2A2] hover:bg-[#81A2A2]/90 text-[#060606] font-bold text-xs rounded transition-all shadow-md shadow-[#81A2A2]/20 disabled:opacity-50"
            >
              <Compass className="w-4 h-4 shrink-0" />
              <span>Guided Investigation Demo</span>
            </button>

            <button
              onClick={() => runGoldenDemo()}
              disabled={isProcessing}
              className="flex items-center space-x-2 px-3.5 py-2.5 bg-[#121619] hover:bg-[#242B30] text-[#81A2A2] border border-[#81A2A2]/50 hover:border-[#81A2A2] font-semibold text-xs rounded transition-all disabled:opacity-50"
              title="Fast-forward simulate CASE-008 receiving new evidence"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Simulate CASE-008</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Primary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Registered Cases */}
        <div 
          onClick={() => setActiveView('cases')}
          className="p-4 rounded bg-[#121619] border border-[#242B30] hover:border-[#454F56] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#8A9399] mb-2">
            <span className="text-xs font-medium">Registered Cases</span>
            <FolderArchive className="w-4 h-4 group-hover:text-[#81A2A2] transition-colors" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-[#F2F2F2]">{cases.length}</span>
            <span className="text-[11px] text-[#FF4D4D] font-mono">
              {cases.filter(c => c.priority === 'CRITICAL').length} Critical
            </span>
          </div>
          <p className="text-[11px] text-[#5F686E] mt-1">Across 6 cyber jurisdiction units</p>
        </div>

        {/* Card 2: Processed Evidence */}
        <div 
          onClick={() => setActiveView('cases')}
          className="p-4 rounded bg-[#121619] border border-[#242B30] hover:border-[#454F56] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#8A9399] mb-2">
            <span className="text-xs font-medium">Evidence Ingested</span>
            <FileText className="w-4 h-4 group-hover:text-[#81A2A2] transition-colors" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-[#F2F2F2]">{evidence.length}</span>
            <span className="text-[11px] text-[#B7FF3C] font-mono">
              {processedEvidenceCount}/{evidence.length} Processed
            </span>
          </div>
          <p className="text-[11px] text-[#5F686E] mt-1">Chat logs, CSVs, APK dumps & SMS intercepts</p>
        </div>

        {/* Card 3: Extracted Indicators */}
        <div 
          onClick={() => setActiveView('graph-explorer')}
          className="p-4 rounded bg-[#121619] border border-[#242B30] hover:border-[#454F56] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#8A9399] mb-2">
            <span className="text-xs font-medium">Normalized Indicators</span>
            <Layers className="w-4 h-4 group-hover:text-[#81A2A2] transition-colors" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-[#81A2A2]">{entities.length}</span>
            <span className="text-[11px] text-[#8A9399] font-mono">
              Phones, UPIs, Domains, IPs
            </span>
          </div>
          <p className="text-[11px] text-[#5F686E] mt-1">100% Provenance preserved to source file</p>
        </div>

        {/* Card 4: Potential Relationships */}
        <div 
          onClick={() => setActiveView('connections')}
          className="p-4 rounded bg-[#121619] border border-[#242B30] hover:border-[#454F56] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#8A9399] mb-2">
            <span className="text-xs font-medium">Cross-Case Leads</span>
            <Network className="w-4 h-4 group-hover:text-[#F5C451] transition-colors" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-[#F5C451]">{suggestedConnections.length}</span>
            <span className="text-[11px] text-[#B7FF3C] font-mono">
              {verifiedConnections.length} Verified
            </span>
          </div>
          <p className="text-[11px] text-[#5F686E] mt-1">
            {highPriorityLeads.length} High-confidence lead(s)
          </p>
        </div>
      </div>

      {/* Main Grid: Leads on Left, Activity Ledger on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: High-Priority Cross-Case Relationships (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-[#F2F2F2]">Active Cross-Case Leads</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#121619] text-[#81A2A2] border border-[#242B30]">
                Requires Verification
              </span>
            </div>
            <button
              onClick={() => setActiveView('connections')}
              className="text-xs text-[#81A2A2] hover:underline flex items-center space-x-1"
            >
              <span>View All ({connections.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {(connections || []).slice(0, 4).map((conn) => {
              const caseAObj = (cases || []).find(c => c.case_number === conn.case_a);
              const caseBObj = (cases || []).find(c => c.case_number === conn.case_b);

              return (
                <div
                  key={conn.id}
                  className="p-3 sm:p-4 rounded-lg bg-[#121619] border border-[#242B30] hover:border-[#454F56] transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedCaseId(conn.case_a);
                          setActiveView('case-detail', conn.case_a);
                        }}
                        className="font-mono text-xs font-bold text-[#81A2A2] hover:underline bg-[#060606] px-2 py-0.5 rounded border border-[#242B30]"
                      >
                        {conn.case_a}
                      </button>
                      <span className="text-xs text-[#5F686E] font-mono">↔</span>
                      <button
                        onClick={() => {
                          setSelectedCaseId(conn.case_b);
                          setActiveView('case-detail', conn.case_b);
                        }}
                        className="font-mono text-xs font-bold text-[#81A2A2] hover:underline bg-[#060606] px-2 py-0.5 rounded border border-[#242B30]"
                      >
                        {conn.case_b}
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                        conn.severity === 'HIGH' ? 'bg-[#FF4D4D]/10 text-[#FF4D4D] border border-[#FF4D4D]/30' :
                        conn.severity === 'MEDIUM' ? 'bg-[#F5C451]/10 text-[#F5C451] border border-[#F5C451]/30' :
                        'bg-[#81A2A2]/10 text-[#81A2A2] border border-[#81A2A2]/30'
                      }`}>
                        Score: {conn.score} / {conn.severity}
                      </span>

                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                        conn.status === 'VERIFIED' ? 'bg-[#B7FF3C]/10 text-[#B7FF3C] border border-[#B7FF3C]/30' :
                        conn.status === 'DISMISSED' ? 'bg-[#5F686E]/10 text-[#5F686E] border border-[#5F686E]/30' :
                        'bg-[#F5C451]/10 text-[#F5C451] border border-[#F5C451]/30'
                      }`}>
                        {conn.status}
                      </span>
                    </div>
                  </div>

                  {/* Case Titles */}
                  <div className="text-xs text-[#8A9399] mb-3 line-clamp-2 sm:truncate">
                    <span className="text-[#F2F2F2]">{caseAObj?.title}</span>
                    <span className="mx-1 text-[#5F686E]">•</span>
                    <span className="text-[#F2F2F2]">{caseBObj?.title}</span>
                  </div>

                  {/* Shared Indicators Pill Bar */}
                  <div className="space-y-1 mb-3">
                    <div className="text-[10px] uppercase font-mono tracking-wider text-[#5F686E]">
                      Shared Indicators ({(conn.shared_entities || []).length})
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(conn.shared_entities || []).map((indicator, idx) => (
                        <div
                          key={idx}
                          className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-[#060606] border border-[#242B30] text-[11px] font-mono"
                        >
                          <span className="text-[#81A2A2] font-semibold text-[10px]">{indicator.type}:</span>
                          <span className="text-[#F2F2F2]">{indicator.normalized_value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Action Controls */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-[#242B30]/60 text-xs">
                    <button
                      onClick={() => {
                        setSelectedConnectionId(conn.id);
                        setActiveView('connection-detail', undefined, conn.id);
                      }}
                      className="text-xs text-[#81A2A2] hover:underline flex items-center space-x-1"
                    >
                      <span>Inspect Provenance & Score Math</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>

                    {conn.status === 'SUGGESTED' && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => dismissConnection(conn.id, 'Dismissed from Dashboard review')}
                          className="flex-1 sm:flex-initial px-3 py-1 text-[11px] text-[#8A9399] hover:text-[#FF4D4D] hover:bg-[#FF4D4D]/10 rounded border border-[#242B30] sm:border-transparent hover:border-[#FF4D4D]/30 transition-colors text-center"
                        >
                          Dismiss
                        </button>
                        <button
                          onClick={() => verifyConnection(conn.id, 'Verified from Dashboard review')}
                          className="flex-1 sm:flex-initial px-3 py-1 text-[11px] font-semibold text-[#060606] bg-[#B7FF3C] hover:bg-[#B7FF3C]/90 rounded transition-colors text-center"
                        >
                          Verify Link
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Ingest Ledger & Crime Distribution (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Crime Distribution */}
          <div className="p-4 rounded-lg bg-[#121619] border border-[#242B30] space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#8A9399]">
              Case Distribution by Crime Type
            </h3>
            <div className="space-y-2">
              {Object.entries(crimeTypeCounts).slice(0, 5).map(([type, count]) => {
                const numCount = Number(count) || 0;
                const pct = cases.length > 0 ? Math.round((numCount / cases.length) * 100) : 0;
                return (
                  <div key={type} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#F2F2F2]">{type}</span>
                      <span className="font-mono text-[#8A9399]">{numCount} ({pct}%)</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#060606] overflow-hidden">
                      <div 
                        className="h-full bg-[#81A2A2] rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Real-time Timeline Activity Stream */}
          <div className="p-4 rounded-lg bg-[#121619] border border-[#242B30] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono uppercase tracking-wider text-[#8A9399] flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Investigation Activity Ledger</span>
              </h3>
              <span className="text-[10px] font-mono text-[#5F686E]">Live</span>
            </div>

            <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
              {(timeline || []).slice(0, 7).map((ev) => (
                <div key={ev.id} className="text-xs p-2.5 rounded bg-[#060606]/60 border border-[#242B30] space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#5F686E]">
                    <span className="text-[#81A2A2] font-semibold">{ev.case_id}</span>
                    <span>{ev.event_time.substring(11, 19)}</span>
                  </div>
                  <p className="text-[#F2F2F2] text-xs leading-relaxed">{ev.description}</p>
                  <div className="text-[10px] font-mono text-[#8A9399]">
                    Actor: {ev.actor || 'System'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Guided Demo Modal */}
      <GuidedDemoModal
        isOpen={guidedDemoOpen}
        onClose={() => setGuidedDemoOpen(false)}
      />
    </div>
  );
};
