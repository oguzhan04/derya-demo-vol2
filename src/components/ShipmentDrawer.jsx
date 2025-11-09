import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { getPhaseLabel } from '../types/Phases.js'

export default function ShipmentDrawer({ shipment, logs, onClose }) {
  // Safety checks
  if (!shipment) return null
  if (!Array.isArray(logs)) return null

  // Filter logs related to this shipment
  const relatedLogs = logs.filter(
    (l) =>
      l.shipmentId === shipment.id ||
      (l.message && shipment.containerNo && l.message.includes(shipment.containerNo)) ||
      (l.message && l.message.includes(shipment.id))
  )

  // Format timestamp helper
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A'
    try {
      const date = new Date(timestamp)
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    } catch {
      return 'N/A'
    }
  }

  // Format date helper - handles both ISO strings and timestamps (numbers)
  const formatDate = (dateStr) => {
    if (dateStr == null) return 'N/A'
    try {
      const date = typeof dateStr === 'number' ? new Date(dateStr) : new Date(dateStr)
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return 'N/A'
    }
  }

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40"
      />
      {/* Drawer */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed top-0 right-0 h-full w-[28rem] bg-white dark:bg-gray-900 shadow-2xl z-50 overflow-y-auto"
      >
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200 dark:border-gray-800">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {shipment.containerNo || shipment.id}
                  </h2>
                  {shipment.currentPhase && (
                    <span className="inline-flex items-center px-2 py-1 mt-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      {getPhaseLabel(shipment.currentPhase)}
                    </span>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Pills */}
              <div className="flex gap-2 mb-6">
                {shipment.complianceStatus && (
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      shipment.complianceStatus === 'flagged'
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        : shipment.complianceStatus === 'cleared' || shipment.complianceStatus === 'ok'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : shipment.complianceStatus === 'issues'
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                    }`}
                  >
                    Compliance: {shipment.complianceStatus}
                  </span>
                )}
                {shipment.monitoringStatus && (
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      shipment.monitoringStatus === 'at_risk'
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        : shipment.monitoringStatus === 'early'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        : shipment.monitoringStatus === 'on_track'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                    }`}
                  >
                    Monitoring: {shipment.monitoringStatus}
                  </span>
                )}
              </div>

              {/* Summary Section */}
              <div className="space-y-3 mb-6 text-sm">
                {shipment.port && (
                  <div className="flex justify-between">
                    <strong className="text-gray-700 dark:text-gray-300">Port:</strong>
                    <span className="text-gray-900 dark:text-white">{shipment.port}</span>
                  </div>
                )}
                {shipment.etaPlanned && (
                  <div className="flex justify-between">
                    <strong className="text-gray-700 dark:text-gray-300">ETA Planned:</strong>
                    <span className="text-gray-900 dark:text-white">{formatDate(shipment.etaPlanned)}</span>
                  </div>
                )}
                {shipment.etaCurrent && (
                  <div className="flex justify-between">
                    <strong className="text-gray-700 dark:text-gray-300">ETA Current:</strong>
                    <span className="text-gray-900 dark:text-white">{formatDate(shipment.etaCurrent)}</span>
                  </div>
                )}
                {shipment.etaVariance != null && (
                  <div className="flex justify-between">
                    <strong className="text-gray-700 dark:text-gray-300">Variance:</strong>
                    <span className="text-gray-900 dark:text-white">{shipment.etaVariance.toFixed(1)} h</span>
                  </div>
                )}
                {shipment.grossMargin != null && (
                  <div className="flex justify-between">
                    <strong className="text-gray-700 dark:text-gray-300">Margin:</strong>
                    <span className="text-gray-900 dark:text-white">${shipment.grossMargin.toLocaleString()}</span>
                  </div>
                )}
                {shipment.costSaved != null && (
                  <div className="flex justify-between">
                    <strong className="text-gray-700 dark:text-gray-300">Cost Saved:</strong>
                    <span className="text-gray-900 dark:text-white">${shipment.costSaved.toLocaleString()}</span>
                  </div>
                )}
                {shipment.createdAt && (
                  <div className="flex justify-between">
                    <strong className="text-gray-700 dark:text-gray-300">Created:</strong>
                    <span className="text-gray-900 dark:text-white">{formatDate(shipment.createdAt)}</span>
                  </div>
                )}
                {shipment.closedAt && (
                  <div className="flex justify-between">
                    <strong className="text-gray-700 dark:text-gray-300">Closed:</strong>
                    <span className="text-gray-900 dark:text-white">{formatDate(shipment.closedAt)}</span>
                  </div>
                )}
              </div>

              {/* Timeline Section */}
              <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
                <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Timeline</h3>
                {relatedLogs.length === 0 ? (
                  <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                    No timeline entries found
                  </div>
                ) : (
                  <ul className="space-y-2 text-sm">
                    {relatedLogs.map((log, i) => (
                      <li
                        key={i}
                        className="border-l-2 border-gray-200 dark:border-gray-700 pl-3 py-1"
                      >
                        <span className="text-gray-400 dark:text-gray-500 text-xs">
                          {formatTimestamp(log.timestamp || log.createdAt)}
                        </span>{' '}
                        <span className="text-gray-700 dark:text-gray-300">{log.message || 'N/A'}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </motion.div>
    </>
  )
}

