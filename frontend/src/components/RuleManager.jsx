import React, { useState, useEffect } from 'react';
import { Sliders, ToggleLeft, ToggleRight, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { fetchRules, toggleRule } from '../api/client';

export const RuleManager = () => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadRules = async () => {
    try {
      const data = await fetchRules();
      setRules(data);
    } catch (err) {
      console.error("Error fetching rules:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRules();
  }, []);

  const handleToggle = async (ruleId) => {
    try {
      await toggleRule(ruleId);
      setRules(rules.map(r => r.rule_id === ruleId ? { ...r, is_active: !r.is_active } : r));
    } catch (err) {
      console.error("Toggle error:", err);
    }
  };

  return (
    <div className="rounded-2xl bg-[#0F1424] border border-gray-800 p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-blue-400" />
            <span>Deterministic Rule Engine Matrix</span>
          </h3>
          <p className="text-xs text-gray-400">Manage deterministic logic, velocity limits, and country embargo filters</p>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">
          {rules.filter(r => r.is_active).length} Active Rules
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        {rules.map((rule) => {
          const isActive = rule.is_active !== false;
          return (
            <div
              key={rule.rule_id}
              className={`p-4 rounded-xl border transition-all duration-200 ${
                isActive
                  ? 'bg-gray-900/60 border-gray-800 hover:border-gray-700'
                  : 'bg-gray-950/40 border-gray-900 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-white">{rule.name}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      rule.severity === 'CRITICAL'
                        ? 'bg-rose-500/20 text-rose-300'
                        : rule.severity === 'HIGH'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-blue-500/20 text-blue-300'
                    }`}>
                      {rule.severity}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{rule.description}</p>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggle(rule.rule_id)}
                  className="p-1 text-gray-400 hover:text-white transition-colors"
                >
                  {isActive ? (
                    <ToggleRight className="w-7 h-7 text-emerald-400" />
                  ) : (
                    <ToggleLeft className="w-7 h-7 text-gray-600" />
                  )}
                </button>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-800/80 flex items-center justify-between text-xs text-gray-400">
                <span>Weight: <strong className="text-gray-200">+{rule.points || rule.weight || 25} pts</strong></span>
                <span className="font-mono text-[11px] text-gray-500">{rule.rule_id}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
