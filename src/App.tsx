import React from 'react';
import { TraceProvider, useTrace } from './context/TraceContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { DashboardView } from './components/dashboard/DashboardView';
import { CasesListView } from './components/cases/CasesListView';
import { CaseDetailView } from './components/cases/CaseDetailView';
import { ConnectionsView } from './components/connections/ConnectionsView';
import { InvestigationGraph } from './components/graph/InvestigationGraph';
import { TerminalView } from './components/terminal/TerminalView';

const MainContent: React.FC = () => {
  const { activeView, selectedCaseId } = useTrace();

  return (
    <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 pb-20 md:pb-6 bg-[#060606]">
      <div className="max-w-7xl mx-auto">
        {activeView === 'dashboard' && <DashboardView />}
        {activeView === 'cases' && <CasesListView />}
        {activeView === 'case-detail' && (
          <CaseDetailView caseNumber={selectedCaseId || 'CASE-008'} />
        )}
        {(activeView === 'connections' || activeView === 'connection-detail') && (
          <ConnectionsView />
        )}
        {(activeView === 'graph-explorer' || (activeView as string) === 'graph') && <InvestigationGraph />}
        {activeView === 'terminal' && <TerminalView />}
      </div>
    </main>
  );
};

export default function App() {
  return (
    <TraceProvider>
      <div className="flex h-screen bg-[#060606] text-[#F2F2F2] flex-col overflow-hidden select-none font-sans">
        <Header />
        <div className="flex flex-1 overflow-hidden relative">
          <Sidebar />
          <MainContent />
        </div>
        <MobileBottomNav />
      </div>
    </TraceProvider>
  );
}
