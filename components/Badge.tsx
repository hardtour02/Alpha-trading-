
import React from 'react';

interface BadgeProps {
  color: 'green' | 'red' | 'yellow' | 'blue';
  children: React.ReactNode;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ color, children, className = '' }) => {
  const colorClasses = {
    green: 'bg-green-500/20 text-buy-green border border-green-500/30',
    red: 'bg-red-500/20 text-sell-red border border-red-500/30',
    yellow: 'bg-yellow-500/20 text-profit-target border border-yellow-500/30',
    blue: 'bg-blue-500/20 text-order-limit border border-blue-500/30',
  };

  return (
    <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${colorClasses[color]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
