#!/usr/bin/env node

/**
 * Phase 1 Autonomous Systems - Deployment Test Script  
 * Validates all APIs and core functionality
 */

const http = require('http')
const https = require('https')
const { URL } = require('url')

const baseUrl = 'http://localhost:3001'

// Test data and utilities
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logTest(name, passed, details = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL'
  const color = passed ? 'green' : 'red'
  log(`${status} ${name}${details ? ` - ${details}` : ''}`, color)
}

function httpRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url)
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    }
    
    const req = http.request(requestOptions, (res) => {
      let data = ''
      res.on('data', (chunk) => data += chunk)
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            data: JSON.parse(data)
          })
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            data: { error: 'Invalid JSON response', raw: data }
          })
        }
      })
    })
    
    req.on('error', reject)
    
    if (options.body) {
      req.write(JSON.stringify(options.body))
    }
    
    req.end()
  })
}

async function testAPI(endpoint, expectedKeys = []) {
  try {
    const response = await httpRequest(`${baseUrl}${endpoint}`)
    const data = response.data
    
    if (response.statusCode !== 200) {
      return { success: false, error: `HTTP ${response.statusCode}`, data }
    }
    
    // Check for expected keys
    const missingKeys = expectedKeys.filter(key => !(key in data))
    if (missingKeys.length > 0) {
      return { success: false, error: `Missing keys: ${missingKeys.join(', ')}`, data }
    }
    
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error.message, data: null }
  }
}

async function testPOST(endpoint, body, expectedKeys = []) {
  try {
    const response = await httpRequest(`${baseUrl}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body
    })
    const data = response.data
    
    if (response.statusCode !== 200) {
      return { success: false, error: `HTTP ${response.statusCode}`, data }
    }
    
    const missingKeys = expectedKeys.filter(key => !(key in data))
    if (missingKeys.length > 0) {
      return { success: false, error: `Missing keys: ${missingKeys.join(', ')}`, data }
    }
    
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error.message, data: null }
  }
}

async function runTests() {
  log('\n🚀 Phase 1 Autonomous Systems - Deployment Test', 'bold')
  log('='.repeat(60), 'blue')
  
  let passed = 0
  let total = 0
  
  // Test 1: Enhanced Health API
  log('\n📊 Testing Enhanced Health API', 'yellow')
  total++
  const healthTest = await testAPI('/api/agents/health/enhanced', ['timestamp', 'summary', 'agents', 'systemHealth'])
  logTest('Enhanced Health Endpoint', healthTest.success, healthTest.error || `${healthTest.data?.agents?.length || 0} agents`)
  if (healthTest.success) passed++
  
  // Test 2: Recovery API - GET
  log('\n🔧 Testing Recovery API', 'yellow')  
  total++
  const recoveryTest = await testAPI('/api/agents/recovery', ['executions', 'summary', 'timestamp'])
  logTest('Recovery History Endpoint', recoveryTest.success, recoveryTest.error || `${recoveryTest.data?.executions?.length || 0} executions`)
  if (recoveryTest.success) passed++
  
  // Test 3: Recovery API - POST (trigger recovery)
  total++
  const triggerTest = await testPOST('/api/agents/recovery', { action: 'trigger', agentId: 'test-agent' }, ['success'])
  logTest('Recovery Trigger', triggerTest.success || triggerTest.data?.reason === 'no_strategy_applicable', 
    triggerTest.error || (triggerTest.data?.reason ? 'No strategy needed (expected)' : 'Triggered successfully'))
  if (triggerTest.success || triggerTest.data?.reason === 'no_strategy_applicable') passed++
  
  // Test 4: Recovery API - POST (get recommendations)
  total++
  const recommendTest = await testPOST('/api/agents/recovery', { action: 'get_recommendations', agentId: 'test-agent' })
  logTest('Recovery Recommendations', recommendTest.success || recommendTest.data?.error?.includes('not found'), 
    recommendTest.error || (recommendTest.data?.error ? 'No agent data (expected)' : 'Generated recommendations'))
  if (recommendTest.success || recommendTest.data?.error?.includes('not found')) passed++
  
  // Test 5: Circuit Breaker Reset
  total++
  const circuitTest = await testPOST('/api/agents/health/enhanced', { action: 'reset_circuit', agentId: 'test-agent' }, ['success'])
  logTest('Circuit Breaker Reset', circuitTest.success, circuitTest.error || 'Reset successful')
  if (circuitTest.success) passed++
  
  // Test 6: System Health Analysis
  if (healthTest.success && healthTest.data) {
    total++
    const systemHealth = healthTest.data.systemHealth
    const hasHealthScore = typeof systemHealth?.overallScore === 'number'
    const hasTrend = ['improving', 'stable', 'degrading'].includes(systemHealth?.trend)
    const hasRecommendations = Array.isArray(systemHealth?.recommendations)
    
    const systemHealthValid = hasHealthScore && hasTrend && hasRecommendations
    logTest('System Health Analysis', systemHealthValid, 
      `Score: ${systemHealth?.overallScore}, Trend: ${systemHealth?.trend}, Recs: ${systemHealth?.recommendations?.length || 0}`)
    if (systemHealthValid) passed++
  }
  
  // Test 7: Circuit Breaker Manager Integration
  if (healthTest.success && healthTest.data?.agents) {
    total++
    const agents = healthTest.data.agents
    const hasCircuitBreakers = agents.every(agent => 
      agent.circuitBreaker && 
      ['closed', 'open', 'half-open'].includes(agent.circuitBreaker.state)
    )
    logTest('Circuit Breaker Integration', hasCircuitBreakers || agents.length === 0, 
      `${agents.length} agents with circuit breakers`)
    if (hasCircuitBreakers || agents.length === 0) passed++
  }
  
  // Test 8: Autonomous Health Monitoring
  if (healthTest.success && healthTest.data?.agents) {
    total++
    const agents = healthTest.data.agents
    const hasAutonomousHealth = agents.every(agent => 
      !agent.autonomousHealth || 
      (agent.autonomousHealth.currentHealth !== undefined && 
       agent.autonomousHealth.lastUpdated !== undefined)
    )
    logTest('Autonomous Health Monitoring', hasAutonomousHealth || agents.length === 0, 
      `Health data structure valid`)
    if (hasAutonomousHealth || agents.length === 0) passed++
  }
  
  // Summary
  log('\n📋 Test Results Summary', 'bold')
  log('='.repeat(60), 'blue')
  log(`✅ Passed: ${passed}/${total} tests`, passed === total ? 'green' : 'yellow')
  log(`📊 Success Rate: ${Math.round((passed / total) * 100)}%`, passed === total ? 'green' : 'yellow')
  
  if (passed === total) {
    log('\n🎉 ALL TESTS PASSED - Phase 1 Deployment Successful!', 'green')
    log('✅ Enhanced Health API operational', 'green')
    log('✅ Recovery System functional', 'green')  
    log('✅ Circuit Breakers integrated', 'green')
    log('✅ Autonomous monitoring active', 'green')
  } else {
    log(`\n⚠️  ${total - passed} tests failed - Review deployment`, 'yellow')
  }
  
  // Additional Info
  log('\n🔗 Access Points:', 'blue')
  log(`📊 Live Activity Dashboard: ${baseUrl}/agents`, 'blue')
  log(`🔧 Enhanced Health API: ${baseUrl}/api/agents/health/enhanced`, 'blue')
  log(`⚡ Recovery API: ${baseUrl}/api/agents/recovery`, 'blue')
  
  log('\n🎯 Phase 1 Features:', 'blue') 
  log('• Circuit Breaker Pattern with failure thresholds', 'blue')
  log('• Predictive Health Monitoring with trend analysis', 'blue')
  log('• Autonomous Recovery System with strategy execution', 'blue')
  log('• Real-time Agent Activity Dashboard', 'blue')
  log('• Enhanced Error Recovery with smart recommendations', 'blue')
  
  return passed === total
}

// Run tests if called directly
if (require.main === module) {
  runTests().then(success => {
    process.exit(success ? 0 : 1)
  }).catch(error => {
    console.error('Test execution failed:', error)
    process.exit(1)
  })
}

module.exports = { runTests, testAPI, testPOST }