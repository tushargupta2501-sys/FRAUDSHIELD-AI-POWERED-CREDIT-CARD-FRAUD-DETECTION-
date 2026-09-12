import React from 'react';
import { Layers, ShieldCheck, Cpu, Database, Network, ArrowRight, ArrowDown } from 'lucide-react';

export const ArchitectureView = () => {
  const pipelineSteps = [
    {
      title: '1. Ingestion & Security Gate',
      desc: 'Validates HMAC-SHA256 signatures, applies token-bucket rate limiting, and sanitizes Pydantic V2 payloads.',
      icon: ShieldCheck,
      color: 'text-blue-400',
      border: 'border-blue-500/30'
    },
    {
      title: '2. ML Inference Engine',
      desc: 'Runs pre-processed features through tuned XGBoost Classifier (with scale_pos_weight for 99.8% precision) and computes TreeSHAP local attributions.',
      icon: Cpu,
      color: 'text-indigo-400',
      border: 'border-indigo-500/30'
    },
    {
      title: '3. Deterministic Rule Engine',
      desc: 'Evaluates real-time velocity (5m / 1h windows), high-risk merchant categories (MCCs 6051, 7995, 5732), and OFAC/country blacklists.',
      icon: Layers,
      color: 'text-amber-400',
      border: 'border-amber-500/30'
    },
    {
      title: '4. Behavioral Profiling Engine',
      desc: 'Tracks user 30-day mean spending, standard deviations, and calculates rolling Gaussian Z-score anomaly indices.',
      icon: Network,
      color: 'text-purple-400',
      border: 'border-purple-500/30'
    },
    {
      title: '5. Risk Aggregator & Decision',
      desc: 'Weighted ensemble formula: 50% ML + 30% Rules + 20% Behavioral -> Composite Score [0-100] -> Decision [ALLOW | CHALLENGE | BLOCK].',
      icon: Database,
      color: 'text-emerald-400',
      border: 'border-emerald-500/30'
    }
  ];

  return (
    <div className="rounded-2xl bg-[#0F1424] border border-gray-800 p-6 shadow-xl space-y-6">
      <div>
        <h3 className="text-lg font-bold text-white">SentinelAI Architecture & Signal Flow</h3>
        <p className="text-xs text-gray-400">High-throughput, real-time transaction security & AI explainability layer</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {pipelineSteps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div key={idx} className={`p-4 rounded-xl bg-gray-900/60 border ${step.border} flex flex-col justify-between`}>
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Icon className={`w-4 h-4 ${step.color}`} />
                  <span className="text-xs font-bold text-white">{step.title}</span>
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 rounded-xl bg-gray-900/40 border border-gray-800 text-xs text-gray-400 font-mono">
        <p className="text-gray-300 font-semibold mb-1">Decision Thresholds:</p>
        <div className="flex flex-wrap gap-4 text-xs">
          <span className="text-emerald-400 font-bold">• Risk &lt; 30 ──▶ ALLOW (Direct Authorization)</span>
          <span className="text-amber-400 font-bold">• 30 &le; Risk &lt; 75 ──▶ CHALLENGE (Step-Up 2FA / OTP)</span>
          <span className="text-rose-400 font-bold">• Risk &ge; 75 ──▶ BLOCK (Declined & Security Alert)</span>
        </div>
      </div>
    </div>
  );
};
