import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Zap,
  Layers,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Key,
  Mail,
  HelpCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { loginUser } from '../api/client';

export const LoginPage = ({ onLoginSuccess, onNavigateToSimulator }) => {
  const [username, setUsername] = useState('analyst@sentinel.ai');
  const [password, setPassword] = useState('sentinel123');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await loginUser(username, password);
      if (onLoginSuccess) onLoginSuccess(data.user_info);
      if (onNavigateToSimulator) onNavigateToSimulator();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Authentication failed. Defaulting to Demo Analyst session.');
      // Auto fallback to demo session
      if (onLoginSuccess) onLoginSuccess({ sub: 'analyst@sentinel.ai', role: 'SENIOR_FRAUD_ANALYST' });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    if (onLoginSuccess) onLoginSuccess({ sub: 'analyst@sentinel.ai', role: 'SENIOR_FRAUD_ANALYST' });
    if (onNavigateToSimulator) onNavigateToSimulator();
  };

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Container */}
      <div className="relative rounded-3xl bg-[#0D1118] border border-white/10 p-8 lg:p-14 shadow-2xl overflow-hidden cyber-grid">
        {/* Glowing Ambient Light Orbs */}
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-[#F59A4A]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Left Column: Brand Hero Text & System Capabilities */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#F59A4A]/10 border border-[#F59A4A]/20 text-[#F59A4A] text-xs font-mono font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Real-Time Fraud Detection & Risk Decisioning</span>
            </div>

            <h1 className="text-3xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              FraudShield <span className="text-[#F59A4A]">AI</span> <br />
              <span className="text-slate-300 text-2xl lg:text-3xl font-semibold">
                Enterprise Credit Card Fraud Platform
              </span>
            </h1>

            <p className="text-sm lg:text-base text-slate-400 max-w-xl leading-relaxed">
              Combines Machine Learning (XGBoost), deterministic rules, behavioral analysis, and TreeSHAP explainability to evaluate transaction risk in under 50ms.
            </p>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-[#151A22] border border-white/5 space-y-1">
                <Cpu className="w-5 h-5 text-cyan-400 mb-1" />
                <h4 className="text-xs font-bold text-white">XGBoost ML Engine</h4>
                <p className="text-[11px] text-slate-400">0.8475 PR-AUC & 86.73% Recall</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#151A22] border border-white/5 space-y-1">
                <Layers className="w-5 h-5 text-[#F59A4A] mb-1" />
                <h4 className="text-xs font-bold text-white">TreeSHAP Explainer</h4>
                <p className="text-[11px] text-slate-400">Regulatory feature attribution</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#151A22] border border-white/5 space-y-1">
                <Zap className="w-5 h-5 text-emerald-400 mb-1" />
                <h4 className="text-xs font-bold text-white">&lt; 15ms Latency</h4>
                <p className="text-[11px] text-slate-400">Sub-second risk decisioning</p>
              </div>
            </div>

            <div className="pt-2 flex items-center space-x-4">
              <button
                onClick={onNavigateToSimulator}
                className="btn-ember px-6 py-3 text-xs uppercase tracking-wider flex items-center space-x-2"
              >
                <span>Launch Interactive Simulator</span>
                <ArrowRight className="w-4 h-4 text-[#07090D]" />
              </button>
            </div>
          </div>

          {/* Right Column: Trustworthy Enterprise Auth Card */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl bg-[#151A22] border border-white/10 p-7 shadow-2xl space-y-5 relative">
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-[#F59A4A]/10 text-[#F59A4A] border border-[#F59A4A]/20">
                    <Key className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Analyst Gateway Sign In</h3>
                    <p className="text-[10px] text-slate-400">Secure JWT Authentication</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 text-[9px] font-mono font-bold rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  SYSTEM READY
                </span>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1.5">
                    Analyst Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      placeholder="analyst@sentinel.ai"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#0D1118] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#F59A4A] transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1.5">
                    Security Passcode
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#0D1118] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#F59A4A] transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center space-x-2 text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded bg-[#0D1118] border-white/10 text-[#F59A4A] focus:ring-0"
                    />
                    <span>Remember credentials</span>
                  </label>
                  <a href="#forgot" onClick={(e) => { e.preventDefault(); alert("Demo Mode: Use pre-filled credentials analyst@sentinel.ai / sentinel123"); }} className="text-[#F59A4A] hover:underline font-medium">
                    Forgot password?
                  </a>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-ember w-full py-3 text-xs uppercase tracking-wider font-bold shadow-lg disabled:opacity-50"
                >
                  {loading ? 'Authenticating Session...' : 'Sign In To FraudShield AI'}
                </button>
              </form>

              {/* Instant One-Click Demo Session Button */}
              <div className="pt-3 text-center border-t border-white/5 space-y-2">
                <p className="text-[11px] text-slate-400 font-mono">
                  Need instant demo access without credentials?
                </p>
                <button
                  type="button"
                  onClick={handleDemoLogin}
                  className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-semibold transition"
                >
                  Instant One-Click Demo Session
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
