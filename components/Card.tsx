
import React from 'react';

interface CardProps {
  title: string;
  value: string | number;
  change?: number;
  children?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, value, change, children }) => {
  const isPositive = change !== undefined && change >= 0;

  return (
    <div className="bg-card p-4 rounded-lg border border-border flex-1 min-w-[200px]">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-medium text-text-secondary">{title}</h3>
          <p className="text-2xl font-semibold text-text mt-1">{value}</p>
        </div>
        {children}
      </div>
      {change !== undefined && (
        <p className={`text-sm mt-2 ${isPositive ? 'text-buy-green' : 'text-sell-red'}`}>
          {isPositive ? '▲' : '▼'} {Math.abs(change)}%
        </p>
      )}
    </div>
  );
};

export default Card;
