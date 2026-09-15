import React, { useState } from 'react';
import { TransactionSimulator } from '../components/TransactionSimulator';
import { LiveTransactionFeed } from '../components/LiveTransactionFeed';
import { SHAPExplainability } from '../components/SHAPExplainability';

export const SimulatorPage = ({
  transactions,
  selectedTx,
  setSelectedTx,
  onEvaluationComplete
}) => {
  return (
    <div className="space-y-6">
      {/* Simulator Section Header */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-800">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Real-Time Transaction Simulator</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Test credit card payments against the ML Engine, Rule Engine, and TreeSHAP attribution pipeline.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Transaction Simulator Input Form (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <TransactionSimulator onEvaluationComplete={onEvaluationComplete} />
        </div>

        {/* Middle Column: Live Transaction Feed (4 cols) */}
        <div className="lg:col-span-4">
          <LiveTransactionFeed
            transactions={transactions}
            onSelectTransaction={setSelectedTx}
            selectedTxId={selectedTx?.transaction_id}
          />
        </div>

        {/* Right Column: Instant SHAP Inspector (3 cols) */}
        <div className="lg:col-span-3">
          <SHAPExplainability selectedTransaction={selectedTx} />
        </div>
      </div>
    </div>
  );
};
