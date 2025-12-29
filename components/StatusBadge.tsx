
import React from 'react';

interface StatusBadgeProps {
  status: 'online' | 'offline' | 'loading';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const configs = {
    online: { color: 'bg-emerald-500', text: 'Operational', icon: 'fa-check-circle' },
    offline: { color: 'bg-rose-500', text: 'Disconnected', icon: 'fa-circle-exclamation' },
    loading: { color: 'bg-amber-500', text: 'Connecting...', icon: 'fa-spinner fa-spin' },
  };

  const current = configs[status];

  return (
    <div className="flex items-center space-x-2 px-3 py-1 bg-white border border-slate-200 rounded-full shadow-sm">
      <div className={`w-2 h-2 rounded-full ${current.color} animate-pulse`}></div>
      <span className="text-xs font-medium text-slate-600 uppercase tracking-wider">{current.text}</span>
      <i className={`fas ${current.icon} text-slate-400 text-[10px]`}></i>
    </div>
  );
};
