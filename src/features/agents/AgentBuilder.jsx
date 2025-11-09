import React, { useState, useRef, useEffect } from 'react'
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
  EyeOff,
  Upload,
  FolderOpen,
  X,
  Settings,
  Link as LinkIcon
} from 'lucide-react'
import { 
  saveWorkflow as persistWorkflow, 
  loadWorkflows, 
  createWorkflow,
  importWorkflow,
  deleteWorkflow as deletePersistedWorkflow
} from '../../services/workflowPersistence'

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

// Helper function to draw SVG path between nodes
const getConnectionPath = (fromNode, toNode) => {
  const fromX = fromNode.x + fromNode.width / 2
  const fromY = fromNode.y + fromNode.height
  const toX = toNode.x + toNode.width / 2
  const toY = toNode.y
  
  const midY = (fromY + toY) / 2
  
  return `M ${fromX} ${fromY} C ${fromX} ${midY} ${toX} ${midY} ${toX} ${toY}`
}

export default function AgentBuilder() {
  const [nodes, setNodes] = useState([])
  const [connections, setConnections] = useState([])
  const [selectedNode, setSelectedNode] = useState(null)
  const [showGrid, setShowGrid] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [workflowName, setWorkflowName] = useState('Untitled Workflow')
  const [currentWorkflowId, setCurrentWorkflowId] = useState(null)
  const [savedWorkflows, setSavedWorkflows] = useState([])
  const [showLoadDialog, setShowLoadDialog] = useState(false)
  const [connectingFrom, setConnectingFrom] = useState(null)
  const [draggingNode, setDraggingNode] = useState(null)
  const [nodeConfig, setNodeConfig] = useState({})
  const [isDragging, setIsDragging] = useState(false)
  const [connectingDrag, setConnectingDrag] = useState(null) // { fromNodeId, fromX, fromY, toX, toY }
  const canvasRef = useRef(null)
  const fileInputRef = useRef(null)
  
  // Use refs for drag state to avoid re-render issues
  const dragStateRef = useRef({
    node: null,
    offset: { x: 0, y: 0 },
    startPos: { x: 0, y: 0 },
    hasMoved: false
  })
  
  // Track if last interaction was a drag (persists until next interaction)
  const lastWasDragRef = useRef(false)
  
  // Track if we're in connection mode
  const isConnectingRef = useRef(false)
  
  // Keep nodes in ref for access in event handlers
  const nodesRef = useRef(nodes)
  useEffect(() => {
    nodesRef.current = nodes
  }, [nodes])

  // Load saved workflows on mount
  useEffect(() => {
    const workflows = loadWorkflows()
    setSavedWorkflows(workflows)
  }, [])

  const addNode = (type, x, y) => {
    try {
      if (!type || !type.id) {
        console.error('Invalid node type:', type)
        return
      }
      
      const nodeType = nodeTypes.find(nt => nt.id === type.id)
      if (!nodeType) {
        console.error('Node type not found:', type.id)
        return
      }
      
      const newNode = {
        id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: type.id,
        name: type.name || nodeType.name,
        icon: nodeType.icon,
        color: nodeType.color,
        x: Math.max(0, x - 60),
        y: Math.max(0, y - 40),
        width: 120,
        height: 80,
        config: {}
      }
      setNodes(prevNodes => [...prevNodes, newNode])
    } catch (error) {
      console.error('Error adding node:', error)
    }
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
        height: 80,
        config: {}
      }
    })
    setNodes(templateNodes)
    
    // Create connections from template
    const templateConnections = template.connections.map(conn => ({
      id: `conn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      from: templateNodes[conn.from]?.id,
      to: templateNodes[conn.to]?.id
    })).filter(c => c.from && c.to)
    setConnections(templateConnections)
  }

  const categories = ['All', 'Customer Service', 'E-commerce', 'Support', 'Marketing', 'Operations', 'Scheduling']
  const filteredTemplates = workflowTemplates.filter(template => 
    selectedCategory === 'All' || template.category === selectedCategory
  )

  const handleCanvasClick = (e) => {
    if (e.target === canvasRef.current) {
      setSelectedNode(null)
      setConnectingFrom(null)
      setConnectingDrag(null)
    }
  }

  const handleNodeClick = (node, e) => {
    e.stopPropagation()
    
    // Don't handle click if clicking on connection handle
    if (e.target.closest('.connection-handle')) {
      return
    }
    
    // Don't handle click if we actually dragged
    if (lastWasDragRef.current) {
      return // User was dragging, not clicking
    }
    
    if (connectingFrom) {
      // Creating a connection
      if (connectingFrom !== node.id) {
        // Check if connection already exists
        const exists = connections.some(c => 
          (c.from === connectingFrom && c.to === node.id) ||
          (c.from === node.id && c.to === connectingFrom)
        )
        
        if (!exists) {
          const newConnection = {
            id: `conn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            from: connectingFrom,
            to: node.id
          }
          setConnections([...connections, newConnection])
        }
      }
      setConnectingFrom(null)
    } else {
      setSelectedNode(node)
      setNodeConfig(node.config || {})
    }
  }

  const startConnection = (nodeId, e) => {
    e.stopPropagation()
    setConnectingFrom(nodeId)
  }

  const handleConnectionDragStart = (node, e) => {
    e.stopPropagation()
    e.preventDefault()
    
    console.log('Connection drag started from node:', node.id)
    
    // Mark that we're connecting
    isConnectingRef.current = true
    
    const canvasRect = canvasRef.current?.getBoundingClientRect()
    if (!canvasRect) {
      console.error('Canvas rect not found')
      isConnectingRef.current = false
      return
    }
    
    // Calculate connection point (bottom center of node)
    const fromX = node.x + node.width / 2
    const fromY = node.y + node.height
    
    const initialDragState = {
      fromNodeId: node.id,
      fromX: fromX,
      fromY: fromY,
      toX: e.clientX - canvasRect.left,
      toY: e.clientY - canvasRect.top
    }
    
    setConnectingDrag(initialDragState)
    console.log('Set connecting drag state:', initialDragState)
    
    let isDragging = true
    
    const handleMouseMove = (moveEvent) => {
      if (!isDragging) return
      
      moveEvent.preventDefault()
      moveEvent.stopPropagation()
      
      const canvasRect = canvasRef.current?.getBoundingClientRect()
      if (!canvasRect) return
      
      const newToX = moveEvent.clientX - canvasRect.left
      const newToY = moveEvent.clientY - canvasRect.top
      
      setConnectingDrag(prev => {
        if (!prev) return null
        const updated = {
          ...prev,
          toX: newToX,
          toY: newToY
        }
        // Debug every 10th update to avoid spam
        if (Math.random() < 0.1) {
          console.log('Connection drag update:', updated)
        }
        return updated
      })
    }
    
    const handleMouseUp = (upEvent) => {
      if (!isDragging) return
      
      isDragging = false
      upEvent.preventDefault()
      upEvent.stopPropagation()
      
      console.log('Connection drag ended')
      
      const canvasRect = canvasRef.current?.getBoundingClientRect()
      if (!canvasRect) {
        setConnectingDrag(null)
        isConnectingRef.current = false
        window.removeEventListener('mousemove', handleMouseMove, { capture: true })
        window.removeEventListener('mouseup', handleMouseUp, { capture: true })
        document.removeEventListener('mousemove', handleMouseMove, { capture: true })
        document.removeEventListener('mouseup', handleMouseUp, { capture: true })
        return
      }
      
      const mouseX = upEvent.clientX - canvasRect.left
      const mouseY = upEvent.clientY - canvasRect.top
      
      console.log('Mouse up at:', mouseX, mouseY)
      
      // Check if mouse is over any node
      const targetNode = nodesRef.current.find(n => {
        const isOver = mouseX >= n.x && mouseX <= n.x + n.width &&
               mouseY >= n.y && mouseY <= n.y + n.height &&
               n.id !== initialDragState.fromNodeId
        if (isOver) {
          console.log('Found target node:', n.id)
        }
        return isOver
      })
      
      if (targetNode) {
        console.log('Creating connection from', initialDragState.fromNodeId, 'to', targetNode.id)
        // Create connection - use functional update to avoid closure issues
        setConnections(prevConnections => {
          const exists = prevConnections.some(c => 
            (c.from === initialDragState.fromNodeId && c.to === targetNode.id) ||
            (c.from === targetNode.id && c.to === initialDragState.fromNodeId)
          )
          
          if (!exists) {
            const newConnection = {
              id: `conn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              from: initialDragState.fromNodeId,
              to: targetNode.id
            }
            console.log('Created new connection:', newConnection)
            return [...prevConnections, newConnection]
          } else {
            console.log('Connection already exists')
          }
          return prevConnections
        })
      } else {
        console.log('No target node found')
      }
      
      setConnectingDrag(null)
      isConnectingRef.current = false
      window.removeEventListener('mousemove', handleMouseMove, { capture: true })
      window.removeEventListener('mouseup', handleMouseUp, { capture: true })
      document.removeEventListener('mousemove', handleMouseMove, { capture: true })
      document.removeEventListener('mouseup', handleMouseUp, { capture: true })
    }
    
    // Use capture phase and make sure events are captured on both window and document
    window.addEventListener('mousemove', handleMouseMove, { passive: false, capture: true })
    window.addEventListener('mouseup', handleMouseUp, { passive: false, once: true, capture: true })
    document.addEventListener('mousemove', handleMouseMove, { passive: false, capture: true })
    document.addEventListener('mouseup', handleMouseUp, { passive: false, once: true, capture: true })
  }

  const handleNodeDragStart = (node, e) => {
    e.stopPropagation()
    e.preventDefault()
    
    const rect = e.currentTarget.getBoundingClientRect()
    const canvasRect = canvasRef.current?.getBoundingClientRect()
    if (!canvasRect) return
    
    // Reset drag flag for new interaction
    lastWasDragRef.current = false
    
    // Calculate offset from click position to node's top-left corner
    const offsetX = e.clientX - rect.left
    const offsetY = e.clientY - rect.top
    
    // Store in ref for stable access
    dragStateRef.current = {
      node: node,
      offset: { x: offsetX, y: offsetY },
      startPos: { x: e.clientX, y: e.clientY },
      hasMoved: false
    }
    
    setIsDragging(true)
    setDraggingNode(node)
    
    // Set up drag handlers - wrapped in try-catch to prevent crashes
    const handleMouseMove = (e) => {
      try {
        e.preventDefault()
        e.stopPropagation()
        
        const canvasRect = canvasRef.current?.getBoundingClientRect()
        if (!canvasRect || !dragStateRef.current.node) return
        
        const dragState = dragStateRef.current
        
        // Check if mouse has actually moved (more than 3px threshold)
        const movedX = Math.abs(e.clientX - dragState.startPos.x)
        const movedY = Math.abs(e.clientY - dragState.startPos.y)
        const hasMoved = movedX > 3 || movedY > 3
        
        if (hasMoved) {
          dragStateRef.current.hasMoved = true
          
          // Calculate new position: mouse position relative to canvas minus the offset
          const newX = e.clientX - canvasRect.left - dragState.offset.x
          const newY = e.clientY - canvasRect.top - dragState.offset.y
          
          setNodes(prevNodes => {
            try {
              return prevNodes.map(n => 
                n.id === dragState.node.id 
                  ? { ...n, x: Math.max(0, newX), y: Math.max(0, newY) }
                  : n
              )
            } catch (err) {
              console.error('Error updating nodes:', err)
              return prevNodes
            }
          })
        }
      } catch (err) {
        console.error('Error in handleMouseMove:', err)
        // Clean up on error
        handleMouseUp(e)
      }
    }
    
    const handleMouseUp = (e) => {
      try {
        const wasDragging = dragStateRef.current.hasMoved
        
        // Track if this was a drag for the click handler
        lastWasDragRef.current = wasDragging
        
        // Only prevent default if we actually dragged
        if (wasDragging) {
          e.preventDefault()
          e.stopPropagation()
        }
        
        dragStateRef.current = {
          node: null,
          offset: { x: 0, y: 0 },
          startPos: { x: 0, y: 0 },
          hasMoved: false
        }
        
        setIsDragging(false)
        setDraggingNode(null)
        
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
        
        // Reset drag flag after a short delay to allow click handler to check it
        setTimeout(() => {
          lastWasDragRef.current = false
        }, 100)
      } catch (err) {
        console.error('Error in handleMouseUp:', err)
      }
    }
    
    try {
      window.addEventListener('mousemove', handleMouseMove, { passive: false })
      window.addEventListener('mouseup', handleMouseUp, { passive: false, once: true })
    } catch (err) {
      console.error('Error setting up drag listeners:', err)
    }
  }

  const deleteNode = (nodeId) => {
    setNodes(nodes.filter(n => n.id !== nodeId))
    setConnections(connections.filter(c => c.from !== nodeId && c.to !== nodeId))
    setSelectedNode(null)
  }

  const deleteConnection = (connId) => {
    setConnections(connections.filter(c => c.id !== connId))
  }

  const clearCanvas = () => {
    if (confirm('Clear all nodes and connections?')) {
      setNodes([])
      setConnections([])
      setSelectedNode(null)
      setWorkflowName('Untitled Workflow')
      setCurrentWorkflowId(null)
      setNodeConfig({})
    }
  }

  const saveWorkflow = () => {
    const name = prompt('Workflow name:', workflowName) || workflowName
    setWorkflowName(name)
    
    const workflow = currentWorkflowId 
      ? { id: currentWorkflowId, name, nodes, connections, updatedAt: new Date().toISOString() }
      : createWorkflow(name, nodes, connections)
    
    if (persistWorkflow(workflow)) {
      setCurrentWorkflowId(workflow.id)
      const workflows = loadWorkflows()
      setSavedWorkflows(workflows)
      alert('Workflow saved successfully!')
    } else {
      alert('Failed to save workflow')
    }
  }

  const loadWorkflow = (workflow) => {
    setNodes(workflow.nodes || [])
    setConnections(workflow.connections || [])
    setWorkflowName(workflow.name)
    setCurrentWorkflowId(workflow.id)
    setSelectedNode(null)
    setShowLoadDialog(false)
  }

  const exportWorkflow = () => {
    const workflow = { 
      name: workflowName,
      nodes, 
      connections,
      exportedAt: new Date().toISOString()
    }
    const dataStr = JSON.stringify(workflow, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${workflowName.replace(/[^a-z0-9]/gi, '_')}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const importWorkflowFromFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const imported = importWorkflow(event.target.result)
        if (imported) {
          setNodes(imported.nodes || [])
          setConnections(imported.connections || [])
          setWorkflowName(imported.name)
          setCurrentWorkflowId(imported.id)
          const workflows = loadWorkflows()
          setSavedWorkflows(workflows)
          alert('Workflow imported successfully!')
        } else {
          alert('Failed to import workflow')
        }
      } catch (error) {
        alert('Error importing workflow: ' + error.message)
      }
    }
    reader.readAsText(file)
    e.target.value = '' // Reset file input
  }

  const updateNodeConfig = (nodeId, config) => {
    setNodes(nodes.map(n => 
      n.id === nodeId ? { ...n, config: { ...n.config, ...config } } : n
    ))
    if (selectedNode?.id === nodeId) {
      setSelectedNode({ ...selectedNode, config: { ...selectedNode.config, ...config } })
      setNodeConfig({ ...nodeConfig, ...config })
    }
  }

  const getNodeConfigForm = (node) => {
    if (!node) return null

    switch (node.type) {
      case 'email':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">To</label>
              <input
                type="text"
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                placeholder="recipient@example.com"
                value={nodeConfig.to || ''}
                onChange={(e) => updateNodeConfig(node.id, { to: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Subject</label>
              <input
                type="text"
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                placeholder="Email subject"
                value={nodeConfig.subject || ''}
                onChange={(e) => updateNodeConfig(node.id, { subject: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Body</label>
              <textarea
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                rows="3"
                placeholder="Email body"
                value={nodeConfig.body || ''}
                onChange={(e) => updateNodeConfig(node.id, { body: e.target.value })}
              />
            </div>
          </div>
        )
      case 'sms':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="text"
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                placeholder="+1234567890"
                value={nodeConfig.phone || ''}
                onChange={(e) => updateNodeConfig(node.id, { phone: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Message</label>
              <textarea
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                rows="3"
                placeholder="SMS message"
                value={nodeConfig.message || ''}
                onChange={(e) => updateNodeConfig(node.id, { message: e.target.value })}
              />
            </div>
          </div>
        )
      case 'trigger':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Trigger Type</label>
              <select
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                value={nodeConfig.triggerType || 'webhook'}
                onChange={(e) => updateNodeConfig(node.id, { triggerType: e.target.value })}
              >
                <option value="webhook">Webhook</option>
                <option value="schedule">Schedule</option>
                <option value="manual">Manual</option>
              </select>
            </div>
          </div>
        )
      case 'schedule':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Schedule</label>
              <select
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                value={nodeConfig.schedule || 'daily'}
                onChange={(e) => updateNodeConfig(node.id, { schedule: e.target.value })}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="hourly">Hourly</option>
              </select>
            </div>
          </div>
        )
      default:
        return (
          <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
            No additional configuration available for this node type.
          </div>
        )
    }
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Toolbar - Top */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <div className="flex items-center gap-2 bg-white rounded-lg shadow-sm border border-gray-200 p-2">
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-2 rounded-lg ${showGrid ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}
            title="Toggle Grid"
          >
            {showGrid ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
        </div>
        
        <div className="flex items-center gap-2 bg-white rounded-lg shadow-sm border border-gray-200 p-2">
          <input
            type="text"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            className="px-2 py-1 text-sm border border-gray-300 rounded w-40"
            placeholder="Workflow name"
          />
          <button
            onClick={() => setShowLoadDialog(true)}
            className="flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            title="Load Workflow"
          >
            <FolderOpen size={16} />
          </button>
          <button
            onClick={saveWorkflow}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            title="Save Workflow"
          >
            <Save size={16} />
            Save
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
            title="Import Workflow"
          >
            <Upload size={16} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={importWorkflowFromFile}
            className="hidden"
          />
          <button
            onClick={exportWorkflow}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            title="Export Workflow"
          >
            <Download size={16} />
          </button>
          <button
            onClick={clearCanvas}
            className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            title="Clear Canvas"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Load Workflow Dialog */}
      {showLoadDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Load Workflow</h3>
              <button onClick={() => setShowLoadDialog(false)}>
                <X size={20} />
              </button>
            </div>
            {savedWorkflows.length === 0 ? (
              <p className="text-gray-500">No saved workflows found.</p>
            ) : (
              <div className="space-y-2">
                {savedWorkflows.map((workflow) => (
                  <div
                    key={workflow.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div>
                      <div className="font-medium">{workflow.name}</div>
                      <div className="text-sm text-gray-500">
                        {workflow.nodes?.length || 0} nodes, {workflow.connections?.length || 0} connections
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => loadWorkflow(workflow)}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Delete this workflow?')) {
                            deletePersistedWorkflow(workflow.id)
                            const workflows = loadWorkflows()
                            setSavedWorkflows(workflows)
                          }
                        }}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col">
        <div className="flex-1 flex">
          {/* Component Palette */}
          <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
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
              className="w-full h-full relative"
              style={{
                backgroundImage: showGrid 
                  ? 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)' 
                  : 'none',
                backgroundSize: '20px 20px'
              }}
              onClick={handleCanvasClick}
              onDrop={(e) => {
                e.preventDefault()
                e.stopPropagation()
                
                // Only handle drops from sidebar (new components)
                try {
                  const data = e.dataTransfer.getData('application/json')
                  if (!data) {
                    console.debug('Drop handler: no data')
                    return
                  }
                  
                  const type = JSON.parse(data)
                  if (!type || !type.id) {
                    console.debug('Drop handler: invalid type data')
                    return // Invalid data, might be from node drag
                  }
                  
                  const rect = canvasRef.current?.getBoundingClientRect()
                  if (!rect) {
                    console.error('Canvas rect not available')
                    return
                  }
                  
                  const x = e.clientX - rect.left
                  const y = e.clientY - rect.top
                  addNode(type, x, y)
                } catch (err) {
                  // Ignore invalid drops (like from dragging nodes)
                  console.debug('Drop handler error:', err.message)
                }
              }}
              onDragOver={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
            >
              {/* SVG for Connections */}
              <svg 
                className="absolute inset-0 pointer-events-none" 
                style={{ zIndex: 1, width: '100%', height: '100%' }}
              >
                {connections.map((conn) => {
                  const fromNode = nodes.find(n => n.id === conn.from)
                  const toNode = nodes.find(n => n.id === conn.to)
                  if (!fromNode || !toNode) return null
                  
                  return (
                    <g key={conn.id}>
                      <path
                        d={getConnectionPath(fromNode, toNode)}
                        stroke="#3B82F6"
                        strokeWidth="2"
                        fill="none"
                        markerEnd="url(#arrowhead)"
                      />
                    </g>
                  )
                })}
                
                {/* Temporary connection line while dragging */}
                {connectingDrag && (() => {
                  const fromX = connectingDrag.fromX
                  const fromY = connectingDrag.fromY
                  const toX = connectingDrag.toX
                  const toY = connectingDrag.toY
                  const midY = (fromY + toY) / 2
                  const path = `M ${fromX} ${fromY} C ${fromX} ${midY} ${toX} ${midY} ${toX} ${toY}`
                  
                  // Debug: log path occasionally
                  if (Math.random() < 0.05) {
                    console.log('Rendering connection line:', { fromX, fromY, toX, toY, path })
                  }
                  
                  return (
                    <g key="temp-connection">
                      <path
                        d={path}
                        stroke="#10B981"
                        strokeWidth="3"
                        strokeDasharray="8,4"
                        fill="none"
                        markerEnd="url(#arrowhead-temp)"
                        style={{ 
                          pointerEvents: 'none',
                          opacity: 0.8,
                          filter: 'drop-shadow(0 0 2px rgba(16, 185, 129, 0.5))'
                        }}
                      />
                    </g>
                  )
                })()}
                
                <defs>
                  <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                    <polygon points="0 0, 10 3, 0 6" fill="#3B82F6" />
                  </marker>
                  <marker id="arrowhead-temp" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                    <polygon points="0 0, 10 3, 0 6" fill="#10B981" />
                  </marker>
                </defs>
              </svg>

              {/* Render Nodes */}
              {nodes && nodes.length > 0 && nodes.map((node) => {
                if (!node || !node.id) return null
                
                const IconComponent = node.icon || Zap
                return (
                  <div
                    key={node.id}
                    data-node-id={node.id}
                    className={`absolute border-2 rounded-lg p-3 cursor-move min-w-[120px] min-h-[80px] flex flex-col items-center justify-center ${
                      selectedNode?.id === node.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : connectingFrom === node.id
                        ? 'border-green-500 bg-green-50'
                        : draggingNode?.id === node.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-300 bg-white hover:border-gray-400'
                    }`}
                    style={{
                      left: node.x,
                      top: node.y,
                      width: node.width,
                      height: node.height,
                      zIndex: selectedNode?.id === node.id || draggingNode?.id === node.id ? 10 : 2,
                      userSelect: 'none',
                      WebkitUserSelect: 'none',
                      msUserSelect: 'none'
                    }}
                    onClick={(e) => handleNodeClick(node, e)}
                    onMouseDown={(e) => {
                      // Don't start node drag if we're connecting
                      if (isConnectingRef.current) {
                        return
                      }
                      // Don't start node drag if clicking on connection button
                      if (e.target.closest('.connection-handle')) {
                        return
                      }
                      // Only start drag on left mouse button
                      if (e.button === 0) {
                        handleNodeDragStart(node, e)
                      }
                    }}
                    draggable={false}
                  >
                    <div className={`p-2 rounded-lg ${node.color} text-white mb-2`}>
                      <IconComponent size={20} />
                    </div>
                    <div className="text-xs font-medium text-gray-900 text-center mb-1">{node.name}</div>
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        console.log('Connection handle mousedown', e)
                        e.stopPropagation()
                        e.preventDefault()
                        handleConnectionDragStart(node, e)
                      }}
                      onMouseUp={(e) => {
                        e.stopPropagation()
                        e.preventDefault()
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        e.preventDefault()
                        console.log('Connection handle clicked (fallback)')
                        // Fallback: use click-to-connect
                        startConnection(node.id, e)
                      }}
                      className="connection-handle mt-1 p-1.5 hover:bg-blue-100 rounded-full cursor-crosshair flex items-center justify-center border-2 border-blue-300 bg-blue-50 transition-colors z-20 relative"
                      title="Drag to connect to another node"
                      style={{ pointerEvents: 'auto', zIndex: 20, touchAction: 'none' }}
                    >
                      <Plus size={14} className="text-blue-600 pointer-events-none" />
                    </button>
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
                      <span>Click and drag nodes to move them</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Properties Panel */}
          {selectedNode && (
            <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-700">Properties</h3>
                <button onClick={() => setSelectedNode(null)}>
                  <X size={16} className="text-gray-400" />
                </button>
              </div>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Settings size={14} className="inline mr-1" />
                    Configuration
                  </label>
                  {getNodeConfigForm(selectedNode)}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Connections</label>
                  <div className="space-y-2">
                    {connections.filter(c => c.from === selectedNode.id || c.to === selectedNode.id).map((conn) => {
                      const otherNode = nodes.find(n => 
                        n.id === (conn.from === selectedNode.id ? conn.to : conn.from)
                      )
                      return (
                        <div key={conn.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm text-gray-700">
                            {conn.from === selectedNode.id ? '→' : '←'} {otherNode?.name || 'Unknown'}
                          </span>
                          <button
                            onClick={() => deleteConnection(conn.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      )
                    })}
                    {connections.filter(c => c.from === selectedNode.id || c.to === selectedNode.id).length === 0 && (
                      <p className="text-sm text-gray-500">No connections</p>
                    )}
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
                  <span>Click to load template</span>
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
