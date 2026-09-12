import React, { useState } from 'react';
import { Send, Sparkles, AlertTriangle, ShieldCheck, Zap, RefreshCw } from 'lucide-react';
import { evaluateTransaction } from '../api/client';

export const TransactionSimulator = ({ onEvaluationComplete }) => {
  const [formData, setFormData] = useState({
    user_id: 'usr_4402',
    card_id: 'card_visa_8911',
    amount: 145.0,
    currency: 'USD',
    merchant_name: 'Target Supercenter',
    merchant_category_code: '5411', // Grocery
    country: 'US',
    ip_address: '198.51.100.22',
  });

  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const presets = [
    {
      name: 'Normal Grocery',
      type: 'legit',
      data: {
        user_id: 'usr_4402',
        card_id: 'card_visa_8911',
        amount: 68.50,
        merchant_name: 'Whole Foods Market',
        merchant_category_code: '5411',
        country: 'US',
        ip_address: '198.51.100.22'
      }
    },
    {
      name: 'Midnight Electronics Spree',
      type: 'fraud',
      data: {
        user_id: 'usr_4402',
        card_id: 'card_visa_8911',
        amount: 2850.00,
        merchant_name: 'BestBuy Cyber Store',
        merchant_category_code: '5732',
        country: 'US',
        ip_address: '185.220.101.5'
      }
    },
    {
      name: 'Rapid Velocity Burst',
      type: 'fraud',
      data: {
        user_id: 'usr_4402',
        card_id: 'card_visa_8911',
        amount: 499.00,
        merchant_name: 'Apple Store Online',
        merchant_category_code: '5732',
        country: 'US',
        ip_address: '198.51.100.22'
      }
    },
    {
      name: 'Sanctioned Foreign Wire',
      type: 'fraud',
      data: {
        user_id: 'usr_9912',
        card_id: 'card_mc_1102',
        amount: 4200.00,
        merchant_name: 'Global Crypto P2P',
        merchant_category_code: '6051',
        country: 'RU',
        ip_address: '95.173.136.2'
      }
    },
    {
      name: 'Micro Card Testing ($1.85)',
      type: 'fraud',
      data: {
        user_id: 'usr_7721',
        card_id: 'card_amex_4419',
        amount: 1.85,
        merchant_name: 'Online Gift Cards Inc',
        merchant_category_code: '5311',
        country: 'NG',
        ip_address: '102.89.23.11'
      }
    }
  ];

  const handleApplyPreset = (preset) => {
    setFormData({
      ...formData,
      ...preset.data
    });
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
    <div className="rounded-2xl bg-[#0F1424] border border-gray-800 p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-bold text-white">Live Transaction Simulator</h2>
        </div>
        <span className="text-xs text-gray-400">Injects directly into Security Gate</span>
      </div>

      {/* Preset Buttons */}
      <div className="mb-5">
        <p className="text-xs font-medium text-gray-400 mb-2">Simulate Attack or Normal Pattern Presets:</p>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(preset)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                preset.type === 'fraud'
                  ? 'bg-rose-500/10 text-rose-300 border border-rose-500/30 hover:bg-rose-500/20'
                  : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20'
              }`}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Form Fields */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">User ID</label>
            <input
              type="text"
              value={formData.user_id}
              onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-gray-900/90 border border-gray-800 text-sm text-gray-100 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Card ID / Token</label>
            <input
              type="text"
              value={formData.card_id}
              onChange={(e) => setFormData({ ...formData, card_id: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-gray-900/90 border border-gray-800 text-sm text-gray-100 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Transaction Amount ($ USD)</label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-gray-900/90 border border-gray-800 text-sm text-gray-100 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Merchant Name</label>
            <input
              type="text"
              value={formData.merchant_name}
              onChange={(e) => setFormData({ ...formData, merchant_name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-gray-900/90 border border-gray-800 text-sm text-gray-100 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Merchant MCC (4 digits)</label>
            <input
              type="text"
              maxLength={4}
              value={formData.merchant_category_code}
              onChange={(e) => setFormData({ ...formData, merchant_category_code: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-gray-900/90 border border-gray-800 text-sm text-gray-100 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Country (ISO-2)</label>
            <input
              type="text"
              maxLength={2}
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value.toUpperCase() })}
              className="w-full px-3 py-2 rounded-xl bg-gray-900/90 border border-gray-800 text-sm text-gray-100 focus:outline-none focus:border-blue-500"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm flex items-center justify-center space-x-2 transition-all duration-200 shadow-lg shadow-blue-500/20 disabled:opacity-50"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Evaluating in Real-Time Pipeline...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Evaluate Transaction</span>
            </>
          )}
        </button>
      </form>

      {/* Instant Decision Banner */}
      {lastResult && (
        <div className={`mt-6 p-4 rounded-xl border transition-all duration-300 ${
          lastResult.decision === 'BLOCK'
            ? 'bg-rose-950/40 border-rose-500/40 text-rose-200 glow-danger'
            : lastResult.decision === 'CHALLENGE'
            ? 'bg-amber-950/40 border-amber-500/40 text-amber-200 glow-warning'
            : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200 glow-success'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {lastResult.decision === 'BLOCK' ? (
                <AlertTriangle className="w-6 h-6 text-rose-400" />
              ) : (
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              )}
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-base tracking-wide">DECISION: {lastResult.decision}</span>
                  <span className="px-2 py-0.5 text-xs font-semibold rounded bg-black/40">
                    Risk Score: {lastResult.risk_score} / 100
                  </span>
                </div>
                <p className="text-xs mt-1 text-gray-300">
                  Evaluated in {lastResult.processing_time_ms} ms | ML Fraud Prob: {(lastResult.ml_score * 100).toFixed(1)}%
                </p>
              </div>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full uppercase tracking-wider font-bold bg-black/30 border border-white/10">
              Tier: {lastResult.risk_tier}
            </span>
          </div>

          {lastResult.rule_violations?.length > 0 && (
            <div className="mt-3 pt-3 border-t border-white/10 text-xs">
              <span className="font-semibold text-rose-300">Triggered Rules:</span>
              <ul className="list-disc list-inside mt-1 space-y-0.5 text-gray-300">
                {lastResult.rule_violations.map((r, i) => (
                  <li key={i}>{r.rule_name}: {r.description}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
