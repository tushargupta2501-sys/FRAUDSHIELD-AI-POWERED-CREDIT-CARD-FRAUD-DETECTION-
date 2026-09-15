import React, { useState, useEffect } from 'react';
import {
  Search,
  Bell,
  Zap,
  Menu,
} from 'lucide-react';

export const HeaderNavigation = ({
  activePage,
  setActivePage,
  isWsConnected,
  currentUser,
  onLogout,
  isCollapsed,
  setIsCollapsed,
  searchQuery,
  setSearchQuery
}) => {
  const [showNotifications, setShowNotifications] = useState(false);

  const pageTitles = {
    landing: 'Analyst Authentication Portal',
    admin: 'Fraud Intelligence Dashboard',
    simulator: 'Transaction Risk Simulator',
    results: 'Transaction Risk & TreeSHAP Result',
    investigation: 'Fraud Investigation & Case Workbench',
    alerts: 'Live Fraud Alerts Queue',
    customers: 'Customer Profile & Behavioral Intelligence',
    rules: 'Deterministic Rule Manager',
    analytics: 'Advanced Risk Analytics & Benchmarks',
    monitoring: 'System Telemetry & Gateway Health',
    architecture: 'System Architecture Visualizer',
    settings: 'Platform Settings & Risk Thresholds'
  };

  const sampleNotifications = [
    { id: 1, type: 'CRITICAL', title: 'Sanctioned Geo Spike', desc: 'Transaction $4,200.00 from RU flagged', time: '2m ago' },
    { id: 2, type: 'HIGH', title: 'High Velocity Burst', desc: '>3 transactions in 5 minutes for usr_4402', time: '8m ago' },
    { id: 3, type: 'INFO', title: 'Model Re-calibration', desc: 'XGBoost PR-AUC steady at 0.8475', time: '25m ago' }
  ];

  // Listen for / or Cmd+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key === '/' || (e.metaKey && e.key === 'k')) && document.activeElement.tagName !== 'INPUT') {
        e.preventDefault();
        const searchInput = document.getElementById('global-search-input');
        if (searchInput) searchInput.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className={`sticky top-0 z-30 h-16 bg-[#14171C] border-b border-[#262B33] px-4 lg:px-8 flex items-center justify-between transition-all duration-150 ${
      isCollapsed ? 'lg:pl-24' : 'lg:pl-80'
    }`}>
      {/* Left: Hamburger Toggle & Page Title */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-[#9AA1AC] hover:text-[#E8EAED] p-2 rounded-[6px] bg-[#1B1F26] border border-[#262B33] transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#F5A623]/40"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-base font-semibold text-[#E8EAED] tracking-tight">
              {pageTitles[activePage] || 'SentinelAI Platform'}
            </h1>
            <span className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-mono font-semibold rounded-full bg-[rgba(245,166,35,0.15)] text-[#F5A623]">
              v1.0 Gateway
            </span>
          </div>
          <p className="text-[11px] text-[#9AA1AC] hidden md:block font-sans">
            Real-Time AI Credit Card Fraud Engine & TreeSHAP Decisioning
          </p>
        </div>
      </div>

      {/* Center/Right: Command Bar, Telemetry Status, Notifications, Quick CTA */}
      <div className="flex items-center space-x-3 lg:space-x-5">
        {/* Global Search Input (Tx ID / Customer / MCC) with Keyboard Shortcut Hint */}
        <div className="relative hidden md:block w-56 lg:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#5C6470]" />
          <input
            id="global-search-input"
            type="text"
            placeholder="Search Tx ID, Customer, MCC... (/)"
            value={searchQuery || ''}
            onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-8 py-1.5 rounded-[6px] bg-[#0B0D10] border border-[#262B33] text-xs text-[#E8EAED] placeholder-[#5C6470] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/40 focus:ring-offset-2 focus:ring-offset-[#0B0D10] transition-colors duration-150 font-mono"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[11px] font-mono text-[#9AA1AC] bg-[#1B1F26] rounded border border-[#262B33]">
            /
          </kbd>
        </div>

        {/* Telemetry WebSocket Status Indicator */}
        <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-[6px] bg-[#0B0D10] border border-[#262B33]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2DD4A7] animate-live-dot" />
          <span className="text-[11px] font-mono font-semibold text-[#E8EAED] uppercase tracking-[0.06em]">
            {isWsConnected ? 'LIVE WS TELEMETRY' : 'REST SYNC'}
          </span>
        </div>

        {/* Notifications Bell Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-[6px] bg-[#1B1F26] border border-[#262B33] text-[#9AA1AC] hover:text-[#E8EAED] transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#F5A623]/40"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#F5A623]" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-[8px] bg-[#14171C] border border-[#262B33] shadow-subtle p-4 space-y-3 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-[#262B33]">
                <span className="text-xs font-semibold text-[#E8EAED] uppercase tracking-[0.06em] font-mono">Live Risk Alerts</span>
                <span className="text-[11px] font-mono text-[#F5A623] font-semibold">3 Unread</span>
              </div>

              <div className="space-y-2">
                {sampleNotifications.map((n) => (
                  <div key={n.id} className="p-2.5 rounded-[6px] bg-[#0B0D10] border border-[#262B33] text-xs space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className={`font-semibold ${
                        n.type === 'CRITICAL' ? 'text-[#E5484D]' : n.type === 'HIGH' ? 'text-[#F0B429]' : 'text-[#4C9AFF]'
                      }`}>
                        {n.title}
                      </span>
                      <span className="text-[11px] font-mono text-[#5C6470]">{n.time}</span>
                    </div>
                    <p className="text-xs text-[#9AA1AC] font-sans">{n.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Primary Action CTA Button */}
        <button
          onClick={() => setActivePage('simulator')}
          className="btn-primary text-xs flex items-center space-x-1.5"
        >
          <Zap className="w-3.5 h-3.5 text-[#0B0D10]" />
          <span className="hidden sm:inline">Evaluate Transaction</span>
        </button>
      </div>
    </header>
  );
};

