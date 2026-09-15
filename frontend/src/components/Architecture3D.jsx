import React, { useState } from 'react';
import { Cpu, Shield, Server, Database, Activity, GitBranch, Layers, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';

export function Architecture3D() {
  const [selectedNode, setSelectedNode] = useState('gateway');

  const nodes = [
    {
      id: 'frontend',
      name: 'React 18 SPA Frontend',
      layer: 'Layer 1: User Interface',
      icon: Cpu,
      color: 'from-blue-500 to-indigo-600',
      borderColor: 'border-blue-500/50',
      glow: 'shadow-blue-500/20',
      description: 'Single Page Application built with React 18, TailwindCSS, Recharts, and WebSockets. Provides real-time transaction simulator, 5-section investigation view, and executive telemetry.',
      tech: ['React 18', 'Vite 5', 'TailwindCSS', 'Recharts', 'Axios']
    },
    {
      id: 'gateway',
      name: 'FastAPI Async Gateway',
      layer: 'Layer 2: Gateway & Security',
      icon: Server,
      color: 'from-teal-500 to-emerald-600',
      borderColor: 'border-teal-500/50',
      glow: 'shadow-teal-500/20',
      description: 'Asynchronous Python web gateway handling incoming API requests, HMAC signature verification, Pydantic schema validation, and JWT authentication tokens.',
      tech: ['FastAPI 0.110', 'Uvicorn ASGI', 'Pydantic V2', 'PyJWT', 'CORS Middleware']
    },
    {
      id: 'security',
      name: 'Security Gate & Rate Limiter',
      layer: 'Layer 2: Gateway & Security',
      icon: Shield,
      color: 'from-cyan-500 to-blue-600',
      borderColor: 'border-cyan-500/50',
      glow: 'shadow-cyan-500/20',
      description: 'Intercepts requests to validate payload hash signatures, verify token expiration, check IP origin blacklists, and sanitize inputs before routing.',
      tech: ['SHA-256 HMAC', 'IP Blacklists', 'ISO 18245 MCC Validator']
    },
    {
      id: 'ml_engine',
      name: 'XGBoost ML Classifier',
      layer: 'Layer 3: Core AI Engine',
      icon: Activity,
      color: 'from-amber-500 to-orange-600',
      borderColor: 'border-amber-500/50',
      glow: 'shadow-amber-500/20',
      description: 'Extreme Gradient Boosting model trained on SMOTE-balanced credit card transaction vectors. Evaluates raw fraud probability P(fraud) with 0.921 PR-AUC.',
      tech: ['XGBoost 2.0', 'Scikit-Learn', 'RobustScaler', 'Joblib']
    },
    {
      id: 'rules',
      name: 'Deterministic Rule Engine',
      layer: 'Layer 3: Core AI Engine',
      icon: GitBranch,
      color: 'from-rose-500 to-pink-600',
      borderColor: 'border-rose-500/50',
      glow: 'shadow-rose-500/20',
      description: 'Evaluates hard security rules (Off-Peak High Amount, Rapid 60s Velocity, High-Risk MCCs, Amount Z-score deviation) and outputs numerical penalty points.',
      tech: ['Rule Penalties', 'Hard Overrides', 'MCC Filters', 'Dynamic Toggles']
    },
    {
      id: 'shap',
      name: 'TreeSHAP Explainability Core',
      layer: 'Layer 4: Regulatory Transparency',
      icon: Layers,
      color: 'from-purple-500 to-violet-600',
      borderColor: 'border-purple-500/50',
      glow: 'shadow-purple-500/20',
      description: 'Extracts exact Shapley additive feature impact values for every transaction. Translates PCA variables (V14, V10) into regulatory-compliant human explanations.',
      tech: ['TreeSHAP', 'Additive Attributions', 'PCA Neutrality Rules']
    },
    {
      id: 'database',
      name: 'SQLAlchemy Async Database',
      layer: 'Layer 5: Persistence & Streaming',
      icon: Database,
      color: 'from-indigo-500 to-blue-600',
      borderColor: 'border-indigo-500/50',
      glow: 'shadow-indigo-500/20',
      description: 'Stores historical transaction evaluations, rules definitions, fraud cases, and customer behavioral profiles. Powered by SQLite / PostgreSQL 15.',
      tech: ['SQLAlchemy 2.0', 'AioSQLite', 'AsyncPG', 'PostgreSQL 15']
    }
  ];

  const activeNodeData = nodes.find((n) => n.id === selectedNode) || nodes[1];

  return (
    <div className="space-y-6">
      {/* Visual Header */}
      <div className="glass-panel p-6 rounded-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs mb-1">
            <Zap className="w-3.5 h-3.5" />
            <span>INTERACTIVE SYSTEM ARCHITECTURE VISUALIZER</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100">
            SentinelAI Hybrid AI & Rule Engine Infrastructure
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Sub-50ms real-time transaction processing pipeline fusing XGBoost ML, Deterministic Rules, and TreeSHAP Explainability.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Pipeline Status: Operational
          </span>
        </div>
      </div>

      {/* Grid Pipeline Diagram */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Interactive Nodes List */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
            Select Architecture Component:
          </h3>
          {nodes.map((node) => {
            const Icon = node.icon;
            const isSelected = selectedNode === node.id;
            return (
              <div
                key={node.id}
                onClick={() => setSelectedNode(node.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all duration-200 flex items-center justify-between ${
                  isSelected
                    ? `bg-slate-900/90 ${node.borderColor} shadow-lg ${node.glow}`
                    : 'bg-[#0D1322]/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900/40'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${node.color} text-white`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-200">{node.name}</div>
                    <div className="text-[11px] font-mono text-slate-400">{node.layer}</div>
                  </div>
                </div>
                <ArrowRight className={`w-4 h-4 transition-transform ${isSelected ? 'text-cyan-400 translate-x-1' : 'text-slate-600'}`} />
              </div>
            );
          })}
        </div>

        {/* Right: Component Detail Card */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-xl border border-slate-800 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Ambient Background Gradient */}
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                {React.createElement(activeNodeData.icon, { className: 'w-6 h-6 text-cyan-400' })}
                <div>
                  <h3 className="text-lg font-bold text-slate-100">{activeNodeData.name}</h3>
                  <span className="text-xs font-mono text-cyan-400">{activeNodeData.layer}</span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 text-xs font-mono border border-slate-700">
                Sub-System ID: {activeNodeData.id}
              </span>
            </div>

            <p className="text-slate-300 text-sm leading-relaxed mb-6">
              {activeNodeData.description}
            </p>

            <div className="space-y-3 mb-6">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Core Technologies & Specifications:
              </h4>
              <div className="flex flex-wrap gap-2">
                {activeNodeData.tech.map((t, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-md bg-indigo-950/60 text-indigo-300 border border-indigo-800/50 text-xs font-mono flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Flow Bar */}
          <div className="p-4 rounded-xl bg-[#060911] border border-slate-800 text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
              <span>Ingestion</span>
              <span>Security</span>
              <span>Inference & Rules</span>
              <span>Explainability</span>
              <span>Persistence</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden relative">
              <div className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 animate-pulse w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Architecture3D;
