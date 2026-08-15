import React from 'react';
import { LayoutDashboard, FolderArchive, Network, GitBranch, Terminal } from 'lucide-react';
import { useTrace } from '../../context/TraceContext';
import { ActiveView } from '../../types';

export const MobileBottomNav: React.FC = () => {
  const { activeView, setActiveView, connections } = useTrace();

  const suggestedCount = (connections || []).filter(c => c.status === 'SUGGESTED').length;

  const items: { id: ActiveView; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'dashboard',
      label: 'Overview',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'cases',
      label: 'Cases',
      icon: <FolderArchive className="w-4 h-4" />,
    },
    {
      id: 'connections',
      label: 'Leads',
      icon: <Network className="w-4 h-4" />,
      badge: suggestedCount > 0 ? suggestedCount : undefined,
    },
    {
      id: 'graph-explorer',
      label: 'Graph',
      icon: <GitBranch className="w-4 h-4" />,
    },
    {
      id: 'terminal',
      label: 'CLI',
      icon: <Terminal className="w-4 h-4" />,
    },
  ];

  return (
    <nav 
      aria-label="Mobile Navigation Bar"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#060606]/95 backdrop-blur-md border-t border-[#242B30] px-2 py-1.5 flex items-center justify-around"
    >
      {items.map((item) => {
        const isActive = activeView === item.id ||
          (item.id === 'cases' && activeView === 'case-detail') ||
          (item.id === 'connections' && activeView === 'connection-detail');

        return (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`flex flex-col items-center justify-center min-w-[56px] py-1 px-2 rounded-lg transition-all relative ${
              isActive 
                ? 'text-[#81A2A2] font-semibold' 
                : 'text-[#8A9399] hover:text-[#F2F2F2]'
            }`}
          >
            <div className="relative">
              {item.icon}
              {item.badge !== undefined && (
                <span className="absolute -top-1 -right-2 bg-[#F5C451] text-[#060606] text-[9px] font-mono font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-mono">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
