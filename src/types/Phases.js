// Shipment phase types and constants

export const SHIPMENT_PHASES = {
  INTAKE: 'intake',
  COMPLIANCE: 'compliance',
  MONITORING: 'monitoring',
  ARRIVAL: 'arrival',
  BILLING: 'billing',
}

export const PHASE_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  DONE: 'done',
}

// Phase configuration for UI
export const PHASES_CONFIG = [
  {
    id: SHIPMENT_PHASES.INTAKE,
    label: 'Intake',
    color: 'blue',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    textColor: 'text-blue-700 dark:text-blue-300',
  },
  {
    id: SHIPMENT_PHASES.COMPLIANCE,
    label: 'Compliance',
    color: 'purple',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    borderColor: 'border-purple-200 dark:border-purple-800',
    textColor: 'text-purple-700 dark:text-purple-300',
  },
  {
    id: SHIPMENT_PHASES.MONITORING,
    label: 'Monitoring',
    color: 'yellow',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    textColor: 'text-yellow-700 dark:text-yellow-300',
  },
  {
    id: SHIPMENT_PHASES.ARRIVAL,
    label: 'Arrival & Delivery',
    color: 'green',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-200 dark:border-green-800',
    textColor: 'text-green-700 dark:text-green-300',
  },
  {
    id: SHIPMENT_PHASES.BILLING,
    label: 'Billing & Close-out',
    color: 'indigo',
    bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
    borderColor: 'border-indigo-200 dark:border-indigo-800',
    textColor: 'text-indigo-700 dark:text-indigo-300',
  },
]

// Helper functions
export const getPhaseLabel = (phase) => {
  const config = PHASES_CONFIG.find(p => p.id === phase)
  return config ? config.label : phase
}

export const getPhaseConfig = (phase) => {
  return PHASES_CONFIG.find(p => p.id === phase) || PHASES_CONFIG[0]
}

export const getStatusLabel = (status) => {
  const labels = {
    [PHASE_STATUS.PENDING]: 'Pending',
    [PHASE_STATUS.IN_PROGRESS]: 'In progress',
    [PHASE_STATUS.DONE]: 'Done',
  }
  return labels[status] || status
}

export const getStatusColor = (status) => {
  const colors = {
    [PHASE_STATUS.PENDING]: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    [PHASE_STATUS.IN_PROGRESS]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    [PHASE_STATUS.DONE]: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  }
  return colors[status] || colors[PHASE_STATUS.PENDING]
}

