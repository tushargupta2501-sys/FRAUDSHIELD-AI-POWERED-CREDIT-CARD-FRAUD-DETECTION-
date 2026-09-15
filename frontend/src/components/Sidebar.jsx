import React from 'react';
import {
  LayoutDashboard,
  Zap,
  Search,
  AlertTriangle,
  Users,
  Sliders,
  BarChart3,
  Cpu,
  Settings,
  ShieldCheck,
  LogOut,
  FileCheck,
} from 'lucide-react';

export const Sidebar = ({ activePage, setActivePage, currentUser, onLogout, isCollapsed, setIsCollapsed }) => {
  const navItems = [
    { id: 'admin', label: 'Dashboard', icon: LayoutDashboard, category: 'OVERVIEW' },
    { id: 'simulator', label: 'Transaction Simulator', icon: Zap, category: 'OPERATIONS', badge: 'Active' },
    { id: 'investigation', label: 'Investigations', icon: Search, category: 'OPERATIONS', count: 14 },
    { id: 'alerts', label: 'Alerts', icon: AlertTriangle, category: 'OPERATIONS', badge: 'LIVE', badgeType: 'block' },
    { id: 'customers', label: 'Customers', icon: Users, category: 'INTELLIGENCE' },
    { id: 'rules', label: 'Rules Manager', icon: Sliders, category: 'ENGINE', count: 5 },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, category: 'ENGINE' },
    { id: 'monitoring', label: 'System Monitoring', icon: Cpu, category: 'SYSTEM', badge: '99.99%' },
    { id: 'architecture', label: 'Architecture', icon: FileCheck, category: 'SYSTEM' },
    { id: 'settings', label: 'Settings', icon: Settings, category: 'SYSTEM' },
  ];

  const categories = ['OVERVIEW', 'OPERATIONS', 'INTELLIGENCE', 'ENGINE', 'SYSTEM'];

  return (
    <aside className={`fixed top-0 left-0 bottom-0 z-40 bg-[#14171C] border-r border-[#262B33] flex flex-col transition-all duration-150 ${
      isCollapsed ? 'w-20' : 'w-72'
    }`}>
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-[#262B33]">
        <div 
          onClick={() => setActivePage('admin')}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="p-2 rounded-[6px] bg-[#F5A623] text-[#0B0D10] font-bold group-hover:bg-[#E0961A] transition-colors duration-150">
            <ShieldCheck className="w-5 h-5" />
          </div>
          {!isCollapsed && (
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base font-semibold tracking-tight text-[#E8EAED] font-mono">
                  Sentinel<span className="text-[#F5A623]">AI</span>
                </span>
                <span className="px-1.5 py-0.5 text-[11px] font-mono font-semibold rounded-full bg-[rgba(245,166,35,0.15)] text-[#F5A623]">
                  ENT
                </span>
              </div>
              <p className="text-[11px] text-[#9AA1AC] font-normal tracking-[0.06em] uppercase">Risk Platform</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        {categories.map((cat) => {
          const catItems = navItems.filter((item) => item.category === cat);
          if (catItems.length === 0) return null;

          return (
            <div key={cat} className="space-y-1">
              {!isCollapsed && (
                <div className="px-3 text-[11px] font-mono font-semibold text-[#5C6470] uppercase tracking-[0.06em] mb-1.5">
                  {cat}
                </div>
              )}

              {catItems.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id || (item.id === 'alerts' && activePage === 'investigation');

                return (
                  <button
                    key={item.id}
                    onClick={() => setActivePage(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-medium transition-all duration-150 rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/40 focus:ring-offset-2 focus:ring-offset-[#0B0D10] ${
                      isActive
                        ? 'bg-[#1B1F26] text-[#E8EAED] border-l-2 border-l-[#F5A623] font-semibold'
                        : 'text-[#9AA1AC] hover:text-[#E8EAED] hover:bg-[#1B1F26] hover:border-l-2 hover:border-l-[#3A4149]'
                    }`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#F5A623]' : 'text-[#9AA1AC]'}`} />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </div>

                    {!isCollapsed && (
                      <div className="flex items-center space-x-1.5">
                        {item.count && (
                          <span className="px-2 py-0.5 text-[11px] font-mono font-semibold rounded-full bg-[#1B1F26] text-[#9AA1AC] border border-[#262B33]">
                            {item.count}
                          </span>
                        )}
                        {item.badge && (
                          <span className={`px-2 py-0.5 text-[11px] font-mono font-semibold rounded-full ${
                            item.badgeType === 'block'
                              ? 'bg-[rgba(229,72,77,0.15)] text-[#E5484D]'
                              : 'bg-[rgba(245,166,35,0.15)] text-[#F5A623]'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Bottom Pinned User Profile Card */}
      <div className="p-3 border-t border-[#262B33] bg-[#0B0D10]">
        {!isCollapsed ? (
          <div className="p-2.5 rounded-[8px] bg-[#14171C] border border-[#262B33] flex items-center justify-between">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="w-8 h-8 rounded-[6px] bg-[rgba(245,166,35,0.15)] text-[#F5A623] flex items-center justify-center font-mono font-semibold text-xs border border-[rgba(245,166,35,0.3)] shrink-0">
                FA
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-[#E8EAED] truncate">{currentUser?.sub || 'analyst@sentinel.ai'}</p>
                <p className="text-[11px] text-[#F5A623] font-mono font-semibold uppercase tracking-[0.06em] truncate">{currentUser?.role || 'Senior Fraud Analyst'}</p>
              </div>
            </div>

            <button
              onClick={onLogout}
              title="Logout session"
              className="p-1.5 text-[#9AA1AC] hover:text-[#E5484D] hover:bg-[rgba(229,72,77,0.15)] rounded-[6px] transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#F5A623]/40"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={onLogout}
            title="Logout session"
            className="w-full py-2 flex items-center justify-center text-[#9AA1AC] hover:text-[#E5484D] hover:bg-[rgba(229,72,77,0.15)] rounded-[6px] transition-colors duration-150"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
};

