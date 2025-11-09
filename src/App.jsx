import { useState } from 'react'
import { Network, Database, LayoutDashboard, Settings, Wrench } from 'lucide-react'
import DataSources from './features/documents/DataSources'
import ViewData from './features/documents/ViewData'
import Dashboard from './features/dashboard/Dashboard'
import ManageAgents from './features/agents/ManageAgents'
import AgentBuilder from './features/agents/AgentBuilder'
import Navbar from './components/Navbar'
import { mockShipments } from './data/mockShipments.js'

export default function App() {
  const [active, setActive] = useState('dashboard')
  const [shipmentData, setShipmentData] = useState(mockShipments)
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] transition-colors duration-300">
      {/* Sidebar */}
      <div 
        className={`${isHovered ? 'w-64' : 'w-[72px]'} bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 h-screen fixed left-0 top-0 z-50`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="p-4">
          {/* Logo */}
          <div className="text-gray-800 dark:text-white text-sm font-bold mb-8 flex items-center justify-center gap-2">
            <div className="text-lg">FF</div>
            <span className={`overflow-hidden transition-all duration-300 whitespace-nowrap text-xs text-gray-600 dark:text-gray-400 ${isHovered ? 'opacity-100' : 'opacity-0 w-0'}`}>
              Derya Maritime
            </span>
          </div>

          {/* Navigation */}
          <div className="space-y-6">
            {/* Dashboard - Standalone at top */}
            <div>
              <button 
                onClick={() => setActive('dashboard')}
                className={`w-full flex items-center ${isHovered ? 'gap-3 justify-start' : 'justify-center'} p-3 rounded-lg transition-all duration-200 ${
                  active === 'dashboard' ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <LayoutDashboard size={20} className="flex-shrink-0" />
                <span className={`overflow-hidden transition-all duration-300 whitespace-nowrap ${isHovered ? 'opacity-100' : 'opacity-0 w-0'}`}>
                  Dashboard
                </span>
              </button>
            </div>

            {/* AI EMPLOYEES Section */}
            <div>
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 px-3">
                <span className={`overflow-hidden transition-all duration-300 whitespace-nowrap ${isHovered ? 'opacity-100' : 'opacity-0 w-0'}`}>
                  AI Employees
                </span>
              </div>
              <div className="space-y-2">
                <button 
                  onClick={() => setActive('manage-employees')}
                  className={`w-full flex items-center ${isHovered ? 'gap-3 justify-start' : 'justify-center'} p-3 rounded-lg transition-all duration-200 ${
                    active === 'manage-employees' ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <Settings size={20} className="flex-shrink-0" />
                  <span className={`overflow-hidden transition-all duration-300 whitespace-nowrap ${isHovered ? 'opacity-100' : 'opacity-0 w-0'}`}>
                    Manage Employees
                  </span>
                </button>

                <button 
                  onClick={() => setActive('agent-builder')}
                  className={`w-full flex items-center ${isHovered ? 'gap-3 justify-start' : 'justify-center'} p-3 rounded-lg transition-all duration-200 ${
                    active === 'agent-builder' ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <Wrench size={20} className="flex-shrink-0" />
                  <span className={`overflow-hidden transition-all duration-300 whitespace-nowrap ${isHovered ? 'opacity-100' : 'opacity-0 w-0'}`}>
                    Agent Builder
                  </span>
                </button>
              </div>
            </div>

            {/* DATA Section */}
            <div>
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 px-3">
                <span className={`overflow-hidden transition-all duration-300 whitespace-nowrap ${isHovered ? 'opacity-100' : 'opacity-0 w-0'}`}>
                  Data
                </span>
              </div>
              <div className="space-y-2">
                <button 
                  onClick={() => setActive('data-explorer')}
                  className={`w-full flex items-center ${isHovered ? 'gap-3 justify-start' : 'justify-center'} p-3 rounded-lg transition-all duration-200 ${
                    active === 'data-explorer' ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <Database size={20} className="flex-shrink-0" />
                  <span className={`overflow-hidden transition-all duration-300 whitespace-nowrap ${isHovered ? 'opacity-100' : 'opacity-0 w-0'}`}>
                    View Data
                  </span>
                </button>

                <button 
                  onClick={() => setActive('data-integration')}
                  className={`w-full flex items-center ${isHovered ? 'gap-3 justify-start' : 'justify-center'} p-3 rounded-lg transition-all duration-200 ${
                    active === 'data-integration' ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <Network size={20} className="flex-shrink-0" />
                  <span className={`overflow-hidden transition-all duration-300 whitespace-nowrap ${isHovered ? 'opacity-100' : 'opacity-0 w-0'}`}>
                    Integrations
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="absolute bottom-4 text-xs text-gray-500 dark:text-gray-400">
            v0.1
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 ml-[72px] bg-[#F9FAFB] dark:bg-[#0B1120] min-h-screen transition-colors duration-300">
        {/* Navbar */}
        <Navbar />
        
        {active === 'manage-employees' ? (
          <div className="py-6">
            <ManageAgents />
          </div>
        ) : active === 'agent-builder' ? (
          <AgentBuilder />
        ) : (
          <div className="p-8 max-w-6xl mx-auto">
            {active === 'dashboard' ? (
              <Dashboard />
            ) : active === 'data-explorer' ? (
              <ViewData />
            ) : active === 'data-integration' ? (
              <DataSources />
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}