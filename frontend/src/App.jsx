import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { MetricCards } from './components/MetricCards';
import { TransactionSimulator } from './components/TransactionSimulator';
import { LiveTransactionFeed } from './components/LiveTransactionFeed';
import { SHAPExplainability } from './components/SHAPExplainability';
import { FraudAnalyticsCharts } from './components/FraudAnalyticsCharts';
import { RuleManager } from './components/RuleManager';
import { ArchitectureView } from './components/ArchitectureView';

import {
  fetchTransactions,
  fetchSummaryMetrics,
  fetchGlobalSHAP,
  fetchTimeseriesData
} from './api/client';
import { TransactionWebSocket } from './api/websocket';

export function App() {
  const [activeTab, setActiveTab] = useState('console');
  const [isWsConnected, setIsWsConnected] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [selectedTx, setSelectedTx] = useState(null);
  const [globalShap, setGlobalShap] = useState([]);
  const [timeseriesData, setTimeseriesData] = useState([]);

  // Load initial backend state
  const loadInitialData = async () => {
    try {
      const [txs, sum, shap, ts] = await Promise.allSettled([
        fetchTransactions(50),
        fetchSummaryMetrics(),
        fetchGlobalSHAP(),
        fetchTimeseriesData()
      ]);

      if (txs.status === 'fulfilled') {
        setTransactions(txs.value);
        if (txs.value.length > 0 && !selectedTx) {
          setSelectedTx(txs.value[0]);
        }
      }
      if (sum.status === 'fulfilled') setMetrics(sum.value);
      if (shap.status === 'fulfilled') setGlobalShap(shap.value);
      if (ts.status === 'fulfilled') setTimeseriesData(ts.value);
    } catch (err) {
      console.error("Data load error:", err);
    }
  };

  useEffect(() => {
    loadInitialData();

    // Initialize WebSocket
    const ws = new TransactionWebSocket(
      (message) => {
        if (message.type === 'NEW_TRANSACTION' && message.data) {
          const newTx = message.data;
          setTransactions((prev) => [newTx, ...prev.slice(0, 99)]);
          setSelectedTx(newTx);
          // Refresh summary counters
          fetchSummaryMetrics().then(setMetrics).catch(() => {});
        }
      },
      (connected) => {
        setIsWsConnected(connected);
      }
    );

    ws.connect();

    // Polling interval fallback for metrics
    const interval = setInterval(() => {
      fetchSummaryMetrics().then(setMetrics).catch(() => {});
    }, 5000);

    return () => {
      ws.disconnect();
      clearInterval(interval);
    };
  }, []);

  const handleEvaluationComplete = (result) => {
    setSelectedTx(result);
    setTransactions((prev) => [result, ...prev.filter(t => t.transaction_id !== result.transaction_id)]);
    fetchSummaryMetrics().then(setMetrics).catch(() => {});
  };

  return (
    <div className="min-h-screen bg-[#080C15] text-slate-100 flex flex-col font-sans">
      <Header
        isWsConnected={isWsConnected}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {/* KPI Metric Summary Row */}
        <MetricCards metrics={metrics} />

        {/* Tab Content */}
        {activeTab === 'console' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Transaction Simulator (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <TransactionSimulator onEvaluationComplete={handleEvaluationComplete} />
            </div>

            {/* Middle Column: Live Transaction Feed (4 cols) */}
            <div className="lg:col-span-4">
              <LiveTransactionFeed
                transactions={transactions}
                onSelectTransaction={setSelectedTx}
                selectedTxId={selectedTx?.transaction_id}
              />
            </div>

            {/* Right Column: SHAP Local Explainability (3 cols) */}
            <div className="lg:col-span-3">
              <SHAPExplainability selectedTransaction={selectedTx} />
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <FraudAnalyticsCharts timeseriesData={timeseriesData} globalShap={globalShap} />
          </div>
        )}

        {activeTab === 'rules' && (
          <div className="space-y-6">
            <RuleManager />
          </div>
        )}

        {activeTab === 'architecture' && (
          <div className="space-y-6">
            <ArchitectureView />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
