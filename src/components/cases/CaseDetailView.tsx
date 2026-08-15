import React, { useState } from 'react';
import { 
  ArrowLeft, 
  FolderArchive, 
  FileText, 
  Layers, 
  Network, 
  Clock, 
  GitBranch, 
  Upload, 
  ShieldAlert,
  CheckCircle2,
  Tag,
  User,
  MapPin,
  Calendar
} from 'lucide-react';
import { useTrace } from '../../context/TraceContext';
import { CaseStatus, PriorityLevel } from '../../types';
import { EvidenceWorkspace } from '../evidence/EvidenceWorkspace';
import { CaseEntitiesTab } from './CaseEntitiesTab';
import { CaseConnectionsTab } from './CaseConnectionsTab';
import { InvestigationGraph } from '../graph/InvestigationGraph';
import { AddEvidenceModal } from '../evidence/AddEvidenceModal';

interface Props {
  caseNumber: string;
}

type TabType = 'overview' | 'evidence' | 'entities' | 'connections' | 'timeline' | 'graph';

export const CaseDetailView: React.FC<Props> = ({ caseNumber }) => {
  const { cases, evidence, entities, connections, timeline, updateCase, setActiveView } = useTrace();

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isAddEvidenceOpen, setIsAddEvidenceOpen] = useState(false);

  const currentCase = cases.find(c => c.case_number === caseNumber || c.id === caseNumber);

  if (!currentCase) {
    return (
      <div className="p-8 text-center bg-[#121619] rounded-lg border border-[#242B30] space-y-4">
        <ShieldAlert className="w-10 h-10 text-[#FF4D4D] mx-auto" />
        <div className="text-base font-bold text-[#F2F2F2]">Case {caseNumber} Not Found</div>
        <button
          onClick={() => setActiveView('cases')}
          className="px-4 py-2 bg-[#81A2A2] text-[#060606] font-semibold text-xs rounded"
        >
          Back to Cases List
        </button>
      </div>
    );
  }

  const caseEvidence = evidence.filter(e => e.case_id === currentCase.case_number);
  const caseEntities = entities.filter(e => e.source_case_id === currentCase.case_number);
  const caseConnections = connections.filter(
    c => (c.case_a === currentCase.case_number || c.case_b === currentCase.case_number) && c.status !== 'DISMISSED'
  );
  const caseTimeline = timeline.filter(t => t.case_id === currentCase.case_number);

  const tabs: { id: TabType; label: string; count?: number; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <FolderArchive className="w-3.5 h-3.5" /> },
    { id: 'evidence', label: 'Evidence Workspace', count: caseEvidence.length, icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'entities', label: 'Entities & Provenance', count: caseEntities.length, icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'connections', label: 'Cross-Case Leads', count: caseConnections.length, icon: <Network className="w-3.5 h-3.5" /> },
    { id: 'graph', label: 'Relationship Graph', icon: <GitBranch className="w-3.5 h-3.5" /> },
    { id: 'timeline', label: 'Timeline', count: caseTimeline.length, icon: <Clock className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setActiveView('cases')}
          className="flex items-center space-x-2 text-xs text-[#8A9399] hover:text-[#F2F2F2] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Cases Repository</span>
        </button>

        <button
          onClick={() => setIsAddEvidenceOpen(true)}
          className="flex items-center space-x-2 px-3 py-1.5 bg-[#81A2A2] hover:bg-[#81A2A2]/90 text-[#060606] font-semibold text-xs rounded transition-colors shadow-sm"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>+ Add Evidence</span>
        </button>
      </div>

      {/* Case Header Card */}
      <div className="p-4 sm:p-6 bg-[#121619] rounded-lg border border-[#242B30] space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm font-bold text-[#81A2A2] bg-[#060606] px-2.5 py-1 rounded border border-[#242B30]">
                {currentCase.case_number}
              </span>

              <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded ${
                currentCase.priority === 'CRITICAL' ? 'bg-[#FF4D4D]/10 text-[#FF4D4D] border border-[#FF4D4D]/30' :
                currentCase.priority === 'HIGH' ? 'bg-[#F5C451]/10 text-[#F5C451] border border-[#F5C451]/30' :
                'bg-[#242B30] text-[#8A9399]'
              }`}>
                {currentCase.priority}
              </span>

              <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-[#242B30] text-[#8A9399]">
                {currentCase.status.replace('_', ' ')}
              </span>

              <span className="text-xs text-[#8A9399] font-medium">
                • {currentCase.crime_type}
              </span>
            </div>

            <h1 className="text-lg sm:text-xl font-bold text-[#F2F2F2]">{currentCase.title}</h1>
          </div>

          {/* Status Controls */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className="text-xs text-[#8A9399]">Update Status:</div>
            <select
              value={currentCase.status}
              onChange={(e) => updateCase(currentCase.case_number, { status: e.target.value as CaseStatus })}
              className="bg-[#060606] border border-[#242B30] focus:border-[#81A2A2] rounded px-3 py-1.5 text-xs text-[#F2F2F2] outline-none"
            >
              <option value="OPEN">OPEN</option>
              <option value="UNDER_INVESTIGATION">UNDER INVESTIGATION</option>
              <option value="PENDING_REVIEW">PENDING REVIEW</option>
              <option value="CLOSED">CLOSED</option>
            </select>
          </div>
        </div>

        {/* Quick Meta Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 pt-3 border-t border-[#242B30]/60 text-xs text-[#8A9399]">
          <div className="flex items-center space-x-1.5">
            <User className="w-3.5 h-3.5 text-[#81A2A2] shrink-0" />
            <span className="truncate">Officer: <strong className="text-[#F2F2F2]">{currentCase.assigned_officer || 'Unassigned'}</strong></span>
          </div>
          <div className="flex items-center space-x-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#81A2A2] shrink-0" />
            <span className="truncate">Unit: <strong className="text-[#F2F2F2]">{currentCase.jurisdiction || 'Metro Cyber Command'}</strong></span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#81A2A2] shrink-0" />
            <span className="truncate">Reg: <strong className="text-[#F2F2F2] font-mono">{currentCase.created_at.substring(0, 10)}</strong></span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Network className="w-3.5 h-3.5 text-[#F5C451] shrink-0" />
            <span className="truncate">Leads: <strong className="text-[#F5C451] font-mono">{caseConnections.length}</strong></span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-[#242B30] flex items-center space-x-2 overflow-x-auto no-scrollbar py-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-medium border-b-2 transition-colors shrink-0 whitespace-nowrap ${
                isActive
                  ? 'border-[#81A2A2] text-[#F2F2F2] bg-[#121619]/40'
                  : 'border-transparent text-[#8A9399] hover:text-[#F2F2F2] hover:bg-[#121619]/20'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                  isActive ? 'bg-[#81A2A2] text-[#060606] font-bold' : 'bg-[#242B30] text-[#8A9399]'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div>
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Description / Synopsis */}
            <div className="p-5 bg-[#121619] rounded-lg border border-[#242B30] space-y-3">
              <h3 className="text-xs font-mono uppercase tracking-wider text-[#8A9399]">
                Investigation Synopsis & Case Facts
              </h3>
              <p className="text-xs text-[#F2F2F2] leading-relaxed">
                {currentCase.description}
              </p>

              {currentCase.tags && currentCase.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-2">
                  <span className="text-[10px] font-mono text-[#5F686E]">Tags:</span>
                  {(currentCase.tags || []).map((t, idx) => (
                    <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#060606] text-[#81A2A2] border border-[#242B30]">
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div 
                onClick={() => setActiveTab('evidence')}
                className="p-4 bg-[#121619] rounded-lg border border-[#242B30] hover:border-[#454F56] transition-all cursor-pointer"
              >
                <div className="text-xs text-[#8A9399]">Evidence Uploads</div>
                <div className="text-2xl font-bold font-mono text-[#F2F2F2] mt-1">{caseEvidence.length}</div>
                <div className="text-[10px] text-[#81A2A2] mt-1">View Evidence Files →</div>
              </div>

              <div 
                onClick={() => setActiveTab('entities')}
                className="p-4 bg-[#121619] rounded-lg border border-[#242B30] hover:border-[#454F56] transition-all cursor-pointer"
              >
                <div className="text-xs text-[#8A9399]">Extracted Indicators</div>
                <div className="text-2xl font-bold font-mono text-[#81A2A2] mt-1">{caseEntities.length}</div>
                <div className="text-[10px] text-[#81A2A2] mt-1">View Provenance →</div>
              </div>

              <div 
                onClick={() => setActiveTab('connections')}
                className="p-4 bg-[#121619] rounded-lg border border-[#242B30] hover:border-[#454F56] transition-all cursor-pointer"
              >
                <div className="text-xs text-[#8A9399]">Cross-Case Leads</div>
                <div className="text-2xl font-bold font-mono text-[#F5C451] mt-1">{caseConnections.length}</div>
                <div className="text-[10px] text-[#F5C451] mt-1">Review Leads →</div>
              </div>
            </div>

            {/* Mini Timeline of Case Events */}
            <div className="p-5 bg-[#121619] rounded-lg border border-[#242B30] space-y-3">
              <h3 className="text-xs font-mono uppercase tracking-wider text-[#8A9399]">
                Chronological Case Activity History
              </h3>

              <div className="space-y-2">
                {(caseTimeline || []).length === 0 ? (
                  <div className="text-xs text-[#5F686E]">No events recorded for this case.</div>
                ) : (
                  (caseTimeline || []).map((ev) => (
                    <div key={ev.id} className="p-3 bg-[#060606] rounded border border-[#242B30] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div>
                        <div className="text-[#F2F2F2]">{ev.description}</div>
                        <div className="text-[10px] font-mono text-[#5F686E]">Actor: {ev.actor || 'System'}</div>
                      </div>
                      <div className="font-mono text-[11px] text-[#8A9399] shrink-0">
                        {ev.event_time.substring(0, 19).replace('T', ' ')}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'evidence' && <EvidenceWorkspace caseId={currentCase.case_number} />}
        {activeTab === 'entities' && <CaseEntitiesTab caseId={currentCase.case_number} />}
        {activeTab === 'connections' && <CaseConnectionsTab caseId={currentCase.case_number} />}
        {activeTab === 'graph' && <InvestigationGraph focusedCaseId={currentCase.case_number} />}
        {activeTab === 'timeline' && (
          <div className="p-5 bg-[#121619] rounded-lg border border-[#242B30] space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#8A9399]">
              Full Case Timeline Ledger ({(caseTimeline || []).length} events)
            </h3>
            <div className="space-y-2.5">
              {(caseTimeline || []).map((ev) => (
                <div key={ev.id} className="p-3 bg-[#060606] rounded border border-[#242B30] text-xs space-y-1">
                  <div className="flex items-center justify-between font-mono text-[11px] text-[#8A9399]">
                    <span className="text-[#81A2A2] font-semibold">{ev.event_type}</span>
                    <span>{ev.event_time.substring(0, 19).replace('T', ' ')}</span>
                  </div>
                  <div className="text-[#F2F2F2]">{ev.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <AddEvidenceModal
        isOpen={isAddEvidenceOpen}
        onClose={() => setIsAddEvidenceOpen(false)}
        caseId={currentCase.case_number}
      />
    </div>
  );
};
