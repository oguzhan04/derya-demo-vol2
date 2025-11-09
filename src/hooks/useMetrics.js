import { useEffect, useState } from 'react'

const API_BASE = '/api'

export function useMetrics() {
  const [metrics, setMetrics] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  async function fetchMetrics() {
    try {
      const res = await fetch(`${API_BASE}/metrics`)
      if (res.ok) {
        const data = await res.json()
        console.log('[METRICS] update', {
          totalShipments: data.totalShipments,
          completedShipments: data.completedShipments,
          successRate: data.successRate,
          avgProcessingMinutes: data.avgProcessingMinutes,
          totalCostSaved: data.totalCostSaved,
          avgMargin: data.avgMargin,
          shipmentsAtRisk: data.shipmentsAtRisk,
          flaggedShipments: data.flaggedShipments,
        })
        setMetrics(data)
      }
    } catch (err) {
      console.error('Error fetching metrics', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMetrics()
    const id = setInterval(fetchMetrics, 5000) // Poll every 5 seconds
    return () => clearInterval(id)
  }, [])

  return { metrics, isLoading, refetch: fetchMetrics }
}

