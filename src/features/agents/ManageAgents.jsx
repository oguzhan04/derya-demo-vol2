import React from 'react'
import { 
  Activity, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Truck, 
  Package, 
  Globe,
  Users,
  Zap,
  BarChart3,
  PieChart
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell } from 'recharts'

// Mock data for charts and agents
const shipmentVolumeData = [
  { month: 'Jan', containers: 120, revenue: 240000 },
  { month: 'Feb', containers: 135, revenue: 270000 },
  { month: 'Mar', containers: 148, revenue: 296000 },
  { month: 'Apr', containers: 162, revenue: 324000 },
  { month: 'May', containers: 175, revenue: 350000 },
  { month: 'Jun', containers: 189, revenue: 378000 }
]

const agentPerformanceData = [
  { agent: 'FreightBot Alpha', tasks: 47, efficiency: 94, errors: 2 },
  { agent: 'RouteMaster Pro', tasks: 23, efficiency: 89, errors: 1 },
  { agent: 'ComplianceGuard', tasks: 31, efficiency: 96, errors: 0 },
  { agent: 'CustomerCare AI', tasks: 19, efficiency: 87, errors: 3 }
]

const activeAgents = [
  {
    id: 1,
    name: 'FreightBot Alpha',
    status: 'active',
    currentTask: 'Processing shipping documents for Container #MSKU1234567',
    tasksCompleted: 47,
    efficiency: 94,
    uptime: '99.2%',
    lastActivity: '2 min ago',
    documentsProcessed: 156,
    containersHandled: 23,
    processingTime: '2.3s avg',
    accuracy: 98.7,
    throughput: 156,
    specialization: 'Document Processing',
    version: 'v2.4.1',
    uptimeHours: 1247,
    lastUpdate: '2 hours ago',
    workQueue: 8,
    successRate: 98.7,
    avgResponseTime: '1.2s',
    totalDocuments: 2847
  },
  {
    id: 2,
    name: 'RouteMaster Pro',
    status: 'active',
    currentTask: 'Optimizing delivery route for 15 shipments in EU region',
    tasksCompleted: 23,
    efficiency: 89,
    uptime: '98.7%',
    lastActivity: '1 min ago',
    routesOptimized: 89,
    distanceSaved: '2,340 km',
    fuelEfficiency: 12.3,
    deliveryTime: '8.2h avg',
    accuracy: 94.2,
    throughput: 89,
    specialization: 'Route Optimization',
    version: 'v1.8.3',
    uptimeHours: 892,
    lastUpdate: '4 hours ago',
    workQueue: 12,
    successRate: 94.2,
    avgResponseTime: '3.1s',
    totalRoutes: 1247
  },
  {
    id: 3,
    name: 'ComplianceGuard',
    status: 'busy',
    currentTask: 'Validating customs documentation for 8 containers',
    tasksCompleted: 31,
    efficiency: 96,
    uptime: '99.5%',
    lastActivity: '30 sec ago',
    documentsValidated: 203,
    complianceChecks: 31,
    violationsDetected: 0,
    processingTime: '4.1s avg',
    accuracy: 99.8,
    throughput: 203,
    specialization: 'Compliance & Customs',
    version: 'v3.1.0',
    uptimeHours: 2156,
    lastUpdate: '1 hour ago',
    workQueue: 5,
    successRate: 99.8,
    avgResponseTime: '4.1s',
    totalValidations: 4567
  },
  {
    id: 4,
    name: 'CustomerCare AI',
    status: 'active',
    currentTask: 'Responding to customer inquiries about shipment delays',
    tasksCompleted: 19,
    efficiency: 87,
    uptime: '97.8%',
    lastActivity: '3 min ago',
    inquiriesHandled: 78,
    customerSatisfaction: 4.7,
    resolutionTime: '2.8m avg',
    languagesSupported: 12,
    accuracy: 91.3,
    throughput: 78,
    specialization: 'Customer Support',
    version: 'v2.0.5',
    uptimeHours: 456,
    lastUpdate: '6 hours ago',
    workQueue: 3,
    successRate: 91.3,
    avgResponseTime: '2.8m',
    totalInquiries: 1234
  }
]

const getStatusColor = (status) => {
  switch (status) {
    case 'active': return 'text-green-600 bg-green-100'
    case 'busy': return 'text-yellow-600 bg-yellow-100'
    case 'idle': return 'text-gray-600 bg-gray-100'
    default: return 'text-gray-600 bg-gray-100'
  }
}

const getStatusIcon = (status) => {
  switch (status) {
    case 'active': return <CheckCircle className="w-4 h-4" />
    case 'busy': return <Clock className="w-4 h-4" />
    case 'idle': return <AlertCircle className="w-4 h-4" />
    default: return <AlertCircle className="w-4 h-4" />
  }
}

export default function ManageAgents() {
  return (
    <div className="space-y-6">


      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Shipment Volume & Revenue */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Shipment Volume & Revenue</h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={shipmentVolumeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'containers' ? value : `$${value.toLocaleString()}`,
                  name === 'containers' ? 'Containers' : 'Revenue'
                ]}
              />
              <Bar yAxisId="left" dataKey="containers" fill="#3B82F6" name="containers" />
              <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} name="revenue" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Agent Performance Comparison */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Agent Performance</h3>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={agentPerformanceData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis dataKey="agent" type="category" width={120} />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'efficiency' ? `${value}%` : value,
                  name === 'efficiency' ? 'Efficiency' : name === 'tasks' ? 'Tasks' : 'Errors'
                ]}
              />
              <Bar dataKey="efficiency" fill="#10B981" name="efficiency" />
              <Bar dataKey="tasks" fill="#3B82F6" name="tasks" />
              <Bar dataKey="errors" fill="#EF4444" name="errors" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Active Agents - Professional Monitoring Interface */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Agent Operations Center</h3>
            <p className="text-sm text-gray-600 mt-1">Real-time monitoring of AI agents in freight forwarding operations</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-700">4 agents online</span>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">System Status</div>
              <div className="text-sm font-medium text-gray-900">Operational</div>
            </div>
          </div>
        </div>

         <div className="flex gap-6 overflow-x-auto pb-6">
           {activeAgents.map((agent) => (
             <div key={agent.id} className="flex-shrink-0 w-[450px]">
               <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 h-[750px] flex flex-col">
                 {/* Agent Header */}
                 <div className="flex items-start justify-between mb-4">
                   <div className="flex items-center gap-3">
                     <div className="relative">
                       <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                         <Truck className="w-8 h-8 text-white" />
                       </div>
                       <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-3 border-white flex items-center justify-center ${
                         agent.status === 'active' ? 'bg-green-500' : 
                         agent.status === 'busy' ? 'bg-yellow-500' : 'bg-gray-400'
                       }`}>
                         {getStatusIcon(agent.status)}
                       </div>
                     </div>
                     <div>
                       <h4 className="text-xl font-bold text-gray-900 mb-1">{agent.name}</h4>
                       <div className="flex items-center gap-2">
                         <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                           agent.status === 'active' ? 'bg-green-100 text-green-800' : 
                           agent.status === 'busy' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                         }`}>
                           {agent.status}
                         </span>
                         <span className="text-xs text-gray-500">• {agent.lastActivity}</span>
                       </div>
                       <div className="mt-1 text-xs text-gray-600">
                         <span className="font-semibold">Specialization:</span> {agent.specialization}
                       </div>
                       <div className="text-xs text-gray-500">Version {agent.version}</div>
                     </div>
                   </div>
                 </div>

                 {/* Current Operation */}
                 <div className="mb-6">
                   <div className="flex items-center gap-2 mb-3">
                     <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                     <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">Current Operation</span>
                   </div>
                   <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
                     <p className="text-xs text-gray-700 leading-relaxed font-medium">{agent.currentTask}</p>
                   </div>
                 </div>

                 {/* Performance Metrics Grid */}
                 <div className="grid grid-cols-2 gap-3 mb-4">
                   <div className="space-y-3">
                     <div className="text-center bg-gray-50 rounded-lg p-3">
                       <div className="text-2xl font-bold text-gray-900 mb-1">{agent.tasksCompleted}</div>
                       <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Tasks Completed</div>
                     </div>
                     <div className="text-center bg-green-50 rounded-lg p-3">
                       <div className="text-2xl font-bold text-green-600 mb-1">{agent.efficiency}%</div>
                       <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Efficiency</div>
                     </div>
                   </div>
                   <div className="space-y-3">
                     <div className="text-center bg-blue-50 rounded-lg p-3">
                       <div className="text-2xl font-bold text-blue-600 mb-1">{agent.uptime}</div>
                       <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Uptime</div>
                     </div>
                     <div className="text-center bg-purple-50 rounded-lg p-3">
                       <div className="text-2xl font-bold text-purple-600 mb-1">{agent.throughput}</div>
                       <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Throughput</div>
                     </div>
                   </div>
                 </div>

                 {/* Work Performance Metrics */}
                 <div className="space-y-3 mb-4">
                   <div className="flex justify-between items-center">
                     <span className="text-xs font-semibold text-gray-700">Work Queue</span>
                     <span className="text-xs font-bold text-gray-900">{agent.workQueue} pending</span>
                   </div>
                   <div className="w-full bg-gray-200 rounded-full h-2">
                     <div className="bg-gradient-to-r from-blue-400 to-blue-500 h-2 rounded-full" style={{width: `${Math.min((agent.workQueue / 20) * 100, 100)}%`}}></div>
                   </div>
                   
                   <div className="flex justify-between items-center">
                     <span className="text-xs font-semibold text-gray-700">Success Rate</span>
                     <span className="text-xs font-bold text-gray-900">{agent.successRate}%</span>
                   </div>
                   <div className="w-full bg-gray-200 rounded-full h-2">
                     <div className="bg-gradient-to-r from-green-400 to-green-500 h-2 rounded-full" style={{width: `${agent.successRate}%`}}></div>
                   </div>

                   <div className="flex justify-between items-center">
                     <span className="text-xs font-semibold text-gray-700">Avg Response Time</span>
                     <span className="text-xs font-bold text-gray-900">{agent.avgResponseTime}</span>
                   </div>
                   <div className="w-full bg-gray-200 rounded-full h-2">
                     <div className="bg-gradient-to-r from-purple-400 to-purple-500 h-2 rounded-full" style={{width: '75%'}}></div>
                   </div>
                 </div>

                 {/* Work Details Grid */}
                 <div className="grid grid-cols-2 gap-3 mb-4">
                   <div className="bg-blue-50 rounded-lg p-3">
                     <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Work Completed</div>
                     <div className="text-sm font-bold text-blue-600">
                       {agent.specialization === 'Document Processing' && `${agent.documentsProcessed} docs`}
                       {agent.specialization === 'Route Optimization' && `${agent.routesOptimized} routes`}
                       {agent.specialization === 'Compliance & Customs' && `${agent.documentsValidated} validations`}
                       {agent.specialization === 'Customer Support' && `${agent.inquiriesHandled} inquiries`}
                     </div>
                   </div>
                   <div className="bg-green-50 rounded-lg p-3">
                     <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Accuracy</div>
                     <div className="text-sm font-bold text-green-600">{agent.accuracy}%</div>
                   </div>
                 </div>

                 {/* Footer Stats */}
                 <div className="mt-auto pt-4 border-t border-gray-200">
                   <div className="grid grid-cols-3 gap-3 text-center">
                     <div>
                       <div className="text-xs text-gray-500 uppercase tracking-wide">Processing Time</div>
                       <div className="text-xs font-bold text-gray-900">{agent.processingTime}</div>
                     </div>
                     <div>
                       <div className="text-xs text-gray-500 uppercase tracking-wide">Total Work</div>
                       <div className="text-xs font-bold text-gray-900">
                         {agent.specialization === 'Document Processing' && agent.totalDocuments}
                         {agent.specialization === 'Route Optimization' && agent.totalRoutes}
                         {agent.specialization === 'Compliance & Customs' && agent.totalValidations}
                         {agent.specialization === 'Customer Support' && agent.totalInquiries}
                       </div>
                     </div>
                     <div>
                       <div className="text-xs text-gray-500 uppercase tracking-wide">Uptime</div>
                       <div className="text-xs font-bold text-gray-900">{agent.uptimeHours}h</div>
                     </div>
                   </div>
                   <div className="mt-3 text-center">
                     <span className="text-xs text-gray-500">Last Update: {agent.lastUpdate}</span>
                   </div>
                 </div>
               </div>
             </div>
           ))}
         </div>
      </div>
    </div>
  )
}
