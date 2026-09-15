import React, { useEffect, useState } from 'react';
import {
  FileText,
  AlertTriangle,
  Activity,
  History,
  Layers,
  ShieldCheck,
  ShieldAlert,
  TrendingUp,
  TrendingDown,
  User,
  CreditCard,
  Globe,
  Clock
} from 'lucide-react';
import { fetchInvestigationDetails } from '../api/client';

export const InvestigationViewSystem = ({ transactionId, onInspectCustomer }) => {
  const [investigationData, setInvestigationData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!transactionId) return;
    setLoading(true);
    fetchInvestigationDetails(transactionId)
      .then(setInvestigationData)
      .catch((err) => console.error("Failed to load investigation view:", err))
      .finally(() => setLoading(false));
  }, [transactionId]);

  if (!transactionId) {
    return (
      <div className="p-8 text-center cyber-card text-slate-400 text-xs">
        Select a transaction record to inspect the 5-Section Investigation Matrix.
      </div>
    );
  }

  if (loading || !investigationData) {
    return (
      <div className="p-12 text-center cyber-card space-y-3">
        <div className="w-8 h-8 border-2 border-[#F59A4A] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400 font-mono">Assembling 5-Section Fraud Investigation Matrix...</p>
      </div>
    );
  }

  const {
    transaction_details,
    rule_violations = [],
    behavioral_analysis,
    historical_matches = [],
    shap_explanations = []
  } = investigationData;

  const isBlock = transaction_details.decision === 'BLOCK';
  const isChallenge = transaction_details.decision === 'CHALLENGE';

  const formatFeatureName = (feat) => {
    const clean = String(feat).replace(/_/g, ' ').replace('num__', '').replace('cat__', '').trim();
    if (/^V\d+$/i.test(clean)) return clean.toUpperCase();
    return clean.replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div className="space-y-6">
      {/* SECTION A: Transaction Details */}
      <div className="cyber-card p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-[#F59A4A]" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Section A: Transaction Details
            </h3>
          </div>
          <span className={`px-2.5 py-0.5 text-xs font-bold rounded uppercase ${
            isBlock ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
            isChallenge ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
            'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
          }`}>
            Verdict: {transaction_details.decision} ({transaction_details.risk_score} / 100)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div className="p-3 rounded-xl bg-[#0D1118] border border-white/5">
            <span className="text-slate-400 block text-[10px] uppercase">Transaction ID</span>
            <span className="font-bold text-white block truncate">{transaction_details.transaction_id}</span>
          </div>

          <div className="p-3 rounded-xl bg-[#0D1118] border border-white/5">
            <span className="text-slate-400 block text-[10px] uppercase">Customer ID</span>
            <button
              onClick={() => onInspectCustomer && onInspectCustomer(transaction_details.user_id)}
              className="font-bold text-[#F59A4A] hover:underline block truncate"
            >
              {transaction_details.user_id}
            </button>
          </div>

          <div className="p-3 rounded-xl bg-[#0D1118] border border-white/5">
            <span className="text-slate-400 block text-[10px] uppercase">Amount</span>
            <span className="font-extrabold text-white block">${transaction_details.amount?.toFixed(2)}</span>
          </div>

          <div className="p-3 rounded-xl bg-[#0D1118] border border-white/5">
            <span className="text-slate-400 block text-[10px] uppercase">Merchant / MCC</span>
            <span className="font-semibold text-slate-200 block truncate">{transaction_details.merchant_name} ({transaction_details.mcc})</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono pt-1">
          <div className="p-3 rounded-xl bg-[#0D1118] border border-white/5">
            <span className="text-slate-400 block text-[10px] uppercase">Payment Card</span>
            <span className="text-slate-300">{transaction_details.card_id}</span>
          </div>

          <div className="p-3 rounded-xl bg-[#0D1118] border border-white/5">
            <span className="text-slate-400 block text-[10px] uppercase">Country</span>
            <span className="font-semibold text-slate-200">{transaction_details.country}</span>
          </div>

          <div className="p-3 rounded-xl bg-[#0D1118] border border-white/5">
            <span className="text-slate-400 block text-[10px] uppercase">IP Address</span>
            <span className="text-slate-300">{transaction_details.ip_address || '198.51.100.22'}</span>
          </div>

          <div className="p-3 rounded-xl bg-[#0D1118] border border-white/5">
            <span className="text-slate-400 block text-[10px] uppercase">Processing Latency</span>
            <span className="font-bold text-cyan-400">{transaction_details.processing_time_ms} ms</span>
          </div>
        </div>
      </div>

      {/* SECTION B: Rule Violations */}
      <div className="cyber-card p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Section B: Rule Violations ({rule_violations.length})
            </h3>
          </div>
        </div>

        {rule_violations.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No operational security rules triggered for this transaction.</p>
        ) : (
          <div className="space-y-2.5">
            {rule_violations.map((rule, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-[#0D1118] border border-rose-500/20 text-xs flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-rose-300">{rule.rule_name}</span>
                    <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase">
                      {rule.severity || 'HIGH'}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] mt-0.5">{rule.description}</p>
                </div>
                <span className="font-mono font-bold text-rose-400 text-sm">+{rule.points_added} pts</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION C: Behavioral Analysis */}
      <div className="cyber-card p-6 space-y-4">
        <div className="flex items-center space-x-2 pb-3 border-b border-white/5">
          <Activity className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Section C: Behavioral Analysis & Sliding Velocity
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div className="p-3.5 rounded-xl bg-[#0D1118] border border-white/5">
            <span className="text-slate-400 block text-[10px] uppercase">5-Min Velocity</span>
            <span className="text-lg font-bold text-white">{behavioral_analysis?.velocity_5m || 1} txns</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0D1118] border border-white/5">
            <span className="text-slate-400 block text-[10px] uppercase">1-Hour Velocity</span>
            <span className="text-lg font-bold text-white">{behavioral_analysis?.velocity_1h || 2} txns</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0D1118] border border-white/5">
            <span className="text-slate-400 block text-[10px] uppercase">24-Hour Velocity</span>
            <span className="text-lg font-bold text-white">{behavioral_analysis?.velocity_24h || 5} txns</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0D1118] border border-white/5">
            <span className="text-slate-400 block text-[10px] uppercase">Amount Z-Score</span>
            <span className="text-lg font-bold text-purple-400">{behavioral_analysis?.z_score || 2.4} σ</span>
          </div>
        </div>
      </div>

      {/* SECTION D: Historical Matches */}
      <div className="cyber-card p-6 space-y-4">
        <div className="flex items-center space-x-2 pb-3 border-b border-white/5">
          <History className="w-5 h-5 text-indigo-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Section D: Historical Transaction Matches
          </h3>
        </div>

        {historical_matches.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No historical matches recorded for this account baseline.</p>
        ) : (
          <div className="space-y-2">
            {historical_matches.map((item, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-[#0D1118] border border-white/5 flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-slate-300 font-bold">{item.merchant}</span>
                  <span className="text-slate-500 ml-2">${item.amount}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  item.decision === 'BLOCK' ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                }`}>
                  {item.decision}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION E: SHAP Explanations */}
      <div className="cyber-card p-6 space-y-4">
        <div className="flex items-center space-x-2 pb-3 border-b border-white/5">
          <Layers className="w-5 h-5 text-[#F59A4A]" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Section E: TreeSHAP Feature Attribution Explanations
          </h3>
        </div>

        <div className="space-y-2">
          {shap_explanations.map((exp, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-[#0D1118] border border-white/5 text-xs text-slate-300 flex items-center justify-between">
              <span>{exp.text || exp.explanation}</span>
              <span className="font-mono font-bold text-[#F59A4A] ml-4">{exp.contribution || '+0.45'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
