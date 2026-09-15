import React from 'react';
import { Layers, TrendingUp, TrendingDown } from 'lucide-react';

export const SHAPExplainability = ({ selectedTransaction }) => {
  if (!selectedTransaction) {
    return (
      <div className="sentinel-card p-8 flex flex-col items-center justify-center text-center h-full min-h-[580px] space-y-3">
        <div className="p-4 rounded-[8px] bg-[#1B1F26] border border-[#262B33] text-[#5C6470]">
          <Layers className="w-8 h-8" />
        </div>
        <h3 className="text-sm font-semibold text-[#E8EAED]">No Transaction Selected</h3>
        <p className="text-xs text-[#9AA1AC] max-w-xs font-sans">
          Select any transaction in the live feed or run a test scenario to inspect XGBoost fraud probability and TreeSHAP feature attributions.
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
    ml_score = 0,
    shap_factors = [],
    rule_violations = [],
    processing_time_ms = 0
  } = selectedTransaction;

  const fraudProbability = (ml_score * 100).toFixed(1);

  const formatFeatureName = (feat) => {
    const clean = String(feat).replace(/_/g, ' ').replace('num__', '').replace('cat__', '').trim();
    if (/^V\d+$/i.test(clean)) return clean.toUpperCase();
    return clean.replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const decisionBadge = {
    BLOCK: { bg: 'badge-block', title: 'BLOCK' },
    CHALLENGE: { bg: 'badge-challenge', title: 'CHALLENGE / REVIEW' },
    ALLOW: { bg: 'badge-allow', title: 'ALLOW' }
  }[decision] || { bg: 'badge-allow', title: 'ALLOW' };

  return (
    <div className="sentinel-card p-5 space-y-5 flex flex-col h-full min-h-[580px]">
      {/* Header Verdict Banner */}
      <div className="pb-3 border-b border-[#262B33] space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-semibold text-[#5C6470] uppercase tracking-[0.06em]">
            Risk & SHAP Inspector
          </span>
          <span className={`${decisionBadge.bg} font-mono text-[11px]`}>
            {decisionBadge.title}
          </span>
        </div>

        <div className="flex items-baseline justify-between pt-1">
          <div>
            <h3 className="text-base font-semibold text-[#E8EAED] truncate max-w-[180px] font-sans">
              {merchant_name}
            </h3>
            <p className="text-[11px] font-mono text-[#9AA1AC]">
              Tx: <span className="text-[#E8EAED] font-mono">{transaction_id?.slice(0, 12)}</span>
            </p>
          </div>

          <div className="text-right font-mono">
            <span className="text-xs text-[#9AA1AC] block font-sans">Amount</span>
            <span className="text-lg font-semibold text-[#E8EAED] font-mono">${amount?.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Fraud Probability & Composite Score Bar */}
      <div className="p-3.5 rounded-[6px] bg-[#0B0D10] border border-[#262B33] space-y-2 font-mono">
        <div className="flex justify-between items-center text-xs">
          <span className="text-[#9AA1AC] font-sans">ML Fraud Probability</span>
          <span className={`font-semibold ${parseFloat(fraudProbability) > 50 ? 'text-[#E5484D]' : 'text-[#2DD4A7]'}`}>
            {fraudProbability}%
          </span>
        </div>

        {/* Score Progress Bar */}
        <div className="w-full h-2 bg-[#1B1F26] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-150 ${
              decision === 'BLOCK'
                ? 'bg-[#E5484D]'
                : decision === 'CHALLENGE'
                ? 'bg-[#F0B429]'
                : 'bg-[#2DD4A7]'
            }`}
            style={{ width: `${Math.max(5, risk_score)}%` }}
          />
        </div>

        <div className="flex justify-between text-[11px] text-[#9AA1AC] pt-0.5">
          <span>Composite Score: <strong className="text-[#E8EAED] font-mono">{risk_score} / 100</strong></span>
          <span>Latency: <strong className="text-[#4C9AFF] font-mono">{processing_time_ms} ms</strong></span>
        </div>
      </div>

      {/* SHAP Feature Attribution Horizontal Bar Chart */}
      <div className="flex-1 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-[#5C6470] uppercase tracking-[0.06em] font-mono">
            TreeSHAP Feature Attributions
          </span>
          <span className="text-[11px] font-mono text-[#5C6470]">Contribution Δ</span>
        </div>

        {shap_factors.length === 0 ? (
          <p className="text-xs text-[#5C6470] italic font-mono">No significant feature attributions detected.</p>
        ) : (
          <div className="space-y-2.5">
            {shap_factors.map((factor, idx) => {
              const isRiskIncrease = factor.impact === 'INCREASES_RISK' || factor.contribution > 0;
              const absContrib = Math.abs(factor.contribution);
              const barWidth = Math.min(100, Math.max(12, (absContrib / 2.5) * 100));

              return (
                <div key={idx} className="p-2.5 rounded-[6px] bg-[#0B0D10] border border-[#262B33] space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center space-x-1.5">
                      {isRiskIncrease ? (
                        <TrendingUp className="w-3.5 h-3.5 text-[#E5484D] shrink-0" />
                      ) : (
                        <TrendingDown className="w-3.5 h-3.5 text-[#2DD4A7] shrink-0" />
                      )}
                      <span className="font-semibold text-[#E8EAED]">
                        {formatFeatureName(factor.feature)}
                      </span>
                    </div>

                    <span className={`font-semibold ${isRiskIncrease ? 'text-[#E5484D]' : 'text-[#2DD4A7]'}`}>
                      {factor.contribution > 0 ? `+${factor.contribution}` : factor.contribution}
                    </span>
                  </div>

                  {/* Horizontal Bar Chart Representation */}
                  <div className="w-full h-1.5 bg-[#1B1F26] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-150 ${
                        isRiskIncrease ? 'bg-[#E5484D]' : 'bg-[#2DD4A7]'
                      }`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>

                  <p className="text-xs text-[#9AA1AC] font-sans">
                    {factor.explanation}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Triggered Rules Summary */}
      {rule_violations.length > 0 && (
        <div className="p-3 rounded-[6px] bg-[rgba(229,72,77,0.15)] border border-[#E5484D] text-xs space-y-1 font-mono">
          <span className="font-semibold text-[#E5484D] block">Triggered Operational Rules:</span>
          {rule_violations.map((rule, idx) => (
            <div key={idx} className="text-[11px] text-[#E8EAED] flex items-center justify-between">
              <span>• {rule.rule_name}</span>
              <span className="text-[#E5484D] font-semibold">+{rule.points_added} pts</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

