import React, { useState } from 'react';
import { Sparkles, RefreshCw, Sliders, CheckCircle2, Zap } from 'lucide-react';
import { evaluateTransaction } from '../api/client';

export const TransactionSimulator = ({ onEvaluationComplete }) => {
  const [activePresetIndex, setActivePresetIndex] = useState(0); // Default active preset

  const [formData, setFormData] = useState({
    user_id: 'usr_4402',
    card_id: 'card_visa_8911',
    amount: 68.50,
    currency: 'USD',
    merchant_name: 'Whole Foods Market',
    merchant_category_code: '5411', // Grocery
    country: 'US',
    ip_address: '198.51.100.22',
    hour_of_day: 14,
    // V1-V28 anonymized feature overrides
    V14: 0.2,
    V12: 0.1,
    V10: 0.1,
    V17: 0.0,
    V4: 0.1
  });

  const [showAdvancedVCols, setShowAdvancedVCols] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const presets = [
    {
      name: 'Normal Transaction',
      type: 'legit',
      data: {
        user_id: 'usr_4402',
        card_id: 'card_visa_8911',
        amount: 68.50,
        merchant_name: 'Whole Foods Market',
        merchant_category_code: '5411',
        country: 'US',
        ip_address: '198.51.100.22',
        hour_of_day: 14,
        V14: 0.2, V12: 0.1, V10: 0.1, V17: 0.0, V4: 0.1
      }
    },
    {
      name: 'Suspicious Transaction',
      type: 'fraud',
      data: {
        user_id: 'usr_4402',
        card_id: 'card_visa_8911',
        amount: 2850.00,
        merchant_name: 'BestBuy Cyber Store',
        merchant_category_code: '5732',
        country: 'US',
        ip_address: '185.220.101.5',
        hour_of_day: 2,
        V14: -4.5, V12: -3.8, V10: -3.2, V17: -2.9, V4: 3.5
      }
    },
    {
      name: 'High Amount Transaction',
      type: 'fraud',
      data: {
        user_id: 'usr_3310',
        card_id: 'card_visa_9901',
        amount: 4500.00,
        merchant_name: 'Luxury Jewelry Emporium',
        merchant_category_code: '5944',
        country: 'US',
        ip_address: '198.51.100.22',
        hour_of_day: 18,
        V14: -2.1, V12: -1.8, V10: -1.5, V17: -1.2, V4: 1.8
      }
    },
    {
      name: 'High Velocity Transaction',
      type: 'fraud',
      data: {
        user_id: 'usr_4402',
        card_id: 'card_visa_8911',
        amount: 499.00,
        merchant_name: 'Apple Store Online',
        merchant_category_code: '5732',
        country: 'US',
        ip_address: '198.51.100.22',
        hour_of_day: 15,
        V14: -4.2, V12: -3.5, V10: -3.0, V17: -2.5, V4: 3.2
      }
    },
    {
      name: 'High Risk Merchant',
      type: 'fraud',
      data: {
        user_id: 'usr_9912',
        card_id: 'card_mc_1102',
        amount: 3200.00,
        merchant_name: 'Global Crypto P2P Exchange',
        merchant_category_code: '6051',
        country: 'RU',
        ip_address: '95.173.136.2',
        hour_of_day: 3,
        V14: -5.1, V12: -4.2, V10: -3.9, V17: -3.5, V4: 4.1
      }
    }
  ];

  const handleApplyPreset = (preset, idx) => {
    setActivePresetIndex(idx);
    setFormData({
      ...formData,
      ...preset.data
    });
  };

  const handleInputChange = (field, value) => {
    setActivePresetIndex(null); // Clear preset highlight if user manually modifies fields
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await evaluateTransaction({
        ...formData,
        amount: parseFloat(formData.amount)
      });
      setLastResult(result);
      if (onEvaluationComplete) onEvaluationComplete(result);
    } catch (err) {
      console.error("Evaluation error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sentinel-card p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#262B33]">
        <div>
          <div className="flex items-center space-x-2 text-[#F5A623] font-mono text-xs mb-0.5 font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="uppercase tracking-[0.06em]">Real-Time Injection Simulator</span>
          </div>
          <h2 className="text-xl font-semibold text-[#E8EAED] tracking-tight">Transaction Risk Simulator</h2>
        </div>
        <span className="text-xs font-mono text-[#9AA1AC] bg-[#0B0D10] px-3 py-1 rounded-[6px] border border-[#262B33]">
          POST /api/v1/transactions/check
        </span>
      </div>

      {/* Preset Scenario Buttons with Clear Active Selection Highlight */}
      <div>
        <p className="text-[11px] font-mono font-semibold text-[#5C6470] mb-2.5 uppercase tracking-[0.06em] flex items-center justify-between">
          <span>Quick Scenario Presets</span>
          {activePresetIndex !== null && (
            <span className="text-[#F5A623] text-[11px] font-semibold">
              Active: {presets[activePresetIndex]?.name}
            </span>
          )}
        </p>
        <div className="flex flex-wrap gap-2.5">
          {presets.map((preset, idx) => {
            const isSelected = activePresetIndex === idx;
            const isFraud = preset.type === 'fraud';

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(preset, idx)}
                className={`px-3 py-2 rounded-[6px] text-xs font-medium transition-all duration-150 flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-[#F5A623]/40 ${
                  isSelected
                    ? isFraud
                      ? 'bg-[#E5484D] text-[#FFFFFF] font-semibold border border-[#E5484D]'
                      : 'bg-[#2DD4A7] text-[#0B0D10] font-semibold border border-[#2DD4A7]'
                    : 'bg-[#1B1F26] text-[#9AA1AC] border border-[#262B33] hover:bg-[#1B1F26] hover:border-[#3A4149] hover:text-[#E8EAED]'
                }`}
              >
                {isSelected && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                <span>{preset.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Amount */}
          <div>
            <label className="text-xs font-semibold text-[#9AA1AC] block mb-1">
              Transaction Amount ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              required
              className="w-full px-3 py-2 rounded-[6px] bg-[#0B0D10] border border-[#262B33] text-xs text-[#E8EAED] font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-[#F5A623]/40 focus:ring-offset-2 focus:ring-offset-[#0B0D10] transition-colors duration-150"
            />
          </div>

          {/* Merchant Name */}
          <div>
            <label className="text-xs font-semibold text-[#9AA1AC] block mb-1">
              Merchant Name
            </label>
            <input
              type="text"
              value={formData.merchant_name}
              onChange={(e) => handleInputChange('merchant_name', e.target.value)}
              required
              className="w-full px-3 py-2 rounded-[6px] bg-[#0B0D10] border border-[#262B33] text-xs text-[#E8EAED] font-sans focus:outline-none focus:ring-2 focus:ring-[#F5A623]/40 focus:ring-offset-2 focus:ring-offset-[#0B0D10] transition-colors duration-150"
            />
          </div>

          {/* MCC */}
          <div>
            <label className="text-xs font-semibold text-[#9AA1AC] block mb-1">
              Merchant Category Code (MCC)
            </label>
            <input
              type="text"
              value={formData.merchant_category_code}
              onChange={(e) => handleInputChange('merchant_category_code', e.target.value)}
              required
              placeholder="5411, 5732, 6051..."
              className="w-full px-3 py-2 rounded-[6px] bg-[#0B0D10] border border-[#262B33] text-xs text-[#E8EAED] font-mono focus:outline-none focus:ring-2 focus:ring-[#F5A623]/40 focus:ring-offset-2 focus:ring-offset-[#0B0D10] transition-colors duration-150"
            />
          </div>

          {/* Country */}
          <div>
            <label className="text-xs font-semibold text-[#9AA1AC] block mb-1">
              Country Code
            </label>
            <input
              type="text"
              value={formData.country}
              onChange={(e) => handleInputChange('country', e.target.value)}
              required
              placeholder="US, RU, NG, UK..."
              className="w-full px-3 py-2 rounded-[6px] bg-[#0B0D10] border border-[#262B33] text-xs text-[#E8EAED] font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#F5A623]/40 focus:ring-offset-2 focus:ring-offset-[#0B0D10] transition-colors duration-150"
            />
          </div>

          {/* User ID */}
          <div>
            <label className="text-xs font-semibold text-[#9AA1AC] block mb-1">
              User ID / Cardholder ID
            </label>
            <input
              type="text"
              value={formData.user_id}
              onChange={(e) => handleInputChange('user_id', e.target.value)}
              required
              className="w-full px-3 py-2 rounded-[6px] bg-[#0B0D10] border border-[#262B33] text-xs text-[#E8EAED] font-mono focus:outline-none focus:ring-2 focus:ring-[#F5A623]/40 focus:ring-offset-2 focus:ring-offset-[#0B0D10] transition-colors duration-150"
            />
          </div>

          {/* Card ID */}
          <div>
            <label className="text-xs font-semibold text-[#9AA1AC] block mb-1">
              Payment Card Token ID
            </label>
            <input
              type="text"
              value={formData.card_id}
              onChange={(e) => handleInputChange('card_id', e.target.value)}
              required
              className="w-full px-3 py-2 rounded-[6px] bg-[#0B0D10] border border-[#262B33] text-xs text-[#E8EAED] font-mono focus:outline-none focus:ring-2 focus:ring-[#F5A623]/40 focus:ring-offset-2 focus:ring-offset-[#0B0D10] transition-colors duration-150"
            />
          </div>
        </div>

        {/* Advanced PCA Features Toggle */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setShowAdvancedVCols(!showAdvancedVCols)}
            className="flex items-center space-x-2 text-xs font-mono text-[#4C9AFF] hover:underline focus:outline-none"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{showAdvancedVCols ? 'Hide PCA Features V1–V28' : 'Customize Anonymized PCA Features (V14, V12, V10, V4)'}</span>
          </button>

          {showAdvancedVCols && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-[6px] bg-[#0B0D10] border border-[#262B33] mt-2 text-xs">
              <div>
                <label className="text-[11px] text-[#5C6470] block mb-1 font-mono">V14 (Strong Neg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.V14}
                  onChange={(e) => handleInputChange('V14', parseFloat(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-[6px] bg-[#14171C] border border-[#262B33] font-mono text-[#E8EAED]"
                />
              </div>
              <div>
                <label className="text-[11px] text-[#5C6470] block mb-1 font-mono">V12 (Strong Neg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.V12}
                  onChange={(e) => handleInputChange('V12', parseFloat(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-[6px] bg-[#14171C] border border-[#262B33] font-mono text-[#E8EAED]"
                />
              </div>
              <div>
                <label className="text-[11px] text-[#5C6470] block mb-1 font-mono">V10 (Neg Correlation)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.V10}
                  onChange={(e) => handleInputChange('V10', parseFloat(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-[6px] bg-[#14171C] border border-[#262B33] font-mono text-[#E8EAED]"
                />
              </div>
              <div>
                <label className="text-[11px] text-[#5C6470] block mb-1 font-mono">V4 (Pos Shift)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.V4}
                  onChange={(e) => handleInputChange('V4', parseFloat(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-[6px] bg-[#14171C] border border-[#262B33] font-mono text-[#E8EAED]"
                />
              </div>
            </div>
          )}
        </div>

        {/* Submit CTA Button */}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-3 text-xs uppercase tracking-[0.06em] font-semibold disabled:opacity-50"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-[#0B0D10]" />
              <span>Evaluating Risk via ML & Rules...</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 text-[#0B0D10]" />
              <span>EVALUATE TRANSACTION</span>
            </>
          )}
        </button>
      </form>

      {/* Immediate Inline Result Summary Card */}
      {lastResult && (
        <div className={`p-4 rounded-[8px] border space-y-2 ${
          lastResult.decision === 'BLOCK' ? 'bg-[rgba(229,72,77,0.15)] border-[#E5484D] text-[#E5484D]' :
          lastResult.decision === 'CHALLENGE' ? 'bg-[rgba(240,180,41,0.15)] border-[#F0B429] text-[#F0B429]' :
          'bg-[rgba(45,212,167,0.15)] border-[#2DD4A7] text-[#2DD4A7]'
        }`}>
          <div className="flex items-center justify-between">
            <span className="font-mono font-semibold text-xs uppercase tracking-[0.06em]">
              Evaluation Verdict: {lastResult.decision}
            </span>
            <span className="font-mono font-semibold text-sm">
              Score: {lastResult.risk_score} / 100
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono text-[#9AA1AC] pt-1 border-t border-current/20">
            <div>ML Prob: <strong className="text-[#E8EAED]">{(lastResult.ml_score * 100).toFixed(1)}%</strong></div>
            <div>Z-Score: <strong className="text-[#E8EAED]">{lastResult.behavioral_anomaly_score} σ</strong></div>
            <div>Rules: <strong className="text-[#E8EAED]">{lastResult.rule_violations?.length || 0} triggered</strong></div>
            <div>Latency: <strong className="text-[#4C9AFF]">{lastResult.processing_time_ms} ms</strong></div>
          </div>
        </div>
      )}
    </div>
  );
};

