/**
 * Demo Lifecycle Script
 * 
 * Simulates a full shipment lifecycle by calling the backend endpoints
 * in sequence and logging the phase transitions.
 * 
 * Usage: npm run demo:lifecycle
 * 
 * Prerequisites: Backend server must be running on http://localhost:3001
 */

const API_BASE = 'http://localhost:3001/api'

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logSection(title) {
  console.log('\n' + '='.repeat(60))
  log(title, 'bright')
  console.log('='.repeat(60))
}

function logShipmentState(shipment) {
  log(`\n📦 Container: ${shipment.containerNo || shipment.id}`, 'cyan')
  log(`   Current Phase: ${shipment.currentPhase || 'N/A'}`, 'blue')
  log(`   Phase Progress:`, 'blue')
  if (shipment.phaseProgress) {
    Object.entries(shipment.phaseProgress).forEach(([phase, status]) => {
      const icon = status === 'done' ? '✓' : status === 'in_progress' ? '⏳' : '○'
      log(`     ${icon} ${phase}: ${status}`)
    })
  }
  log(`   Compliance Status: ${shipment.complianceStatus || 'N/A'}`, 
    shipment.complianceStatus === 'ok' ? 'green' : 
    shipment.complianceStatus === 'issues' ? 'yellow' : 'reset')
  if (shipment.complianceIssues && shipment.complianceIssues.length > 0) {
    log(`   Compliance Issues:`, 'yellow')
    shipment.complianceIssues.forEach(issue => {
      log(`     - ${issue}`, 'yellow')
    })
  }
}

async function fetchShipments() {
  try {
    const response = await fetch(`${API_BASE}/shipments`)
    if (!response.ok) {
      throw new Error(`Failed to fetch shipments: ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    log(`❌ Error fetching shipments: ${error.message}`, 'red')
    throw error
  }
}

async function findTestShipment() {
  const shipments = await fetchShipments()
  
  // Look for a shipment in compliance or monitoring phase
  let testShipment = shipments.find(s => 
    s.currentPhase === 'compliance' || 
    s.currentPhase === 'monitoring' ||
    s.currentPhase === 'arrival'
  )
  
  // If none found, use the first shipment
  if (!testShipment && shipments.length > 0) {
    testShipment = shipments[0]
  }
  
  if (!testShipment) {
    log('⚠️  No shipments found. Please create a shipment first (upload an arrival notice).', 'yellow')
    process.exit(1)
  }
  
  return testShipment
}

async function callEndpoint(method, endpoint, description) {
  try {
    log(`\n🔄 ${description}...`, 'blue')
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      const text = await response.text()
      throw new Error(`HTTP ${response.status}: ${text}`)
    }
    
    const data = await response.json()
    log(`✅ ${description} completed`, 'green')
    return data
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red')
    throw error
  }
}

async function runDemoLifecycle() {
  logSection('🚀 Derya AI - Shipment Lifecycle Demo')
  
  try {
    // Step 1: Find a test shipment
    logSection('Step 1: Finding Test Shipment')
    const testShipment = await findTestShipment()
    logShipmentState(testShipment)
    
    const containerNo = testShipment.containerNo || testShipment.id
    
    // Step 2: Advance through phases
    logSection('Step 2: Advancing Through Phases')
    
    // Check current phase and advance accordingly
    if (testShipment.currentPhase === 'compliance') {
      log('\n📍 Current phase: Compliance', 'cyan')
      log('   → Advancing to Monitoring...', 'blue')
      
      await callEndpoint('POST', '/debug/phase/compliance-done', 'Mark Compliance Done')
      
      const shipmentsAfter = await fetchShipments()
      const updated = shipmentsAfter.find(s => 
        (s.containerNo || s.id) === containerNo
      )
      if (updated) {
        logShipmentState(updated)
      }
    }
    
    // Advance to Arrival if in Monitoring
    const shipmentsCheck1 = await fetchShipments()
    const currentCheck1 = shipmentsCheck1.find(s => 
      (s.containerNo || s.id) === containerNo
    )
    
    if (currentCheck1 && currentCheck1.currentPhase === 'monitoring') {
      log('\n📍 Current phase: Monitoring', 'cyan')
      log('   → Advancing to Arrival & Delivery...', 'blue')
      
      await callEndpoint('POST', '/debug/phase/arrival-release', 'Simulate Arrival & Release')
      
      const shipmentsAfter = await fetchShipments()
      const updated = shipmentsAfter.find(s => 
        (s.containerNo || s.id) === containerNo
      )
      if (updated) {
        logShipmentState(updated)
      }
    }
    
    // Advance to Billing if in Arrival
    const shipmentsCheck2 = await fetchShipments()
    const currentCheck2 = shipmentsCheck2.find(s => 
      (s.containerNo || s.id) === containerNo
    )
    
    if (currentCheck2 && currentCheck2.currentPhase === 'arrival') {
      log('\n📍 Current phase: Arrival & Delivery', 'cyan')
      log('   → Advancing to Billing & Close-out...', 'blue')
      
      await callEndpoint('POST', '/debug/phase/billing-processed', 'Simulate Invoice Processed')
      
      const shipmentsAfter = await fetchShipments()
      const updated = shipmentsAfter.find(s => 
        (s.containerNo || s.id) === containerNo
      )
      if (updated) {
        logShipmentState(updated)
      }
    }
    
    // Final state
    logSection('Final State')
    const finalShipments = await fetchShipments()
    const finalShipment = finalShipments.find(s => 
      (s.containerNo || s.id) === containerNo
    )
    
    if (finalShipment) {
      logShipmentState(finalShipment)
      
      // Summary
      log('\n📊 Summary:', 'bright')
      log(`   Container: ${containerNo}`)
      log(`   Final Phase: ${finalShipment.currentPhase}`, 'cyan')
      
      const completedPhases = Object.entries(finalShipment.phaseProgress || {})
        .filter(([_, status]) => status === 'done').length
      log(`   Completed Phases: ${completedPhases}/5`, 'green')
      
      if (finalShipment.complianceStatus) {
        log(`   Compliance: ${finalShipment.complianceStatus}`, 
          finalShipment.complianceStatus === 'ok' ? 'green' : 'yellow')
      }
    }
    
    log('\n✅ Demo lifecycle completed successfully!', 'green')
    
  } catch (error) {
    log(`\n❌ Demo failed: ${error.message}`, 'red')
    process.exit(1)
  }
}

// Check if server is running
fetch(`${API_BASE}/shipments`)
  .then(() => {
    runDemoLifecycle()
  })
  .catch((error) => {
    log('\n❌ Cannot connect to backend server at http://localhost:3001', 'red')
    log('   Please make sure the server is running:', 'yellow')
    log('   npm run dev:server', 'cyan')
    process.exit(1)
  })

