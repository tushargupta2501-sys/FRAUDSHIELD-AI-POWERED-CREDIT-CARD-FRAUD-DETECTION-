import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  User,
  Layers,
  ChevronRight,
  FileText,
  Clock,
  HelpCircle,
  TrendingUp,
  TrendingDown,
  Cpu,
  Activity,
  Sliders
} from 'lucide-react';
import { SHAPExplainability } from '../components/SHAPExplainability';
import { InvestigationViewSystem } from '../components/InvestigationViewSystem';

export const ResultScreenPage = ({
  selectedTransaction,
  onInspectCustomer
}) => {
  if (!selectedTransaction) {
    return (
      <div className="cyber-card p-12 flex flex-col items-center justify-center text-center space-y-4">
        <Layers className="w-12 h-12 text-slate-600 mb-2" />
        <h3 className="text-lg font-bold text-white">No Evaluation Result Loaded</h3>
        <p className="text-xs text-slate-400 max-w-sm">
          Run a transaction in the Simulator or select a record from the feed to inspect full decisioning details, TreeSHAP explainability, and the 5-Section Investigation Matrix.
        </p>
      </div>
    );
  }

  const {
    transaction_id,
    amount,
    merchant_name,
    decision,
    risk_score,
    risk_tier,
    ml_score = 0,
    processing_time_ms = 0,
    user_id,
    shap_factors = [],
    rule_violations = [],
    behavioral_anomaly_score = 0
  } = selectedTransaction;

  const decisionStyles = {
    BLOCK: {
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/40',
      text: 'text-rose-400',
      glow: 'glow-danger',
      badgeBg: 'bg-rose-500/20',
      icon: ShieldAlert,
      title: 'TRANSACTION BLOCKED'
    },
    CHALLENGE: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/40',
      text: 'text-amber-400',
      glow: 'glow-warning',
      badgeBg: 'bg-amber-500/20',
      icon: AlertTriangle,
      title: 'STEP-UP CHALLENGE / REVIEW'
    },
    ALLOW: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/40',
      text: 'text-emerald-400',
      glow: 'glow-success',
      badgeBg: 'bg-emerald-500/20',
      icon: ShieldCheck,
      title: 'TRANSACTION APPROVED'
    }
  };

  const currentStyle = decisionStyles[decision] || decisionStyles.ALLOW;
  const VerdictIcon = currentStyle.icon;

  return (
    <div className="space-y-8">
      {/* Hero Result Banner */}
      <div className={`cyber-card p-8 border ${currentStyle.border} ${currentStyle.glow} space-y-6`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Verdict Info */}
          <div className="flex items-center space-x-5">
            <div className={`p-4 rounded-2xl ${currentStyle.badgeBg} ${currentStyle.text} border ${currentStyle.border}`}>
              <VerdictIcon className="w-10 h-10" />
            </div>

            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-md ${currentStyle.badgeBg} ${currentStyle.text} border ${currentStyle.border}`}>
                  {decision}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Risk Tier: <strong className="text-white">{risk_tier}</strong>
                </span>
              </div>
              <h2 className="text-2xl font-black text-white">{currentStyle.title}</h2>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                Tx ID: <span className="text-slate-200">{transaction_id}</span> | Latency: <span className="text-cyan-400 font-bold">{processing_time_ms} ms</span>
              </p>
            </div>
          </div>

          {/* Large Risk Score Visualization */}
          <div className="flex items-center space-x-6 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-8">
            <div className="text-center">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-1">
                COMPOSITE RISK SCORE
              </span>
              <div className="text-4xl font-black font-mono text-[#F59A4A] tracking-tight">
                {risk_score} <span className="text-lg font-normal text-slate-500">/ 100</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-1">
                AMOUNT
              </span>
              <span className="text-2xl font-black font-mono text-white">${amount?.toFixed(2)}</span>
            </div>

            <button
              onClick={() => onInspectCustomer(user_id)}
              className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-[#F59A4A] hover:bg-white/10 transition"
            >
              <User className="w-3.5 h-3.5" />
              <span>Customer Profile</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 4 Risk Component Gauges */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-4 border-t border-white/5">
          <div className="p-3.5 rounded-xl bg-[#0D1118] border border-white/5 space-y-1">
            <span className="text-[11px] font-mono text-slate-400 block">ML XGBoost Probability</span>
            <p className="text-base font-bold font-mono text-cyan-400">{(ml_score * 100).toFixed(1)}%</p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0D1118] border border-white/5 space-y-1">
            <span className="text-[11px] font-mono text-slate-400 block">Behavioral Z-Score</span>
            <p className="text-base font-bold font-mono text-purple-400">{behavioral_anomaly_score} σ</p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0D1118] border border-white/5 space-y-1">
            <span className="text-[11px] font-mono text-slate-400 block">Rule Penalties Added</span>
            <p className="text-base font-bold font-mono text-amber-400">
              {rule_violations.reduce((sum, r) => sum + (r.points_added || 0), 0)} pts
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0D1118] border border-white/5 space-y-1">
            <span className="text-[11px] font-mono text-slate-400 block">Engine Latency</span>
            <p className="text-base font-bold font-mono text-emerald-400">{processing_time_ms} ms</p>
          </div>
        </div>
      </div>

      {/* Grid: Why Was Flagged? + TreeSHAP Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: "Why Was Flagged?" Narrative Card (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="cyber-card p-6 space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-white/5">
              <HelpCircle className="w-5 h-5 text-[#F59A4A]" />
              <h3 className="text-base font-bold text-white">Why was this transaction flagged?</h3>
            </div>

            <div className="space-y-3">
              {rule_violations.length > 0 ? (
                rule_violations.map((rule, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-rose-300">{rule.rule_name}</span>
                      <span className="font-mono text-rose-400 font-bold">+{rule.points_added} pts</span>
                    </div>
                    <p className="text-slate-300 text-[11px]">{rule.description}</p>
                  </div>
                ))
              ) : (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
                  No hard operational security rules triggered. Risk score is derived from baseline statistical metrics.
                </div>
              )}

              {/* Behavioral Anomaly Explanation */}
              <div className="p-3.5 rounded-xl bg-[#0D1118] border border-white/5 text-xs space-y-1">
                <span className="font-bold text-[#F59A4A] block">Behavioral Pattern Assessment</span>
                <p className="text-slate-400 text-[11px]">
                  Transaction amount of ${amount} compared against user 30-day baseline yields an anomaly Z-score of {behavioral_anomaly_score}σ.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: TreeSHAP Feature Attributions (7 cols) */}
        <div className="lg:col-span-7">
          <SHAPExplainability selectedTransaction={selectedTransaction} />
        </div>
      </div>

      {/* Full 5-Section Investigation Matrix */}
      <div className="space-y-4 pt-4 border-t border-white/5">
        <div className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-[#F59A4A]" />
          <h3 className="text-base font-bold text-white uppercase tracking-wider">
            Complete 5-Section Analyst Investigation Matrix
          </h3>
        </div>

        <InvestigationViewSystem
          transactionId={transaction_id}
          onInspectCustomer={onInspectCustomer}
        />
      </div>
    </div>
  );
};
