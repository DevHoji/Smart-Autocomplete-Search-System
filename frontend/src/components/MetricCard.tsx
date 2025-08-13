/**
 * MetricCard component
 * Displays key metrics with trend indicators and color coding
 */

import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  isInverted?: boolean; // For metrics where lower is better (like response time)
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  icon,
  color,
  isInverted = false,
}) => {
  const getColorClasses = (color: string) => {
    const colors = {
      blue: {
        bg: 'bg-blue-500/20',
        icon: 'text-blue-400',
        text: 'text-blue-300',
      },
      green: {
        bg: 'bg-green-500/20',
        icon: 'text-green-400',
        text: 'text-green-300',
      },
      purple: {
        bg: 'bg-purple-500/20',
        icon: 'text-purple-400',
        text: 'text-purple-300',
      },
      orange: {
        bg: 'bg-orange-500/20',
        icon: 'text-orange-400',
        text: 'text-orange-300',
      },
      red: {
        bg: 'bg-red-500/20',
        icon: 'text-red-400',
        text: 'text-red-300',
      },
    };
    return colors[color as keyof typeof colors];
  };

  const getTrendColor = (change: number) => {
    const isPositive = isInverted ? change < 0 : change > 0;
    return isPositive ? 'text-green-400' : 'text-red-400';
  };

  const getTrendIcon = (change: number) => {
    const isPositive = isInverted ? change < 0 : change > 0;
    return isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />;
  };

  const colorClasses = getColorClasses(color);

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-400 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-100 mb-2">{value}</p>

          {change !== undefined && (
            <div className={`flex items-center space-x-1 text-sm ${getTrendColor(change)}`}>
              {getTrendIcon(change)}
              <span>
                {Math.abs(change).toFixed(1)}%
              </span>
              <span className="text-gray-500">
                {isInverted
                  ? (change < 0 ? 'improvement' : 'slower')
                  : (change > 0 ? 'increase' : 'decrease')
                }
              </span>
            </div>
          )}
        </div>
        
        <div className={`w-12 h-12 rounded-lg ${colorClasses.bg} flex items-center justify-center`}>
          <div className={colorClasses.icon}>
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
