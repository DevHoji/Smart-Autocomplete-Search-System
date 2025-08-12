// Test what's being exported from types
import * as types from './src/types/index.ts';

console.log('Available exports:', Object.keys(types));
console.log('AnalyticsData available:', 'AnalyticsData' in types);
