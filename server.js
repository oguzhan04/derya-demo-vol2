import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import multer from 'multer'
import { pdf as pdfParse } from 'pdf-parse'
import OpenAI from 'openai'
import { startEmailWatcher, setProcessArrivalNoticeBuffer, emailStatus } from './emailWatcher.js'
import { runComplianceChecks } from './api/_lib/complianceRules.js'
import { computeMetrics } from './api/_lib/metrics.js'

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

// ============================================================================
// INITIAL SHIPMENTS - Only these 3 flagged shipments should exist
// ============================================================================
let shipments = [
  // Shipment 1: Class 8 chemical → Compliance Team
  { 
    id: '6', 
    containerNo: 'MSKU7891234', 
    status: 'in-transit', 
    eta: '2024-12-15T10:00:00Z', 
    carrier: 'MSC', 
    port: 'Port of Los Angeles', 
    vessel: 'MSC OSCAR',
    voyage: 'V1234',
    totalCharges: 12500,
    commodity: 'Class 8 Chemical Products',
    lastUpdatedBy: 'FreightBot Alpha',
    source: 'email',
    complianceStatus: 'flagged',
    complianceIssues: ['class 8 chemical'],
    emailMetadata: {
      subject: 'Arrival Notice - MSKU7891234',
      from: 'carrier@msc.com',
      receivedAt: new Date().toISOString(),
      attachmentName: 'arrival_notice.pdf',
      attachmentSize: 245000
    }
  },
  { 
    id: '7', 
    containerNo: 'MAEU4567890', 
    status: 'in-transit', 
    eta: '2024-12-18T14:30:00Z', 
    carrier: 'Maersk', 
    port: 'Port of Rotterdam', 
    vessel: 'MAERSK MADRID',
    voyage: 'V5678',
    totalCharges: 18900,
    commodity: 'Food Products',
    lastUpdatedBy: 'FreightBot Alpha',
    source: 'email',
    complianceStatus: 'flagged',
    complianceIssues: ['EU 2017/625 reconciliation'],
    emailMetadata: {
      subject: 'Arrival Notice - MAEU4567890',
      from: 'notifications@maersk.com',
      receivedAt: new Date().toISOString(),
      attachmentName: 'arrival_notice.pdf',
      attachmentSize: 312000
    }
  },
  { 
    id: '8', 
    containerNo: 'COSU9876543', 
    status: 'in-transit', 
    eta: '2024-12-20T09:15:00Z', 
    carrier: 'CMA CGM', 
    port: 'Port of Hamburg', 
    vessel: 'CMA CGM ANTOINE DE SAINT EXUPERY',
    voyage: 'V9012',
    totalCharges: 15200,
    invoiceAmount: 16800, // Mismatch with totalCharges
    commodity: 'Electronics',
    lastUpdatedBy: 'FreightBot Alpha',
    source: 'email',
    complianceStatus: 'flagged',
    complianceIssues: ['invoice-ratecard mismatch'],
    emailMetadata: {
      subject: 'Arrival Notice - COSU9876543',
      from: 'operations@cmacgm.com',
      receivedAt: new Date().toISOString(),
      attachmentName: 'arrival_notice.pdf',
      attachmentSize: 278000
    }
  }
].map(initializePhaseData)

// Global shipment ID counter - ensures unique IDs for all new shipments
let nextShipmentId = 9 // Start after our 3 flagged shipments (ids 6, 7, 8)

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
// Auto-pipeline progression flag (can be set via environment variable)
const AUTO_PIPELINE = process.env.AUTO_PIPELINE === 'true' || process.env.AUTO_PIPELINE === '1'

if (AUTO_PIPELINE) {
  console.log('🚀 [AUTO-PIPELINE] Auto pipeline enabled - shipments will automatically progress through phases')
} else {
  console.log('⏸️  [AUTO-PIPELINE] Auto pipeline disabled - set AUTO_PIPELINE=true to enable')
}

// Track shipments currently in auto-pipeline to prevent duplicate runs
const activeAutoPipelines = new Set()

// Helper function to log pipeline event from backend
function logPipelineEventBackend(eventData) {
  const phaseName = eventData.phase ? getPhaseDisplayName(eventData.phase) : ''
  const phasePrefix = phaseName ? `[${phaseName}] ` : ''
  
  const action = {
    id: String(actionCounter++),
    employeeId: eventData.agent && eventData.agent.includes('FreightBot') ? 'AI-EMP-001' : 'AI-EMP-002',
    createdAt: eventData.timestamp || new Date().toISOString(),
    message: `${phasePrefix}${eventData.agent || 'FreightBot Alpha'} ${eventData.step}${eventData.containerNo ? ` for ${eventData.containerNo}` : ''}`,
    phase: eventData.phase || 'intake',
    duration: eventData.duration || null,
    confidence: eventData.confidence || null,
    emailSource: true // Mark as from email processing
  }
  actions.unshift(action)
  
  // Keep only last 50 actions
  if (actions.length > 50) {
    actions = actions.slice(0, 50)
  }
  
  console.log('📊 Pipeline Event Logged:', eventData)
  return action
}

// Helper to get display name for phase
function getPhaseDisplayName(phase) {
  const phaseMap = {
    'intake': 'Intake',
    'compliance': 'Compliance',
    'monitoring': 'Monitoring',
    'arrival': 'Arrival & Delivery',
    'billing': 'Billing & Close-Out'
  }
  return phaseMap[phase] || phase
}

// Automatic phase progression workflow
async function autoProgressShipmentPhases(shipment) {
  if (!AUTO_PIPELINE) {
    console.log('⏸️  AUTO_PIPELINE disabled, skipping automatic progression')
    return
  }
  
  if (!shipment || !shipment.id) {
    console.error('❌ Invalid shipment for auto-progression')
    return
  }
  
  // Create unique key for this shipment
  const shipmentKey = shipment.id || shipment.containerNo
  
  // Guard: Check if this shipment is already in auto-pipeline
  if (activeAutoPipelines.has(shipmentKey)) {
    console.log(`⏭️  [AUTO-PIPELINE] Shipment ${shipment.containerNo || shipment.id} is already in auto-pipeline, skipping duplicate run`)
    return
  }
  
  // Mark as active
  activeAutoPipelines.add(shipmentKey)
  
  console.log(`🚀 [AUTO-PIPELINE] Starting automatic progression for shipment ${shipment.containerNo || shipment.id}`)
  
  // Since compliance is already run during intake, we start from monitoring
  // But we still log compliance completion if it passed
  const phases = [
    { id: 'compliance', name: 'Compliance', delay: 3000, skipIfDone: true },
    { id: 'monitoring', name: 'Monitoring', delay: 3000 },
    { id: 'arrival', name: 'Arrival & Delivery', delay: 3000 },
    { id: 'billing', name: 'Billing & Close-Out', delay: 3000 }
  ]
  
  let currentDelay = 0
  
  // Cleanup function to remove from active pipelines when done
  const cleanup = () => {
    activeAutoPipelines.delete(shipmentKey)
    console.log(`🧹 [AUTO-PIPELINE] Cleaned up tracking for shipment ${shipment.containerNo || shipment.id}`)
  }
  
  // Schedule cleanup after all phases complete (add extra buffer)
  const totalDuration = phases.reduce((sum, p) => sum + p.delay, 0) + 5000 // 5s buffer
  setTimeout(cleanup, totalDuration)
  
  phases.forEach((phase, phaseIndex) => {
    currentDelay += phase.delay
    
    setTimeout(async () => {
      // Find the shipment in the current shipments array (it might have been updated)
      const currentShipment = shipments.find(s => s.id === shipment.id || s.containerNo === shipment.containerNo)
      if (!currentShipment) {
        console.warn(`⚠️  Shipment ${shipment.id} not found, skipping phase ${phase.id}`)
        return
      }
      
      // Initialize phase data if needed
      initializePhaseData(currentShipment)
      
      // Skip if phase is already done and skipIfDone is true
      if (phase.skipIfDone && currentShipment.phaseProgress[phase.id] === 'done') {
        console.log(`⏭️  [AUTO-PIPELINE] Skipping ${phase.name} phase (already done) for shipment ${currentShipment.containerNo || currentShipment.id}`)
        return
      }
      
      // Mark previous phase as done
      if (phaseIndex > 0) {
        const previousPhase = phases[phaseIndex - 1]
        currentShipment.phaseProgress[previousPhase.id] = 'done'
      }
      
      // Update current phase
      currentShipment.currentPhase = phase.id
      currentShipment.phaseProgress[phase.id] = 'in_progress'
      
      // Run phase-specific logic
      if (phase.id === 'compliance') {
        // Compliance was already run, just mark as done if it passed
        if (currentShipment.complianceStatus === 'ok') {
          currentShipment.phaseProgress.compliance = 'done'
          // Move to monitoring
          currentShipment.currentPhase = 'monitoring'
          if (currentShipment.phaseProgress.monitoring === 'pending') {
            currentShipment.phaseProgress.monitoring = 'in_progress'
          }
        }
      } else if (phase.id === 'monitoring') {
        // Monitoring: Calculate ETA drift and update status
        if (!currentShipment.etaPlanned && currentShipment.eta) {
          currentShipment.etaPlanned = new Date(currentShipment.eta).getTime()
        }
        if (!currentShipment.etaCurrent) {
          const varianceHours = (Math.random() * 14) - 6 // -6 to +8 hours
          currentShipment.etaCurrent = currentShipment.etaPlanned + (varianceHours * 60 * 60 * 1000)
          currentShipment.etaVariance = varianceHours
          currentShipment.monitoringStatus = varianceHours > 4 ? 'at_risk' : varianceHours < -2 ? 'early' : 'on_track'
        }
        
        setTimeout(() => {
          const updatedShipment = shipments.find(s => s.id === currentShipment.id || s.containerNo === currentShipment.containerNo)
          if (updatedShipment) {
            updatedShipment.phaseProgress.monitoring = 'done'
            updatedShipment.currentPhase = 'arrival'
            if (updatedShipment.phaseProgress.arrival === 'pending') {
              updatedShipment.phaseProgress.arrival = 'in_progress'
            }
          }
        }, 1000)
      } else if (phase.id === 'arrival') {
        // Arrival: Add milestone tracking
        if (!currentShipment.arrivalMilestones) {
          currentShipment.arrivalMilestones = []
        }
        
        // Add sequential milestones
        setTimeout(() => {
          const updatedShipment = shipments.find(s => s.id === currentShipment.id || s.containerNo === currentShipment.containerNo)
          if (updatedShipment) {
            if (!updatedShipment.arrivalMilestones.includes('discharged')) {
              updatedShipment.arrivalMilestones.push('discharged')
              logPipelineEventBackend({
                agent: 'FreightBot Alpha',
                step: 'Discharged at terminal',
                containerNo: updatedShipment.containerNo || updatedShipment.id,
                timestamp: new Date().toISOString(),
                phase: 'arrival'
              })
            }
          }
        }, 500)
        
        setTimeout(() => {
          const updatedShipment = shipments.find(s => s.id === currentShipment.id || s.containerNo === currentShipment.containerNo)
          if (updatedShipment) {
            if (!updatedShipment.arrivalMilestones.includes('customs_released')) {
              updatedShipment.arrivalMilestones.push('customs_released')
              logPipelineEventBackend({
                agent: 'FreightBot Alpha',
                step: 'Customs released',
                containerNo: updatedShipment.containerNo || updatedShipment.id,
                timestamp: new Date().toISOString(),
                phase: 'arrival'
              })
            }
          }
        }, 1500)
        
        setTimeout(() => {
          const updatedShipment = shipments.find(s => s.id === currentShipment.id || s.containerNo === currentShipment.containerNo)
          if (updatedShipment) {
            updatedShipment.phaseProgress.arrival = 'done'
            updatedShipment.currentPhase = 'billing'
            if (updatedShipment.phaseProgress.billing === 'pending') {
              updatedShipment.phaseProgress.billing = 'in_progress'
            }
          }
        }, 2000)
      } else if (phase.id === 'billing') {
        // Billing: Add invoice and margin calculations
        if (!currentShipment.invoice) {
          // Generate dummy invoice data
          const buyRate = 950 + Math.random() * 100 // $950-$1050
          const sellRate = buyRate + 200 + Math.random() * 100 // $200-$300 margin
          currentShipment.invoice = {
            buyRate: Math.round(buyRate),
            sellRate: Math.round(sellRate),
            demurrage: Math.random() > 0.7 ? Math.round(Math.random() * 500) : 0
          }
          currentShipment.grossMargin = currentShipment.invoice.sellRate - currentShipment.invoice.buyRate
          currentShipment.costSaved = 35 // Demo constant
        }
        
        setTimeout(() => {
          const updatedShipment = shipments.find(s => s.id === currentShipment.id || s.containerNo === currentShipment.containerNo)
          if (updatedShipment) {
            updatedShipment.phaseProgress.billing = 'done'
            // Log final billing message with margin
            logPipelineEventBackend({
              agent: 'FreightBot Alpha',
              step: `Closed – margin $${updatedShipment.grossMargin || 0}, cost saved $${updatedShipment.costSaved || 0}`,
              containerNo: updatedShipment.containerNo || updatedShipment.id,
              timestamp: new Date().toISOString(),
              phase: 'billing'
            })
          }
        }, 1000)
      } else {
        // For other phases, mark as done after a short delay
        setTimeout(() => {
          const updatedShipment = shipments.find(s => s.id === currentShipment.id || s.containerNo === currentShipment.containerNo)
          if (updatedShipment) {
            updatedShipment.phaseProgress[phase.id] = 'done'
            // Move to next phase if not billing
            if (phase.id !== 'billing') {
              const nextPhaseIndex = phaseIndex + 1
              if (nextPhaseIndex < phases.length) {
                const nextPhase = phases[nextPhaseIndex]
                updatedShipment.currentPhase = nextPhase.id
                if (updatedShipment.phaseProgress[nextPhase.id] === 'pending') {
                  updatedShipment.phaseProgress[nextPhase.id] = 'in_progress'
                }
              }
            }
          }
        }, 1000)
      }
      
      // Log pipeline event with phase-specific messages (action-oriented with context)
      let stepMessage = ''
      
      if (phase.id === 'compliance') {
        if (currentShipment.complianceStatus === 'ok') {
          stepMessage = 'Cleared customs checks – no issues found'
        } else {
          const firstIssue = currentShipment.complianceIssues?.[0] || 'compliance review needed'
          stepMessage = `Flagged – ${firstIssue}`
        }
      } else if (phase.id === 'monitoring') {
        // Calculate ETA drift
        if (!currentShipment.etaPlanned && currentShipment.eta) {
          currentShipment.etaPlanned = new Date(currentShipment.eta).getTime()
        }
        if (!currentShipment.etaCurrent) {
          // Simulate ETA variance: -6 to +8 hours
          const varianceHours = (Math.random() * 14) - 6 // -6 to +8
          currentShipment.etaCurrent = currentShipment.etaPlanned + (varianceHours * 60 * 60 * 1000)
          currentShipment.etaVariance = varianceHours
          currentShipment.monitoringStatus = varianceHours > 4 ? 'at_risk' : varianceHours < -2 ? 'early' : 'on_track'
        }
        const variance = currentShipment.etaVariance || 0
        const status = currentShipment.monitoringStatus || 'on_track'
        stepMessage = `Started ETA tracking for ${currentShipment.port || 'Port'} – variance ${variance > 0 ? '+' : ''}${variance.toFixed(1)}h (${status})`
      } else if (phase.id === 'arrival') {
        stepMessage = `Marked container ${currentShipment.containerNo || currentShipment.id} as arrived`
      } else if (phase.id === 'billing') {
        stepMessage = 'Closed file and marked invoice ready'
      } else {
        stepMessage = `Completed ${phase.name} phase`
      }
      
      logPipelineEventBackend({
        agent: 'FreightBot Alpha',
        step: stepMessage,
        containerNo: currentShipment.containerNo || currentShipment.id,
        timestamp: new Date().toISOString(),
        confidence: 0.97,
        duration: 2.9,
        phase: phase.id
      })
      
      // Update employee metrics
      const employee = employees.find(e => e.id === 'AI-EMP-001')
      if (employee) {
        employee.tasksCompleted += 1
        employee.lastActivity = 'just now'
        setTimeout(() => {
          employee.lastActivity = '1 min ago'
        }, 60000)
      }
      
      console.log(`✅ [AUTO-PIPELINE] Completed ${phase.name} phase for shipment ${currentShipment.containerNo || currentShipment.id}`)
    }, currentDelay)
  })
  
  console.log(`⏱️  [AUTO-PIPELINE] Scheduled all phases for shipment ${shipment.containerNo || shipment.id} (total duration: ${currentDelay}ms)`)
}

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
      // Log to Mission Log before throwing
      const errorAction = {
        id: String(actionCounter++),
        employeeId: 'AI-EMP-001',
        createdAt: new Date().toISOString(),
        message: 'Failed to parse arrival notice – could not extract text from document',
        phase: 'intake',
        error: true
      }
      actions.unshift(errorAction)
      if (actions.length > 50) {
        actions = actions.slice(0, 50)
      }
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
      // Log to Mission Log before throwing
      const errorAction = {
        id: String(actionCounter++),
        employeeId: 'AI-EMP-001',
        createdAt: new Date().toISOString(),
        message: 'Failed to parse arrival notice – invalid data format from AI parser',
        phase: 'intake',
        error: true
      }
      actions.unshift(errorAction)
      if (actions.length > 50) {
        actions = actions.slice(0, 50)
      }
      throw new Error('Failed to parse extracted data')
    }

    // Log parsed data - try multiple field names for container number
    // For simulated shipments, use the unique container number from metadata
    const containerNo = emailMetadata?.simulatedContainerNo ||
                        extractedData?.containerNo || 
                        extractedData?.containerNumber || 
                        extractedData?.container || 
                        generateContainerNo()
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
    // For simulate endpoint, always create new shipment (don't update existing)
    const isSimulate = source === 'email' && emailMetadata?.subject?.includes('[SIMULATED]')
    const existingShipmentIndex = isSimulate ? -1 : shipments.findIndex(s => s.containerNo === containerNo)
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
        id: String(nextShipmentId++),
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
    
    // If this is a new shipment from email and AUTO_PIPELINE is enabled, start automatic progression
    if (isNew && source === 'email' && AUTO_PIPELINE) {
      console.log(`🚀 [AUTO-PIPELINE] Triggering automatic phase progression for new email shipment ${shipment.containerNo}`)
      // Start auto-progression workflow (non-blocking)
      autoProgressShipmentPhases(shipment).catch(err => {
        console.error('❌ [AUTO-PIPELINE] Error in auto-progression:', err)
      })
    }

    // Create action message based on source (action-oriented with context)
    const shipmentId = `SHP-${shipment.id}`
    const actionMessage = source === 'email'
      ? `Parsed arrival notice and created shipment ${shipmentId} (${containerNo})`
      : `FreightBot Alpha parsed arrival notice for ${containerNo} (ETA ${new Date(eta).toLocaleDateString()}, Port: ${port}, Charges: $${totalCharges.toLocaleString()} USD).`
    const actionPhase = 'intake'
    
    // Add compliance action if compliance check was run (action-oriented)
    if (shipment.complianceStatus === 'ok') {
      const complianceAction = {
        id: String(actionCounter++),
        employeeId: 'AI-EMP-001',
        createdAt: new Date().toISOString(),
        message: `Cleared customs checks – no issues found`,
        phase: 'compliance'
      }
      actions.unshift(complianceAction)
    } else if (shipment.complianceStatus === 'issues' && shipment.complianceIssues.length > 0) {
      const complianceAction = {
        id: String(actionCounter++),
        employeeId: 'AI-EMP-001',
        createdAt: new Date().toISOString(),
        message: `Found compliance issues: ${shipment.complianceIssues[0]}`,
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
export { processArrivalNoticeBuffer, shipments, actions, actionCounter, employees, formatTime, autoProgressShipmentPhases, AUTO_PIPELINE }

// ============================================================================
// Compliance Check Function
// ============================================================================

function runComplianceCheck(shipment) {
  // Ensure phase data
  initializePhaseData(shipment)

  // If shipment is already flagged with manually set issues, preserve them
  if (shipment.complianceStatus === 'flagged' && 
      shipment.complianceIssues && 
      shipment.complianceIssues.length > 0 &&
      // Check if issues look manually set (not from auto-compliance check)
      (shipment.complianceIssues.includes('class 8 chemical') ||
       shipment.complianceIssues.includes('EU 2017/625 reconciliation') ||
       shipment.complianceIssues.includes('invoice-ratecard mismatch'))) {
    // Preserve existing manually set compliance issues
    console.log(`[COMPLIANCE] Preserving manually set compliance issues for ${shipment.containerNo}:`, shipment.complianceIssues)
    return
  }

  // Use the new compliance rules engine
  const complianceResult = runComplianceChecks(shipment)
  
  shipment.complianceIssues = complianceResult.findings
  shipment.complianceStatus = complianceResult.status === 'cleared' ? 'ok' : (complianceResult.status === 'flagged' ? 'flagged' : 'issues')
  shipment.complianceCheckedAt = complianceResult.checkedAt

  if (complianceResult.status === 'cleared') {
    shipment.phaseProgress.compliance = 'done'
    // Only advance to monitoring if we are currently in compliance or intake
    if (shipment.currentPhase === 'intake' || shipment.currentPhase === 'compliance') {
      shipment.currentPhase = 'monitoring'
      if (shipment.phaseProgress.monitoring === 'pending') {
        shipment.phaseProgress.monitoring = 'in_progress'
      }
    }
  } else {
    if (shipment.phaseProgress.compliance === 'pending') {
      shipment.phaseProgress.compliance = 'in_progress'
    }
    shipment.currentPhase = 'compliance'
  }

  // Log compliance check completion
  console.log('🛃 [COMPLIANCE] Completed:', {
    id: shipment.id,
    container: shipment.containerNo,
    issues: complianceResult.findings.length,
    status: shipment.complianceStatus,
    phase: shipment.currentPhase,
    findings: complianceResult.findings
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
            message: `Cleared customs checks – no issues found`,
            phase: 'compliance'
          }
          actions.unshift(action)
        } else if (shipment.complianceStatus === 'issues' && shipment.complianceIssues.length > 0) {
          const action = {
            id: String(actionCounter++),
            employeeId: 'AI-EMP-001',
            createdAt: new Date().toISOString(),
            message: `Found compliance issues: ${shipment.complianceIssues[0]}`,
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

// POST /api/ai-events/log - Log pipeline event for tracking
app.post('/api/ai-events/log', (req, res) => {
  const eventData = {
    timestamp: req.body.timestamp || new Date().toISOString(),
    agent: req.body.agent || 'FreightBot Alpha',
    step: req.body.step,
    confidence: req.body.confidence || 0.96,
    duration: req.body.duration || 0,
    ...req.body
  }
  
  // Store in actions array for Mission Log
  const action = {
    id: String(actionCounter++),
    employeeId: eventData.agent.includes('FreightBot') ? 'AI-EMP-001' : 'AI-EMP-002',
    createdAt: eventData.timestamp,
    message: `${eventData.agent} ${eventData.step}${eventData.containerNo ? ` for ${eventData.containerNo}` : ''}`,
    phase: req.body.phase || 'intake',
    duration: eventData.duration,
    confidence: eventData.confidence
  }
  actions.unshift(action)
  
  // Keep only last 50 actions
  if (actions.length > 50) {
    actions = actions.slice(0, 50)
  }
  
  console.log('📊 Pipeline Event Logged:', eventData)
  
  res.json({ ok: true, event: eventData, action })
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
  // Ensure our 3 specific flagged shipments always exist
  const REQUIRED_CONTAINERS = ['MSKU7891234', 'MAEU4567890', 'COSU9876543']
  
  REQUIRED_CONTAINERS.forEach((containerNo, index) => {
    const existingIndex = shipments.findIndex(s => (s.containerNo || s.id) === containerNo)
    if (existingIndex === -1) {
      // Create the shipment if it doesn't exist
      const shipmentData = [
        {
          id: '6',
          containerNo: 'MSKU7891234',
          status: 'in-transit',
          eta: '2024-12-15T10:00:00Z',
          carrier: 'MSC',
          port: 'Port of Los Angeles',
          vessel: 'MSC OSCAR',
          voyage: 'V1234',
          totalCharges: 12500,
          commodity: 'Class 8 Chemical Products',
          lastUpdatedBy: 'FreightBot Alpha',
          source: 'email',
          complianceStatus: 'flagged',
          complianceIssues: ['class 8 chemical'],
          emailMetadata: {
            subject: 'Arrival Notice - MSKU7891234',
            from: 'carrier@msc.com',
            receivedAt: new Date().toISOString(),
            attachmentName: 'arrival_notice.pdf',
            attachmentSize: 245000
          }
        },
        {
          id: '7',
          containerNo: 'MAEU4567890',
          status: 'in-transit',
          eta: '2024-12-18T14:30:00Z',
          carrier: 'Maersk',
          port: 'Port of Rotterdam',
          vessel: 'MAERSK MADRID',
          voyage: 'V5678',
          totalCharges: 18900,
          commodity: 'Food Products',
          lastUpdatedBy: 'FreightBot Alpha',
          source: 'email',
          complianceStatus: 'flagged',
          complianceIssues: ['EU 2017/625 reconciliation'],
          emailMetadata: {
            subject: 'Arrival Notice - MAEU4567890',
            from: 'notifications@maersk.com',
            receivedAt: new Date().toISOString(),
            attachmentName: 'arrival_notice.pdf',
            attachmentSize: 312000
          }
        },
        {
          id: '8',
          containerNo: 'COSU9876543',
          status: 'in-transit',
          eta: '2024-12-20T09:15:00Z',
          carrier: 'CMA CGM',
          port: 'Port of Hamburg',
          vessel: 'CMA CGM ANTOINE DE SAINT EXUPERY',
          voyage: 'V9012',
          totalCharges: 15200,
          invoiceAmount: 16800,
          commodity: 'Electronics',
          lastUpdatedBy: 'FreightBot Alpha',
          source: 'email',
          complianceStatus: 'flagged',
          complianceIssues: ['invoice-ratecard mismatch'],
          emailMetadata: {
            subject: 'Arrival Notice - COSU9876543',
            from: 'operations@cmacgm.com',
            receivedAt: new Date().toISOString(),
            attachmentName: 'arrival_notice.pdf',
            attachmentSize: 278000
          }
        }
      ]
      
      const newShipment = shipmentData[index]
      initializePhaseData(newShipment)
      shipments.push(newShipment)
      console.log(`[API] Created missing flagged shipment: ${containerNo}`)
    }
  })
  
  res.json(shipments)
})

// ============================================================================
// Metrics Endpoint
// ============================================================================

app.get('/api/metrics', (req, res) => {
  const metrics = computeMetrics(shipments)
  res.json(metrics)
})

// ============================================================================
// Auto-Pipeline Status Endpoint
// ============================================================================

app.get('/api/auto-pipeline/status', (req, res) => {
  // Get active pipeline shipments
  const activeShipments = Array.from(activeAutoPipelines).map(key => {
    const shipment = shipments.find(s => s.id === key || s.containerNo === key)
    return shipment ? {
      id: shipment.id || key,
      containerNo: shipment.containerNo || shipment.id || key,
      currentPhase: shipment.currentPhase || 'intake'
    } : { id: key, containerNo: key, currentPhase: 'intake' }
  })
  
  res.json({
    active: activeAutoPipelines.size > 0,
    count: activeAutoPipelines.size,
    shipments: activeShipments
  })
})

// ============================================================================
// Debug: Simulate Email Endpoint
// ============================================================================

app.post('/api/debug/simulate-email', upload.single('file'), async (req, res) => {
  console.log('[/api/debug/simulate-email] Simulating test arrival notice...')
  
  try {
    // Parse body if it exists (multer might not parse JSON body)
    let bodyData = {}
    if (req.body && typeof req.body === 'object') {
      // If body is already parsed (from express.json middleware)
      bodyData = req.body
    } else if (req.body && typeof req.body === 'string') {
      try {
        bodyData = JSON.parse(req.body)
      } catch (e) {
        // Not JSON, ignore
      }
    }
    
    // Use provided file or default test PDF
    let fileBuffer = null
    let mimetype = 'application/pdf'
    
    if (req.file) {
      fileBuffer = req.file.buffer
      mimetype = req.file.mimetype
      console.log('[/api/debug/simulate-email] Using uploaded file:', req.file.originalname, req.file.size, 'bytes')
    } else {
      // Try to read test PDF if available
      const fs = await import('fs/promises')
      const path = await import('path')
      const testPdfPath = path.join(process.cwd(), 'test_arrival_notice.pdf')
      
      try {
        fileBuffer = await fs.readFile(testPdfPath)
        console.log('[/api/debug/simulate-email] Using test_arrival_notice.pdf for simulation')
      } catch (readError) {
        console.warn('[/api/debug/simulate-email] test_arrival_notice.pdf not found:', readError.message)
        // Continue to fallback - don't return error yet
      }
    }
    
    let result = null
    let shipment = null
    
    // 1) Try the real simulation first (if we have a file)
    if (fileBuffer) {
      try {
        // Generate unique container number for simulated shipments to avoid overwriting existing ones
        const uniqueContainerNo = generateContainerNo()
        console.log('[/api/debug/simulate-email] Generated unique container number for simulation:', uniqueContainerNo)
        
        // Create email metadata with unique container reference
    const emailMetadata = {
          subject: `[SIMULATED] Arrival Notice for ${uniqueContainerNo}`,
      from: 'demo@freightbot.ai',
      receivedAt: new Date().toISOString(),
      attachmentName: req.file?.originalname || 'test_arrival_notice.pdf',
          attachmentSize: fileBuffer.length,
          simulatedContainerNo: uniqueContainerNo // Pass this so we can override parsed container
    }
    
        console.log('[/api/debug/simulate-email] Processing arrival notice buffer...')
        result = await processArrivalNoticeBuffer(
      fileBuffer,
      'email',
      mimetype,
      emailMetadata
    )
    
        // Override container number with our unique one to ensure it's always new
        if (result && result.shipment) {
          result.shipment.containerNo = uniqueContainerNo
          console.log('[/api/debug/simulate-email] Overrode container number to:', uniqueContainerNo)
        }
        
        if (result && result.shipment) {
          shipment = result.shipment
          
          // Find the shipment in the array and reset it to Intake phase
          const arrayIndex = shipments.findIndex(s => s.id === shipment.id)
          if (arrayIndex >= 0) {
            // Reset to Intake phase for simulated shipments so auto-pipeline can run
            initializePhaseData(shipments[arrayIndex])
            shipments[arrayIndex].currentPhase = 'intake'
            shipments[arrayIndex].phaseProgress.intake = 'in_progress'
            shipments[arrayIndex].phaseProgress.compliance = 'pending'
            shipments[arrayIndex].phaseProgress.monitoring = 'pending'
            shipments[arrayIndex].phaseProgress.arrival = 'pending'
            shipments[arrayIndex].phaseProgress.billing = 'pending'
            
            // Update our local reference
            shipment = shipments[arrayIndex]
            console.log('[/api/debug/simulate-email] Reset shipment in array to Intake phase for auto-pipeline')
          }
          
          console.log('[/api/debug/simulate-email] Real parser created shipment:', {
            id: shipment.id,
            containerNo: shipment.containerNo,
            currentPhase: shipment.currentPhase
          })
        } else {
          console.warn('[/api/debug/simulate-email] processArrivalNoticeBuffer returned no shipment')
        }
      } catch (parseError) {
        console.error('[/api/debug/simulate-email] Error in processArrivalNoticeBuffer:', parseError)
        // Continue to fallback
      }
    }
    
    // 2) If that failed to create a shipment, fall back to a dummy one
    if (!shipment) {
      console.warn('[/api/debug/simulate-email] No shipment created by parser, using fallback dummy shipment')
      const id = String(nextShipmentId++)
      const containerNo = 'TEST' + String(Date.now()).slice(-6)
      
      shipment = {
        id,
        containerNo: containerNo,
        status: 'in-transit',
        eta: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        port: 'Port of Los Angeles',
        carrier: 'Test Carrier',
        vessel: 'Test Vessel',
        voyage: 'TEST001',
        totalCharges: 0,
        lastUpdatedBy: 'FreightBot Alpha',
        source: 'email',
        emailMetadata: {
          subject: `[SIMULATED] Arrival Notice for ${containerNo}`,
          from: 'demo@freightbot.ai',
          receivedAt: new Date().toISOString(),
          attachmentName: 'test_arrival_notice.pdf',
          attachmentSize: 0
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      // Initialize phase data - START AT INTAKE
      initializePhaseData(shipment)
      shipment.currentPhase = 'intake'
      shipment.phaseProgress.intake = 'in_progress'
      shipment.phaseProgress.compliance = 'pending'
      shipment.phaseProgress.monitoring = 'pending'
      shipment.phaseProgress.arrival = 'pending'
      shipment.phaseProgress.billing = 'pending'
      
      // Store this in the same shipments array used by /api/shipments
      shipments.push(shipment)
      console.log('[/api/debug/simulate-email] Fallback shipment added to shipments array. Total shipments:', shipments.length)
      
      // Trigger auto-pipeline if enabled
      if (AUTO_PIPELINE) {
        console.log('[/api/debug/simulate-email] Completing Intake → Compliance transition for fallback shipment')
        // First, complete Intake and run compliance check
        shipment.phaseProgress.intake = 'done'
        shipment.currentPhase = 'compliance'
        shipment.phaseProgress.compliance = 'in_progress'
        
        // Run compliance check
        runComplianceCheck(shipment)
        
        // Then trigger auto-pipeline (which will continue from Compliance)
        console.log('[/api/debug/simulate-email] Triggering auto-pipeline for fallback shipment')
        autoProgressShipmentPhases(shipment).catch(err => {
          console.error('❌ [AUTO-PIPELINE] Error in auto-progression for fallback shipment:', err)
        })
      }
      
      // Create an action for this
      const action = {
        id: String(actionCounter++),
        employeeId: 'AI-EMP-001',
        createdAt: new Date().toISOString(),
        message: `FreightBot Alpha parsed arrival notice for ${containerNo} (fallback simulation)`,
        phase: 'intake'
      }
      actions.unshift(action)
      if (actions.length > 50) {
        actions = actions.slice(0, 50)
      }
    } else {
      // Verify shipment is in the shipments array
      const foundInArray = shipments.find(s => s.id === shipment.id || s.containerNo === shipment.containerNo)
      const isNewShipment = !foundInArray
      
      if (isNewShipment) {
        console.log('[/api/debug/simulate-email] New shipment created, resetting to Intake phase for auto-pipeline')
        // Reset to Intake phase for new shipments so auto-pipeline can run
        initializePhaseData(shipment)
        shipment.currentPhase = 'intake'
        shipment.phaseProgress.intake = 'in_progress'
        shipment.phaseProgress.compliance = 'pending'
        shipment.phaseProgress.monitoring = 'pending'
        shipment.phaseProgress.arrival = 'pending'
        shipment.phaseProgress.billing = 'pending'
        
        // Add to shipments array (if not already added by processArrivalNoticeBuffer)
        if (!shipments.find(s => s.id === shipment.id)) {
          shipments.push(shipment)
        } else {
          // Update the existing shipment in array to match our reset phase
          const arrayIndex = shipments.findIndex(s => s.id === shipment.id)
          if (arrayIndex >= 0) {
            shipments[arrayIndex] = shipment
            shipment = shipments[arrayIndex] // Update reference
          }
        }
        console.log('[/api/debug/simulate-email] New shipment added/updated in shipments array. Total shipments:', shipments.length)
        
        // Trigger auto-pipeline if enabled (for simulated shipments that start at Intake)
        if (AUTO_PIPELINE && shipment.currentPhase === 'intake') {
          console.log('[/api/debug/simulate-email] Completing Intake → Compliance transition for simulated shipment')
          // First, complete Intake and run compliance check
          shipment.phaseProgress.intake = 'done'
          shipment.currentPhase = 'compliance'
          shipment.phaseProgress.compliance = 'in_progress'
          
          // Run compliance check
          runComplianceCheck(shipment)
          
          // Then trigger auto-pipeline (which will continue from Compliance)
          console.log('[/api/debug/simulate-email] Triggering auto-pipeline for new simulated shipment')
          autoProgressShipmentPhases(shipment).catch(err => {
            console.error('❌ [AUTO-PIPELINE] Error in auto-progression for simulated shipment:', err)
          })
        }
      } else {
        console.log('[/api/debug/simulate-email] Shipment already exists in array (update, not new). Total shipments:', shipments.length)
      }
    }
    
    // Ensure we're returning the shipment from the array (which has the correct phase after auto-pipeline setup)
    // Get the latest state from the array
    const finalShipment = shipments.find(s => s.id === shipment.id) || shipment
    // Update shipment reference to match array
    shipment = finalShipment
    
    console.log('[/api/debug/simulate-email] Final shipment state:', {
      id: finalShipment.id,
      containerNo: finalShipment.containerNo,
      currentPhase: finalShipment.currentPhase,
      phaseProgress: finalShipment.phaseProgress,
      inArray: shipments.findIndex(s => s.id === finalShipment.id) >= 0
    })
    
    // Return shipment to the frontend
    res.json({
      ok: true,
      shipment: {
        id: finalShipment.id,
        containerNo: finalShipment.containerNo || finalShipment.id,
        currentPhase: finalShipment.currentPhase || 'intake',
        phaseName: finalShipment.currentPhase || 'Intake'
      },
      action: result?.action || null
    })
    
  } catch (error) {
    console.error('[/api/debug/simulate-email] Error simulating email', error)
    console.error('[/api/debug/simulate-email] Error stack:', error.stack)
    
    // Log error to Mission Log
    const errorAction = {
      id: String(actionCounter++),
      employeeId: 'AI-EMP-001',
      createdAt: new Date().toISOString(),
      message: `Failed to parse arrival notice – needs review: ${error.message}`,
      phase: 'intake',
      error: true
    }
    actions.unshift(errorAction)
    
    // Keep only last 50 actions
    if (actions.length > 50) {
      actions = actions.slice(0, 50)
    }
    
    res.status(500).json({
      ok: false,
      error: error.message || String(error),
      action: errorAction
    })
  }
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

