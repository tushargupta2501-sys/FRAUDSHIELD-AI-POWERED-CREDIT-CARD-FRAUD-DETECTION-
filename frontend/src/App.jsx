import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { HeaderNavigation } from './components/HeaderNavigation';
import { CustomerProfileModal } from './components/CustomerProfileModal';
import { Architecture3D } from './components/Architecture3D';
import { RuleManager } from './components/RuleManager';

import { LoginPage } from './pages/LoginPage';
import { SimulatorPage } from './pages/SimulatorPage';
import { ResultScreenPage } from './pages/ResultScreenPage';
import { InvestigationDashboardPage } from './pages/InvestigationDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

import { fetchTransactions, logoutUser } from './api/client';
import { TransactionWebSocket } from './api/websocket';

export function App() {
  const [activePage, setActivePage] = useState('admin');
  const [isWsConnected, setIsWsConnected] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('sentinel_user');
      return saved ? JSON.parse(saved) : { sub: 'analyst@sentinel.ai', role: 'SENIOR_FRAUD_ANALYST' };
    } catch {
      return null;
    }
  });

  const [transactions, setTransactions] = useState([]);
  const [selectedTx, setSelectedTx] = useState(null);
  const [inspectedCustomerId, setInspectedCustomerId] = useState(null);

  // Load initial transaction history
  const loadInitialData = async () => {
    try {
      const txs = await fetchTransactions(50);
      setTransactions(txs);
      if (txs.length > 0 && !selectedTx) {
        setSelectedTx(txs[0]);
      }
    } catch (err) {
      console.error("Initial transactions load error:", err);
    }
  };

  useEffect(() => {
    loadInitialData();

    // WebSocket real-time broadcast listener
    const ws = new TransactionWebSocket(
      (message) => {
        if (message.type === 'NEW_TRANSACTION' && message.data) {
          const newTx = message.data;
          setTransactions((prev) => [newTx, ...prev.slice(0, 99)]);
          setSelectedTx(newTx);
        }
      },
      (connected) => {
        setIsWsConnected(connected);
      }
    );

    ws.connect();

    return () => {
      ws.disconnect();
    };
  }, []);

  const handleEvaluationComplete = (result) => {
    setSelectedTx(result);
    setTransactions((prev) => [result, ...prev.filter(t => t.transaction_id !== result.transaction_id)]);
    setActivePage('results');
  };

  const handleLoginSuccess = (userInfo) => {
    setCurrentUser(userInfo);
    setActivePage('admin');
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setActivePage('landing');
  };

  return (
    <div className="min-h-screen bg-[#07090D] text-slate-100 flex flex-col font-sans selection:bg-[#F59A4A] selection:text-[#07090D]">
      {/* Persistent Left Sidebar Navigation */}
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        currentUser={currentUser}
        onLogout={handleLogout}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      {/* Top Command & Navigation Header */}
      <HeaderNavigation
        activePage={activePage}
        setActivePage={setActivePage}
        isWsConnected={isWsConnected}
        currentUser={currentUser}
        onLogout={handleLogout}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      {/* Main Responsive Content Workspace Container */}
      <main className={`flex-1 w-full transition-all duration-300 p-4 lg:p-8 space-y-8 ${
        isCollapsed ? 'lg:pl-24' : 'lg:pl-80'
      }`}>
        <div className="max-w-[1800px] mx-auto space-y-8">
          {activePage === 'landing' && (
            <LoginPage
              onLoginSuccess={handleLoginSuccess}
              onNavigateToSimulator={() => setActivePage('simulator')}
            />
          )}

          {(activePage === 'admin' || activePage === 'monitoring') && (
            <AdminDashboardPage
              transactions={transactions}
              onSelectTransaction={(tx) => {
                setSelectedTx(tx);
                setActivePage('results');
              }}
            />
          )}

          {activePage === 'simulator' && (
            <SimulatorPage
              transactions={transactions}
              selectedTx={selectedTx}
              setSelectedTx={(tx) => {
                setSelectedTx(tx);
                setActivePage('results');
              }}
              onEvaluationComplete={handleEvaluationComplete}
            />
          )}

          {activePage === 'results' && (
            <ResultScreenPage
              selectedTransaction={selectedTx}
              onInspectCustomer={(id) => setInspectedCustomerId(id)}
            />
          )}

          {(activePage === 'investigation' || activePage === 'alerts') && (
            <InvestigationDashboardPage
              onInspectCustomer={(id) => setInspectedCustomerId(id)}
              onSelectTransaction={(tx) => {
                setSelectedTx(tx);
                setActivePage('results');
              }}
            />
          )}

          {activePage === 'customers' && (
            <div className="cyber-card p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <h2 className="text-lg font-bold text-white">Customer Intelligence & Profiles</h2>
                <span className="text-xs font-mono text-[#F59A4A]">30-Day Spending Baselines & Risk Segmentation</span>
              </div>
              <p className="text-xs text-slate-400">
                Select any customer from the investigation queue or recent transactions to inspect their complete 30-day spending profile, sliding velocity counters, and card risk tier.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                {['usr_4402', 'usr_9912', 'usr_7721'].map((cid) => (
                  <button
                    key={cid}
                    onClick={() => setInspectedCustomerId(cid)}
                    className="cyber-card-interactive p-4 text-left space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-white text-xs">{cid}</span>
                      <span className="px-2 py-0.5 text-[9px] font-mono font-bold rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        Inspect Profile
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">View 30-day Z-scores, velocity counters, and associated payment cards.</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activePage === 'rules' && (
            <div className="cyber-card p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <h2 className="text-lg font-bold text-white">Deterministic Rule Engine Manager</h2>
                <span className="text-xs font-mono text-[#F59A4A]">Active Rules: 5</span>
              </div>
              <RuleManager />
            </div>
          )}

          {activePage === 'analytics' && (
            <AdminDashboardPage
              transactions={transactions}
              onSelectTransaction={(tx) => {
                setSelectedTx(tx);
                setActivePage('results');
              }}
            />
          )}

          {activePage === 'architecture' && (
            <Architecture3D />
          )}

          {activePage === 'settings' && (
            <div className="cyber-card p-6 space-y-4">
              <h2 className="text-lg font-bold text-white">Platform Settings & Governance</h2>
              <div className="space-y-3 text-xs text-slate-300">
                <div className="p-3 rounded-xl bg-[#0D1118] border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block">XGBoost ML Model Weight</span>
                    <span className="text-slate-400">Ensemble Weight in Risk Aggregator</span>
                  </div>
                  <span className="font-mono font-bold text-[#F59A4A]">50% (WEIGHT_ML = 0.50)</span>
                </div>
                <div className="p-3 rounded-xl bg-[#0D1118] border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block">Deterministic Rule Engine Weight</span>
                    <span className="text-slate-400">Ensemble Weight in Risk Aggregator</span>
                  </div>
                  <span className="font-mono font-bold text-amber-400">30% (WEIGHT_RULES = 0.30)</span>
                </div>
                <div className="p-3 rounded-xl bg-[#0D1118] border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block">Behavioral Z-Score Engine Weight</span>
                    <span className="text-slate-400">Ensemble Weight in Risk Aggregator</span>
                  </div>
                  <span className="font-mono font-bold text-cyan-400">20% (WEIGHT_BEHAVIORAL = 0.20)</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Customer Profile Modal Drawer */}
      <CustomerProfileModal
        customerId={inspectedCustomerId}
        onClose={() => setInspectedCustomerId(null)}
      />
    </div>
  );
}

export default App;
