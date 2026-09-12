import React from 'react';
import { ShieldCheck, AlertTriangle, ShieldAlert, Clock, ArrowUpRight, Search } from 'lucide-react';

export const LiveTransactionFeed = ({ transactions, onSelectTransaction, selectedTxId }) => {
  const [filter, setFilter] = React.useState('ALL');
  const [search, setSearch] = React.useState('');

  const filtered = transactions.filter(tx => {
    if (filter !== 'ALL' && tx.decision !== filter) return false;
    if (search && !tx.merchant_name?.toLowerCase().includes(search.toLowerCase()) && !tx.user_id?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="rounded-2xl bg-[#0F1424] border border-gray-800 p-5 shadow-xl flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <span>Live Transaction Stream</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </h2>
          <p className="text-xs text-gray-400">Inspecting real-time card authorization pipeline</p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5 bg-gray-900/80 p-1 rounded-xl border border-gray-800 text-xs">
          {['ALL', 'BLOCK', 'CHALLENGE', 'ALLOW'].map((d) => (
            <button
              key={d}
              onClick={() => setFilter(d)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                filter === d
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-3">
        <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3" />
        <input
          type="text"
          placeholder="Filter by merchant or user..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-gray-900/80 border border-gray-800 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Transaction List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[520px]">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-xs">
            No transactions matching filter. Submit or simulate a transaction!
          </div>
        ) : (
          filtered.map((tx) => {
            const isSelected = selectedTxId === tx.transaction_id;
            const isBlock = tx.decision === 'BLOCK';
            const isChallenge = tx.decision === 'CHALLENGE';

            return (
              <div
                key={tx.transaction_id}
                onClick={() => onSelectTransaction(tx)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-blue-500 bg-blue-950/20 shadow-md'
                    : 'border-gray-800/80 bg-gray-900/40 hover:bg-gray-800/40 hover:border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className={`p-2 rounded-lg ${
                      isBlock
                        ? 'bg-rose-500/10 text-rose-400'
                        : isChallenge
                        ? 'bg-amber-500/10 text-amber-400'
                        : 'bg-emerald-500/10 text-emerald-400'
                    }`}>
                      {isBlock ? (
                        <AlertTriangle className="w-4 h-4" />
                      ) : isChallenge ? (
                        <ShieldAlert className="w-4 h-4" />
                      ) : (
                        <ShieldCheck className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-semibold text-white">{tx.merchant_name}</span>
                        <span className="text-[10px] text-gray-400">({tx.user_id})</span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {new Date(tx.timestamp).toLocaleTimeString()} · {tx.processing_time_ms}ms
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-bold text-white">
                      ${typeof tx.amount === 'number' ? tx.amount.toFixed(2) : tx.amount}
                    </div>
                    <span className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      isBlock
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : isChallenge
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {tx.decision} ({tx.risk_score})
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
