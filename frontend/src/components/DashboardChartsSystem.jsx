import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  CartesianGrid
} from 'recharts';
import { ShieldAlert, MapPin, Store, TrendingUp, PieChart as PieIcon } from 'lucide-react';
import { fetchDashboardCharts } from '../api/client';

export const DashboardChartsSystem = () => {
  const [chartsData, setChartsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardCharts()
      .then(setChartsData)
      .catch((err) => console.error("Failed to load dashboard charts:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !chartsData) {
    return (
      <div className="p-12 text-center rounded-[8px] bg-[#14171C] border border-[#262B33] space-y-3">
        <div className="w-8 h-8 border-2 border-[#F5A623] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-[#9AA1AC] font-mono">Loading 5-System Recharts Analytics Engine...</p>
      </div>
    );
  }

  const {
    fraud_vs_legit = [],
    fraud_by_location = [],
    fraud_by_merchant = [],
    fraud_trend = [],
    risk_distribution = []
  } = chartsData;

  const tooltipStyle = {
    backgroundColor: '#14171C',
    borderColor: '#262B33',
    borderRadius: '8px',
    color: '#E8EAED',
    fontSize: '12px',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.4)'
  };

  return (
    <div className="space-y-6">
      {/* Top Row: Fraud vs Legit (1) & Risk Distribution (5) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Fraud vs Legit Distribution */}
        <div className="sentinel-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-[#2DD4A7]" />
              <h3 className="text-xs font-semibold text-[#E8EAED] uppercase tracking-[0.06em] font-mono">1. Fraud vs. Legit Distribution</h3>
            </div>
            <span className="text-[11px] font-mono text-[#5C6470]">Outcome Breakdown</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={fraud_vs_legit}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {fraud_vs_legit.map((entry, index) => (
                    <Cell key={`cell-fvl-${index}`} fill={entry.name === 'Fraud Blocked' ? '#E5484D' : entry.name === 'Under Review' ? '#F0B429' : '#2DD4A7'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend formatter={(value) => <span className="text-xs text-[#9AA1AC] font-sans">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 5: Risk Tier Distribution */}
        <div className="sentinel-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <PieIcon className="w-4 h-4 text-[#F5A623]" />
              <h3 className="text-xs font-semibold text-[#E8EAED] uppercase tracking-[0.06em] font-mono">5. Composite Risk Tier Distribution</h3>
            </div>
            <span className="text-[11px] font-mono text-[#5C6470]">LOW - CRITICAL</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={risk_distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={0}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="count"
                >
                  {risk_distribution.map((entry, index) => (
                    <Cell key={`cell-risk-${index}`} fill={entry.name === 'Critical' || entry.name === 'High' ? '#E5484D' : entry.name === 'Medium' ? '#F0B429' : '#2DD4A7'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend formatter={(value) => <span className="text-xs text-[#9AA1AC] font-sans">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Middle Row: Fraud Trend (4) */}
      <div className="sentinel-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-[#4C9AFF]" />
            <h3 className="text-xs font-semibold text-[#E8EAED] uppercase tracking-[0.06em] font-mono">4. Real-Time Fraud & Volume Trend</h3>
          </div>
          <span className="text-[11px] font-mono text-[#5C6470]">10-Minute Sliding Windows</span>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={fraud_trend}>
              <defs>
                <linearGradient id="legitGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2DD4A7" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#2DD4A7" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="fraudGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E5484D" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#E5484D" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#262B33" />
              <XAxis dataKey="timestamp" stroke="#9AA1AC" tick={{ fontSize: 11 }} />
              <YAxis stroke="#9AA1AC" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend formatter={(value) => <span className="text-xs text-[#9AA1AC] font-sans">{value}</span>} />
              <Area type="monotone" dataKey="legitimate_count" name="Legitimate Txns" stroke="#2DD4A7" fillOpacity={1} fill="url(#legitGrad)" />
              <Area type="monotone" dataKey="fraud_blocked_count" name="Fraud Blocked" stroke="#E5484D" fillOpacity={1} fill="url(#fraudGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row: Fraud by Location (2) & Fraud by Merchant (3) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 2: Fraud by Location */}
        <div className="sentinel-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-[#E5484D]" />
              <h3 className="text-xs font-semibold text-[#E8EAED] uppercase tracking-[0.06em] font-mono">2. Fraud Count by Geographic Location</h3>
            </div>
            <span className="text-[11px] font-mono text-[#5C6470]">Country ISO Breakdown</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fraud_by_location}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262B33" />
                <XAxis dataKey="country" stroke="#9AA1AC" tick={{ fontSize: 11 }} />
                <YAxis stroke="#9AA1AC" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="fraud_count" name="Fraud Incidents" fill="#E5484D" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Fraud by Merchant */}
        <div className="sentinel-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Store className="w-4 h-4 text-[#F0B429]" />
              <h3 className="text-xs font-semibold text-[#E8EAED] uppercase tracking-[0.06em] font-mono">3. Fraud Concentration by Merchant Category</h3>
            </div>
            <span className="text-[11px] font-mono text-[#5C6470]">Top High Risk MCCs</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fraud_by_merchant} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#262B33" />
                <XAxis type="number" stroke="#9AA1AC" tick={{ fontSize: 11 }} />
                <YAxis dataKey="merchant_category" type="category" stroke="#9AA1AC" tick={{ fontSize: 10 }} width={120} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="fraud_count" name="Fraud Blocked" fill="#F5A623" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

