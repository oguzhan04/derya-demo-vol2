/**
 * Compliance Rules Engine
 * Rule-based logic for checking shipment compliance
 */

export function runComplianceChecks(shipment) {
  const findings = []
  
  // Rule 1: Heavy cargo check for specific ports
  const heavyCargoPorts = ['LAX', 'Long Beach', 'Los Angeles', 'LGB']
  const portStr = (shipment.port || '').toUpperCase()
  const isHeavyCargoPort = heavyCargoPorts.some(p => portStr.includes(p.toUpperCase()))
  
  if (isHeavyCargoPort && shipment.weight && shipment.weight > 25000) {
    findings.push('Heavy cargo (>25,000kg) – needs manual clearance')
  }
  
  // Rule 2: Missing ISF filing (for US imports)
  const usPorts = ['LAX', 'Long Beach', 'Los Angeles', 'LGB', 'NYC', 'New York', 'Savannah', 'Charleston', 'Miami']
  const isUSPort = usPorts.some(p => portStr.includes(p.toUpperCase()))
  
  if (isUSPort && !shipment.docs?.includes('ISF') && !shipment.isfFiled) {
    findings.push('Missing ISF filing (required for US imports)')
  }
  
  // Rule 3: Missing required documents
  const requiredDocs = ['Bill of Lading', 'Commercial Invoice']
  const hasDocs = shipment.docs || shipment.documents || []
  const missingDocs = requiredDocs.filter(doc => 
    !hasDocs.some(s => s.toLowerCase().includes(doc.toLowerCase()))
  )
  
  if (missingDocs.length > 0) {
    findings.push(`Missing documents: ${missingDocs.join(', ')}`)
  }
  
  // Rule 4: Invalid or missing HS Code
  if (shipment.hsCode) {
    const hsCodeStr = String(shipment.hsCode).trim()
    if (hsCodeStr === '0000' || hsCodeStr === '9999' || hsCodeStr.length < 4) {
      findings.push('HS code appears invalid or generic')
    }
  } else if (!shipment.commodity) {
    findings.push('Missing HS code or commodity description')
  }
  
  // Rule 5: High-risk ports
  const watchlistPorts = ['IRAN', 'NORTH KOREA', 'SYRIA', 'RUSSIA']
  if (portStr && watchlistPorts.some(wp => portStr.includes(wp))) {
    findings.push('Route involves a high-risk port (manual review required)')
  }
  
  // Rule 6: Missing shipper/consignee
  if (!shipment.shipper) {
    findings.push('Missing shipper information')
  }
  if (!shipment.consignee) {
    findings.push('Missing consignee information')
  }
  
  // Rule 7: Missing ETA
  if (!shipment.eta && !shipment.arrivalDate && !shipment.promisedDate) {
    findings.push('Missing ETA or arrival date')
  }
  
  // Determine status
  const status = findings.length > 0 ? 'flagged' : 'cleared'
  
  return { 
    status, 
    findings,
    checkedAt: new Date().toISOString()
  }
}

