import React from 'react';

export default function StatsCard({ label, value, icon: Icon, color = 'blue', trend }) {
  const colors = {
    blue: { bg: 'bg-blue-50', icon: 'text-blue-600', border: 'border-blue-100' },
    green: { bg: 'bg-green-50', icon: 'text-green-600', border: 'border-green-100' },
    amber: { bg: 'bg-amber-50', icon: 'text-amber-600', border: 'border-amber-100' },
    purple: { bg: 'bg-purple-50', icon: 'text-purple-600', border: 'border-purple-100' },
    cyan: { bg: 'bg-cyan-50', icon: 'text-cyan-600', border: 'border-cyan-100' },
  };
  const c = colors[color] || colors.blue;

  return (
    <div className={`bg-card rounded-2xl border border-border p-5 flex items-center gap-4 hover:shadow-md transition-shadow`}>
      <div className={`w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center flex-shrink-0`}>
        {Icon && <Icon className={`w-6 h-6 ${c.icon}`} />}
      </div>
      <div>
        <div className="text-2xl font-display font-bold text-foreground">{value}</div>
        <div className="text-sm text-muted-foreground">{label}</div>
        {trend && <div className="text-xs text-green-600 mt-0.5">{trend}</div>}
      </div>
    </div>
  );
}