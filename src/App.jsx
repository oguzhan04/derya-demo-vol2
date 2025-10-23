import { useState } from 'react'
import { Network, Users, Database, LayoutDashboard, Bot, Settings, Wrench } from 'lucide-react'
import DataSources from './features/documents/DataSources'
import ViewData from './features/documents/ViewData'
import CXPage from './cx/CXPage'
import Dashboard from './features/dashboard/Dashboard'
import ChatGPTTest from './features/integrations/ChatGPTTest'
import ManageAgents from './features/agents/ManageAgents'
import AgentBuilder from './features/agents/AgentBuilder'
import { mockShipments } from './data/mockShipments'

export default function App() {
  const [active, setActive] = useState('dashboard')
  const [shipmentData, setShipmentData] = useState(mockShipments)
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div className="flex">
      {/* Sidebar */}
      <div 
        className={`${isHovered ? 'w-64' : 'w-[72px]'} bg-white border-r border-gray-200 transition-all duration-300 h-screen fixed left-0 top-0 z-50`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="p-4">
          {/* Logo */}
          <div className="text-gray-800 text-sm font-bold mb-8 flex items-center justify-center gap-2">
            <div className="text-lg">FF</div>
            <span className={`overflow-hidden transition-all duration-300 whitespace-nowrap text-xs text-gray-600 ${isHovered ? 'opacity-100' : 'opacity-0 w-0'}`}>
              Derya Maritime
            </span>
          </div>

          {/* Navigation */}
          <div className="space-y-6">
            {/* ANALYTICS Section */}
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
                <span className={`overflow-hidden transition-all duration-300 whitespace-nowrap ${isHovered ? 'opacity-100' : 'opacity-0 w-0'}`}>
                  Analytics
                </span>
              </div>
              <div className="space-y-2">
                <button 
                  onClick={() => setActive('dashboard')}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                    active === 'dashboard' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <LayoutDashboard size={20} className="flex-shrink-0" />
                  <span className={`overflow-hidden transition-all duration-300 whitespace-nowrap ${isHovered ? 'opacity-100' : 'opacity-0 w-0'}`}>
                    Dashboard
                  </span>
                </button>


                <button 
                  onClick={() => setActive('customer-experience')}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                    active === 'customer-experience' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Users size={20} className="flex-shrink-0" />
                  <span className={`overflow-hidden transition-all duration-300 whitespace-nowrap ${isHovered ? 'opacity-100' : 'opacity-0 w-0'}`}>
                    Customer Experience
                  </span>
                </button>

              </div>
            </div>

            {/* DATA Section */}
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
                <span className={`overflow-hidden transition-all duration-300 whitespace-nowrap ${isHovered ? 'opacity-100' : 'opacity-0 w-0'}`}>
                  Data
                </span>
              </div>
              <div className="space-y-2">
                <button 
                  onClick={() => setActive('data-explorer')}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                    active === 'data-explorer' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
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
                    active === 'data-integration' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Network size={20} className="flex-shrink-0" />
                  <span className={`overflow-hidden transition-all duration-300 whitespace-nowrap ${isHovered ? 'opacity-100' : 'opacity-0 w-0'}`}>
                    Integrations
                  </span>
                </button>

                <button 
                  onClick={() => setActive('chatgpt-test')}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                    active === 'chatgpt-test' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Bot size={20} className="flex-shrink-0" />
                  <span className={`overflow-hidden transition-all duration-300 whitespace-nowrap ${isHovered ? 'opacity-100' : 'opacity-0 w-0'}`}>
                    ChatGPT Test
                  </span>
                </button>

                <button 
                  onClick={() => setActive('manage-agents')}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                    active === 'manage-agents' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Settings size={20} className="flex-shrink-0" />
                  <span className={`overflow-hidden transition-all duration-300 whitespace-nowrap ${isHovered ? 'opacity-100' : 'opacity-0 w-0'}`}>
                    Manage Agents
                  </span>
                </button>

                <button 
                  onClick={() => setActive('agent-builder')}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                    active === 'agent-builder' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Wrench size={20} className="flex-shrink-0" />
                  <span className={`overflow-hidden transition-all duration-300 whitespace-nowrap ${isHovered ? 'opacity-100' : 'opacity-0 w-0'}`}>
                    Agent Builder
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
        ) : active === 'chatgpt-test' ? (
          <div className="p-8 max-w-6xl mx-auto">
            <ChatGPTTest />
          </div>
        ) : active === 'manage-agents' ? (
          <div className="p-8 max-w-6xl mx-auto">
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