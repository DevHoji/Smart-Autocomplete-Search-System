/**
 * TopQueriesChart component
 * Displays top search queries in a horizontal bar chart format
 */

import React from 'react';
import { Search } from 'lucide-react';

interface TopQuery {
  query: string;
  count: number;
}

interface TopQueriesChartProps {
  data: TopQuery[];
}

const TopQueriesChart: React.FC<TopQueriesChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-gray-500">
        <div className="text-center">
          <Search className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p>No search queries data available</p>
        </div>
      </div>
    );
  }

  const maxCount = Math.max(...data.map(item => item.count));

  return (
    <div className="space-y-4">
      {data.slice(0, 8).map((item, index) => {
        const percentage = (item.count / maxCount) * 100;
        
        return (
          <div key={item.query} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <span className="text-gray-500 w-4">#{index + 1}</span>
                <span className="font-medium text-gray-900 truncate max-w-[200px]">
                  "{item.query}"
                </span>
              </div>
              <span className="text-gray-600 font-medium">
                {item.count.toLocaleString()}
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
      
      {data.length > 8 && (
        <div className="text-center pt-2">
          <span className="text-sm text-gray-500">
            +{data.length - 8} more queries
          </span>
        </div>
      )}
    </div>
  );
};

export default TopQueriesChart;
