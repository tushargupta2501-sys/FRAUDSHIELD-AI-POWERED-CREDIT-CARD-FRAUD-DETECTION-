import React, { useState } from 'react';
import { Search } from 'lucide-react';

export const LiveTransactionFeed = ({ transactions = [], onSelectTransaction, selectedTxId }) => {
  const [filterDecision, setFilterDecision] = useState('ALL');
  const [feedSearch, setFeedSearch] = useState('');

  // Apply decision filter and text search to incoming stream
  const filteredTransactions = transactions.filter((tx) => {
    // 1. Decision Filter
    if (filterDecision !== 'ALL' && tx.decision !== filterDecision) {
      return false;
    }
    // 2. Text Search Filter
    if (feedSearch.trim() !== '') {
      const q = feedSearch.toLowerCase();
      const matchId = tx.transaction_id?.toLowerCase().includes(q);
      const matchMerchant = tx.merchant_name?.toLowerCase().includes(q);
      const matchUser = tx.user_id?.toLowerCase().includes(q);
      const matchMcc = tx.merchant_category_code?.toLowerCase().includes(q);
      if (!matchId && !matchMerchant && !matchUser && !matchMcc) return false;
    }
    return true;
  });

  const getDecisionBadge = (decision) => {
    switch (decision) {
      case 'BLOCK':
        return <span className="badge-block font-mono text-[11px]">BLOCK</span>;
      case 'CHALLENGE':
        return <span className="badge-challenge font-mono text-[11px]">REVIEW</span>;
      case 'ALLOW':
      default:
        return <span className="badge-allow font-mono text-[11px]">ALLOW</span>;
    }
  };

  return (
    <div className="sentinel-card p-5 space-y-4 flex flex-col h-full min-h-[580px]">
      {/* Feed Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#262B33]">
        <div className="flex items-center space-x-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2DD4A7] animate-live-dot" />
          <h3 className="text-xs font-semibold text-[#E8EAED] font-mono uppercase tracking-[0.06em]">
            Live Stream Feed ({filteredTransactions.length})
          </h3>
        </div>

        <span className="text-[11px] font-mono text-[#5C6470]">
          WS Broadcast Active
        </span>
      </div>

      {/* Filter Tabs: ALL / BLOCK / CHALLENGE / ALLOW */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center space-x-1 bg-[#0B0D10] p-1 rounded-[6px] border border-[#262B33] text-xs">
          {['ALL', 'BLOCK', 'CHALLENGE', 'ALLOW'].map((tab) => {
            const isActive = filterDecision === tab;
            return (
              <button
                key={tab}
                onClick={() => setFilterDecision(tab)}
                className={`px-2.5 py-1 rounded-[6px] font-mono text-[11px] font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#F5A623]/40 ${
                  isActive
                    ? tab === 'BLOCK'
                      ? 'bg-[rgba(229,72,77,0.15)] text-[#E5484D] border border-[#E5484D]'
                      : tab === 'CHALLENGE'
                      ? 'bg-[rgba(240,180,41,0.15)] text-[#F0B429] border border-[#F0B429]'
                      : tab === 'ALLOW'
                      ? 'bg-[rgba(45,212,167,0.15)] text-[#2DD4A7] border border-[#2DD4A7]'
                      : 'bg-[#1B1F26] text-[#F5A623] border border-[#F5A623]'
                    : 'text-[#9AA1AC] hover:text-[#E8EAED] hover:bg-[#1B1F26]'
                }`}
              >
                {tab === 'CHALLENGE' ? 'REVIEW' : tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Feed Search Box */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#5C6470]" />
        <input
          type="text"
          placeholder="Filter stream by merchant, ID..."
          value={feedSearch}
          onChange={(e) => setFeedSearch(e.target.value)}
          className="w-full pl-8 pr-3 py-1.5 rounded-[6px] bg-[#0B0D10] border border-[#262B33] text-xs font-mono text-[#E8EAED] placeholder-[#5C6470] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/40 focus:ring-offset-2 focus:ring-offset-[#0B0D10] transition-colors duration-150"
        />
      </div>

      {/* Stream Items List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {filteredTransactions.length === 0 ? (
          <div className="p-8 text-center text-[#5C6470] text-xs font-mono space-y-1">
            <p>No transactions matching filter criteria.</p>
            <p className="text-[11px]">Submit a test transaction in the Simulator to see stream updates.</p>
          </div>
        ) : (
          filteredTransactions.map((tx) => {
            const isSelected = selectedTxId === tx.transaction_id;

            return (
              <div
                key={tx.transaction_id}
                onClick={() => onSelectTransaction && onSelectTransaction(tx)}
                className={`p-3 rounded-[6px] border text-xs cursor-pointer transition-all duration-150 ${
                  isSelected
                    ? 'bg-[#1B1F26] border-l-2 border-l-[#F5A623] border-[#3A4149]'
                    : 'bg-[#0B0D10] border-[#262B33] hover:border-[#3A4149] hover:bg-[#1B1F26]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-[#E8EAED] truncate max-w-[140px] font-sans">
                    {tx.merchant_name}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-semibold text-[#E8EAED]">${tx.amount?.toFixed(2)}</span>
                    {getDecisionBadge(tx.decision)}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-[#9AA1AC]">
                  <span>User: <strong className="text-[#E8EAED]">{tx.user_id}</strong></span>
                  <span>Score: <strong className={tx.risk_score > 70 ? 'text-[#E5484D]' : tx.risk_score > 30 ? 'text-[#F0B429]' : 'text-[#2DD4A7]'}>{tx.risk_score}</strong></span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

