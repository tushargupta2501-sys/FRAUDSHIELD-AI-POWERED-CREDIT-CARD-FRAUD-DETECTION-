import React, { useEffect, useState } from 'react';
import {
  Search,
  Filter,
  ChevronRight,
  RefreshCw,
  FileText,
  X,
  ShieldAlert,
  Layers,
  AlertTriangle
} from 'lucide-react';
import { fetchFraudAlerts, fetchFraudCases } from '../api/client';
import { InvestigationViewSystem } from '../components/InvestigationViewSystem';

export const InvestigationDashboardPage = ({ onInspectCustomer, onSelectTransaction }) => {
  const [alerts, setAlerts] = useState([]);
  const [cases, setCases] = useState([]);
  const [activeTab, setActiveTab] = useState('alerts');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [inspectingTxId, setInspectingTxId] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [altData, caseData] = await Promise.all([
        fetchFraudAlerts(),
        fetchFraudCases()
      ]);
      setAlerts(altData);
      setCases(caseData);
    } catch (err) {
      console.error("Failed to load alerts/cases:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredAlerts = alerts.filter((a) => {
    if (severityFilter !== 'ALL' && a.severity !== severityFilter) return false;
    if (statusFilter !== 'ALL' && a.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/5">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Fraud Investigation & Alert Center</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-Time Alerts, Analyst Cases, & Complete 5-Section Investigation Matrix.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-[#151A22] border border-white/10 text-xs text-slate-300 hover:text-white hover:border-[#F59A4A] transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#F59A4A]' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* 5-Section Investigation Matrix Modal Container if inspectingTxId is selected */}
      {inspectingTxId && (
        <div className="p-6 rounded-2xl bg-[#0D1118] border border-[#F59A4A]/50 shadow-2xl space-y-4 relative glow-ember">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <h3 className="text-sm font-extrabold text-[#F59A4A] uppercase tracking-wider font-mono">
              Active Investigation View: {inspectingTxId}
            </h3>
            <button
              onClick={() => setInspectingTxId(null)}
              className="px-3 py-1.5 text-xs rounded-xl bg-white/10 text-slate-200 hover:text-white hover:bg-rose-500/20 hover:border-rose-500/30 flex items-center space-x-1 transition"
            >
              <X className="w-3.5 h-3.5" />
              <span>Close Matrix</span>
            </button>
          </div>

          <InvestigationViewSystem
            transactionId={inspectingTxId}
            onInspectCustomer={onInspectCustomer}
          />
        </div>
      )}

      {/* Navigation Sub-Tabs & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#151A22] p-3 rounded-2xl border border-white/5">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
              activeTab === 'alerts'
                ? 'bg-[#F59A4A] text-[#07090D] shadow-lg shadow-[#F59A4A]/30 border border-[#FFB067]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            Fraud Alerts ({alerts.length})
          </button>
          <button
            onClick={() => setActiveTab('cases')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
              activeTab === 'cases'
                ? 'bg-[#F59A4A] text-[#07090D] shadow-lg shadow-[#F59A4A]/30 border border-[#FFB067]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            Analyst Cases ({cases.length})
          </button>
        </div>

        {/* Severity & Status Filters */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1.5 text-slate-400 font-mono">
            <Filter className="w-3.5 h-3.5 text-[#F59A4A]" />
            <span>Severity:</span>
          </div>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-[#0D1118] border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-[#F59A4A]"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical Only</option>
            <option value="HIGH">High Only</option>
            <option value="MEDIUM">Medium Only</option>
          </select>
        </div>
      </div>

      {/* Tab 1: Real-Time Alerts Queue */}
      {activeTab === 'alerts' && (
        <div className="cyber-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0D1118] border-b border-white/5 text-slate-400 uppercase tracking-wider text-[10px] font-mono">
                <tr>
                  <th className="py-3 px-4">Alert ID / Tx ID</th>
                  <th className="py-3 px-4">Customer ID</th>
                  <th className="py-3 px-4">Merchant & Amount</th>
                  <th className="py-3 px-4">Risk Score</th>
                  <th className="py-3 px-4">Severity</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {filteredAlerts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500 italic">
                      No fraud alerts matching active filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredAlerts.map((alert) => (
                    <tr key={alert.alert_id} className="hover:bg-white/5 transition">
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-white block">{alert.alert_id}</span>
                        <span className="text-[10px] text-slate-500 block truncate max-w-[120px]">{alert.transaction_id}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => onInspectCustomer(alert.user_id)}
                          className="text-[#F59A4A] hover:underline font-bold"
                        >
                          {alert.user_id}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 font-sans">
                        <span className="font-semibold text-slate-200 block">{alert.merchant_name}</span>
                        <span className="font-mono text-white font-bold text-xs">${alert.amount?.toFixed(2)}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-rose-400">{alert.risk_score} / 100</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase ${
                          alert.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                          alert.severity === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                          'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        }`}>
                          {alert.severity}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 text-[9px] font-bold rounded bg-slate-800 text-slate-300 border border-white/5">
                          {alert.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => setInspectingTxId(alert.transaction_id)}
                          className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[#F59A4A] hover:bg-[#F59A4A] hover:text-[#07090D] font-bold text-[11px] transition"
                        >
                          Inspect Matrix
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Analyst Cases */}
      {activeTab === 'cases' && (
        <div className="cyber-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0D1118] border-b border-white/5 text-slate-400 uppercase tracking-wider text-[10px] font-mono">
                <tr>
                  <th className="py-3 px-4">Case ID</th>
                  <th className="py-3 px-4">Customer ID</th>
                  <th className="py-3 px-4">Assigned Analyst</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {cases.map((cs) => (
                  <tr key={cs.case_id} className="hover:bg-white/5 transition">
                    <td className="py-3.5 px-4 font-bold text-white">{cs.case_id}</td>
                    <td className="py-3.5 px-4 text-[#F59A4A] font-bold">{cs.user_id}</td>
                    <td className="py-3.5 px-4 text-slate-300 font-sans">{cs.assigned_to}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 text-[9px] font-bold rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
                        {cs.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setInspectingTxId(cs.transaction_id)}
                        className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[#F59A4A] hover:bg-[#F59A4A] hover:text-[#07090D] font-bold text-[11px] transition"
                      >
                        Inspect Case
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
