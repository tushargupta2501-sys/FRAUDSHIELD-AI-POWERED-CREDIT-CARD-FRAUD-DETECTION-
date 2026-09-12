import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { BarChart3, TrendingUp, Cpu } from 'lucide-react';

export const FraudAnalyticsCharts = ({ timeseriesData, globalShap }) => {
  // Default mock series if empty
  const defaultSeries = [
    { timestamp: '15:30', legitimate_count: 42, challenged_count: 3, fraud_blocked_count: 1 },
    { timestamp: '15:40', legitimate_count: 55, challenged_count: 5, fraud_blocked_count: 2 },
    { timestamp: '15:50', legitimate_count: 48, challenged_count: 2, fraud_blocked_count: 0 },
    { timestamp: '16:00', legitimate_count: 62, challenged_count: 8, fraud_blocked_count: 4 },
    { timestamp: '16:10', legitimate_count: 58, challenged_count: 4, fraud_blocked_count: 3 },
    { timestamp: '16:20', legitimate_count: 70, challenged_count: 6, fraud_blocked_count: 5 },
  ];

  const chartData = timeseriesData?.length > 0 ? timeseriesData : defaultSeries;

  const shapData = globalShap?.length > 0 ? globalShap : [
    { feature: 'velocity_5m', importance: 3.18 },
    { feature: 'amount_to_avg_ratio', importance: 1.41 },
    { feature: 'velocity_1h', importance: 1.38 },
    { feature: 'velocity_24h', importance: 1.20 },
    { feature: 'is_foreign', importance: 1.08 },
    { feature: 'amount', importance: 0.95 }
  ];

  return (
    <div className="space-y-6">
      {/* Time Series Graph */}
      <div className="rounded-2xl bg-[#0F1424] border border-gray-800 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              <span>Real-Time Ingestion & Fraud Volume Timeline</span>
            </h3>
            <p className="text-xs text-gray-400">Throughput volume segmented by authorization decision</p>
          </div>
          <div className="flex items-center space-x-4 text-xs">
            <span className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> <span className="text-gray-300">Approved</span></span>
            <span className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> <span className="text-gray-300">Challenged</span></span>
            <span className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> <span className="text-gray-300">Blocked</span></span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="legitGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="fraudGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.5}/>
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
              <XAxis dataKey="timestamp" stroke="#6B7280" fontSize={11} />
              <YAxis stroke="#6B7280" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '10px', fontSize: '12px' }}
              />
              <Area type="monotone" dataKey="legitimate_count" stroke="#10B981" fillOpacity={1} fill="url(#legitGrad)" name="Approved (Legit)" />
              <Area type="monotone" dataKey="fraud_blocked_count" stroke="#EF4444" fillOpacity={1} fill="url(#fraudGrad)" name="Blocked (Fraud)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Global SHAP Feature Importance */}
      <div className="rounded-2xl bg-[#0F1424] border border-gray-800 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Cpu className="w-5 h-5 text-indigo-400" />
              <span>Global TreeSHAP Feature Importance (Model-wide)</span>
            </h3>
            <p className="text-xs text-gray-400">Mean absolute SHAP value impact across XGBoost trees</p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={shapData} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" horizontal={false} />
              <XAxis type="number" stroke="#6B7280" fontSize={11} />
              <YAxis type="category" dataKey="feature" stroke="#9CA3AF" fontSize={11} width={120} />
              <Tooltip
                contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '10px', fontSize: '12px' }}
              />
              <Bar dataKey="importance" fill="#6366F1" radius={[0, 6, 6, 0]} name="Mean |SHAP| Score">
                {shapData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? '#3B82F6' : index === 1 ? '#6366F1' : '#818CF8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
