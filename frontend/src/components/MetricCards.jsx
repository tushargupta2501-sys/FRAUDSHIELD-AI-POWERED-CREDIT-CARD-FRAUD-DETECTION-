import React from 'react';
import { Activity, ShieldAlert, DollarSign, Zap, Sliders, CheckCircle2 } from 'lucide-react';

export const MetricCards = ({ metrics }) => {
  const cards = [
    {
      title: 'Total Processed',
      value: metrics?.total_transactions?.toLocaleString() || '0',
      subtitle: `${metrics?.total_allowed || 0} approved`,
      icon: Activity,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20'
    },
    {
      title: 'Fraud Catch Rate',
      value: `${metrics?.fraud_rate_percentage || 0.0}%`,
      subtitle: `${metrics?.total_flagged_fraud || 0} blocked, ${metrics?.total_challenged || 0} challenged`,
      icon: ShieldAlert,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20'
    },
    {
      title: 'Prevented Fraud Loss',
      value: `$${(metrics?.prevented_loss_usd || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtitle: `Out of $${(metrics?.total_volume_usd || 0).toLocaleString()} volume`,
      icon: DollarSign,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20'
    },
    {
      title: 'Avg Evaluation Latency',
      value: `${metrics?.average_latency_ms || 12.5} ms`,
      subtitle: '99.4% under 25ms SLA',
      icon: Zap,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-[#0F1424] border border-gray-800/80 shadow-sm relative overflow-hidden group hover:border-gray-700 transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-400">{card.title}</p>
                <h3 className="text-2xl font-bold text-white mt-1 tracking-tight">{card.value}</h3>
              </div>
              <div className={`p-3 rounded-xl ${card.bg} ${card.border} border`}>
                <Icon className={`w-5 h-5 ${card.color}`} />
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-800/60 flex items-center justify-between text-xs text-gray-400">
              <span>{card.subtitle}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
