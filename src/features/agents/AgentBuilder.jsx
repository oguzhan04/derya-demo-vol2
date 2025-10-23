import React, { useState, useRef } from 'react'
import { 
  Mail, 
  MessageSquare, 
  MapPin, 
  Clock, 
  FileText, 
  Calendar,
  Zap,
  Plus,
  Save,
  Download,
  Trash2,
  MousePointer,
  Eye,
  EyeOff
} from 'lucide-react'

const nodeTypes = [
  {
    id: 'trigger',
    name: 'Trigger',
    icon: Zap,
    color: 'bg-green-500',
    description: 'Start your workflow'
  },
  {
    id: 'email',
    name: 'Email',
    icon: Mail,
    color: 'bg-blue-500',
    description: 'Send or receive emails'
  },
  {
    id: 'sms',
    name: 'SMS',
    icon: MessageSquare,
    color: 'bg-purple-500',
    description: 'Send text messages'
  },
  {
    id: 'location',
    name: 'Location',
    icon: MapPin,
    color: 'bg-orange-500',
    description: 'GPS and location data'
  },
  {
    id: 'document',
    name: 'Document',
    icon: FileText,
    color: 'bg-indigo-500',
    description: 'Process documents'
  },
  {
    id: 'schedule',
    name: 'Schedule',
    icon: Clock,
    color: 'bg-yellow-500',
    description: 'Time-based triggers'
  },
  {
    id: 'calendar',
    name: 'Calendar',
    icon: Calendar,
    color: 'bg-pink-500',
    description: 'Calendar integration'
  }
]

const workflowTemplates = [
  {
    id: 'customer-onboarding',
    name: 'Customer Onboarding',
    description: 'Welcome new customers with automated emails and document collection',
    category: 'Customer Service',
    nodes: [
      { type: 'trigger', name: 'New Customer', x: 50, y: 100 },
      { type: 'email', name: 'Welcome Email', x: 250, y: 100 },
      { type: 'document', name: 'Collect Info', x: 450, y: 100 },
      { type: 'email', name: 'Follow-up', x: 650, y: 100 }
    ],
    connections: [
      { from: 0, to: 1 },
      { from: 1, to: 2 },
      { from: 2, to: 3 }
    ]
  },
  {
    id: 'order-processing',
    name: 'Order Processing',
    description: 'Automated order fulfillment with inventory checks and notifications',
    category: 'E-commerce',
    nodes: [
      { type: 'trigger', name: 'New Order', x: 50, y: 100 },
      { type: 'document', name: 'Check Inventory', x: 250, y: 100 },
      { type: 'email', name: 'Order Confirmation', x: 450, y: 100 },
      { type: 'sms', name: 'Shipping Update', x: 650, y: 100 }
    ],
    connections: [
      { from: 0, to: 1 },
      { from: 1, to: 2 },
      { from: 2, to: 3 }
    ]
  },
  {
    id: 'customer-support',
    name: 'Customer Support',
    description: 'Intelligent ticket routing and automated responses',
    category: 'Support',
    nodes: [
      { type: 'trigger', name: 'Support Ticket', x: 50, y: 100 },
      { type: 'document', name: 'Analyze Issue', x: 250, y: 100 },
      { type: 'email', name: 'Auto Response', x: 450, y: 100 },
      { type: 'calendar', name: 'Schedule Follow-up', x: 650, y: 100 }
    ],
    connections: [
      { from: 0, to: 1 },
      { from: 1, to: 2 },
      { from: 2, to: 3 }
    ]
  },
  {
    id: 'lead-nurturing',
    name: 'Lead Nurturing',
    description: 'Automated lead scoring and follow-up sequences',
    category: 'Marketing',
    nodes: [
      { type: 'trigger', name: 'New Lead', x: 50, y: 100 },
      { type: 'document', name: 'Score Lead', x: 250, y: 100 },
      { type: 'email', name: 'Nurture Email', x: 450, y: 100 },
      { type: 'calendar', name: 'Schedule Call', x: 650, y: 100 }
    ],
    connections: [
      { from: 0, to: 1 },
      { from: 1, to: 2 },
      { from: 2, to: 3 }
    ]
  },
  {
    id: 'inventory-alerts',
    name: 'Inventory Management',
    description: 'Automated stock monitoring and reorder alerts',
    category: 'Operations',
    nodes: [
      { type: 'schedule', name: 'Daily Check', x: 50, y: 100 },
      { type: 'document', name: 'Check Stock', x: 250, y: 100 },
      { type: 'email', name: 'Low Stock Alert', x: 450, y: 100 },
      { type: 'sms', name: 'Reorder Request', x: 650, y: 100 }
    ],
    connections: [
      { from: 0, to: 1 },
      { from: 1, to: 2 },
      { from: 2, to: 3 }
    ]
  },
  {
    id: 'appointment-booking',
    name: 'Appointment Booking',
    description: 'Automated scheduling with calendar integration',
    category: 'Scheduling',
    nodes: [
      { type: 'trigger', name: 'Booking Request', x: 50, y: 100 },
      { type: 'calendar', name: 'Check Availability', x: 250, y: 100 },
      { type: 'email', name: 'Confirmation', x: 450, y: 100 },
      { type: 'sms', name: 'Reminder', x: 650, y: 100 }
    ],
    connections: [
      { from: 0, to: 1 },
      { from: 1, to: 2 },
      { from: 2, to: 3 }
    ]
  }
]

export default function AgentBuilder() {
  const [nodes, setNodes] = useState([])
  const [selectedNode, setSelectedNode] = useState(null)
  const [showGrid, setShowGrid] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const canvasRef = useRef(null)

  const addNode = (type, x, y) => {
    const newNode = {
      id: `node-${Date.now()}`,
      type: type.id,
      name: type.name,
      icon: type.icon,
      color: type.color,
      x: x - 60,
      y: y - 40,
      width: 120,
      height: 80
    }
    setNodes([...nodes, newNode])
  }

  const loadTemplate = (template) => {
    const templateNodes = template.nodes.map((nodeTemplate, index) => {
      const nodeType = nodeTypes.find(nt => nt.id === nodeTemplate.type)
      return {
        id: `node-${Date.now()}-${index}`,
        type: nodeTemplate.type,
        name: nodeTemplate.name,
        icon: nodeType?.icon || Zap,
        color: nodeType?.color || 'bg-gray-500',
        x: nodeTemplate.x,
        y: nodeTemplate.y,
        width: 120,
        height: 80
      }
    })
    setNodes([...nodes, ...templateNodes])
  }

  const categories = ['All', 'Customer Service', 'E-commerce', 'Support', 'Marketing', 'Operations', 'Scheduling']
  const filteredTemplates = workflowTemplates.filter(template => 
    selectedCategory === 'All' || template.category === selectedCategory
  )

  const handleCanvasClick = (e) => {
    if (e.target === canvasRef.current) {
      setSelectedNode(null)
    }
  }

  const handleNodeClick = (node, e) => {
    e.stopPropagation()
    setSelectedNode(node)
  }

  const deleteNode = (nodeId) => {
    setNodes(nodes.filter(n => n.id !== nodeId))
    setSelectedNode(null)
  }

  const clearCanvas = () => {
    setNodes([])
    setSelectedNode(null)
  }

  const saveWorkflow = () => {
    const workflow = {
      nodes,
      name: 'My Workflow',
      createdAt: new Date().toISOString()
    }
    console.log('Saving workflow:', workflow)
  }

  const exportWorkflow = () => {
    const workflow = { nodes }
    const dataStr = JSON.stringify(workflow, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'workflow.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Toolbar - moved to top right */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <div className="flex items-center gap-2 bg-white rounded-lg shadow-sm border border-gray-200 p-2">
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-2 rounded-lg ${showGrid ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}
          >
            {showGrid ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
          <span className="text-sm text-gray-500">Grid</span>
        </div>
        
        <div className="flex items-center gap-2 bg-white rounded-lg shadow-sm border border-gray-200 p-2">
          <button
            onClick={saveWorkflow}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save size={16} />
            Save
          </button>
          <button
            onClick={exportWorkflow}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Download size={16} />
            Export
          </button>
          <button
            onClick={clearCanvas}
            className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
          >
            <Trash2 size={16} />
            Clear
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex-1 flex">
        {/* Component Palette */}
        <div className="w-64 bg-white border-r border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Components</h3>
          <div className="space-y-2">
            {nodeTypes.map((type) => {
              const IconComponent = type.icon
              return (
                <div
                  key={type.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('application/json', JSON.stringify(type))
                  }}
                >
                  <div className={`p-2 rounded-lg ${type.color} text-white`}>
                    <IconComponent size={16} />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{type.name}</div>
                    <div className="text-xs text-gray-500">{type.description}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 relative overflow-hidden">
          <div
            ref={canvasRef}
            className="w-full h-full relative cursor-grab active:cursor-grabbing"
            style={{
              backgroundImage: showGrid 
                ? 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)' 
                : 'none',
              backgroundSize: '20px 20px'
            }}
            onClick={handleCanvasClick}
            onDrop={(e) => {
              e.preventDefault()
              const type = JSON.parse(e.dataTransfer.getData('application/json'))
              const rect = canvasRef.current.getBoundingClientRect()
              const x = e.clientX - rect.left
              const y = e.clientY - rect.top
              addNode(type, x, y)
            }}
            onDragOver={(e) => e.preventDefault()}
          >
            {/* Render Nodes */}
            {nodes.map((node) => {
              const IconComponent = node.icon
              return (
                <div
                  key={node.id}
                  className={`absolute border-2 rounded-lg p-3 cursor-move min-w-[120px] min-h-[80px] flex flex-col items-center justify-center ${
                    selectedNode?.id === node.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 bg-white hover:border-gray-400'
                  }`}
                  style={{
                    left: node.x,
                    top: node.y,
                    width: node.width,
                    height: node.height
                  }}
                  onClick={(e) => handleNodeClick(node, e)}
                >
                  <div className={`p-2 rounded-lg ${node.color} text-white mb-2`}>
                    <IconComponent size={20} />
                  </div>
                  <div className="text-xs font-medium text-gray-900 text-center">{node.name}</div>
                </div>
              )
            })}

            {/* Empty State */}
            {nodes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus size={32} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Start Building Your Workflow</h3>
                  <p className="text-gray-500 mb-4">Drag components from the sidebar to get started</p>
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                    <MousePointer size={16} />
                    <span>Click and drag to pan</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Properties Panel */}
        {selectedNode && (
          <div className="w-80 bg-white border-l border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Properties</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Node Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={selectedNode.name}
                  onChange={(e) => {
                    const updatedNodes = nodes.map(n => 
                      n.id === selectedNode.id ? { ...n, name: e.target.value } : n
                    )
                    setNodes(updatedNodes)
                    setSelectedNode({ ...selectedNode, name: e.target.value })
                  }}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Configuration</label>
                <div className="space-y-2">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-700">Email Settings</div>
                    <button className="text-blue-600 text-sm hover:text-blue-800">Configure</button>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-700">Trigger Conditions</div>
                    <button className="text-blue-600 text-sm hover:text-blue-800">Configure</button>
                  </div>
                </div>
              </div>

              <button
                onClick={() => deleteNode(selectedNode.id)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
              >
                <Trash2 size={16} />
                Delete Node
              </button>
            </div>
          </div>
        )}
        </div>

        {/* Template Library - Bottom Section */}
        <div className="h-48 bg-white border-t border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Workflow Templates</h3>
            <div className="flex items-center gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-2">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="flex-shrink-0 w-64 bg-gray-50 rounded-lg border border-gray-200 p-4 cursor-pointer hover:bg-gray-100 hover:border-gray-300 transition-colors"
                onClick={() => loadTemplate(template)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900 text-sm">{template.name}</h4>
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                    {template.category}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mb-3">{template.description}</p>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <span>Click to add to workflow</span>
                  <Plus size={12} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}