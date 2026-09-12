import React from 'react';
import { HelpCircle, Layers, TrendingUp, TrendingDown, Info } from 'lucide-react';

export const SHAPExplainability = ({ selectedTransaction }) => {
  if (!selectedTransaction) {
    return (
      <div className="rounded-2xl bg-[#0F1424] border border-gray-800 p-6 flex flex-col items-center justify-center text-center h-full min-h-[300px]">
        <Layers className="w-10 h-10 text-gray-600 mb-3" />
        <h3 className="text-sm font-semibold text-gray-300">No Transaction Selected</h3>
        <p className="text-xs text-gray-500 mt-1 max-w-xs">
          Click on any transaction in the live feed to inspect its local TreeSHAP attribution factors and decision breakdown.
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
    ml_score,
    shap_factors = [],
    rule_violations = [],
    behavioral_anomaly_score,
  } = selectedTransaction;

  return (
    <div className="rounded-2xl bg-[#0F1424] border border-gray-800 p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-800">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-bold text-white">TreeSHAP Explainability Inspector</h3>
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Local Attribution
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Transaction: <span className="text-gray-200 font-mono">{transaction_id?.slice(0, 8)}...</span> | ${amount} at {merchant_name}
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs text-gray-400">ML Fraud Probability</span>
          <p className="text-lg font-bold text-indigo-400">{(ml_score * 100).toFixed(1)}%</p>
        </div>
      </div>

      {/* Ensemble Score Contribution Breakdown */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="p-3 rounded-xl bg-gray-900/60 border border-gray-800">
          <span className="text-[11px] text-gray-400">ML Engine (50%)</span>
          <p className="text-sm font-bold text-blue-400 mt-1">{(ml_score * 100).toFixed(1)} pts</p>
        </div>
        <div className="p-3 rounded-xl bg-gray-900/60 border border-gray-800">
          <span className="text-[11px] text-gray-400">Rules Engine (30%)</span>
          <p className="text-sm font-bold text-amber-400 mt-1">
            {rule_violations.reduce((sum, r) => sum + (r.points_added || 0), 0)} pts
          </p>
        </div>
        <div className="p-3 rounded-xl bg-gray-900/60 border border-gray-800">
          <span className="text-[11px] text-gray-400">Behavioral Z-Score (20%)</span>
          <p className="text-sm font-bold text-purple-400 mt-1">{behavioral_anomaly_score} σ</p>
        </div>
      </div>

      {/* SHAP Feature Contribution Waterfall */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center space-x-1.5">
            <span>Key Feature Drivers (TreeSHAP Value)</span>
          </span>
          <span className="text-[11px] text-gray-500">Positive = Increases Risk</span>
        </div>

        {shap_factors.length === 0 ? (
          <p className="text-xs text-gray-500 italic">No significant outlier SHAP drivers detected for this transaction.</p>
        ) : (
          <div className="space-y-3">
            {shap_factors.map((factor, idx) => {
              const isRiskIncrease = factor.contribution > 0;
              const maxContrib = 3.5;
              const barWidth = Math.min(100, Math.abs(factor.contribution / maxContrib) * 100);

              return (
                <div key={idx} className="p-3 rounded-xl bg-gray-900/40 border border-gray-800/80">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center space-x-2">
                      {isRiskIncrease ? (
                        <TrendingUp className="w-3.5 h-3.5 text-rose-400" />
                      ) : (
                        <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                      <span className="font-semibold text-gray-200 capitalize">
                        {factor.feature.replace(/_/g, ' ').replace('num__', '').replace('cat__', '')}
                      </span>
                    </div>
                    <span className={`font-mono font-bold ${isRiskIncrease ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {factor.contribution > 0 ? `+${factor.contribution}` : factor.contribution}
                    </span>
                  </div>

                  {/* Visual Bar */}
                  <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full rounded-full ${isRiskIncrease ? 'bg-gradient-to-r from-amber-500 to-rose-500' : 'bg-emerald-500'}`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>

                  <p className="text-[11px] text-gray-400">{factor.explanation}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Triggered Rule Violations if any */}
      {rule_violations.length > 0 && (
        <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30">
          <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider mb-2">Triggered Rule Violations:</h4>
          <div className="space-y-1.5">
            {rule_violations.map((rule, idx) => (
              <div key={idx} className="text-xs text-gray-300 flex items-start space-x-2">
                <span className="text-rose-400 font-bold">•</span>
                <div>
                  <span className="font-semibold text-white">{rule.rule_name}:</span> {rule.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
