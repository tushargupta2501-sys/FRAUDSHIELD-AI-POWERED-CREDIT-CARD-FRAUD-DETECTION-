import React, { useEffect, useState } from 'react';
import { Sliders, Plus, Check, X, ShieldAlert, Edit, Trash2, Power } from 'lucide-react';
import { fetchRules, createRule, toggleRule } from '../api/client';

export const RuleManager = () => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [newRule, setNewRule] = useState({
    rule_id: 'RULE_NEW_CUSTOM',
    name: 'Custom High Risk Pattern',
    condition_type: 'ABSOLUTE_AMOUNT',
    threshold: 2500.0,
    severity: 'HIGH',
    points: 30.0,
    description: 'Custom security rule triggered on suspicious condition.'
  });

  const loadRulesData = async () => {
    setLoading(true);
    try {
      const data = await fetchRules();
      setRules(data);
    } catch (err) {
      console.error("Failed to load rules:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRulesData();
  }, []);

  const handleToggle = async (ruleId) => {
    try {
      const updated = await toggleRule(ruleId);
      setRules((prev) => prev.map(r => r.rule_id === ruleId ? { ...r, is_active: updated.is_active } : r));
    } catch (err) {
      console.error("Toggle error:", err);
    }
  };

  const handleCreateRule = async (e) => {
    e.preventDefault();
    try {
      const created = await createRule(newRule);
      setRules((prev) => [...prev, created]);
      setShowAddModal(false);
    } catch (err) {
      console.error("Create rule error:", err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">Deterministic Fraud Rule Management</h3>
          <p className="text-xs text-slate-400">Configure operational rule penalty points, severity tags, and active status switches.</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="btn-ember px-3.5 py-1.5 text-xs flex items-center space-x-1.5"
        >
          <Plus className="w-3.5 h-3.5 text-[#07090D]" />
          <span>Add Custom Rule</span>
        </button>
      </div>

      {/* Rules Table */}
      <div className="overflow-x-auto rounded-xl border border-white/5 bg-[#0D1118]">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#151A22] border-b border-white/5 text-slate-400 uppercase tracking-wider font-mono text-[10px]">
            <tr>
              <th className="py-3 px-4">Rule Name</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4">Severity</th>
              <th className="py-3 px-4">Penalty Points</th>
              <th className="py-3 px-4">Status Switch</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-mono">
            {rules.map((rule) => (
              <tr key={rule.rule_id} className="hover:bg-white/5 transition">
                <td className="py-3.5 px-4 font-bold text-white">
                  {rule.name}
                  <span className="block text-[10px] text-slate-500 font-mono">{rule.rule_id}</span>
                </td>
                <td className="py-3.5 px-4 text-slate-300 font-sans max-w-xs">{rule.description}</td>
                <td className="py-3.5 px-4">
                  <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase ${
                    rule.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                    rule.severity === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                    'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  }`}>
                    {rule.severity}
                  </span>
                </td>
                <td className="py-3.5 px-4 font-bold text-[#F59A4A]">+{rule.points} pts</td>
                <td className="py-3.5 px-4">
                  <button
                    onClick={() => handleToggle(rule.rule_id)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      rule.is_active ? 'bg-emerald-500' : 'bg-slate-700'
                    }`}
                  >
                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                      rule.is_active ? 'translate-x-4' : 'translate-x-1'
                    }`} />
                  </button>
                </td>
                <td className="py-3.5 px-4 text-right space-x-2">
                  <button title="Edit Rule" className="p-1 text-slate-400 hover:text-white transition">
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Custom Rule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="cyber-card p-6 max-w-lg w-full space-y-4 relative">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <h3 className="text-base font-bold text-white">Create New Deterministic Rule</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRule} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Rule Name</label>
                <input
                  type="text"
                  value={newRule.name}
                  onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-[#0D1118] border border-white/10 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Description</label>
                <input
                  type="text"
                  value={newRule.description}
                  onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-[#0D1118] border border-white/10 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">Severity</label>
                  <select
                    value={newRule.severity}
                    onChange={(e) => setNewRule({ ...newRule, severity: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0D1118] border border-white/10 text-white"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">Penalty Points</label>
                  <input
                    type="number"
                    value={newRule.points}
                    onChange={(e) => setNewRule({ ...newRule, points: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0D1118] border border-white/10 text-white font-mono"
                  />
                </div>
              </div>

              <button type="submit" className="btn-ember w-full py-2.5 text-xs font-bold uppercase mt-2">
                Save & Activate Security Rule
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
