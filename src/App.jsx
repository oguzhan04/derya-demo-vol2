import { useState } from 'react'
import { Upload, BarChart, Network } from 'lucide-react'
import DataSources from './features/documents/DataSources'
import DocumentUpload from './features/documents/DocumentUpload'
import AnalyticsTab from './features/analytics/AnalyticsTab'
import { mockShipments } from './data/mockShipments'

export default function App() {
  const [active, setActive] = useState('analytics')
  const [shipmentData, setShipmentData] = useState(mockShipments)
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div className="flex">
      {/* Sidebar */}
      <div 
        className={`${isHovered ? 'w-64' : 'w-[72px]'} bg-blue-900 transition-all duration-300 h-screen fixed left-0 top-0 z-50`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="p-4">
          {/* Logo */}
          <div className="text-white text-sm font-bold mb-8 flex items-center gap-3">
            <div className="text-lg">FF</div>
            <span className={`overflow-hidden transition-all duration-300 whitespace-nowrap text-xs text-gray-300 ${isHovered ? 'opacity-100' : 'opacity-0 w-0'}`}>
              Derya Maritime
            </span>
          </div>

          {/* Navigation */}
          <div className="space-y-4">
            <button 
              onClick={() => setActive('analytics')}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                active === 'analytics' ? 'bg-white/20 text-white' : 'text-gray-300 hover:bg-white/10'
              }`}
            >
              <BarChart size={20} className="flex-shrink-0" />
              <span className={`overflow-hidden transition-all duration-300 whitespace-nowrap ${isHovered ? 'opacity-100' : 'opacity-0 w-0'}`}>
                Analytics
              </span>
            </button>

            <button 
              onClick={() => setActive('data-integration')}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                active === 'data-integration' ? 'bg-white/20 text-white' : 'text-gray-300 hover:bg-white/10'
              }`}
            >
              <Network size={20} className="flex-shrink-0" />
              <span className={`overflow-hidden transition-all duration-300 whitespace-nowrap ${isHovered ? 'opacity-100' : 'opacity-0 w-0'}`}>
                Data Integration
              </span>
            </button>

            <button 
              onClick={() => setActive('documents')}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                active === 'documents' ? 'bg-white/20 text-white' : 'text-gray-300 hover:bg-white/10'
              }`}
            >
              <Upload size={20} className="flex-shrink-0" />
              <span className={`overflow-hidden transition-all duration-300 whitespace-nowrap ${isHovered ? 'opacity-100' : 'opacity-0 w-0'}`}>
                Document Upload
              </span>
            </button>
          </div>

          {/* Footer */}
          <div className="absolute bottom-4 text-xs text-gray-500">
            v0.1
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 ml-[72px] bg-gray-50 min-h-screen">
        <div className="p-8 max-w-6xl mx-auto">
          {active === 'analytics' ? (
            <AnalyticsTab rows={shipmentData} loading={false} />
          ) : active === 'data-integration' ? (
            <DataSources />
          ) : active === 'documents' ? (
            <DocumentUpload />
          ) : null}
        </div>
      </div>
    </div>
  )
}