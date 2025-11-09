import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import multer from 'multer'
import { pdf as pdfParse } from 'pdf-parse'
import OpenAI from 'openai'
import { startEmailWatcher, setProcessArrivalNoticeBuffer, emailStatus } from './emailWatcher.js'

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
})

// Configure multer for file uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type. Only PDF and images are allowed.'), false)
    }
  }
})

// ============================================================================
// In-Memory Data Store
// ============================================================================

let employees = [
  {
    id: 'AI-EMP-001',
    name: 'FreightBot Alpha',
    role: 'Documents / Arrival Notices',
    currentTask: 'Parsing arrival notice for container MAEU1234567 and extracting customs data',
    tasksCompleted: 156,
    successRate: 98.7,
    workQueue: 8,
    efficiency: 94,
    costSavingsUsd: 12450,
    uptime: '99.2%',
    throughput: 156,
    modelConfidence: 96.8,
    lastActivity: '2 min ago'
  },
  {
    id: 'AI-EMP-002',
    name: 'RouteMaster Pro',
    role: 'Routing / ETA Tracking',
    currentTask: 'Updating ETAs for 15 shipments in EU region based on port congestion data',
    tasksCompleted: 89,
    successRate: 95.8,
    workQueue: 12,
    efficiency: 89,
    costSavingsUsd: 18900,
    uptime: '98.7%',
    throughput: 89,
    modelConfidence: 94.2,
    lastActivity: '1 min ago'
  }
]

// Phase mapping for actions
const ACTION_PHASE_MAP = {
  'AI-EMP-001': 'intake', // Document parsing -> Intake
  'AI-EMP-002': 'monitoring', // ETA updates -> Monitoring
}

let actions = [
  { id: '1', employeeId: 'AI-EMP-001', createdAt: new Date(Date.now() - 6 * 60000).toISOString(), message: 'Parsed arrival notice for MAEU1234567', phase: 'intake' },
  { id: '2', employeeId: 'AI-EMP-002', createdAt: new Date(Date.now() - 5 * 60000).toISOString(), message: 'Updated ETA for 5 shipments (avg delay 2h)', phase: 'monitoring' },
  { id: '3', employeeId: 'AI-EMP-001', createdAt: new Date(Date.now() - 3 * 60000).toISOString(), message: 'Created customs & trucking tasks for SHP-9021', phase: 'compliance' },
  { id: '4', employeeId: 'AI-EMP-002', createdAt: new Date(Date.now() - 1 * 60000).toISOString(), message: 'Optimized route for Hamburg → Berlin delivery', phase: 'monitoring' }
]

// Helper function to initialize phase data for a shipment
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
  // Initialize compliance metadata
  if (!shipment.complianceStatus) {
    shipment.complianceStatus = 'pending'
  }
  if (!shipment.complianceIssues) {
    shipment.complianceIssues = []
  }
  return shipment
}

let shipments = [
  { id: '1', containerNo: 'MAEU1234567', status: 'in-transit', eta: '2024-01-20T14:00:00Z', carrier: 'Maersk', port: 'Rotterdam', lastUpdatedBy: 'System' },
  { id: '2', containerNo: 'TCLU9876543', status: 'in-transit', eta: '2024-01-21T10:00:00Z', carrier: 'COSCO', port: 'Hamburg', lastUpdatedBy: 'System' },
  { id: '3', containerNo: 'MSKU4567890', status: 'in-transit', eta: '2024-01-22T16:00:00Z', carrier: 'MSC', port: 'Antwerp', lastUpdatedBy: 'System' },
  { id: '4', containerNo: 'COSU1112223', status: 'in-transit', eta: '2024-01-23T09:00:00Z', carrier: 'CMA CGM', port: 'Felixstowe', lastUpdatedBy: 'System' },
  { id: '5', containerNo: 'HLCU4445556', status: 'in-transit', eta: '2024-01-24T12:00:00Z', carrier: 'Hapag-Lloyd', port: 'Bremen', lastUpdatedBy: 'System' }
].map(initializePhaseData)

let actionCounter = 5

// ============================================================================
// Helper Functions
// ============================================================================

function generateContainerNo() {
  const prefixes = ['MAEU', 'TCLU', 'MSKU', 'COSU', 'HLCU']
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
  const number = Math.floor(1000000 + Math.random() * 9000000)
  return `${prefix}${number}`
}

function formatTime(date) {
  const d = new Date(date)
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

// ============================================================================
// Shared Arrival Notice Processing Function
// ============================================================================

/**
 * Process arrival notice buffer (shared between upload and email)
 * @param {Buffer} fileBuffer - PDF or image file buffer
 * @param {string} source - 'upload' | 'email'
 * @param {string} mimetype - MIME type of the file (optional, defaults to 'application/pdf')
 * @returns {Promise<{shipment: object, actionMessage: string}>}
 */
async function processArrivalNoticeBuffer(fileBuffer, source = 'upload', mimetype = 'application/pdf', emailMetadata = null) {
  const employee = employees.find(e => e.id === 'AI-EMP-001')
  if (!employee) {
    throw new Error('Employee not found')
  }

  try {
    // Extract text from file
    let extractedText = ''
    
    if (mimetype === 'application/pdf') {
      // Extract text from PDF
      const pdfData = await pdfParse(fileBuffer)
      extractedText = pdfData.text
    } else if (mimetype.startsWith('image/')) {
      // For images, we'll use OpenAI's vision API
      // Convert buffer to base64
      const base64Image = fileBuffer.toString('base64')
      const dataUrl = `data:${mimetype};base64,${base64Image}`
      
      // Use vision API to extract text
      const visionResponse = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Extract all text from this arrival notice document. Return only the raw text content, no formatting.' },
              { type: 'image_url', image_url: { url: dataUrl } }
            ]
          }
        ],
        max_tokens: 2000
      })
      extractedText = visionResponse.choices[0].message.content
    }

    if (!extractedText || extractedText.trim().length === 0) {
      throw new Error('Could not extract text from document')
    }

    // Call OpenAI to extract structured data
    console.log('🤖 [OPENAI] Sending PDF to OpenAI…')
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at extracting structured data from shipping documents. Extract the following fields from the arrival notice and return ONLY valid JSON, no other text: { "carrier": string, "vessel": string, "voyage": string, "containerNo": string, "eta": string (ISO date format), "port": string, "totalCharges": number, "shipper": string (optional), "consignee": string (optional), "hsCode": string (optional), "commodity": string (optional) }'
        },
        {
          role: 'user',
          content: `Extract shipping information from this arrival notice:\n\n${extractedText}\n\nReturn JSON with: carrier, vessel, voyage, containerNo, eta (ISO date), port, totalCharges (number), shipper (optional), consignee (optional), hsCode (optional), commodity (optional).`
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1
    })

    // Parse the JSON response
    let extractedData
    try {
      const responseText = completion.choices[0].message.content
      extractedData = JSON.parse(responseText)
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError)
      throw new Error('Failed to parse extracted data')
    }

    // Log parsed data
    const containerNo = extractedData.containerNo || generateContainerNo()
    console.log('🤖 [OPENAI] Parsed arrival notice:', {
      container: containerNo,
      vessel: extractedData.vessel || 'Unknown',
      eta: extractedData.eta || 'Unknown',
      port: extractedData.port || 'Unknown',
      carrier: extractedData.carrier || 'Unknown'
    })

    // Validate required fields
    const eta = extractedData.eta || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    const port = extractedData.port || 'Unknown'
    const totalCharges = extractedData.totalCharges || 0
    const carrier = extractedData.carrier || 'Unknown'
    const vessel = extractedData.vessel || 'Unknown'
    const voyage = extractedData.voyage || 'Unknown'
    const shipper = extractedData.shipper || null
    const consignee = extractedData.consignee || null
    const hsCode = extractedData.hsCode || null
    const commodity = extractedData.commodity || null

    // Update employee stats
    employee.tasksCompleted += 1
    employee.workQueue += 1
    setTimeout(() => {
      employee.workQueue = Math.max(0, employee.workQueue - 1)
    }, 100)

    // Update or insert shipment
    const existingShipmentIndex = shipments.findIndex(s => s.containerNo === containerNo)
    let shipment
    if (existingShipmentIndex >= 0) {
      shipment = shipments[existingShipmentIndex]
      shipment.eta = eta
      shipment.status = 'in-transit'
      shipment.port = port
      shipment.carrier = carrier
      shipment.lastUpdatedBy = employee.name
      // Update compliance fields if provided
      if (shipper) shipment.shipper = shipper
      if (consignee) shipment.consignee = consignee
      if (hsCode) shipment.hsCode = hsCode
      if (commodity) shipment.commodity = commodity
      // Preserve email metadata if it exists, or add it if this is from email
      if (emailMetadata && !shipment.emailMetadata) {
        shipment.source = source
        shipment.emailMetadata = emailMetadata
      }
    } else {
      shipment = {
        id: String(shipments.length + 1),
        containerNo: containerNo,
        status: 'in-transit',
        eta: eta,
        port: port,
        carrier: carrier,
        vessel: vessel,
        voyage: voyage,
        totalCharges: totalCharges,
        lastUpdatedBy: employee.name,
        shipper: shipper,
        consignee: consignee,
        hsCode: hsCode,
        commodity: commodity,
        source: source, // 'upload' or 'email'
        emailMetadata: emailMetadata // { subject, from, receivedAt, attachmentName, attachmentSize }
      }
      shipments.push(shipment)
    }
    
    // Initialize phase data if needed
    initializePhaseData(shipment)
    
    // Log shipment creation
    const isNew = existingShipmentIndex < 0
    console.log(`🚢 [SHIPMENT] ${isNew ? 'Created' : 'Updated'} shipment:`, {
      id: shipment.id,
      container: shipment.containerNo,
      phase: shipment.currentPhase || 'intake'
    })
    
    // Phase transition: Intake → Compliance
    // After successful parse, mark intake as done
    shipment.phaseProgress.intake = 'done'
    shipment.currentPhase = 'compliance'
    // Set compliance to in_progress initially - runComplianceCheck will update it
    if (shipment.phaseProgress.compliance === 'pending') {
      shipment.phaseProgress.compliance = 'in_progress'
    }

    // Run compliance check - this will either move to monitoring or keep in compliance
    console.log(`🛃 [COMPLIANCE] Started for shipment: ${shipment.id}`)
    runComplianceCheck(shipment)

    // Create action message based on source
    const actionMessage = source === 'email'
      ? `[Intake] Ops AI processed arrival notice from email for container ${containerNo}`
      : `FreightBot Alpha parsed arrival notice for ${containerNo} (ETA ${new Date(eta).toLocaleDateString()}, Port: ${port}, Charges: $${totalCharges.toLocaleString()} USD).`
    const actionPhase = 'intake'
    
    // Add compliance action if compliance check was run
    if (shipment.complianceStatus === 'ok') {
      const complianceAction = {
        id: String(actionCounter++),
        employeeId: 'AI-EMP-001',
        createdAt: new Date().toISOString(),
        message: `[Compliance] Ops AI cleared shipment ${containerNo} for monitoring.`,
        phase: 'compliance'
      }
      actions.unshift(complianceAction)
    } else if (shipment.complianceStatus === 'issues' && shipment.complianceIssues.length > 0) {
      const complianceAction = {
        id: String(actionCounter++),
        employeeId: 'AI-EMP-001',
        createdAt: new Date().toISOString(),
        message: `[Compliance] Ops AI found compliance issues for ${containerNo}: ${shipment.complianceIssues[0]}.`,
        phase: 'compliance'
      }
      actions.unshift(complianceAction)
    }

    // Create action with phase
    const action = {
      id: String(actionCounter++),
      employeeId: 'AI-EMP-001',
      createdAt: new Date().toISOString(),
      message: actionMessage,
      phase: actionPhase
    }
    actions.unshift(action)

    // Keep only last 50 actions
    if (actions.length > 50) {
      actions = actions.slice(0, 50)
    }

    // Update last activity
    employee.lastActivity = 'just now'
    setTimeout(() => {
      employee.lastActivity = '1 min ago'
    }, 60000)

    return {
      shipment,
      actionMessage,
      action,
      extracted: {
        containerNo,
        eta,
        port,
        totalCharges,
        carrier,
        vessel,
        voyage,
        shipper,
        consignee,
        hsCode,
        commodity
      }
    }

  } catch (error) {
    console.error(`Error processing arrival notice (${source}):`, error)

    // Still create an action for the attempt
    const errorAction = {
      id: String(actionCounter++),
      employeeId: 'AI-EMP-001',
      createdAt: new Date().toISOString(),
      message: `FreightBot Alpha attempted to parse arrival notice (${source}) but encountered an error: ${error.message}`
    }
    actions.unshift(errorAction)

    // Keep only last 50 actions
    if (actions.length > 50) {
      actions = actions.slice(0, 50)
    }

    throw error
  }
}

// Export for email watcher
export { processArrivalNoticeBuffer, shipments, actions, actionCounter, employees, formatTime }

// ============================================================================
// Compliance Check Function
// ============================================================================

function runComplianceCheck(shipment) {
  // Ensure phase data
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
    // Generic or placeholder codes
    if (hsCodeStr === '0000' || hsCodeStr === '9999' || hsCodeStr.length < 4) {
      issues.push('HS code appears invalid or generic')
    }
  }

  shipment.complianceIssues = issues

  if (issues.length === 0) {
    shipment.complianceStatus = 'ok'
    shipment.phaseProgress.compliance = 'done'
    // Only advance to monitoring if we are currently in compliance or intake
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

  // Log compliance check completion
  console.log('🛃 [COMPLIANCE] Completed:', {
    id: shipment.id,
    container: shipment.containerNo,
    issues: issues.length,
    status: shipment.complianceStatus,
    phase: shipment.currentPhase
  })

  return shipment
}

// ============================================================================
// API Routes
// ============================================================================

// GET /api/ai-employees
app.get('/api/ai-employees', (req, res) => {
  res.json(employees)
})

// GET /api/ai-actions
app.get('/api/ai-actions', (req, res) => {
  const limit = parseInt(req.query.limit) || 20
  const sortedActions = [...actions]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit)
    .map(action => ({
      ...action,
      time: formatTime(action.createdAt),
      agent: employees.find(e => e.id === action.employeeId)?.name || 'Unknown'
    }))
  
  res.json(sortedActions)
})

// POST /api/ai-events/arrival-notice
app.post('/api/ai-events/arrival-notice', (req, res) => {
  const employee = employees.find(e => e.id === 'AI-EMP-001')
  if (!employee) {
    return res.status(404).json({ error: 'Employee not found' })
  }

  // Increment tasks completed
  employee.tasksCompleted += 1
  
  // Simulate work queue: add 1 then process 1 (net 0, but shows activity)
  employee.workQueue += 1
  setTimeout(() => {
    employee.workQueue = Math.max(0, employee.workQueue - 1)
  }, 100)

  // Generate container number
  const containerNo = generateContainerNo()

  // Create action with phase
  const action = {
    id: String(actionCounter++),
    employeeId: 'AI-EMP-001',
    createdAt: new Date().toISOString(),
    message: `FreightBot Alpha parsed arrival notice for ${containerNo} and created customs & trucking tasks.`,
    phase: 'intake'
  }
  actions.unshift(action)

  // Keep only last 50 actions
  if (actions.length > 50) {
    actions = actions.slice(0, 50)
  }

  // Update last activity
  employee.lastActivity = 'just now'
  setTimeout(() => {
    employee.lastActivity = '1 min ago'
  }, 60000)

  res.json({ 
    success: true, 
    employee: employee,
    action: {
      ...action,
      time: formatTime(action.createdAt),
      agent: employee.name
    }
  })
})

// POST /api/ai-events/update-eta
app.post('/api/ai-events/update-eta', (req, res) => {
  const employee = employees.find(e => e.id === 'AI-EMP-002')
  if (!employee) {
    return res.status(404).json({ error: 'Employee not found' })
  }

  // Increment tasks completed
  employee.tasksCompleted += 1

  // Update a few shipment ETAs (add 2 hours delay)
  const updatedCount = Math.min(15, shipments.length)
  const now = new Date()
  shipments.slice(0, updatedCount).forEach(shipment => {
    // Initialize phase data if needed
    initializePhaseData(shipment)
    
    const currentEta = new Date(shipment.eta)
    currentEta.setHours(currentEta.getHours() + 2)
    shipment.eta = currentEta.toISOString()
    shipment.lastUpdatedBy = employee.name
    
    // Phase transition: Move to Monitoring phase
    // Ensure previous phases are marked as done
    if (shipment.phaseProgress.intake === 'pending') {
      shipment.phaseProgress.intake = 'done'
    }
    if (shipment.phaseProgress.compliance === 'pending') {
      shipment.phaseProgress.compliance = 'done'
    }
    
    // Move to monitoring phase
    shipment.currentPhase = 'monitoring'
    shipment.phaseProgress.monitoring = 'in_progress'
  })

  // Create action
  const action = {
    id: String(actionCounter++),
    employeeId: 'AI-EMP-002',
    createdAt: new Date().toISOString(),
    message: `RouteMaster Pro updated ETAs for ${updatedCount} shipments (avg delay 2h).`,
    phase: 'monitoring'
  }
  actions.unshift(action)

  // Keep only last 50 actions
  if (actions.length > 50) {
    actions = actions.slice(0, 50)
  }

  // Update last activity
  employee.lastActivity = 'just now'
  setTimeout(() => {
    employee.lastActivity = '1 min ago'
  }, 60000)

  res.json({ 
    success: true, 
    employee: employee,
    action: {
      ...action,
      time: formatTime(action.createdAt),
      agent: employee.name
    },
    shipmentsUpdated: updatedCount
  })
})

// POST /api/ai-events/arrival-notice-upload
app.post('/api/ai-events/arrival-notice-upload', upload.single('file'), async (req, res) => {
  const employee = employees.find(e => e.id === 'AI-EMP-001')
  if (!employee) {
    return res.status(404).json({ ok: false, error: 'Employee not found' })
  }

  if (!req.file) {
    return res.status(400).json({ ok: false, error: 'No file uploaded' })
  }

  try {
    // Use shared processing function
    const result = await processArrivalNoticeBuffer(req.file.buffer, 'upload', req.file.mimetype)

    res.json({
      ok: true,
      extracted: result.extracted,
      employee: employee,
      action: {
        ...result.action,
        time: formatTime(result.action.createdAt),
        agent: employee.name
      }
    })

  } catch (error) {
    console.error('Error processing arrival notice upload:', error)
    res.status(500).json({
      ok: false,
      error: error.message || 'Failed to process arrival notice'
    })
  }
})

// GET /api/shipments (optional, for future use)
// ============================================================================
// Recheck Compliance Endpoint
// ============================================================================

// POST /api/ai-events/recheck-compliance
app.post('/api/ai-events/recheck-compliance', (req, res) => {
  let updatedCount = 0
  
  shipments.forEach(shipment => {
    if (shipment.currentPhase === 'compliance') {
      const previousStatus = shipment.complianceStatus
      runComplianceCheck(shipment)
      
      // Create action if status changed
      if (previousStatus !== shipment.complianceStatus) {
        if (shipment.complianceStatus === 'ok') {
          const action = {
            id: String(actionCounter++),
            employeeId: 'AI-EMP-001',
            createdAt: new Date().toISOString(),
            message: `[Compliance] Ops AI cleared shipment ${shipment.containerNo || shipment.id} for monitoring after recheck.`,
            phase: 'compliance'
          }
          actions.unshift(action)
        } else if (shipment.complianceStatus === 'issues' && shipment.complianceIssues.length > 0) {
          const action = {
            id: String(actionCounter++),
            employeeId: 'AI-EMP-001',
            createdAt: new Date().toISOString(),
            message: `[Compliance] Ops AI found compliance issues for ${shipment.containerNo || shipment.id}: ${shipment.complianceIssues[0]}.`,
            phase: 'compliance'
          }
          actions.unshift(action)
        }
      }
      
      updatedCount++
    }
  })
  
  // Keep only last 50 actions
  if (actions.length > 50) {
    actions = actions.slice(0, 50)
  }
  
  res.json({ ok: true, updated: updatedCount })
})

// ============================================================================
// Debug Phase Transition Endpoints
// ============================================================================

// POST /api/debug/phase/compliance-done
app.post('/api/debug/phase/compliance-done', (req, res) => {
  let updatedCount = 0
  
  shipments.forEach(shipment => {
    if (shipment.currentPhase === 'compliance') {
      initializePhaseData(shipment)
      shipment.phaseProgress.compliance = 'done'
      shipment.currentPhase = 'monitoring'
      if (shipment.phaseProgress.monitoring === 'pending') {
        shipment.phaseProgress.monitoring = 'in_progress'
      }
      updatedCount++
    }
  })
  
  res.json({ ok: true, updated: updatedCount })
})

// POST /api/debug/phase/arrival-release
app.post('/api/debug/phase/arrival-release', (req, res) => {
  let updatedCount = 0
  
  shipments.forEach(shipment => {
    if (shipment.currentPhase === 'monitoring') {
      initializePhaseData(shipment)
      shipment.phaseProgress.monitoring = 'done'
      shipment.phaseProgress.arrival = 'in_progress'
      shipment.currentPhase = 'arrival'
      updatedCount++
    }
  })
  
  res.json({ ok: true, updated: updatedCount })
})

// POST /api/debug/phase/billing-processed
app.post('/api/debug/phase/billing-processed', (req, res) => {
  let updatedCount = 0
  
  shipments.forEach(shipment => {
    if (shipment.currentPhase === 'arrival') {
      initializePhaseData(shipment)
      shipment.phaseProgress.arrival = 'done'
      shipment.phaseProgress.billing = 'done'
      shipment.currentPhase = 'billing'
      updatedCount++
    }
  })
  
  res.json({ ok: true, updated: updatedCount })
})

// ============================================================================
// Shipments Endpoint
// ============================================================================

app.get('/api/shipments', (req, res) => {
  res.json(shipments)
})

// ============================================================================
// Email Status Endpoint
// ============================================================================

app.get('/api/email/status', (req, res) => {
  res.json({
    connected: emailStatus.connected,
    lastConnectAt: emailStatus.lastConnectAt,
    lastPollAt: emailStatus.lastPollAt,
    lastError: emailStatus.lastError,
    imapUser: process.env.IMAP_USER || null,
  })
})

// Email processing activity - get recent email-processed shipments
app.get('/api/email/activity', (req, res) => {
  const emailShipments = shipments
    .filter(s => s.source === 'email' && s.emailMetadata)
    .sort((a, b) => {
      const aTime = a.emailMetadata?.receivedAt || 0
      const bTime = b.emailMetadata?.receivedAt || 0
      return new Date(bTime) - new Date(aTime)
    })
    .slice(0, 20) // Last 20 email-processed shipments
    .map(s => ({
      shipmentId: s.id,
      containerNo: s.containerNo,
      subject: s.emailMetadata.subject,
      from: s.emailMetadata.from,
      receivedAt: s.emailMetadata.receivedAt,
      attachmentName: s.emailMetadata.attachmentName,
      attachmentSize: s.emailMetadata.attachmentSize,
      currentPhase: s.currentPhase,
      processedAt: s.lastUpdatedBy ? new Date().toISOString() : null
    }))
  
  res.json(emailShipments)
})

// ============================================================================
// Server Start
// ============================================================================

app.listen(PORT, () => {
  console.log(`🚀 AI Employee API server running on http://localhost:${PORT}`)
  
  // Start email watcher if configured
  setProcessArrivalNoticeBuffer(processArrivalNoticeBuffer)
  startEmailWatcher()
})

