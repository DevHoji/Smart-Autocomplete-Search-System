/**
 * TrendingWordsChart component
 * Displays trending words with growth indicators
 */

import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TrendingWord {
  word: string;
  recent_selections: number;
  growth_rate: number;
}

interface TrendingWordsChartProps {
  data: TrendingWord[];
}

const TrendingWordsChart: React.FC<TrendingWordsChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-gray-500">
        <div className="text-center">
          <TrendingUp className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p>No trending words data available</p>
        </div>
      </div>
    );
  }

  const getTrendIcon = (growthRate: number) => {
    if (growthRate > 5) {
      return <TrendingUp className="w-4 h-4 text-green-600" />;
    } else if (growthRate < -5) {
      return <TrendingDown className="w-4 h-4 text-red-600" />;
    } else {
      return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTrendColor = (growthRate: number) => {
    if (growthRate > 5) {
      return 'text-green-600 bg-green-50';
    } else if (growthRate < -5) {
      return 'text-red-600 bg-red-50';
    } else {
      return 'text-gray-600 bg-gray-50';
    }
  };

  const getGrowthLabel = (growthRate: number) => {
    if (growthRate > 20) return 'Hot';
    if (growthRate > 10) return 'Rising';
    if (growthRate > 5) return 'Growing';
    if (growthRate > -5) return 'Stable';
    if (growthRate > -10) return 'Declining';
    return 'Falling';
  };

  return (
    <div className="space-y-3">
      {data.slice(0, 10).map((item, index) => (
        <div key={item.word} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-500 w-6">
              #{index + 1}
            </span>
            
            <div className="flex items-center space-x-2">
              {getTrendIcon(item.growth_rate)}
              <span className="font-medium text-gray-900">
                {item.word}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">
                {item.recent_selections} selections
              </div>
              <div className={`text-xs px-2 py-1 rounded-full ${getTrendColor(item.growth_rate)}`}>
                {item.growth_rate > 0 ? '+' : ''}{item.growth_rate.toFixed(1)}%
              </div>
            </div>
            
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getTrendColor(item.growth_rate)}`}>
              {getGrowthLabel(item.growth_rate)}
            </div>
          </div>
        </div>
      ))}
      
      {data.length > 10 && (
        <div className="text-center pt-2">
          <span className="text-sm text-gray-500">
            +{data.length - 10} more trending words
          </span>
        </div>
      )}
    </div>
  );
};

export default TrendingWordsChart;
