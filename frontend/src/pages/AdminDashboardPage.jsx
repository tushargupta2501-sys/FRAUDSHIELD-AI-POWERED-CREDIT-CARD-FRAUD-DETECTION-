import React, { useEffect, useState } from 'react';
import {
  Sliders,
  Cpu,
  ShieldCheck,
} from 'lucide-react';
import { RuleManager } from '../components/RuleManager';
import { MetricCards } from '../components/MetricCards';
import { ThreeDNetwork } from '../components/ThreeDNetwork';
import { LiveTransactionFeed } from '../components/LiveTransactionFeed';
import { fetchDashboardStats } from '../api/client';

export const AdminDashboardPage = ({ transactions = [], onSelectTransaction }) => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchDashboardStats()
      .then(setStats)
      .catch((err) => console.error("Failed to load dashboard stats:", err));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#262B33] gap-3">
        <div>
          <div className="flex items-center space-x-2 text-[#F5A623] font-mono text-xs mb-0.5 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="uppercase tracking-[0.06em]">AI Fraud Intelligence Command Center</span>
          </div>
          <h1 className="text-2xl font-semibold text-[#E8EAED] tracking-tight">Executive Dashboard & Operations Telemetry</h1>
          <p className="text-xs text-[#9AA1AC] mt-1 font-sans">
            Real-time multi-dimensional fraud monitoring, 3D network intelligence, and automated risk scoring engine.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 rounded-full bg-[rgba(45,212,167,0.15)] text-[#2DD4A7] border border-[rgba(45,212,167,0.3)] text-xs font-mono flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2DD4A7] animate-live-dot" />
            System Status: 100% Operational
          </span>
        </div>
      </div>

      {/* KPI Metric Summary Row */}
      <MetricCards metrics={stats} />

      {/* Champion Model Benchmark Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="sentinel-card p-4 space-y-1">
          <span className="text-[11px] text-[#5C6470] font-mono uppercase tracking-[0.06em]">Champion Model</span>
          <p className="text-base font-semibold text-[#E8EAED] flex items-center space-x-1.5 font-sans">
            <Cpu className="w-4 h-4 text-[#4C9AFF]" />
            <span>XGBoost Classifier</span>
          </p>
        </div>

        <div className="sentinel-card p-4 space-y-1">
          <span className="text-[11px] text-[#5C6470] font-mono uppercase tracking-[0.06em]">PR-AUC (Precision-Recall)</span>
          <p className="text-base font-semibold text-[#2DD4A7] font-mono">0.9210 <span className="text-xs text-[#9AA1AC] font-sans">(SOTA Target)</span></p>
        </div>

        <div className="sentinel-card p-4 space-y-1">
          <span className="text-[11px] text-[#5C6470] font-mono uppercase tracking-[0.06em]">ROC-AUC Score</span>
          <p className="text-base font-semibold text-[#4C9AFF] font-mono">0.9840</p>
        </div>

        <div className="sentinel-card p-4 space-y-1">
          <span className="text-[11px] text-[#5C6470] font-mono uppercase tracking-[0.06em]">Inference Latency</span>
          <p className="text-base font-semibold text-[#F5A623] font-mono">&lt; 4.2 ms / tx</p>
        </div>
      </div>

      {/* Main Grid Row: 3D Network Graph + Live Telemetry Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ThreeDNetwork transactions={transactions} onSelectTransaction={onSelectTransaction} />
        </div>
        <div className="lg:col-span-1 h-[440px]">
          <LiveTransactionFeed transactions={transactions} onSelectTransaction={onSelectTransaction} />
        </div>
      </div>

      {/* Deterministic Security Rule Engine */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Sliders className="w-5 h-5 text-[#F5A623]" />
          <h3 className="text-lg font-semibold text-[#E8EAED]">Hard Rule Engine Manager</h3>
        </div>
        <RuleManager />
      </div>
    </div>
  );
};

