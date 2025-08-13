#!/usr/bin/env node

/**
 * Comprehensive test script for the Smart Autocomplete System
 * Tests all major functionality including API endpoints and data flow
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3001';
const FRONTEND_BASE = 'http://localhost:5174';

// Test colors
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(testName, status, message = '') {
  const statusColor = status === 'PASS' ? 'green' : status === 'FAIL' ? 'red' : 'yellow';
  const statusSymbol = status === 'PASS' ? '✓' : status === 'FAIL' ? '✗' : '⚠';
  log(`${statusSymbol} ${testName}`, statusColor);
  if (message) {
    log(`  ${message}`, 'reset');
  }
}

async function testBackendHealth() {
  try {
    const response = await axios.get(`${API_BASE}/api/suggest/health`);
    const data = response.data;
    
    if (data.status === 'healthy' && data.trie_loaded && data.word_count > 1000) {
      logTest('Backend Health Check', 'PASS', `${data.word_count} words loaded`);
      return true;
    } else {
      logTest('Backend Health Check', 'FAIL', `Status: ${data.status}, Words: ${data.word_count}`);
      return false;
    }
  } catch (error) {
    logTest('Backend Health Check', 'FAIL', `Connection failed: ${error.message}`);
    return false;
  }
}

async function testSingleLetterAutocomplete() {
  try {
    const response = await axios.get(`${API_BASE}/api/suggest?prefix=c&k=5`);
    const data = response.data;
    
    if (data.suggestions && data.suggestions.length > 0) {
      const allStartWithC = data.suggestions.every(s => s.word.toLowerCase().startsWith('c'));
      if (allStartWithC) {
        logTest('Single Letter Autocomplete', 'PASS', `${data.suggestions.length} suggestions for 'c'`);
        return true;
      } else {
        logTest('Single Letter Autocomplete', 'FAIL', 'Not all suggestions start with "c"');
        return false;
      }
    } else {
      logTest('Single Letter Autocomplete', 'FAIL', 'No suggestions returned');
      return false;
    }
  } catch (error) {
    logTest('Single Letter Autocomplete', 'FAIL', error.message);
    return false;
  }
}

async function testMultiWordAutocomplete() {
  try {
    const testPrefixes = ['pro', 'com', 'app', 'dev'];
    let allPassed = true;
    
    for (const prefix of testPrefixes) {
      const response = await axios.get(`${API_BASE}/api/suggest?prefix=${prefix}&k=3`);
      const data = response.data;
      
      if (!data.suggestions || data.suggestions.length === 0) {
        logTest('Multi-word Autocomplete', 'FAIL', `No suggestions for "${prefix}"`);
        allPassed = false;
        break;
      }
      
      const allStartWithPrefix = data.suggestions.every(s => 
        s.word.toLowerCase().startsWith(prefix.toLowerCase())
      );
      
      if (!allStartWithPrefix) {
        logTest('Multi-word Autocomplete', 'FAIL', `Invalid suggestions for "${prefix}"`);
        allPassed = false;
        break;
      }
    }
    
    if (allPassed) {
      logTest('Multi-word Autocomplete', 'PASS', `All prefixes returned valid suggestions`);
    }
    
    return allPassed;
  } catch (error) {
    logTest('Multi-word Autocomplete', 'FAIL', error.message);
    return false;
  }
}

async function testSpellChecking() {
  try {
    // Test correct word
    const correctResponse = await axios.get(`${API_BASE}/api/suggest/spell-check?word=computer`);
    const correctData = correctResponse.data;
    
    // Test incorrect word
    const incorrectResponse = await axios.get(`${API_BASE}/api/suggest/spell-check?word=computr`);
    const incorrectData = incorrectResponse.data;
    
    // Test spell suggestions
    const suggestionsResponse = await axios.get(`${API_BASE}/api/suggest/spell-suggestions?word=computr&max=3`);
    const suggestionsData = suggestionsResponse.data;
    
    if (correctData.isCorrect && !incorrectData.isCorrect && suggestionsData.suggestions.length > 0) {
      logTest('Spell Checking', 'PASS', `Suggestions: ${suggestionsData.suggestions.join(', ')}`);
      return true;
    } else {
      logTest('Spell Checking', 'FAIL', 'Spell check logic failed');
      return false;
    }
  } catch (error) {
    logTest('Spell Checking', 'FAIL', error.message);
    return false;
  }
}

async function testRealTimePerformance() {
  try {
    const startTime = Date.now();
    const promises = [];
    
    // Simulate rapid typing
    const rapidPrefixes = ['p', 'pr', 'pro', 'prog', 'progr', 'progra', 'program'];
    
    for (const prefix of rapidPrefixes) {
      promises.push(axios.get(`${API_BASE}/api/suggest?prefix=${prefix}&k=5`));
    }
    
    const responses = await Promise.all(promises);
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    const allSuccessful = responses.every(r => r.status === 200 && r.data.suggestions);
    
    if (allSuccessful && totalTime < 2000) { // Should complete within 2 seconds
      logTest('Real-time Performance', 'PASS', `${rapidPrefixes.length} requests in ${totalTime}ms`);
      return true;
    } else {
      logTest('Real-time Performance', 'FAIL', `Too slow: ${totalTime}ms or failed requests`);
      return false;
    }
  } catch (error) {
    logTest('Real-time Performance', 'FAIL', error.message);
    return false;
  }
}

async function testFrontendConnection() {
  try {
    const response = await axios.get(FRONTEND_BASE, { timeout: 5000 });
    
    if (response.status === 200 && response.data.includes('Smart Autocomplete')) {
      logTest('Frontend Connection', 'PASS', 'Frontend is accessible');
      return true;
    } else {
      logTest('Frontend Connection', 'FAIL', 'Frontend not properly loaded');
      return false;
    }
  } catch (error) {
    logTest('Frontend Connection', 'FAIL', `Cannot reach frontend: ${error.message}`);
    return false;
  }
}

async function testAnalyticsEndpoint() {
  try {
    const response = await axios.get(`${API_BASE}/api/admin/stats?days=1`);
    const data = response.data;
    
    if (data.trie_stats && typeof data.trie_stats.word_count === 'number') {
      logTest('Analytics Endpoint', 'PASS', `Analytics data available`);
      return true;
    } else {
      logTest('Analytics Endpoint', 'FAIL', 'Invalid analytics data structure');
      return false;
    }
  } catch (error) {
    logTest('Analytics Endpoint', 'FAIL', error.message);
    return false;
  }
}

async function runAllTests() {
  log('\n🧪 Smart Autocomplete System - Comprehensive Test Suite', 'bold');
  log('=' .repeat(60), 'blue');
  
  const tests = [
    { name: 'Backend Health', fn: testBackendHealth },
    { name: 'Frontend Connection', fn: testFrontendConnection },
    { name: 'Single Letter Autocomplete', fn: testSingleLetterAutocomplete },
    { name: 'Multi-word Autocomplete', fn: testMultiWordAutocomplete },
    { name: 'Spell Checking', fn: testSpellChecking },
    { name: 'Real-time Performance', fn: testRealTimePerformance },
    { name: 'Analytics Endpoint', fn: testAnalyticsEndpoint },
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      logTest(test.name, 'FAIL', `Unexpected error: ${error.message}`);
      failed++;
    }
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  log('\n' + '=' .repeat(60), 'blue');
  log(`📊 Test Results: ${passed} passed, ${failed} failed`, 'bold');
  
  if (failed === 0) {
    log('🎉 All tests passed! The autocomplete system is working correctly.', 'green');
  } else {
    log(`⚠️  ${failed} test(s) failed. Please check the issues above.`, 'red');
  }
  
  log('\n💡 To test the UI manually:', 'yellow');
  log(`   • Open: ${FRONTEND_BASE}`, 'reset');
  log(`   • Try typing single letters like 'c', 'p', 'a'`, 'reset');
  log(`   • Try typing sentences like "I am going to the"`, 'reset');
  log(`   • Try misspelled words to see red underlines`, 'reset');
  log(`   • Right-click misspelled words for corrections`, 'reset');
  log(`   • Click the test tube icon to run the built-in test suite`, 'reset');
  
  return failed === 0;
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    log(`Fatal error: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { runAllTests };
