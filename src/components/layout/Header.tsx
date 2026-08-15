import React from 'react';
import { 
  Shield, 
  Search, 
  RotateCcw, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  Activity,
  Terminal,
  Layers
} from 'lucide-react';
import { useTrace } from '../../context/TraceContext';

export const Header: React.FC = () => {
  const { 
    searchQuery, 
    setSearchQuery, 
    cases, 
    connections, 
    runGoldenDemo, 
    resetToSeedData, 
    isProcessing,
    setActiveView 
  } = useTrace();

  const suggestedCount = connections.filter(c => c.status === 'SUGGESTED').length;
  const highRiskCount = connections.filter(c => c.severity === 'HIGH' && c.status !== 'DISMISSED').length;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setActiveView('terminal');
  };

  return (
    <header className="h-16 border-b border-[#242B30] bg-[#060606]/95 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Brand & Identity */}
      <div className="flex items-center space-x-4">
        <button 
          onClick={() => setActiveView('dashboard')}
          className="flex items-center space-x-3 text-left group"
        >
          <div className="w-9 h-9 rounded bg-[#121619] border border-[#454F56]/60 flex items-center justify-center text-[#81A2A2] group-hover:border-[#81A2A2] transition-colors">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-base font-bold tracking-wider text-[#F2F2F2]">TRACE</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#B7FF3C] animate-pulse" title="System Online" />
              <span className="text-[10px] uppercase font-mono tracking-widest px-1.5 py-0.5 rounded bg-[#242B30] text-[#81A2A2] border border-[#454F56]/40">
                MVP
              </span>
            </div>
            <p className="text-[11px] text-[#8A9399] tracking-tight">Evidence Intelligence & Cross-Case Platform</p>
          </div>
        </button>
      </div>

      {/* Global Indicator & Query Search Bar */}
      <div className="hidden md:flex items-center flex-1 max-w-lg mx-8">
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <Search className="w-4 h-4 text-[#8A9399] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search indicators (e.g. 9000011111, support@upi.test, CASE-001)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#121619] border border-[#242B30] focus:border-[#81A2A2] rounded-md pl-10 pr-20 py-1.5 text-xs text-[#F2F2F2] placeholder-[#5F686E] font-mono outline-none transition-colors"
          />
          <button 
            type="button" 
            onClick={() => setActiveView('terminal')} 
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-[#81A2A2] bg-[#242B30] px-1.5 py-0.5 rounded border border-[#454F56]/40 hover:bg-[#454F56]/40"
          >
            CLI ⏎
          </button>
        </form>
      </div>

      {/* Telemetry Stats & Rapid Demonstration Actions */}
      <div className="flex items-center space-x-3">
        {/* Golden Demo Quick Action */}
        <button
          onClick={() => runGoldenDemo()}
          disabled={isProcessing}
          className="flex items-center space-x-2 px-3 py-1.5 bg-[#81A2A2]/10 hover:bg-[#81A2A2]/20 text-[#81A2A2] border border-[#81A2A2]/50 hover:border-[#81A2A2] rounded text-xs font-semibold tracking-wide transition-all disabled:opacity-50"
          title="Simulate CASE-008 receiving new evidence and automatically discovering relationships with CASE-001 & CASE-002"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span className="hidden sm:inline">Run Golden Demo (CASE-008)</span>
          <span className="sm:hidden">Golden Demo</span>
        </button>

        {/* High Risk Leads Pill */}
        <button
          onClick={() => setActiveView('connections')}
          className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded bg-[#121619] border border-[#242B30] hover:border-[#454F56] text-xs transition-colors"
          title="Active Potential Cross-Case Relationships"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-[#F5C451]" />
          <span className="text-[#8A9399]">Leads:</span>
          <span className="font-mono font-bold text-[#F5C451]">{suggestedCount}</span>
        </button>

        {/* Reset Seed Data */}
        <button
          onClick={() => {
            if (confirm('Reset investigation database to deterministic demo state?')) {
              resetToSeedData();
            }
          }}
          className="p-1.5 text-[#8A9399] hover:text-[#F2F2F2] hover:bg-[#242B30] rounded border border-transparent hover:border-[#454F56] transition-colors"
          title="Reset Demo Dataset"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
