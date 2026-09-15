import React, { useEffect, useState } from 'react';
import { X, User, CreditCard, Activity, ShieldCheck, AlertTriangle } from 'lucide-react';
import { fetchCustomerProfile, fetchCustomerHistory } from '../api/client';

export const CustomerProfileModal = ({ customerId, onClose }) => {
  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!customerId) return;
    setLoading(true);
    Promise.allSettled([
      fetchCustomerProfile(customerId),
      fetchCustomerHistory(customerId)
    ]).then(([profRes, histRes]) => {
      if (profRes.status === 'fulfilled') setProfile(profRes.value);
      if (histRes.status === 'fulfilled') setHistory(histRes.value);
      setLoading(false);
    });
  }, [customerId]);

  if (!customerId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0F1424] border border-gray-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg bg-gray-800/50 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {loading ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-gray-400 font-mono">Retrieving Customer 30-Day Profile & Card Baselines...</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center space-x-3 pb-4 border-b border-gray-800">
              <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{profile?.full_name || customerId}</h3>
                <p className="text-xs text-gray-400 font-mono">
                  Customer ID: <span className="text-indigo-300">{customerId}</span> | Segment: {profile?.risk_segment || 'STANDARD'}
                </p>
              </div>
            </div>

            {/* 30-Day Behavioral Baseline Stats */}
            <div>
              <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-3 flex items-center space-x-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>30-Day Behavioral Baseline Engine</span>
              </h4>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-gray-900/60 border border-gray-800">
                  <span className="text-[11px] text-gray-400 block">30d Avg Amount</span>
                  <p className="text-base font-bold text-emerald-400 mt-0.5">
                    ${profile?.behavioral_profile?.avg_amount_30d?.toFixed(2) || '120.00'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-gray-900/60 border border-gray-800">
                  <span className="text-[11px] text-gray-400 block">30d Max Amount</span>
                  <p className="text-base font-bold text-amber-400 mt-0.5">
                    ${profile?.behavioral_profile?.max_amount_30d?.toFixed(2) || '450.00'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-gray-900/60 border border-gray-800">
                  <span className="text-[11px] text-gray-400 block">30d Total Txns</span>
                  <p className="text-base font-bold text-indigo-400 mt-0.5">
                    {profile?.behavioral_profile?.total_txns_30d || 28} txns
                  </p>
                </div>
              </div>
            </div>

            {/* Associated Payment Cards */}
            <div>
              <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-3 flex items-center space-x-2">
                <CreditCard className="w-4 h-4 text-indigo-400" />
                <span>Associated Payment Cards</span>
              </h4>

              <div className="space-y-2">
                {profile?.cards?.map((card, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-gray-900/40 border border-gray-800/80 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-white">{card.card_network}</span>
                      <span className="font-mono text-gray-400 ml-2">{card.masked_pan}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-gray-400">Limit: ${card.credit_limit}</span>
                      <span className="ml-3 px-1.5 py-0.5 text-[9px] font-bold rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                        {card.card_status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Historical Spend Summary */}
            {history && (
              <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/20 flex justify-between items-center text-xs">
                <div>
                  <span className="text-gray-400">Total Spend Volume: </span>
                  <span className="font-bold text-white">${history.total_spend_usd?.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-gray-400">Fraud Incidents: </span>
                  <span className="font-bold text-rose-400">{history.fraud_incidents_count}</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
