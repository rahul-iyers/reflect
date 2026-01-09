import React from 'react';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

export default function   Notification({ type = 'success', title, message, onClose }) {
  const configs = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
      textColor: 'text-green-400',
      subTextColor: 'text-green-400/70'
    },
    error: {
      icon: AlertCircle,
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
      textColor: 'text-red-400',
      subTextColor: 'text-red-400/70'
    },
    info: {
      icon: Info,
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      textColor: 'text-blue-400',
      subTextColor: 'text-blue-400/70'
    }
  };

  const config = configs[type] || configs.info;
  const Icon = config.icon;

  return (
    <div className={`mb-8 p-4 ${config.bgColor} border ${config.borderColor} rounded-xl flex items-center gap-3 animate-fade-in`}>
      <Icon className={config.textColor} size={24} />
      <div className="flex-1">
        <p className={`${config.textColor} font-medium`}>{title}</p>
        {message && <p className={`${config.subTextColor} text-sm`}>{message}</p>}
      </div>
      {onClose && (
        <button 
          onClick={onClose}
          className={`${config.textColor} hover:opacity-70 transition-opacity`}
        >
          ✕
        </button>
      )}
    </div>
  );
}