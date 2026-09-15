import React, { useState } from 'react';
import {
  Search,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Radio,
  User,
  ShieldCheck,
  X,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

export const Header = ({
  activePage,
  isWsConnected,
  currentUser,
  onNavigate
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const notifications = [
    {
      id: 1,
      title: 'CRITICAL Fraud Alert Triggered',
      desc: 'Tx #tx_88192 blocked ($2,850.00 at BestBuy Online). Risk Score: 88.5.',
      time: '2 mins ago',
      type: 'critical',
      txId: 'tx_88192'
    },
    {
      id: 2,
      title: 'Rule Engine Updated',
      desc: 'Security Admin modified RULE_SANCTIONED_COUNTRY penalty (+45 pts).',
      time: '15 mins ago',
      type: 'info'
    },
    {
      id: 3,
      title: 'High Velocity Spike Detected',
      desc: 'User usr_4402 exceeded 5m transaction window (>4 txns).',
      time: '42 mins ago',
      type: 'warning'
    }
  ];

  const pageTitles = {
    dashboard: { title: 'Executive Fraud Monitoring Dashboard', subtitle: 'Real-time overview of payment velocity, risk metrics, and ML model health' },
    simulator: { title: 'Transaction Risk Simulator', subtitle: 'Test payment payloads against XGBoost ML, Rule Engine, and TreeSHAP attribution' },
    results: { title: 'Transaction Risk Decision & SHAP Inspector', subtitle: 'Detailed risk score breakdown, decision state, and TreeSHAP feature drivers' },
    investigation: { title: 'Fraud Investigation Workbench', subtitle: '5-section comprehensive analyst matrix for case investigation and review' },
    alerts: { title: 'Security Alerts & Incident Queue', subtitle: 'Prioritized list of critical, high, and medium severity fraud warnings' },
    customers: { title: 'Customer Intelligence & Profiles', subtitle: '30-day spending baselines, card associations, and Z-score anomaly patterns' },
    rules: { title: 'Deterministic Rule Manager', subtitle: 'Configure security rule conditions, penalty weights, and dynamic toggles' },
    analytics: { title: 'Analytics & Model Benchmarks', subtitle: 'XGBoost performance metrics, PR-AUC curves, and global SHAP importance' },
    system: { title: 'Real-Time Streaming Telemetry', subtitle: 'Live WebSocket transaction feed and processing latency monitor' },
    architecture: { title: 'System Architecture Visualizer', subtitle: 'Interactive 4-layer pipeline view from Security Gate down to Decision Engine' },
    settings: { title: 'Platform & API Settings', subtitle: 'Manage API keys, environment parameters, and notification hooks' },
  };

  const currentHeaderInfo = pageTitles[activePage] || { title: 'FraudShield AI Platform', subtitle: 'Real-Time Fraud Detection & Risk Decisioning' };

  return (
    <header className="h-16 bg-[#090E1A]/95 backdrop-blur-md border-b border-slate-800/80 px-4 md:px-6 flex items-center justify-between sticky top-0 z-40 shadow-xl">
      {/* Current Page Title & Subtitle */}
      <div>
        <h1 className="text-base md:text-lg font-extrabold text-white tracking-tight flex items-center space-x-2">
          <span>{currentHeaderInfo.title}</span>
        </h1>
        <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
          {currentHeaderInfo.subtitle}
        </p>
      </div>

      {/* Right Controls: Search, Telemetry Badge, Notifications, User */}
      <div className="flex items-center space-x-3">
        {/* Global Search Input */}
        <div className="relative hidden md:block w-56 lg:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Tx ID, Customer, MCC, Country..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
          />
        </div>

        {/* WebSocket / System Health Live Pill */}
        <div className="flex items-center space-x-2 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800">
          <span className="relative flex h-2 w-2">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isWsConnected ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isWsConnected ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
          </span>
          <span className="text-[10px] font-mono font-bold tracking-wide text-slate-300">
            {isWsConnected ? 'WS LIVE' : 'REST SYNC'}
          </span>
        </div>

        {/* Notification Bell Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center border-2 border-[#090E1A]">
              3
            </span>
          </button>

          {/* Notifications Panel */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#0B0F19] border border-slate-800 shadow-2xl p-4 z-50 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <Bell className="w-4 h-4 text-indigo-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Live Security Alerts</h4>
                </div>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {notifications.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (onNavigate) onNavigate('investigation');
                      setShowNotifications(false);
                    }}
                    className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 transition cursor-pointer space-y-1"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className={`font-bold ${item.type === 'critical' ? 'text-rose-400' : 'text-indigo-300'}`}>
                        {item.title}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">{item.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-300">{item.desc}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  if (onNavigate) onNavigate('alerts');
                  setShowNotifications(false);
                }}
                className="w-full py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 text-indigo-300 text-xs font-semibold flex items-center justify-center space-x-1.5 transition"
              >
                <span>View All Incident Alerts</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* User Role Tag */}
        <div className="hidden lg:flex items-center space-x-2 bg-slate-900 border border-slate-800 px-3 py-1 rounded-xl">
          <User className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-xs font-bold text-slate-200 truncate max-w-[110px]">
            {currentUser?.sub || 'Analyst'}
          </span>
          <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
            {currentUser?.role || 'ANALYST'}
          </span>
        </div>
      </div>
    </header>
  );
};
