import React from 'react';
import { ShieldCheck, Activity, Cpu, Bell, Radio } from 'lucide-react';

export const Header = ({ isWsConnected, activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'console', label: 'Live Risk Console' },
    { id: 'analytics', label: 'Explainability & Analytics' },
    { id: 'rules', label: 'Rule Engine Config' },
    { id: 'architecture', label: 'System Architecture' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-800 bg-[#0A0E1A]/90 backdrop-blur-md px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Brand Logo & Title */}
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-emerald-400 p-[2px] shadow-lg shadow-blue-500/20">
            <div className="w-full h-full bg-[#0B0F19] rounded-[10px] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold tracking-tight text-white">Sentinel<span className="text-blue-500">AI</span></h1>
              <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider text-blue-400 uppercase bg-blue-500/10 border border-blue-500/20 rounded-full">
                v1.0 Pro
              </span>
            </div>
            <p className="text-xs text-gray-400">Real-Time Fraud Detection & Security Layer</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center space-x-1 bg-gray-900/80 p-1 rounded-xl border border-gray-800">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Pipeline & WebSocket Status Indicators */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-gray-900/60 border border-gray-800">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-gray-300 font-medium">XGBoost + SHAP</span>
          </div>

          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-gray-900/60 border border-gray-800">
            <span className={`w-2 h-2 rounded-full ${isWsConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
            <span className={isWsConnected ? 'text-emerald-400 font-medium' : 'text-rose-400 font-medium'}>
              {isWsConnected ? 'Live Stream Active' : 'Connecting...'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
