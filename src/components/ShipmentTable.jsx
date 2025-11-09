import { getPhaseLabel } from '../types/Phases.js'

export default function ShipmentTable({ shipments, onSelect }) {
  // Safety check
  if (!Array.isArray(shipments)) {
    return null
  }

  return (
    <div className="mt-6 border rounded-2xl overflow-hidden shadow-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
          <tr>
            <th className="p-2 text-left font-medium">Container</th>
            <th className="p-2 text-left font-medium">Phase</th>
            <th className="p-2 text-left font-medium">Compliance</th>
            <th className="p-2 text-left font-medium">Monitoring</th>
            <th className="p-2 text-left font-medium">Margin</th>
            <th className="p-2 text-left font-medium">Updated</th>
          </tr>
        </thead>
        <tbody>
          {shipments.length === 0 ? (
            <tr>
              <td colSpan={6} className="p-4 text-center text-gray-500 dark:text-gray-400">
                No shipments available
              </td>
            </tr>
          ) : (
            shipments.map((s) => (
              <tr
                key={s.id}
                onClick={() => onSelect(s)}
                className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition"
              >
                <td className="p-2 font-medium text-gray-900 dark:text-white">
                  {s.containerNo || s.id}
                </td>
                <td className="p-2 text-gray-700 dark:text-gray-300">
                  {s.currentPhase ? getPhaseLabel(s.currentPhase) : '—'}
                </td>
                <td className="p-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      s.complianceStatus === 'flagged'
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        : s.complianceStatus === 'cleared' || s.complianceStatus === 'ok'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : s.complianceStatus === 'issues'
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                    }`}
                  >
                    {s.complianceStatus || '—'}
                  </span>
                </td>
                <td className="p-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      s.monitoringStatus === 'at_risk'
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        : s.monitoringStatus === 'early'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        : s.monitoringStatus === 'on_track'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                    }`}
                  >
                    {s.monitoringStatus || '—'}
                  </span>
                </td>
                <td className="p-2 text-gray-700 dark:text-gray-300">
                  {s.grossMargin != null ? `$${s.grossMargin.toLocaleString()}` : '—'}
                </td>
                <td className="p-2 text-gray-500 dark:text-gray-400 text-xs">
                  {s.closedAt
                    ? `${Math.round((Date.now() - new Date(s.closedAt).getTime()) / 1000)}s ago`
                    : s.updatedAt
                    ? `${Math.round((Date.now() - new Date(s.updatedAt).getTime()) / 1000)}s ago`
                    : 'in progress'}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

