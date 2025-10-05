import { useState } from 'react'
import { Upload, BarChart, Network, Users, TrendingUp, Database } from 'lucide-react'
import DataSources from './features/documents/DataSources'
import DocumentUpload from './features/documents/DocumentUpload'
import AnalyticsTab from './features/analytics/AnalyticsTab'
import CXPage from './cx/CXPage'
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
          <div className="text-white text-sm font-bold mb-8 flex items-center justify-center gap-2">
            <div className="text-lg">FF</div>
            <span className={`overflow-hidden transition-all duration-300 whitespace-nowrap text-xs text-gray-300 ${isHovered ? 'opacity-100' : 'opacity-0 w-0'}`}>
              Derya Maritime
            </span>
          </div>

          {/* Navigation */}
          <div className="space-y-6">
            {/* ANALYTICS Section */}
            <div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
                <span className={`overflow-hidden transition-all duration-300 whitespace-nowrap ${isHovered ? 'opacity-100' : 'opacity-0 w-0'}`}>
                  Analytics
                </span>
              </div>
              <div className="space-y-2">
                <button 
                  onClick={() => setActive('analytics')}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                    active === 'analytics' ? 'bg-white/20 text-white' : 'text-gray-300 hover:bg-white/10'
                  }`}
                >
                  <BarChart size={20} className="flex-shrink-0" />
                  <span className={`overflow-hidden transition-all duration-300 whitespace-nowrap ${isHovered ? 'opacity-100' : 'opacity-0 w-0'}`}>
                    Operations
                  </span>
                </button>

                <button 
                  onClick={() => setActive('customer-experience')}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                    active === 'customer-experience' ? 'bg-white/20 text-white' : 'text-gray-300 hover:bg-white/10'
                  }`}
                >
                  <Users size={20} className="flex-shrink-0" />
                  <span className={`overflow-hidden transition-all duration-300 whitespace-nowrap ${isHovered ? 'opacity-100' : 'opacity-0 w-0'}`}>
                    Customer Experience
                  </span>
                </button>

                <div className="w-full flex items-center gap-3 p-3 rounded-lg opacity-50 cursor-not-allowed">
                  <TrendingUp size={20} className="flex-shrink-0 text-gray-400" />
                  <span className={`overflow-hidden transition-all duration-300 whitespace-nowrap text-gray-400 ${isHovered ? 'opacity-100' : 'opacity-0 w-0'}`}>
                    Markets
                  </span>
                </div>
              </div>
            </div>

            {/* DATA Section */}
            <div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
                <span className={`overflow-hidden transition-all duration-300 whitespace-nowrap ${isHovered ? 'opacity-100' : 'opacity-0 w-0'}`}>
                  Data
                </span>
              </div>
              <div className="space-y-2">
                <button 
                  onClick={() => setActive('data-explorer')}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                    active === 'data-explorer' ? 'bg-white/20 text-white' : 'text-gray-300 hover:bg-white/10'
                  }`}
                >
                  <Database size={20} className="flex-shrink-0" />
                  <span className={`overflow-hidden transition-all duration-300 whitespace-nowrap ${isHovered ? 'opacity-100' : 'opacity-0 w-0'}`}>
                    View Data
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
                    Integrations
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
                    Upload
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="absolute bottom-4 text-xs text-gray-500">
            v0.1
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 ml-[72px] bg-gray-50 min-h-screen">
        {active === 'customer-experience' ? (
          <CXPage />
        ) : (
          <div className="p-8 max-w-6xl mx-auto">
            {active === 'analytics' ? (
              <AnalyticsTab rows={shipmentData} loading={false} />
            ) : active === 'data-explorer' ? (
              <div className="space-y-6">
                <div className="mb-6">
                  <h1 className="text-3xl font-bold text-[color:var(--deep-blue)] tracking-tight mb-2">
                    View Data
                  </h1>
                  <p className="text-slate-600">
                    Browse and explore all your uploaded and integrated data
                  </p>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <div className="text-center py-12">
                    <Database className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">View Data Coming Soon</h3>
                    <p className="text-slate-600 mb-6">
                      This section will allow you to browse, search, and explore all your uploaded documents and integrated data sources.
                    </p>
                    <div className="space-y-3 text-sm text-slate-500">
                      <p>• View all uploaded documents and their metadata</p>
                      <p>• Browse integrated data from external sources</p>
                      <p>• Search and filter across all your data</p>
                      <p>• Preview document contents and data quality</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : active === 'data-integration' ? (
              <DataSources />
            ) : active === 'documents' ? (
              <DocumentUpload />
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}