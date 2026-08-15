import React from 'react';
import { 
  LayoutDashboard, 
  FolderArchive, 
  Network, 
  GitBranch, 
  Terminal, 
  Info,
  X
} from 'lucide-react';
import { useTrace } from '../../context/TraceContext';
import { ActiveView } from '../../types';

export const Sidebar: React.FC = () => {
  const { activeView, setActiveView, connections, cases, mobileMenuOpen, setMobileMenuOpen } = useTrace();

  const suggestedCount = (connections || []).filter(c => c.status === 'SUGGESTED').length;
  const verifiedCount = (connections || []).filter(c => c.status === 'VERIFIED').length;

  const navItems: { id: ActiveView; label: string; icon: React.ReactNode; badge?: string | number; badgeColor?: string }[] = [
    {
      id: 'dashboard',
      label: 'Investigation Overview',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'cases',
      label: 'Cases Repository',
      icon: <FolderArchive className="w-4 h-4" />,
      badge: (cases || []).length,
      badgeColor: 'bg-[#242B30] text-[#8A9399]',
    },
    {
      id: 'connections',
      label: 'Cross-Case Leads',
      icon: <Network className="w-4 h-4" />,
      badge: suggestedCount > 0 ? `${suggestedCount} New` : undefined,
      badgeColor: 'bg-[#F5C451]/20 text-[#F5C451] border border-[#F5C451]/40',
    },
    {
      id: 'graph-explorer',
      label: 'Intelligence Graph',
      icon: <GitBranch className="w-4 h-4" />,
    },
    {
      id: 'terminal',
      label: 'Investigative CLI',
      icon: <Terminal className="w-4 h-4" />,
      badge: 'PROMPT',
      badgeColor: 'bg-[#81A2A2]/10 text-[#81A2A2] border border-[#81A2A2]/30',
    },
  ];

  const renderNavContent = () => (
    <div className="flex flex-col justify-between h-full p-4">
      <div className="space-y-6">
        {/* Section: Main Navigation */}
        <div>
          <div className="text-[10px] font-mono tracking-widest text-[#5F686E] uppercase px-3 mb-2">
            Investigation Modules
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = activeView === item.id || 
                (item.id === 'cases' && activeView === 'case-detail') ||
                (item.id === 'connections' && activeView === 'connection-detail');

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveView(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#121619] text-[#F2F2F2] border border-[#81A2A2]/60 shadow-sm'
                      : 'text-[#8A9399] hover:text-[#F2F2F2] hover:bg-[#121619]/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className={isActive ? 'text-[#81A2A2]' : 'text-[#8A9399]'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Section: Quick Intelligence Summary */}
        <div className="p-3 bg-[#121619] rounded border border-[#242B30]">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#8A9399] mb-2 flex items-center justify-between">
            <span>Verified Intelligence</span>
            <span className="w-2 h-2 rounded-full bg-[#B7FF3C]" />
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center text-[#8A9399]">
              <span>Confirmed Links</span>
              <span className="font-mono font-bold text-[#B7FF3C]">{verifiedCount}</span>
            </div>
            <div className="flex justify-between items-center text-[#8A9399]">
              <span>Pending Review</span>
              <span className="font-mono font-bold text-[#F5C451]">{suggestedCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Operational Notice */}
      <div className="pt-4 border-t border-[#242B30]">
        <div className="p-3 rounded bg-[#121619]/80 border border-[#242B30] text-[11px] text-[#8A9399] space-y-1.5 leading-relaxed">
          <div className="flex items-center space-x-1.5 text-[#81A2A2] font-semibold text-[10px] font-mono uppercase tracking-wider">
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span>Operational Notice</span>
          </div>
          <p className="text-[10px] text-[#5F686E] leading-normal">
            TRACE assists human investigators in uncovering cross-case indicators. TRACE does not determine guilt, track people, or access live banks. All demo data is synthetic.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex w-64 border-r border-[#242B30] bg-[#060606] flex-col shrink-0 min-h-[calc(100vh-4rem)]">
        {renderNavContent()}
      </aside>

      {/* Mobile Slide-Over Drawer with Backdrop */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div 
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer Panel */}
          <div className="relative w-72 max-w-[80vw] bg-[#060606] border-r border-[#242B30] h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between p-4 border-b border-[#242B30]">
              <span className="text-xs font-mono font-bold tracking-wider text-[#F2F2F2]">NAVIGATION</span>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 text-[#8A9399] hover:text-[#F2F2F2] rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {renderNavContent()}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
