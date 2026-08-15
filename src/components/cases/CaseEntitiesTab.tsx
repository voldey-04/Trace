import React, { useState } from 'react';
import { Layers, Search, Filter, ExternalLink, Link2, FileText, CheckCircle2 } from 'lucide-react';
import { Entity, EntityType } from '../../types';
import { useTrace } from '../../context/TraceContext';

interface Props {
  caseId: string;
}

export const CaseEntitiesTab: React.FC<Props> = ({ caseId }) => {
  const { entities, evidence, cases, setActiveView, setSelectedCaseId } = useTrace();

  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  const caseEntities = entities.filter(e => e.source_case_id === caseId);

  // Group or check cross-case matches for each entity
  const getOtherCasesWithIndicator = (ent: Entity) => {
    const matching = entities.filter(
      other => other.source_case_id !== caseId && 
               other.type === ent.type && 
               other.normalized_value === ent.normalized_value
    );
    const uniqueCaseIds = Array.from(new Set(matching.map(m => m.source_case_id)));
    return uniqueCaseIds;
  };

  const filteredEntities = caseEntities.filter(e => {
    const matchesType = typeFilter === 'ALL' || e.type === typeFilter;
    const matchesSearch = 
      e.value.toLowerCase().includes(search.toLowerCase()) ||
      e.normalized_value.toLowerCase().includes(search.toLowerCase()) ||
      e.type.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="p-4 bg-[#121619] rounded-lg border border-[#242B30] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-2 w-full sm:w-auto flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#8A9399]" />
          <input
            type="text"
            placeholder="Search indicators by value, type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#060606] border border-[#242B30] focus:border-[#81A2A2] rounded px-3 py-1.5 text-xs text-[#F2F2F2] outline-none font-mono"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full sm:w-auto bg-[#060606] border border-[#242B30] focus:border-[#81A2A2] rounded p-1.5 text-xs text-[#F2F2F2] outline-none"
          >
            <option value="ALL">All Indicator Types ({caseEntities.length})</option>
            <option value="PHONE">PHONE</option>
            <option value="UPI">UPI</option>
            <option value="EMAIL">EMAIL</option>
            <option value="WEBSITE">WEBSITE / DOMAIN</option>
            <option value="TRANSACTION">TRANSACTION / UTR</option>
            <option value="ACCOUNT">ACCOUNT NUMBER</option>
            <option value="IP_ADDRESS">IP ADDRESS</option>
            <option value="USERNAME">USERNAME</option>
            <option value="AMOUNT">AMOUNT</option>
          </select>
        </div>
      </div>

      {/* Entities Table */}
      {filteredEntities.length === 0 ? (
        <div className="p-8 text-center bg-[#121619] rounded-lg border border-[#242B30] space-y-2">
          <Layers className="w-8 h-8 text-[#5F686E] mx-auto" />
          <div className="text-xs text-[#8A9399]">No indicators matched the selected filter.</div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEntities.map((ent) => {
            const ev = evidence.find(e => e.id === ent.source_evidence_id);
            const otherCases = getOtherCasesWithIndicator(ent);

            return (
              <div
                key={ent.id}
                className="p-4 rounded-lg bg-[#121619] border border-[#242B30] hover:border-[#454F56] transition-all space-y-2"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2.5">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#060606] text-[#81A2A2] border border-[#81A2A2]/40">
                      {ent.type}
                    </span>
                    <span className="font-mono text-xs font-bold text-[#F2F2F2]">{ent.value}</span>
                    <span className="text-[11px] font-mono text-[#5F686E]">
                      (norm: <span className="text-[#8A9399]">{ent.normalized_value}</span>)
                    </span>
                  </div>

                  {/* Cross-case link flag */}
                  {otherCases.length > 0 ? (
                    <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-[#F5C451]/10 border border-[#F5C451]/30 text-xs">
                      <Link2 className="w-3.5 h-3.5 text-[#F5C451]" />
                      <span className="text-[11px] text-[#F5C451] font-semibold">Shared in:</span>
                      {otherCases.map((cNum) => (
                        <button
                          key={cNum}
                          onClick={() => {
                            setSelectedCaseId(cNum);
                            setActiveView('case-detail', cNum);
                          }}
                          className="font-mono text-[10px] text-[#F2F2F2] bg-[#060606] hover:bg-[#242B30] px-1.5 py-0.2 rounded border border-[#454F56]/40 underline"
                        >
                          {cNum}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[10px] font-mono text-[#5F686E]">Unique to this case</span>
                  )}
                </div>

                {/* Provenance Details */}
                <div className="pt-2 border-t border-[#242B30]/60 grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs">
                  <div className="sm:col-span-4 flex items-center space-x-1.5 text-[#8A9399] font-mono text-[11px]">
                    <FileText className="w-3.5 h-3.5 text-[#81A2A2] shrink-0" />
                    <span className="truncate">Source: {ev?.file_name || ent.source_evidence_id}</span>
                  </div>

                  <div className="sm:col-span-8 text-[#8A9399] italic font-mono text-[11px] bg-[#060606] p-2 rounded border border-[#242B30]">
                    "{ent.source_context || 'Extracted from primary evidence payload'}"
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
