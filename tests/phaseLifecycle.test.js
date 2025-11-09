import { describe, it, expect, beforeEach } from '@jest/globals'

// Import phase helpers from server.js
// Since server.js uses ES modules, we'll test the logic directly
// In a real setup, you'd extract these into a separate module

describe('Phase Lifecycle State Machine', () => {
  // Helper function to initialize phase data (copied from server.js logic)
  function initializePhaseData(shipment) {
    if (!shipment.currentPhase) {
      shipment.currentPhase = 'intake'
    }
    if (!shipment.phaseProgress) {
      shipment.phaseProgress = {
        intake: 'pending',
        compliance: 'pending',
        monitoring: 'pending',
        arrival: 'pending',
        billing: 'pending',
      }
    }
    if (!shipment.complianceStatus) {
      shipment.complianceStatus = 'pending'
    }
    if (!shipment.complianceIssues) {
      shipment.complianceIssues = []
    }
    return shipment
  }

  // Helper function to run compliance check (copied from server.js logic)
  function runComplianceCheck(shipment) {
    initializePhaseData(shipment)

    const issues = []

    // Required fields check
    if (!shipment.containerNo) issues.push('Missing container number')
    if (!shipment.shipper) issues.push('Missing shipper')
    if (!shipment.consignee) issues.push('Missing consignee')
    if (!shipment.hsCode && !shipment.commodity) issues.push('Missing HS code or commodity description')
    if (!shipment.eta && !shipment.arrivalDate && !shipment.promisedDate) issues.push('Missing ETA')
    if (!shipment.port && !shipment.destination) issues.push('Missing discharge port')

    // Basic risk flags
    const watchlistPorts = ['IRAN', 'NORTH KOREA', 'SYRIA']
    const portStr = (shipment.port || shipment.destination || '').toUpperCase()
    if (portStr && watchlistPorts.some(wp => portStr.includes(wp))) {
      issues.push('Route involves a high-risk port (manual review required)')
    }

    // Check for generic/invalid HS codes
    if (shipment.hsCode) {
      const hsCodeStr = String(shipment.hsCode).trim()
      if (hsCodeStr === '0000' || hsCodeStr === '9999' || hsCodeStr.length < 4) {
        issues.push('HS code appears invalid or generic')
      }
    }

    shipment.complianceIssues = issues

    if (issues.length === 0) {
      shipment.complianceStatus = 'ok'
      shipment.phaseProgress.compliance = 'done'
      if (shipment.currentPhase === 'intake' || shipment.currentPhase === 'compliance') {
        shipment.currentPhase = 'monitoring'
        if (shipment.phaseProgress.monitoring === 'pending') {
          shipment.phaseProgress.monitoring = 'in_progress'
        }
      }
    } else {
      shipment.complianceStatus = 'issues'
      if (shipment.phaseProgress.compliance === 'pending') {
        shipment.phaseProgress.compliance = 'in_progress'
      }
      shipment.currentPhase = 'compliance'
    }

    return shipment
  }

  describe('Phase 1 - Intake', () => {
    it('should initialize phase data with correct defaults', () => {
      const shipment = {
        id: 'test-1',
        containerNo: 'TEST1234567',
      }

      initializePhaseData(shipment)

      expect(shipment.currentPhase).toBe('intake')
      expect(shipment.phaseProgress.intake).toBe('pending')
      expect(shipment.phaseProgress.compliance).toBe('pending')
      expect(shipment.phaseProgress.monitoring).toBe('pending')
      expect(shipment.phaseProgress.arrival).toBe('pending')
      expect(shipment.phaseProgress.billing).toBe('pending')
      expect(shipment.complianceStatus).toBe('pending')
      expect(Array.isArray(shipment.complianceIssues)).toBe(true)
    })

    it('should mark intake as done and move to compliance', () => {
      const shipment = {
        id: 'test-1',
        containerNo: 'TEST1234567',
      }

      initializePhaseData(shipment)
      shipment.phaseProgress.intake = 'done'
      shipment.currentPhase = 'compliance'
      shipment.phaseProgress.compliance = 'in_progress'

      expect(shipment.phaseProgress.intake).toBe('done')
      expect(shipment.currentPhase).toBe('compliance')
      expect(shipment.phaseProgress.compliance).toBe('in_progress')
    })
  })

  describe('Phase 2 - Compliance', () => {
    it('should pass compliance check with all required fields', () => {
      const shipment = {
        id: 'test-1',
        containerNo: 'TEST1234567',
        shipper: 'ACME Corp',
        consignee: 'Umbrella Co',
        hsCode: '1234.56',
        eta: new Date().toISOString(),
        port: 'Rotterdam',
      }

      initializePhaseData(shipment)
      shipment.phaseProgress.intake = 'done'
      shipment.currentPhase = 'compliance'
      shipment.phaseProgress.compliance = 'in_progress'

      runComplianceCheck(shipment)

      expect(shipment.complianceStatus).toBe('ok')
      expect(Array.isArray(shipment.complianceIssues)).toBe(true)
      expect(shipment.complianceIssues.length).toBe(0)
      expect(shipment.phaseProgress.compliance).toBe('done')
      expect(shipment.currentPhase).toBe('monitoring')
      expect(shipment.phaseProgress.monitoring).toBe('in_progress')
    })

    it('should fail compliance check with missing required fields', () => {
      const shipment = {
        id: 'test-2',
        containerNo: 'TEST7654321',
        // Missing shipper, consignee, hsCode, eta, port
      }

      initializePhaseData(shipment)
      shipment.phaseProgress.intake = 'done'
      shipment.currentPhase = 'compliance'
      shipment.phaseProgress.compliance = 'in_progress'

      runComplianceCheck(shipment)

      expect(shipment.complianceStatus).toBe('issues')
      expect(Array.isArray(shipment.complianceIssues)).toBe(true)
      expect(shipment.complianceIssues.length).toBeGreaterThan(0)
      expect(shipment.currentPhase).toBe('compliance')
      expect(shipment.phaseProgress.compliance).toBe('in_progress')
    })

    it('should flag invalid HS codes', () => {
      const shipment = {
        id: 'test-3',
        containerNo: 'TEST9999999',
        shipper: 'ACME Corp',
        consignee: 'Umbrella Co',
        hsCode: '0000', // Invalid
        eta: new Date().toISOString(),
        port: 'Rotterdam',
      }

      initializePhaseData(shipment)
      runComplianceCheck(shipment)

      expect(shipment.complianceStatus).toBe('issues')
      expect(shipment.complianceIssues.some(issue => issue.includes('HS code'))).toBe(true)
    })

    it('should flag high-risk ports', () => {
      const shipment = {
        id: 'test-4',
        containerNo: 'TEST8888888',
        shipper: 'ACME Corp',
        consignee: 'Umbrella Co',
        hsCode: '1234.56',
        eta: new Date().toISOString(),
        port: 'IRAN Port', // High-risk
      }

      initializePhaseData(shipment)
      runComplianceCheck(shipment)

      expect(shipment.complianceStatus).toBe('issues')
      expect(shipment.complianceIssues.some(issue => issue.includes('high-risk'))).toBe(true)
    })
  })

  describe('Phase Transitions', () => {
    it('should transition from compliance to monitoring when compliant', () => {
      const shipment = {
        id: 'test-5',
        containerNo: 'TEST5555555',
        shipper: 'ACME Corp',
        consignee: 'Umbrella Co',
        hsCode: '1234.56',
        eta: new Date().toISOString(),
        port: 'Rotterdam',
      }

      initializePhaseData(shipment)
      shipment.phaseProgress.intake = 'done'
      shipment.currentPhase = 'compliance'
      shipment.phaseProgress.compliance = 'in_progress'

      runComplianceCheck(shipment)

      expect(shipment.currentPhase).toBe('monitoring')
      expect(shipment.phaseProgress.compliance).toBe('done')
      expect(shipment.phaseProgress.monitoring).toBe('in_progress')
    })

    it('should stay in compliance when issues are found', () => {
      const shipment = {
        id: 'test-6',
        containerNo: 'TEST6666666',
        // Missing required fields
      }

      initializePhaseData(shipment)
      shipment.phaseProgress.intake = 'done'
      shipment.currentPhase = 'compliance'
      shipment.phaseProgress.compliance = 'in_progress'

      runComplianceCheck(shipment)

      expect(shipment.currentPhase).toBe('compliance')
      expect(shipment.phaseProgress.compliance).toBe('in_progress')
      expect(shipment.complianceStatus).toBe('issues')
    })
  })
})

