/**
 * PerformanceChart component
 * Displays system performance metrics with visual indicators
 */

import React from 'react';
import { Clock, Target, Zap, AlertTriangle } from 'lucide-react';

interface PerformanceChartProps {
  responseTime: number;
  successRate: number;
  period: number;
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({
  responseTime,
  successRate,
  period,
}) => {
  // Generate mock historical data for visualization
  const generateMockData = (baseValue: number, variance: number, points: number) => {
    return Array.from({ length: points }, (_, i) => {
      const trend = Math.sin(i * 0.5) * variance * 0.3;
      const noise = (Math.random() - 0.5) * variance;
      return Math.max(0, baseValue + trend + noise);
    });
  };

  const dataPoints = period === 1 ? 24 : period === 7 ? 7 : period === 30 ? 30 : 90;
  const responseTimeData = generateMockData(responseTime, responseTime * 0.3, dataPoints);
  const successRateData = generateMockData(successRate, 10, dataPoints);

  const getPerformanceStatus = (responseTime: number, successRate: number) => {
    if (responseTime < 50 && successRate > 95) {
      return { status: 'Excellent', color: 'green', icon: <Zap className="w-5 h-5" /> };
    } else if (responseTime < 100 && successRate > 85) {
      return { status: 'Good', color: 'blue', icon: <Target className="w-5 h-5" /> };
    } else if (responseTime < 200 && successRate > 70) {
      return { status: 'Fair', color: 'yellow', icon: <Clock className="w-5 h-5" /> };
    } else {
      return { status: 'Poor', color: 'red', icon: <AlertTriangle className="w-5 h-5" /> };
    }
  };

  const performance = getPerformanceStatus(responseTime, successRate);

  const getStatusColor = (color: string) => {
    const colors = {
      green: 'bg-green-100 text-green-800 border-green-200',
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      red: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[color as keyof typeof colors];
  };

  return (
    <div className="space-y-6">
      {/* Performance Status */}
      <div className="flex items-center justify-between">
        <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${getStatusColor(performance.color)}`}>
          {performance.icon}
          <span className="font-medium">
            System Performance: {performance.status}
          </span>
        </div>
        
        <div className="text-sm text-gray-600">
          Last {period} {period === 1 ? 'day' : 'days'}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Response Time Chart */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">Response Time</h4>
            <span className="text-sm text-gray-600">
              Avg: {responseTime.toFixed(0)}ms
            </span>
          </div>
          
          <div className="h-32 flex items-end space-x-1">
            {responseTimeData.map((value, index) => {
              const height = (value / Math.max(...responseTimeData)) * 100;
              const color = value < 50 ? 'bg-green-500' : 
                           value < 100 ? 'bg-blue-500' : 
                           value < 200 ? 'bg-yellow-500' : 'bg-red-500';
              
              return (
                <div
                  key={index}
                  className={`flex-1 ${color} rounded-t transition-all duration-300 hover:opacity-80`}
                  style={{ height: `${height}%` }}
                  title={`${value.toFixed(0)}ms`}
                />
              );
            })}
          </div>
          
          <div className="flex justify-between text-xs text-gray-500">
            <span>0ms</span>
            <span>{Math.max(...responseTimeData).toFixed(0)}ms</span>
          </div>
        </div>

        {/* Success Rate Chart */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">Success Rate</h4>
            <span className="text-sm text-gray-600">
              Avg: {successRate.toFixed(1)}%
            </span>
          </div>
          
          <div className="h-32 flex items-end space-x-1">
            {successRateData.map((value, index) => {
              const height = (value / 100) * 100;
              const color = value > 95 ? 'bg-green-500' : 
                           value > 85 ? 'bg-blue-500' : 
                           value > 70 ? 'bg-yellow-500' : 'bg-red-500';
              
              return (
                <div
                  key={index}
                  className={`flex-1 ${color} rounded-t transition-all duration-300 hover:opacity-80`}
                  style={{ height: `${height}%` }}
                  title={`${value.toFixed(1)}%`}
                />
              );
            })}
          </div>
          
          <div className="flex justify-between text-xs text-gray-500">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-lg font-bold text-gray-900">
            {responseTime < 50 ? '🚀' : responseTime < 100 ? '⚡' : responseTime < 200 ? '⏱️' : '🐌'}
          </div>
          <div className="text-sm text-gray-600">Speed</div>
        </div>
        
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-lg font-bold text-gray-900">
            {successRate > 95 ? '🎯' : successRate > 85 ? '✅' : successRate > 70 ? '⚠️' : '❌'}
          </div>
          <div className="text-sm text-gray-600">Accuracy</div>
        </div>
        
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-lg font-bold text-gray-900">
            {responseTime < 100 && successRate > 90 ? '💎' : '⭐'}
          </div>
          <div className="text-sm text-gray-600">Quality</div>
        </div>
        
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-lg font-bold text-gray-900">
            {Math.random() > 0.5 ? '📈' : '📊'}
          </div>
          <div className="text-sm text-gray-600">Trend</div>
        </div>
      </div>

      {/* Performance Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h5 className="font-medium text-blue-900 mb-2">Performance Insights</h5>
        <div className="text-sm text-blue-800 space-y-1">
          {responseTime > 100 && (
            <p>• Response time could be improved with caching or optimization</p>
          )}
          {successRate < 90 && (
            <p>• Success rate could be improved with better query matching</p>
          )}
          {responseTime < 50 && successRate > 95 && (
            <p>• Excellent performance! System is running optimally</p>
          )}
          <p>• Monitor trends over time to identify patterns and issues</p>
        </div>
      </div>
    </div>
  );
};

export default PerformanceChart;
