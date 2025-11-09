import React, { useState, useEffect, useRef } from 'react'
import { 
  FileText,
  Navigation2,
  CheckCircle,
  Clock, 
  ChevronDown,
  ChevronUp,
  BarChart3,
  Zap,
  Play,
  Loader2,
  Upload,
  Sparkles,
  Brain,
  Settings,
  MessageSquare,
  MoreVertical,
  RefreshCw,
  FileCheck,
  Truck,
  Bot,
  FileBarChart,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Timer,
  Activity,
  Lightbulb,
  History,
  X,
  Send,
  Info,
  Mail,
  MailCheck
} from 'lucide-react'
import { PHASES_CONFIG, SHIPMENT_PHASES, getPhaseLabel, getStatusLabel, getStatusColor } from '../../types/Phases.js'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, ComposedChart } from 'recharts'
import { motion, AnimatePresence } from 'framer-motion'
import CountUp from 'react-countup'

const API_BASE = '/api'

// ============================================================================
// Animation Variants
// ============================================================================

const actionItemVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0 }
}

// ============================================================================
// Helper Functions
// ============================================================================

const getRoleIcon = (role) => {
  if (role.includes('Document') || role.includes('Arrival')) return FileText
  if (role.includes('Route') || role.includes('ETA')) return Navigation2
  return FileText
}

const getRoleColor = (role) => {
  if (role.includes('Document') || role.includes('Arrival')) return 'from-blue-500 to-indigo-600'
  if (role.includes('Route') || role.includes('ETA')) return 'from-green-500 to-emerald-600'
  return 'from-gray-500 to-gray-600'
}

// Get agent accent color and initials
const getAgentAccent = (name) => {
  if (name.includes('FreightBot') || name.includes('Alpha')) {
    return {
      color: '#2563EB',
      borderColor: 'border-l-primary',
      bgColor: 'bg-primary/5',
      initials: 'FA'
    }
  }
  if (name.includes('RouteMaster') || name.includes('Pro')) {
    return {
      color: '#16A34A',
      borderColor: 'border-l-success',
      bgColor: 'bg-success/5',
      initials: 'RP'
    }
  }
  return {
    color: '#6B7280',
    borderColor: 'border-l-gray-400',
    bgColor: 'bg-gray-50',
    initials: 'AI'
  }
}

// ============================================================================
// Components
// ============================================================================

// Mock data generators for new features
const generateInsights = (employee) => {
  if (employee.id === 'AI-EMP-001') {
    return [
      { icon: '🔍', text: 'Detected duplicate arrival notices — skipped 4 documents.' },
      { icon: '⚡', text: 'Achieved 99.1% OCR accuracy this week.' },
      { icon: '🧠', text: 'Suggests consolidating Hamburg & Bremen routes for 12% efficiency gain.' }
    ]
  }
  return [
    { icon: '🚀', text: 'Optimized 15 routes based on real-time port congestion data.' },
    { icon: '📊', text: 'ETA accuracy improved to 96.4% over last 7 days.' },
    { icon: '💡', text: 'Identified 3 high-priority shipments requiring immediate attention.' }
  ]
}

const generateReasoning = (employee) => {
  if (employee.id === 'AI-EMP-001') {
    return [
      'Extracted carrier name from PDF header → matched vessel database → validated ETA against port schedule.',
      'Parsed container number using OCR → cross-referenced with shipping manifest → confirmed customs status.',
      'Detected duplicate document signature → skipped processing → logged for operator review.'
    ]
  }
  return [
    'Analyzed port congestion API → calculated delay impact → updated 15 ETAs with 96% confidence.',
    'Cross-referenced weather data → adjusted route timing → optimized for fuel efficiency.',
    'Detected pattern in carrier delays → applied predictive adjustment → improved accuracy by 2.3%.'
  ]
}

/**
 * @param {{ employee: any, onAction: (action: string) => void, onFileUpload: () => void }} props
 */
function EmployeeCard({ employee, onAction, onFileUpload }) {
  const [showInsights, setShowInsights] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [showReasoning, setShowReasoning] = useState(false)
  const [showPerformanceLogs, setShowPerformanceLogs] = useState(false)
  const [showConfigure, setShowConfigure] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showOverride, setShowOverride] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [taskProgress, setTaskProgress] = useState(0)
  const [chatQuery, setChatQuery] = useState('')
  const [chatResponse, setChatResponse] = useState('')
  const [isChatLoading, setIsChatLoading] = useState(false)
  const fileInputRef = React.useRef(null)
  const chatInputRef = React.useRef(null)
  const Icon = getRoleIcon(employee.role)
  
  // Mock metrics
  const metrics = {
    avgResponseTime: '3.1s',
    automationRate: 92,
    costSavings: 12480,
    lastSync: '2m ago'
  }
  
  // Mock task progress
  useEffect(() => {
    if (isLoading || isUploading) {
      const interval = setInterval(() => {
        setTaskProgress(prev => {
          if (prev >= 90) return prev
          return prev + Math.random() * 15
        })
      }, 500)
      return () => clearInterval(interval)
    } else {
      setTaskProgress(0)
    }
  }, [isLoading, isUploading])
  
  const insights = generateInsights(employee)
  const reasoning = generateReasoning(employee)
  
  // Track previous values for CountUp animation
  const prevValuesRef = useRef({
    tasksCompleted: employee.tasksCompleted || 0,
    successRate: employee.successRate || 0,
    workQueue: employee.workQueue || 0,
    efficiency: employee.efficiency || 0
  })
  
  // Update previous values when employee data changes
  useEffect(() => {
    prevValuesRef.current = {
      tasksCompleted: employee.tasksCompleted || 0,
      successRate: employee.successRate || 0,
      workQueue: employee.workQueue || 0,
      efficiency: employee.efficiency || 0
    }
  }, [employee.tasksCompleted, employee.successRate, employee.workQueue, employee.efficiency])
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMenu && !event.target.closest('.menu-container')) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showMenu])
  
  const handleChatSubmit = async (e) => {
    e.preventDefault()
    if (!chatQuery.trim()) return
    
    setIsChatLoading(true)
    setChatResponse('')
    
    // Simulate API call
    setTimeout(() => {
      const responses = {
        'how many': `Processed ${employee.tasksCompleted} documents today with ${employee.successRate}% success rate.`,
        'confidence': `Current confidence on active task: ${employee.modelConfidence || 98.4}%. Based on OCR accuracy and data validation.`,
        'delayed': 'Found 3 shipments with delays >3h. MAEU1234567, TCLU9876543, and MSCU4567890. All flagged for operator review.',
        'default': `I've processed ${employee.tasksCompleted} tasks today. My current operation is: ${employee.currentTask}. How can I help?`
      }
      
      const query = chatQuery.toLowerCase()
      let response = responses.default
      if (query.includes('how many') || query.includes('process')) response = responses['how many']
      else if (query.includes('confidence')) response = responses.confidence
      else if (query.includes('delay') || query.includes('delayed')) response = responses.delayed
      
      setChatResponse(response)
      setIsChatLoading(false)
      setChatQuery('')
    }, 1000)
  }

  const handleAction = async (actionType) => {
    setIsLoading(true)
    try {
      await onAction(actionType)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
    if (!allowedTypes.includes(file.type)) {
      alert('Invalid file type. Please upload a PDF or image file.')
      return
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size too large. Maximum size is 10MB.')
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`${API_BASE}/ai-events/arrival-notice-upload`, {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.ok) {
        // Success - refetch data
        await onFileUpload()
      } else {
        // Error
        alert(`Upload failed: ${data.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert(`Upload failed: ${error.message || 'Network error'}`)
    } finally {
      setIsUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const agentAccent = getAgentAccent(employee.name)
  const confidence = employee.modelConfidence || 98.4
  const nextRun = employee.id === 'AI-EMP-001' ? '12m' : '8m'
  const taskSource = employee.id === 'AI-EMP-001' ? '/uploads/arrival_notices/' : 'Port congestion API'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`bg-white dark:bg-gray-900 border-l-4 ${agentAccent.borderColor} border-t border-r border-b border-gray-200 dark:border-gray-800 rounded-2xl shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_0_rgba(0,0,0,0.06)] hover:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] hover:scale-[1.01] transition-all duration-200 relative group`}
    >
      {/* Header with Status */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4 flex-1">
            {/* Agent Avatar */}
            <div 
              className={`w-14 h-14 rounded-xl ${agentAccent.bgColor} border-2 cursor-pointer hover:scale-105 transition-transform`} 
              style={{ borderColor: agentAccent.color }}
              onClick={() => setShowHistory(true)}
            >
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-lg font-bold" style={{ color: agentAccent.color }}>
                  {agentAccent.initials}
                </span>
            </div>
            </div>
            <div className="flex-1">
              <h3 
                className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-1 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setShowHistory(true)}
              >
                {employee.name}
                <Sparkles className="w-4 h-4" style={{ color: agentAccent.color }} />
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide">{employee.role}</p>
          </div>
          </div>
          
          {/* Right side: Role Summary + Menu */}
          <div className="flex items-start gap-2">
            {/* Role Summary Box */}
            <div className="hidden lg:block text-right text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 max-w-[180px]">
              <div className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                {employee.id === 'AI-EMP-001' ? 'Document Parser' : 'Route Optimizer'}
              </div>
              <div>GPT-4-Turbo</div>
              <div className="text-[10px] mt-1">Updated: {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
            
            {/* ACTIVE Badge */}
            <motion.span 
              animate={{ opacity: [1, 0.7, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="px-3 py-1 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-full text-[10px] font-semibold uppercase tracking-wide shadow-sm"
            >
            ACTIVE
            </motion.span>
            
            {/* Header Menu */}
            <div className="relative menu-container">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <MoreVertical className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </button>
              
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 top-10 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 py-2"
                >
                  <button
                    onClick={() => { setShowReasoning(true); setShowMenu(false); }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <Brain className="w-4 h-4" />
                    View Reasoning
                  </button>
                  <button
                    onClick={() => { setShowPerformanceLogs(true); setShowMenu(false); }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <BarChart3 className="w-4 h-4" />
                    Performance Logs
                  </button>
                  <button
                    onClick={() => { setShowConfigure(true); setShowMenu(false); }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    Configure Role
                  </button>
                  <button
                    onClick={() => { setShowChat(true); setShowMenu(false); }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Ask Agent
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Active Operation - Enhanced */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide">Active Operation</span>
          </div>
          <div className="relative overflow-hidden bg-bg-highlight dark:bg-bg-highlight-dark rounded-lg p-4 border border-gray-100 dark:border-gray-800">
            {/* Shimmer animation overlay */}
            <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent"></div>
            <div className="relative">
              <p className="text-base font-medium text-gray-900 dark:text-white leading-relaxed mb-3">
            {employee.currentTask}
          </p>
              
              {/* Progress Bar */}
              {(isLoading || isUploading) && (
                <div className="mb-3">
                  <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(taskProgress, 100)}%` }}
                      className="h-full bg-primary rounded-full"
                    />
        </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {Math.round(taskProgress)}% complete
                  </div>
                </div>
              )}
              
              {/* Metadata Row */}
              <div className="flex items-center gap-4 flex-wrap text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <span className="font-medium">Confidence:</span>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">{confidence}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Next check: in {nextRun}</span>
                </div>
                <div className="flex items-center gap-1 group/explain relative">
                  <Info className="w-3 h-3 cursor-help" />
                  <span>Source: {taskSource}</span>
                  <div className="absolute left-0 top-6 w-64 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-lg p-2 opacity-0 group-hover/explain:opacity-100 transition-opacity pointer-events-none z-10">
                    Data source that triggered this operation
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons - Two Levels */}
        <div className="mb-6 space-y-3">
          {/* Quick Actions */}
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Quick Actions</div>
            <div className="grid grid-cols-2 gap-2">
          {employee.id === 'AI-EMP-001' && (
            <>
              <button
                onClick={() => handleAction('arrival-notice')}
                disabled={isLoading || isUploading}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 text-gray-700 dark:text-gray-300 rounded-lg transition-colors text-sm font-medium"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Refresh Data
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={handleUploadClick}
                disabled={isLoading || isUploading}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 text-gray-700 dark:text-gray-300 rounded-lg transition-colors text-sm font-medium"
              >
                {isUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <FileCheck className="w-4 h-4" />
                    )}
                    Upload Notice
                  </button>
                </>
              )}
              {employee.id === 'AI-EMP-002' && (
                <>
                  <button
                    onClick={() => handleAction('update-eta')}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 text-gray-700 dark:text-gray-300 rounded-lg transition-colors text-sm font-medium"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Refresh Data
                  </button>
                  <button
                    disabled
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 text-gray-700 dark:text-gray-300 rounded-lg transition-colors text-sm font-medium"
                  >
                    <Truck className="w-4 h-4" />
                    Sync Carrier API
                  </button>
                  </>
                )}
            </div>
          </div>
          
          {/* AI Actions */}
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">AI Actions</div>
            <div className="grid grid-cols-2 gap-2">
              {employee.id === 'AI-EMP-001' && (
                <>
                  <button
                    onClick={() => handleAction('arrival-notice')}
                    disabled={isLoading || isUploading}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-primary hover:bg-primary-dark disabled:bg-primary/50 text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                    Re-analyze Shipments
                  </button>
                  <button
                    disabled
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-primary/80 hover:bg-primary-dark disabled:opacity-50 text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    <FileBarChart className="w-4 h-4" />
                    Generate Report
              </button>
            </>
          )}
          {employee.id === 'AI-EMP-002' && (
                <>
            <button
              onClick={() => handleAction('update-eta')}
              disabled={isLoading}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-success hover:bg-success-dark disabled:bg-success/50 text-white rounded-lg transition-colors text-sm font-medium"
            >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Navigation2 className="w-4 h-4" />
                    )}
                    Optimize Route Plan
            </button>
                  <button
                    disabled
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-success/80 hover:bg-success-dark disabled:opacity-50 text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    <FileBarChart className="w-4 h-4" />
                    Generate Report
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Key Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Tasks Executed</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              <CountUp
                key={`tasks-${employee.id}-${employee.tasksCompleted}`}
                start={prevValuesRef.current.tasksCompleted}
                end={employee.tasksCompleted || 0}
                duration={0.5}
                enableScrollSpy={false}
              />
          </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Success Rate</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              <CountUp
                key={`success-${employee.id}-${employee.successRate}`}
                start={prevValuesRef.current.successRate}
                end={employee.successRate || 0}
                duration={0.5}
                decimals={1}
                suffix="%"
                enableScrollSpy={false}
              />
          </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Pending Jobs</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              <CountUp
                key={`queue-${employee.id}-${employee.workQueue}`}
                start={prevValuesRef.current.workQueue}
                end={employee.workQueue || 0}
                duration={0.5}
                enableScrollSpy={false}
              />
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Operational Efficiency</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              <CountUp
                key={`efficiency-${employee.id}-${employee.efficiency}`}
                start={prevValuesRef.current.efficiency}
                end={employee.efficiency || 0}
                duration={0.5}
                decimals={1}
                suffix="%"
                enableScrollSpy={false}
              />
          </div>
        </div>
      </div>

        {/* Live Metrics Footer */}
        <div className="grid grid-cols-3 gap-3 mb-4 pt-4 border-t border-gray-200 dark:border-gray-800">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-1">
              <Timer className="w-3 h-3" />
              <span>Avg Response</span>
            </div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">{metrics.avgResponseTime}</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-1">
              <Activity className="w-3 h-3" />
              <span>Automation</span>
            </div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">{metrics.automationRate}%</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-1">
              <DollarSign className="w-3 h-3" />
              <span>Cost Savings</span>
            </div>
            <div className="text-sm font-semibold text-success">${metrics.costSavings.toLocaleString()}</div>
          </div>
        </div>
        
        {/* Insights Feed */}
        <div className="mb-4">
        <button
            onClick={() => setShowInsights(!showInsights)}
            className="w-full flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors mb-2"
          >
            <span className="flex items-center gap-1">
              <Lightbulb className="w-3 h-3" />
              Insights
            </span>
            {showInsights ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          {showInsights && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-2"
            >
              {insights.map((insight, idx) => (
                <div key={idx} className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
                  <span className="mr-2">{insight.icon}</span>
                  {insight.text}
                </div>
              ))}
            </motion.div>
          )}
        </div>
        
        {/* Learning Mode Badge */}
        {employee.id === 'AI-EMP-001' && (
          <div className="mb-4 text-xs text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 flex items-center gap-2">
            <span>🧩</span>
            <span>Learning from 12 new samples to improve extraction accuracy.</span>
          </div>
        )}
      </div>

      {/* Footer: Last Sync + Override + View History */}
      <div className="border-t border-gray-200 dark:border-gray-800">
        <div className="px-6 py-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Last sync: {metrics.lastSync}</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowOverride(true)}
              className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-gray-700 dark:hover:text-gray-300"
            >
              Override
        </button>
            <button
              onClick={() => setShowHistory(true)}
              className="hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1"
            >
              <History className="w-3 h-3" />
              View History
            </button>
          </div>
        </div>
      </div>
      
      {/* Modals and Panels */}
      
      {/* Reasoning Panel */}
      {showReasoning && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowReasoning(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Brain className="w-5 h-5" />
                AI Reasoning: Last 3 Actions
              </h3>
              <button onClick={() => setShowReasoning(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {reasoning.map((step, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                    {idx + 1}
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 flex-1">{step}</p>
                </div>
              ))}
            </div>
          </motion.div>
              </div>
            )}
      
      {/* Performance Logs Panel */}
      {showPerformanceLogs && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowPerformanceLogs(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-2xl w-full"
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Performance Logs (7-day)
              </h3>
              <button onClick={() => setShowPerformanceLogs(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={[
                  { day: 'Mon', success: 96.2, efficiency: 91.5 },
                  { day: 'Tue', success: 97.1, efficiency: 93.2 },
                  { day: 'Wed', success: 98.0, efficiency: 94.8 },
                  { day: 'Thu', success: 97.5, efficiency: 95.1 },
                  { day: 'Fri', success: 98.7, efficiency: 96.0 },
                  { day: 'Sat', success: 98.9, efficiency: 95.5 },
                  { day: 'Sun', success: 99.1, efficiency: 96.2 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" className="dark:stroke-gray-700" />
                  <XAxis dataKey="day" stroke="#6B7280" className="dark:stroke-gray-400" />
                  <YAxis stroke="#6B7280" className="dark:stroke-gray-400" />
                  <Tooltip />
                  <Line type="monotone" dataKey="success" stroke="#16A34A" strokeWidth={2} name="Success Rate %" />
                  <Line type="monotone" dataKey="efficiency" stroke="#2563EB" strokeWidth={2} name="Efficiency %" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
              </div>
            )}
      
      {/* Configure Role Modal */}
      {showConfigure && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowConfigure(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-lg w-full"
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configure Role
              </h3>
              <button onClick={() => setShowConfigure(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Role Description</label>
                <textarea
                  defaultValue={employee.id === 'AI-EMP-001' 
                    ? 'Auto-parse arrival notices every 30 min. Extract container numbers, carrier info, and customs data.'
                    : 'Monitor port congestion and update ETAs every 15 min. Optimize routes based on real-time data.'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Trigger Rules</label>
                <input
                  type="text"
                  defaultValue={employee.id === 'AI-EMP-001' ? 'New file in /uploads/arrival_notices/' : 'Port API update detected'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Confidence Threshold</label>
                <input
                  type="number"
                  defaultValue="95"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
                />
              </div>
              <button className="w-full px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-colors">
                Save Configuration
              </button>
            </div>
          </motion.div>
              </div>
            )}
      
      {/* Chat Panel */}
      {showChat && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowChat(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-md w-full h-[500px] flex flex-col"
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Ask {employee.name}</h3>
              <button onClick={() => setShowChat(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
              {chatResponse ? (
                <div className="bg-bg-highlight dark:bg-bg-highlight-dark rounded-lg p-3 text-sm text-gray-700 dark:text-gray-300">
                  {chatResponse}
                </div>
              ) : (
                <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                  Ask {employee.name} anything about their operations
              </div>
            )}
            </div>
            <form onSubmit={handleChatSubmit} className="p-4 border-t border-gray-200 dark:border-gray-800">
              <div className="flex gap-2">
                <input
                  ref={chatInputRef}
                  type="text"
                  value={chatQuery}
                  onChange={(e) => setChatQuery(e.target.value)}
                  placeholder="How many docs did you process today?"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
                />
                <button
                  type="submit"
                  disabled={isChatLoading}
                  className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {isChatLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </form>
          </motion.div>
              </div>
            )}
      
      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowHistory(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <History className="w-5 h-5" />
                {employee.name} - Action History
              </h3>
              <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{employee.tasksCompleted}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Total Actions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">3.1s</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Avg Completion</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">2</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Errors</div>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Top 3 Recurring Tasks</h4>
                <div className="space-y-2">
                  {['Parse arrival notice', 'Extract container data', 'Validate customs info'].map((task, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
                      <span className="text-gray-700 dark:text-gray-300">{task}</span>
                      <span className="text-gray-500 dark:text-gray-400">{Math.floor(Math.random() * 50) + 20}x</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Recent Timeline</h4>
                <div className="space-y-2">
                  {Array.from({ length: 10 }).map((_, idx) => (
                    <div key={idx} className="flex gap-3 text-sm">
                      <span className="text-gray-500 dark:text-gray-400 font-mono text-xs w-16">
                        {new Date(Date.now() - idx * 60000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-gray-700 dark:text-gray-300 flex-1">
                        {idx === 0 ? employee.currentTask : `Completed task #${employee.tasksCompleted - idx}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
          </div>
        )}
      
      {/* Override Modal */}
      {showOverride && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowOverride(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-lg w-full"
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                Operator Override
              </h3>
              <button onClick={() => setShowOverride(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <X className="w-5 h-5" />
              </button>
      </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Field to Override</label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm">
                  <option>ETA</option>
                  <option>Container Number</option>
                  <option>Carrier</option>
                  <option>Port</option>
                </select>
    </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">New Value</label>
                <input
                  type="text"
                  placeholder="Enter corrected value"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Reason</label>
                <textarea
                  placeholder="Why are you overriding this value?"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
                  rows={3}
                />
              </div>
              <button className="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-medium transition-colors">
                Apply Override
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}

// Ops AI Card Component
function OpsAICard({ shipments, employees, onPhaseSelect, selectedPhase, actions = [] }) {
  // Calculate phase counts
  const phaseCounts = PHASES_CONFIG.reduce((acc, phase) => {
    acc[phase.id] = shipments.filter(s => s.currentPhase === phase.id).length
    return acc
  }, {})
  
  // Calculate compliance issues count
  const complianceIssuesCount = shipments.filter(
    s => s.currentPhase === 'compliance' && s.complianceStatus === 'issues'
  ).length
  
  // Aggregate metrics from all employees
  const totalTasks = employees.reduce((sum, e) => sum + (e.tasksCompleted || 0), 0)
  const avgSuccessRate = employees.length > 0
    ? Math.round(employees.reduce((sum, e) => sum + (e.successRate || 0), 0) / employees.length)
    : 0
  const totalQueue = employees.reduce((sum, e) => sum + (e.workQueue || 0), 0)
  const avgEfficiency = employees.length > 0
    ? Math.round(employees.reduce((sum, e) => sum + (e.efficiency || 0), 0) / employees.length)
    : 0

  // Find last email-processed action
  const lastEmailAction = actions.find(a => 
    a.message && a.message.includes('from email') && a.phase === 'intake'
  )
  
  const formatLastEmailTime = (action) => {
    if (!action) return null
    const date = new Date(action.createdAt)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    
    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  // Email status hook
  const [emailStatus, setEmailStatus] = useState(null)

  useEffect(() => {
    let cancelled = false

    const fetchEmailStatus = async () => {
      try {
        const response = await fetch(`${API_BASE}/email/status`)
        if (response.ok) {
          const data = await response.json()
          if (!cancelled) {
            setEmailStatus(data)
          }
        }
      } catch (error) {
        console.error('Failed to fetch email status:', error)
        if (!cancelled) {
          setEmailStatus(prev => ({ ...(prev || {}), connected: false }))
        }
      }
    }

    // Fetch immediately
    fetchEmailStatus()

    // Poll every 10 seconds
    const interval = setInterval(fetchEmailStatus, 10000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative bg-white dark:bg-gray-900 border-l-4 border-l-primary border-t border-r border-b border-gray-200 dark:border-gray-800 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.08),0_1px_4px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.06)] transition-all duration-300 overflow-hidden group"
    >
      {/* Glowing background effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="relative p-8">
        {/* Header - Enhanced */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/30 blur-2xl rounded-2xl animate-pulse"></div>
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-primary via-primary to-primary-dark flex items-center justify-center shadow-lg border-2 border-primary/20">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"></div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3 mb-1">
                Ops AI
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  <Sparkles className="w-5 h-5 text-primary" />
                </motion.div>
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">End-to-end shipment lifecycle automation</p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Activity className="w-3 h-3" />
                  GPT-4 Turbo
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">•</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Real-time processing</span>
                {emailStatus && (
                  <>
                    <span className="text-xs text-gray-500 dark:text-gray-400">•</span>
                    <div className="flex items-center gap-2">
                      <span
                        className={
                          emailStatus.connected
                            ? "inline-flex items-center rounded-full bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-400"
                            : "inline-flex items-center rounded-full bg-rose-50 dark:bg-rose-900/30 px-2 py-0.5 text-[10px] font-medium text-rose-700 dark:text-rose-400"
                        }
                      >
                        {emailStatus.connected ? (
                          <>
                            <motion.span
                              animate={{ opacity: [1, 0.5, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="mr-1"
                            >
                              ●
                            </motion.span>
                            Gmail: Online
                            {emailStatus.imapUser ? ` (${emailStatus.imapUser})` : ""}
                          </>
                        ) : (
                          <>● Gmail: Offline</>
                        )}
                      </span>
                      {emailStatus.connected && emailStatus.lastPollAt && (
                        <span className="text-[10px] text-gray-500 dark:text-gray-400">
                          {(() => {
                            const lastPoll = new Date(emailStatus.lastPollAt)
                            const now = new Date()
                            const diffMs = now - lastPoll
                            const diffSecs = Math.floor(diffMs / 1000)
                            if (diffSecs < 60) return `${diffSecs}s ago`
                            const diffMins = Math.floor(diffSecs / 60)
                            return `${diffMins}m ago`
                          })()}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          <motion.div
            animate={{ 
              boxShadow: [
                '0 0 0 0 rgba(16, 185, 129, 0.4)',
                '0 0 0 8px rgba(16, 185, 129, 0)',
                '0 0 0 0 rgba(16, 185, 129, 0)'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="relative"
          >
            <motion.span 
              animate={{ opacity: [1, 0.8, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="relative px-4 py-2 bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 text-white rounded-full text-xs font-bold uppercase tracking-wider shadow-lg"
            >
              <span className="relative z-10">ACTIVE</span>
              <div className="absolute inset-0 bg-emerald-400 rounded-full blur-md opacity-50 animate-pulse"></div>
            </motion.span>
          </motion.div>
        </div>

        {/* Phase Pipeline - Enhanced */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <div className="w-1 h-4 bg-primary rounded-full"></div>
              Shipment Pipeline
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{shipments.length} total</span>
              {lastEmailAction && (
                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  Last email: {formatLastEmailTime(lastEmailAction)}
                </span>
              )}
            </div>
          </div>
          <div className="grid grid-cols-5 gap-2 relative">
            {/* Connecting flow lines between stages */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-purple-200 via-yellow-200 to-green-200 dark:from-blue-800 dark:via-purple-800 dark:via-yellow-800 dark:to-green-800 opacity-30 -translate-y-1/2 pointer-events-none" style={{ marginLeft: '8%', marginRight: '8%' }}></div>
            
            {PHASES_CONFIG.map((phase, idx) => {
              const count = phaseCounts[phase.id] || 0
              const isSelected = selectedPhase === phase.id
              const hasIssues = phase.id === 'compliance' && complianceIssuesCount > 0
              const percentage = shipments.length > 0 ? (count / shipments.length) * 100 : 0
              const nextPhase = PHASES_CONFIG[idx + 1]
              
              return (
                <div key={phase.id} className="relative flex items-center">
                  <motion.button
                    onClick={() => onPhaseSelect(phase.id)}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative flex flex-col rounded-2xl border-2 px-4 py-4 text-left transition-all duration-300 overflow-hidden w-full ${
                      isSelected
                        ? `${phase.borderColor} ${phase.bgColor} border-opacity-100 shadow-lg shadow-${phase.color}-500/20`
                        : 'border-gray-200 dark:border-gray-700 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md'
                    }`}
                  >
                    {/* Progress bar at bottom */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100 dark:bg-gray-700">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.8, delay: idx * 0.1 }}
                        className={`h-full bg-gradient-to-r ${phase.color === 'blue' ? 'from-blue-500 to-blue-600' : 
                          phase.color === 'purple' ? 'from-purple-500 to-purple-600' :
                          phase.color === 'yellow' ? 'from-yellow-500 to-yellow-600' :
                          phase.color === 'green' ? 'from-green-500 to-green-600' :
                          'from-indigo-500 to-indigo-600'}`}
                      />
                    </div>
                  
                  <div className={`text-[10px] font-bold uppercase tracking-widest mb-2 relative z-10 ${
                    isSelected ? `${phase.textColor} font-extrabold` : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {phase.label}
                  </div>
                  <div className="flex items-baseline gap-2 mb-1 relative z-10">
                    <div className={`text-2xl font-bold ${
                      isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-800 dark:text-gray-200'
                    }`}>
                      {count}
                    </div>
                    {hasIssues && (
                      <motion.span 
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="text-xs font-semibold text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-0.5 rounded-full"
                      >
                        {complianceIssuesCount} ⚠
                      </motion.span>
                    )}
                  </div>
                  <div className={`text-[10px] font-medium relative z-10 ${
                    isSelected ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    shipments
                  </div>
                  
                    {/* Glow effect when selected - behind content */}
                    {isSelected && (
                      <div className={`absolute inset-0 bg-gradient-to-br from-${phase.color}-500/10 to-transparent pointer-events-none z-0`}></div>
                    )}
                  </motion.button>
                  
                  {/* Arrow connector to next phase */}
                  {nextPhase && idx < PHASES_CONFIG.length - 1 && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10">
                      <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${
                        phase.color === 'blue' ? 'from-blue-200 to-purple-200' :
                        phase.color === 'purple' ? 'from-purple-200 to-yellow-200' :
                        phase.color === 'yellow' ? 'from-yellow-200 to-green-200' :
                        'from-green-200 to-indigo-200'
                      } dark:from-gray-700 dark:to-gray-700 flex items-center justify-center`}>
                        <ChevronDown className="w-2 h-2 text-gray-600 dark:text-gray-400 rotate-[-90deg]" />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
        
        {/* Compliance Issues Summary */}
        {complianceIssuesCount > 0 && (
          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-yellow-700 dark:text-yellow-400 font-medium">
                Compliance issues: {complianceIssuesCount} shipment{complianceIssuesCount !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        )}

        {/* Metrics Grid - Enhanced */}
        <div className="grid grid-cols-4 gap-4">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 rounded-xl p-5 border border-blue-200/50 dark:border-blue-800/50 hover:shadow-lg transition-all duration-300 group overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors"></div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 dark:bg-blue-500/30 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Tasks Executed</div>
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{totalTasks}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">+12%</span>
                <span className="text-gray-400">vs last week</span>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/10 rounded-xl p-5 border border-emerald-200/50 dark:border-emerald-800/50 hover:shadow-lg transition-all duration-300 group overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors"></div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 dark:bg-emerald-500/30 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Success Rate</div>
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{avgSuccessRate}%</div>
              <div className="w-full h-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-full mt-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${avgSuccessRate}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full"
                />
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-800/10 rounded-xl p-5 border border-amber-200/50 dark:border-amber-800/50 hover:shadow-lg transition-all duration-300 group overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-colors"></div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 dark:bg-amber-500/30 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Pending Jobs</div>
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{totalQueue}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">In queue</div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="relative bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/10 rounded-xl p-5 border border-purple-200/50 dark:border-purple-800/50 hover:shadow-lg transition-all duration-300 group overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-colors"></div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 dark:bg-purple-500/30 flex items-center justify-center">
                  <Activity className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Efficiency</div>
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{avgEfficiency}%</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <BarChart3 className="w-3 h-3 text-purple-500" />
                <span>Optimal</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

function ActivityFeed({ actions, previousActionIds }) {
  const [timeAgo, setTimeAgo] = useState('')

  useEffect(() => {
    const updateTimeAgo = () => {
      const seconds = Math.floor((Date.now() - (actions[0]?.timestamp || Date.now())) / 1000)
      if (seconds < 60) {
        setTimeAgo(`${seconds}s ago`)
      } else {
        const minutes = Math.floor(seconds / 60)
        setTimeAgo(`${minutes}m ago`)
      }
    }
    
    if (actions.length > 0) {
      updateTimeAgo()
      const interval = setInterval(updateTimeAgo, 1000)
      return () => clearInterval(interval)
    }
  }, [actions])

  return (
    <div className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-6 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 overflow-hidden group">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
      
      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-lg"></div>
              <div className="relative w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent AI Actions</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Live activity stream</p>
            </div>
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [1, 0.7, 1]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2.5 h-2.5 bg-emerald-500 rounded-full ml-2 shadow-lg shadow-emerald-500/50"
            />
          </div>
          {timeAgo && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <Clock className="w-3 h-3 text-gray-500 dark:text-gray-400" />
              <span className="text-xs text-gray-600 dark:text-gray-400 font-mono font-semibold">{timeAgo}</span>
            </div>
          )}
        </div>
        <div className="space-y-0 max-h-96 overflow-y-auto">
          {actions.length === 0 ? (
            <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No actions yet</div>
          ) : (
            <AnimatePresence mode="popLayout">
              {actions.slice(0, 10).map((action, index) => {
                const isNew = previousActionIds && !previousActionIds.has(action.id)
                return (
                  <motion.div
                    key={action.id}
                    variants={actionItemVariants}
                    initial={isNew ? "initial" : false}
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.5, delay: isNew ? index * 0.05 : 0 }}
                    className={`flex gap-3 text-sm py-3 px-2 rounded-lg ${index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}`}
                  >
                    <span className="text-gray-500 dark:text-gray-400 font-mono text-xs flex-shrink-0 w-16 text-right">
                      {(() => {
                        if (!action.createdAt) return action.time || '—'
                        const date = new Date(action.createdAt)
                        const now = new Date()
                        const diffMs = now - date
                        const diffMins = Math.floor(diffMs / 60000)
                        const diffHours = Math.floor(diffMs / 3600000)
                        if (diffMins < 1) return 'now'
                        if (diffMins < 60) return `${diffMins}m`
                        if (diffHours < 24) return `${diffHours}h`
                        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                      })()}
                    </span>
                    <div className="flex-1 flex items-center gap-2">
                      {action.phase && (
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          PHASES_CONFIG.find(p => p.id === action.phase)?.bgColor || 'bg-slate-100 dark:bg-slate-800'
                        } ${
                          PHASES_CONFIG.find(p => p.id === action.phase)?.textColor || 'text-slate-600 dark:text-slate-400'
                        }`}>
                          {getPhaseLabel(action.phase)}
                        </span>
                      )}
                      <span className="font-semibold text-gray-900 dark:text-white">{action.agent}</span>
                      <span className="text-gray-500 dark:text-gray-400"> {action.message}</span>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  )
}

function EmployeeRanking({ employees }) {
  const sortedEmployees = [...employees].sort((a, b) => b.tasksCompleted - a.tasksCompleted)
  const maxTasks = Math.max(...sortedEmployees.map(e => e.tasksCompleted || 0), 1)
  
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_0_rgba(0,0,0,0.06)] p-6 hover:scale-[1.01] transition-all duration-200">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">AI Employee Ranking</h3>
      <div className="space-y-4">
        {sortedEmployees.map((employee, idx) => {
          const percentage = ((employee.tasksCompleted || 0) / maxTasks) * 100
          return (
            <div key={employee.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-sm font-semibold text-gray-900 dark:text-white">
              {idx + 1}
            </div>
            <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 dark:text-white">{employee.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{employee.role}</div>
                  </div>
            </div>
            <div className="text-right flex-shrink-0">
                  <div className="font-semibold text-gray-900 dark:text-white">{employee.tasksCompleted} tasks</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{employee.successRate}% success</div>
            </div>
          </div>
              {/* Horizontal bar chart */}
              <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  className="h-full bg-gradient-to-r from-primary to-primary-dark rounded-full"
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Enhanced chart data with cost savings
const shipmentVolumeData = [
  { month: 'Jan', containers: 120, costSavings: 24000, prevContainers: 100, prevCostSavings: 20000 },
  { month: 'Feb', containers: 135, costSavings: 27000, prevContainers: 120, prevCostSavings: 24000 },
  { month: 'Mar', containers: 148, costSavings: 29600, prevContainers: 135, prevCostSavings: 27000 },
  { month: 'Apr', containers: 162, costSavings: 32400, prevContainers: 148, prevCostSavings: 29600 },
  { month: 'May', containers: 175, costSavings: 35000, prevContainers: 162, prevCostSavings: 32400 },
  { month: 'Jun', containers: 189, costSavings: 37800, prevContainers: 175, prevCostSavings: 35000 }
]

// Custom tooltip for chart
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    const containerChange = data.prevContainers 
      ? ((data.containers - data.prevContainers) / data.prevContainers * 100).toFixed(1)
      : 0
    const savingsChange = data.prevCostSavings
      ? ((data.costSavings - data.prevCostSavings) / data.prevCostSavings * 100).toFixed(1)
      : 0
    
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg">
        <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">{data.month}</p>
        {payload.map((entry, index) => (
          <div key={index} className="text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              {entry.name === 'containers' ? 'Shipments:' : 'Cost Savings:'}
            </span>
            <span className="ml-2 font-semibold text-gray-900 dark:text-white">
              {entry.name === 'containers' 
                ? `${entry.value} (${containerChange > 0 ? '+' : ''}${containerChange}%)`
                : `$${entry.value.toLocaleString()} (${savingsChange > 0 ? '+' : ''}${savingsChange}%)`
              }
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

// ============================================================================
// Main Component
// ============================================================================

// ============================================================================
// Shipment Detail Drawer Component
// ============================================================================

function ShipmentDetailDrawer({ shipment, actions, onClose, onRecheckCompliance, onAdvancePhaseDebug }) {
  if (!shipment) return null

  // Filter actions for this shipment by container number
  const shipmentActions = actions
    .filter(action => {
      const containerNo = shipment.containerNo || shipment.id
      return action.message && action.message.includes(containerNo)
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)

  // Format time helper
  const formatTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    
    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  // Get phase status icon
  const getPhaseIcon = (phaseId) => {
    const progress = shipment.phaseProgress?.[phaseId] || 'pending'
    if (progress === 'done') return '✓'
    if (progress === 'in_progress') return '⏳'
    return '○'
  }

  // Get phase sublabel
  const getPhaseSublabel = (phaseId) => {
    const labels = {
      intake: 'Docs',
      compliance: 'Customs',
      monitoring: 'Tracking',
      arrival: 'Delivery',
      billing: 'Billing'
    }
    return labels[phaseId] || ''
  }

  const containerNo = shipment.containerNo || shipment.id || 'Unknown'
  const eta = shipment.eta || shipment.arrivalDate || shipment.promisedDate

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-end"
        onClick={onClose}
      >
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md h-full bg-white dark:bg-gray-900 shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Container {containerNo}
                </h2>
                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    <span>{shipment.carrier || '—'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Navigation2 className="w-4 h-4" />
                    <span>{shipment.port || shipment.origin || '—'}</span>
                  </div>
                  {eta && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(eta).toLocaleString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric',
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}</span>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            
            {/* Phase badges */}
            <div className="flex items-center gap-2 flex-wrap">
              {shipment.currentPhase && (
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  PHASES_CONFIG.find(p => p.id === shipment.currentPhase)?.bgColor || 'bg-slate-100 dark:bg-slate-800'
                } ${
                  PHASES_CONFIG.find(p => p.id === shipment.currentPhase)?.textColor || 'text-slate-600 dark:text-slate-400'
                }`}>
                  {getPhaseLabel(shipment.currentPhase)}
                </span>
              )}
              {shipment.phaseProgress && shipment.currentPhase && (
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(shipment.phaseProgress[shipment.currentPhase])}`}>
                  {getStatusLabel(shipment.phaseProgress[shipment.currentPhase])}
                </span>
              )}
            </div>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Email Source & Timeline */}
            {shipment.source === 'email' && shipment.emailMetadata && (
              <div>
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Source
                </h3>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                        {shipment.emailMetadata.subject || 'No subject'}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                        <div>From: {shipment.emailMetadata.from || 'Unknown'}</div>
                        <div>Received: {new Date(shipment.emailMetadata.receivedAt).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</div>
                        <div className="flex items-center gap-2 mt-2">
                          <FileText className="w-3 h-3" />
                          <span>{shipment.emailMetadata.attachmentName || 'unnamed.pdf'}</span>
                          <span className="text-gray-500">({(shipment.emailMetadata.attachmentSize / 1024).toFixed(1)} KB)</span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          // Open email source modal - we'll add this state
                          const modal = document.getElementById('email-source-modal')
                          if (modal) modal.style.display = 'flex'
                        }}
                        className="mt-3 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center gap-1"
                      >
                        <Mail className="w-3 h-3" />
                        View Email Source
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Email Source Modal */}
                <div id="email-source-modal" className="hidden fixed inset-0 bg-black/50 dark:bg-black/70 z-[60] flex items-center justify-center p-4" onClick={(e) => {
                  if (e.target.id === 'email-source-modal') {
                    e.target.style.display = 'none'
                  }
                }}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
                  >
                    <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Mail className="w-5 h-5" />
                        Email Source
                      </h3>
                      <button onClick={(e) => {
                        const modal = e.target.closest('#email-source-modal')
                        if (modal) modal.style.display = 'none'
                      }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="p-6 space-y-4">
                      <div>
                        <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Subject</div>
                        <div className="text-sm text-gray-900 dark:text-white">{shipment.emailMetadata.subject || 'No subject'}</div>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">From</div>
                        <div className="text-sm text-gray-900 dark:text-white">{shipment.emailMetadata.from || 'Unknown'}</div>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Received</div>
                        <div className="text-sm text-gray-900 dark:text-white">
                          {new Date(shipment.emailMetadata.receivedAt).toLocaleString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          })}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Attachment</div>
                        <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-white">
                          <FileText className="w-4 h-4" />
                          <span>{shipment.emailMetadata.attachmentName || 'unnamed.pdf'}</span>
                          <span className="text-gray-500">({(shipment.emailMetadata.attachmentSize / 1024).toFixed(1)} KB)</span>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                        <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">PDF Preview</div>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                          PDF preview would be displayed here
                          <div className="mt-2 text-xs">(PDF viewer integration can be added here)</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
                
                {/* Email-to-Shipment Timeline */}
                <div className="mt-4">
                  <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-3">
                    Processing Timeline
                  </h4>
                  <div className="space-y-2 relative">
                    {/* Connecting lines */}
                    <div className="absolute left-3 top-6 bottom-6 w-0.5 bg-gradient-to-b from-blue-200 via-purple-200 to-green-200 dark:from-blue-800 dark:via-purple-800 dark:to-green-800"></div>
                    
                    <div className="flex items-center gap-3 text-sm relative z-10">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center border-2 border-blue-300 dark:border-blue-700">
                        <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">Email Received</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {(() => {
                            const date = new Date(shipment.emailMetadata.receivedAt)
                            const now = new Date()
                            const diffMs = now - date
                            const diffMins = Math.floor(diffMs / 60000)
                            const diffHours = Math.floor(diffMs / 3600000)
                            if (diffMins < 1) return 'just now'
                            if (diffMins < 60) return `${diffMins}m ago`
                            if (diffHours < 24) return `${diffHours}h ago`
                            return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                          })()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm relative z-10">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center border-2 border-blue-300 dark:border-blue-700">
                        <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">PDF Extracted</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {shipment.emailMetadata.attachmentName || 'unnamed.pdf'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm relative z-10">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center border-2 border-blue-300 dark:border-blue-700">
                        <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">AI Parsed</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Container {containerNo} identified
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm relative z-10">
                      <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                        shipment.currentPhase === 'intake' ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700' :
                        shipment.currentPhase === 'compliance' ? 'bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700' :
                        shipment.currentPhase === 'monitoring' ? 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700' :
                        'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700'
                      }`}>
                        {shipment.currentPhase === 'intake' || shipment.currentPhase === 'compliance' ? (
                          <Loader2 className={`w-4 h-4 animate-spin ${
                            shipment.currentPhase === 'intake' ? 'text-blue-600 dark:text-blue-400' :
                            'text-purple-600 dark:text-purple-400'
                          }`} />
                        ) : (
                          <CheckCircle className={`w-4 h-4 ${
                            shipment.currentPhase === 'monitoring' ? 'text-yellow-600 dark:text-yellow-400' :
                            'text-green-600 dark:text-green-400'
                          }`} />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {shipment.currentPhase === 'intake' ? 'Shipment Created' :
                           shipment.currentPhase === 'compliance' ? 'Compliance Check' :
                           shipment.currentPhase === 'monitoring' ? 'In Monitoring' :
                           'Completed'}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {shipment.currentPhase === 'monitoring' ? (
                            <span className="flex items-center gap-1">
                              <CheckCircle className="w-3 h-3 text-green-500" />
                              All caught up
                            </span>
                          ) : (
                            getPhaseLabel(shipment.currentPhase || 'intake')
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Phase Timeline */}
            <div>
              <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                <div className="w-1 h-4 bg-primary rounded-full"></div>
                Phase Timeline
              </h3>
              <div className="space-y-3">
                {PHASES_CONFIG.map((phase, idx) => {
                  const progress = shipment.phaseProgress?.[phase.id] || 'pending'
                  const isCurrent = shipment.currentPhase === phase.id
                  const isDone = progress === 'done'
                  const isInProgress = progress === 'in_progress'
                  
                  return (
                    <div
                      key={phase.id}
                      className={`flex items-center gap-3 p-3 rounded-lg ${
                        isCurrent && isInProgress
                          ? 'bg-primary/10 border-l-4 border-l-primary'
                          : isDone
                          ? 'bg-gray-50 dark:bg-gray-800/50'
                          : 'bg-gray-50/50 dark:bg-gray-800/30'
                      }`}
                    >
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                        isDone
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : isInProgress
                          ? 'bg-primary/20 text-primary dark:text-primary'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                      }`}>
                        {getPhaseIcon(phase.id)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 dark:text-white text-sm">
                          {phase.label}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {getPhaseSublabel(phase.id)}
                        </div>
                      </div>
                      {isCurrent && (
                        <span className="text-xs text-primary font-medium">Current</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Compliance Section */}
            {shipment.complianceStatus && (
              <div>
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <div className="w-1 h-4 bg-primary rounded-full"></div>
                  Compliance
                </h3>
                <div className="space-y-3">
                  <div>
                    {shipment.complianceStatus === 'ok' ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        ✓ OK
                      </span>
                    ) : shipment.complianceStatus === 'issues' ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                        ⚠ Issues
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400">
                        Pending
                      </span>
                    )}
                  </div>
                  {shipment.complianceIssues && Array.isArray(shipment.complianceIssues) && shipment.complianceIssues.length > 0 && (
                    <ul className="mt-2 list-disc pl-5 text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      {shipment.complianceIssues.map((issue, idx) => (
                        <li key={idx}>{issue}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            {/* Recent Actions */}
            <div>
              <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                <div className="w-1 h-4 bg-primary rounded-full"></div>
                Recent AI Actions
              </h3>
              {shipmentActions.length > 0 ? (
                <div className="space-y-2">
                  {shipmentActions.map((action) => (
                    <div
                      key={action.id}
                      className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                          action.phase === 'intake' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                          action.phase === 'compliance' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' :
                          action.phase === 'monitoring' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                          'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400'
                        }`}>
                          {action.phase ? action.phase.toUpperCase() : 'ACTION'}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTime(action.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{action.message}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No actions yet for this shipment.</p>
              )}
            </div>
          </div>

          {/* Footer Controls */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 space-y-2">
            {onRecheckCompliance && (
              <button
                onClick={onRecheckCompliance}
                className="w-full px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Re-run Compliance Check
              </button>
            )}
            {onAdvancePhaseDebug && (
              <button
                onClick={onAdvancePhaseDebug}
                className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Advance Phase (Debug)
              </button>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
              Debug / Operator controls
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function ShipmentsTable({ shipments, previousShipmentIds, selectedPhase, onShipmentClick }) {
  const [highlightedIds, setHighlightedIds] = useState(new Set())
  
  // Filter shipments by phase
  const filteredShipments = selectedPhase && selectedPhase !== 'all'
    ? shipments.filter(s => s.currentPhase === selectedPhase)
    : shipments
  
  // Detect new shipments and highlight them
  useEffect(() => {
    if (!previousShipmentIds) return
    
    const newIds = shipments
      .map(s => s.id)
      .filter(id => !previousShipmentIds.has(id))
    
    if (newIds.length > 0) {
      setHighlightedIds(new Set(newIds))
      
      // Remove highlight after 2 seconds
      const timer = setTimeout(() => {
        setHighlightedIds(new Set())
      }, 2000)
      
      return () => clearTimeout(timer)
    }
  }, [shipments, previousShipmentIds])
  
  if (filteredShipments.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_0_rgba(0,0,0,0.06)] p-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Active Shipments</h3>
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <p>No shipments yet — upload an arrival notice to create one.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_0_rgba(0,0,0,0.06)] p-6">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Active Shipments</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">Container</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">Carrier</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">Port</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">Phase</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">Phase Status</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">Compliance</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">ETA</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">Last Updated By</th>
              <th className="text-center py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredShipments.map((shipment, index) => {
              const getStatus = () => {
                if (!shipment.eta) return { text: 'Pending', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' }
                const now = new Date()
                const eta = new Date(shipment.eta)
                const hoursUntil = (eta - now) / (1000 * 60 * 60)
                if (hoursUntil < -24) return { text: 'Delayed', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' }
                if (hoursUntil < 0) return { text: 'Delay', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' }
                return { text: 'On Time', color: 'bg-success/10 text-success dark:bg-success/20 dark:text-success' }
              }
              const status = getStatus()
              
              return (
                <motion.tr
                  key={shipment.id}
                  initial={highlightedIds.has(shipment.id) ? { backgroundColor: '#FEF3C7' } : false}
                  animate={{ backgroundColor: index % 2 === 0 ? 'transparent' : '#F9FAFB' }}
                  transition={{ duration: 0.6 }}
                  onClick={() => onShipmentClick && onShipmentClick(shipment)}
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  <td className="py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                    <div className="flex items-center gap-2">
                      <span>{shipment.id || shipment.containerNo || '—'}</span>
                      {shipment.source === 'email' && (
                        <span 
                          className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 group/badge relative cursor-help" 
                          title="Processed via Email Automation"
                        >
                          <Mail className="w-3 h-3 mr-0.5" />
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded opacity-0 group-hover/badge:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                            Processed via Email Automation
                            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-800"></div>
                          </div>
                        </span>
                      )}
                      {shipment.source === 'upload' && (
                        <span 
                          className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 group/badge relative cursor-help"
                          title="Manual Upload"
                        >
                          <Upload className="w-3 h-3 mr-0.5" />
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded opacity-0 group-hover/badge:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                            Manual Upload
                            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-800"></div>
                          </div>
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{shipment.carrier || '—'}</td>
                  <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{shipment.origin || shipment.port || '—'}</td>
                  <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                    {shipment.currentPhase ? (
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        PHASES_CONFIG.find(p => p.id === shipment.currentPhase)?.bgColor || 'bg-slate-100 dark:bg-slate-800'
                      } ${
                        PHASES_CONFIG.find(p => p.id === shipment.currentPhase)?.textColor || 'text-slate-600 dark:text-slate-400'
                      }`}>
                        {getPhaseLabel(shipment.currentPhase)}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                    {shipment.phaseProgress && shipment.currentPhase ? (
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(shipment.phaseProgress[shipment.currentPhase])}`}>
                        {getStatusLabel(shipment.phaseProgress[shipment.currentPhase])}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                    {shipment.complianceStatus ? (
                      <div className="group/comp relative">
                        {shipment.complianceStatus === 'ok' ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            🟢 OK
                          </span>
                        ) : shipment.complianceStatus === 'issues' ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 cursor-help">
                            🟡 Needs data
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400">
                            Pending
                          </span>
                        )}
                        {shipment.complianceIssues && Array.isArray(shipment.complianceIssues) && shipment.complianceIssues.length > 0 && (
                          <div className="absolute left-0 top-6 w-64 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-lg p-2 opacity-0 group-hover/comp:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                            <div className="font-semibold mb-1">Compliance Issues:</div>
                            <ul className="list-disc list-inside space-y-1">
                              {shipment.complianceIssues.map((issue, idx) => (
                                <li key={idx}>{issue}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : '—'}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300 text-right font-mono">
                  {shipment.arrivalDate ? new Date(shipment.arrivalDate).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : shipment.promisedDate ? new Date(shipment.promisedDate).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : '—'}
                </td>
                  <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{shipment.lastUpdatedBy || '—'}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                      {status.text}
                    </span>
                  </td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function ManageAgents() {
  const [employees, setEmployees] = useState([])
  const [actions, setActions] = useState([])
  const [shipments, setShipments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [previousShipmentIds, setPreviousShipmentIds] = useState(new Set())
  const [previousActionIds, setPreviousActionIds] = useState(new Set())
  const [selectedPhase, setSelectedPhase] = useState('all')
  const [isDebugLoading, setIsDebugLoading] = useState(null)
  const [selectedShipment, setSelectedShipment] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [toast, setToast] = useState(null)

  // Fetch employees, actions, and shipments
  const fetchData = async () => {
    try {
      const [employeesRes, actionsRes, shipmentsRes] = await Promise.all([
        fetch(`${API_BASE}/ai-employees`),
        fetch(`${API_BASE}/ai-actions?limit=20`),
        fetch(`${API_BASE}/shipments`)
      ])

      if (employeesRes.ok) {
        const employeesData = await employeesRes.json()
        setEmployees(employeesData)
      }

      if (actionsRes.ok) {
        const actionsData = await actionsRes.json()
        // Track previous action IDs for fade-in animation
        setPreviousActionIds(new Set(actions.map(a => a.id)))
        setActions(actionsData)
      }

      if (shipmentsRes.ok) {
        const shipmentsData = await shipmentsRes.json()
        
        // Detect new email-processed shipments and show toast
        if (previousShipmentIds.size > 0) {
          const newEmailShipments = shipmentsData.filter(s => 
            s.source === 'email' && 
            !previousShipmentIds.has(s.id) &&
            s.emailMetadata
          )
          
          if (newEmailShipments.length > 0) {
            const containerNo = newEmailShipments[0].containerNo || newEmailShipments[0].id
            setToast({
              message: `📧 Parsed new arrival notice: ${containerNo}`,
              type: 'success'
            })
            // Auto-dismiss after 4 seconds
            setTimeout(() => setToast(null), 4000)
          }
        }
        
        // Track previous shipment IDs for highlighting new ones
        setPreviousShipmentIds(new Set(shipments.map(s => s.id)))
        setShipments(shipmentsData)
      }

      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching data:', error)
      setIsLoading(false)
    }
  }

  // Polling every 4 seconds
  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 4000)
    return () => clearInterval(interval)
  }, [])

  // Handle action button clicks
  const handleAction = async (actionType) => {
    try {
      const endpoint = actionType === 'arrival-notice' 
        ? `${API_BASE}/ai-events/arrival-notice`
        : `${API_BASE}/ai-events/update-eta`

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        // Immediately refetch to show updated data
        await fetchData()
      } else {
        console.error('Action failed:', await response.text())
      }
    } catch (error) {
      console.error('Error triggering action:', error)
    }
  }

  // Handle recheck compliance
  const handleRecheckCompliance = async () => {
    setIsDebugLoading('recheck-compliance')
    try {
      const response = await fetch(`${API_BASE}/ai-events/recheck-compliance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log(`✅ Rechecked compliance for ${data.updated} shipments`)
        // Refetch to update UI
        await fetchData()
      } else {
        console.error('Recheck compliance failed:', await response.text())
      }
    } catch (error) {
      console.error('Error rechecking compliance:', error)
    } finally {
      setIsDebugLoading(null)
    }
  }

  // Handle debug phase transitions
  const handleMarkComplianceDone = async () => {
    setIsDebugLoading('compliance')
    try {
      const response = await fetch(`${API_BASE}/debug/phase/compliance-done`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log(`✅ Marked ${data.updated} shipments as compliance done`)
        // Refetch to update UI
        await fetchData()
      } else {
        console.error('Debug action failed:', await response.text())
      }
    } catch (error) {
      console.error('Error triggering debug action:', error)
    } finally {
      setIsDebugLoading(null)
    }
  }

  const handleSimulateArrival = async () => {
    setIsDebugLoading('arrival')
    try {
      const response = await fetch(`${API_BASE}/debug/phase/arrival-release`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log(`✅ Simulated arrival & release for ${data.updated} shipments`)
        // Refetch to update UI
        await fetchData()
      } else {
        console.error('Debug action failed:', await response.text())
      }
    } catch (error) {
      console.error('Error triggering debug action:', error)
    } finally {
      setIsDebugLoading(null)
    }
  }

  const handleSimulateBilling = async () => {
    setIsDebugLoading('billing')
    try {
      const response = await fetch(`${API_BASE}/debug/phase/billing-processed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log(`✅ Simulated billing processed for ${data.updated} shipments`)
        // Refetch to update UI
        await fetchData()
      } else {
        console.error('Debug action failed:', await response.text())
      }
    } catch (error) {
      console.error('Error triggering debug action:', error)
    } finally {
      setIsDebugLoading(null)
    }
  }

  // Handle shipment click to open drawer
  const handleShipmentClick = (shipment) => {
    setSelectedShipment(shipment)
    setIsDetailOpen(true)
  }

  // Handle recheck compliance for selected shipment
  const handleRecheckComplianceForShipment = async () => {
    if (!selectedShipment) return
    
    setIsDebugLoading('recheck-compliance')
    try {
      const response = await fetch(`${API_BASE}/ai-events/recheck-compliance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log(`✅ Rechecked compliance for ${data.updated} shipments`)
        // Refetch to update UI
        await fetchData()
        // Update selected shipment in drawer
        const updatedShipment = shipments.find(s => s.id === selectedShipment.id || s.containerNo === selectedShipment.containerNo)
        if (updatedShipment) {
          setSelectedShipment(updatedShipment)
        }
      } else {
        console.error('Recheck compliance failed:', await response.text())
      }
    } catch (error) {
      console.error('Error rechecking compliance:', error)
    } finally {
      setIsDebugLoading(null)
    }
  }

  // Handle advance phase for selected shipment (debug)
  const handleAdvancePhaseForShipment = async () => {
    if (!selectedShipment) return
    
    const currentPhase = selectedShipment.currentPhase
    let endpoint = null
    
    if (currentPhase === 'compliance') {
      endpoint = `${API_BASE}/debug/phase/compliance-done`
    } else if (currentPhase === 'monitoring') {
      endpoint = `${API_BASE}/debug/phase/arrival-release`
    } else if (currentPhase === 'arrival') {
      endpoint = `${API_BASE}/debug/phase/billing-processed`
    }
    
    if (!endpoint) {
      console.log('No debug endpoint for current phase:', currentPhase)
      return
    }
    
    setIsDebugLoading('advance-phase')
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log(`✅ Advanced phase for ${data.updated} shipments`)
        // Refetch to update UI
        await fetchData()
        // Update selected shipment in drawer
        const updatedShipment = shipments.find(s => s.id === selectedShipment.id || s.containerNo === selectedShipment.containerNo)
        if (updatedShipment) {
          setSelectedShipment(updatedShipment)
        }
      } else {
        console.error('Advance phase failed:', await response.text())
      }
    } catch (error) {
      console.error('Error advancing phase:', error)
    } finally {
      setIsDebugLoading(null)
    }
  }

  if (isLoading && employees.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 relative bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 min-h-screen">
      {/* Page Header - Enhanced */}
      <div className="mb-12 pt-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center shadow-lg">
                  <Bot className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent mb-1">
                  AI Control Room
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Autonomous Freight Forwarding Workforce</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Ops AI currently managing {shipments.length} live shipment{shipments.length !== 1 ? 's' : ''} across {new Set(shipments.map(s => s.currentPhase)).size} phase{new Set(shipments.map(s => s.currentPhase)).size !== 1 ? 's' : ''}.
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{employees.length} Active Agents</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <Activity className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{shipments.length} Shipments</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid - Optimized Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Left Column: Ops AI Card */}
        <div className="xl:col-span-8 space-y-6">
          <OpsAICard 
            shipments={shipments}
            employees={employees}
            onPhaseSelect={setSelectedPhase}
            selectedPhase={selectedPhase}
            actions={actions}
          />
          
          {/* Debug Actions - Enhanced */}
          <div className="relative bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl"></div>
            
            <div className="relative">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg">
                    <Settings className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Debug Actions</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Development tools</p>
                  </div>
                </div>
                <motion.span
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-amber-500 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-md"
                >
                  Testing Only
                </motion.span>
              </div>
            
            {/* Phase 1 & 3 - Existing Features */}
            {employees.length > 0 && (
              <div className="mb-4">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Phase Transitions (Real Features)</div>
                <div className="flex flex-wrap gap-2">
                  {employees.map((employee) => (
                    <button
                      key={employee.id}
                      onClick={() => handleAction(employee.id === 'AI-EMP-001' ? 'arrival-notice' : 'update-eta')}
                      className="px-3 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      {employee.id === 'AI-EMP-001' ? 'Parse Arrival Notice' : 'Update ETAs'}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Phase 2, 4, 5 - Debug Buttons */}
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Phase Transitions (Debug)</div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleRecheckCompliance}
                  disabled={isDebugLoading}
                  className="px-3 py-2 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 disabled:opacity-50 text-blue-700 dark:text-blue-400 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  {isDebugLoading === 'recheck-compliance' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    'Re-run Compliance Check'
                  )}
                </button>
                
                <button
                  onClick={handleMarkComplianceDone}
                  disabled={isDebugLoading}
                  className="px-3 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  {isDebugLoading === 'compliance' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Mark Compliance Done'
                  )}
                </button>
                
                <button
                  onClick={handleSimulateArrival}
                  disabled={isDebugLoading}
                  className="px-3 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  {isDebugLoading === 'arrival' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Simulate Arrival & Release'
                  )}
                </button>
                
                <button
                  onClick={handleSimulateBilling}
                  disabled={isDebugLoading}
                  className="px-3 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  {isDebugLoading === 'billing' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Simulate Invoice Processed'
                  )}
                </button>
              </div>
            </div>
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Sidebar */}
        <div className="xl:col-span-4">
          <div className="xl:sticky xl:top-24 space-y-6">
            <ActivityFeed actions={actions} previousActionIds={previousActionIds} />
            
            {/* Phase Filter Reset */}
            {selectedPhase !== 'all' && (
              <button
                onClick={() => setSelectedPhase('all')}
                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
              >
                Show All Phases
              </button>
            )}
            
            {/* Compact Network Performance Chart - Enhanced */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative bg-gradient-to-br from-blue-50 via-white to-indigo-50/50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-6 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 overflow-hidden group"
            >
              {/* Decorative gradient */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-colors"></div>
              
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                      <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Shipment Volume & Cost Savings</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Shipment volume vs cost savings</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">6M</span>
                    <ChevronDown className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                <ComposedChart data={shipmentVolumeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" className="dark:stroke-gray-700" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#6B7280"
                    className="dark:stroke-gray-400"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    yAxisId="left" 
                    stroke="#6B7280"
                    className="dark:stroke-gray-400"
                    tick={{ fontSize: 12 }}
                    width={40}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    stroke="#16A34A"
                    className="dark:stroke-success"
                    tick={{ fontSize: 12 }}
                    width={50}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    yAxisId="left" 
                    dataKey="containers" 
                    fill="#2563EB" 
                    name="containers"
                    radius={[2, 2, 0, 0]}
                  />
                  <Line 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="costSavings" 
                    stroke="#16A34A" 
                    strokeWidth={2}
                    name="costSavings"
                    dot={{ fill: '#16A34A', r: 3 }}
                    activeDot={{ r: 4 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Compact Employee Ranking - Hidden for YC demo (focus on Ops AI) */}
            {false && (
            <div className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-6 overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Legacy Agents</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Performance leaderboard</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {[...employees].sort((a, b) => (b.tasksCompleted || 0) - (a.tasksCompleted || 0)).map((employee, idx) => {
                    const maxTasks = Math.max(...employees.map(e => e.tasksCompleted || 0), 1)
                    const percentage = ((employee.tasksCompleted || 0) / maxTasks) * 100
                    const isTop = idx === 0
                    const agentAccent = getAgentAccent(employee.name)
                    
                    return (
                      <motion.div 
                        key={employee.id} 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`relative space-y-2 p-3 rounded-xl transition-all duration-300 ${
                          isTop 
                            ? 'bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 border-2 border-primary/30' 
                            : 'bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        {isTop && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg">
                            <span className="text-[10px] font-bold text-white">1</span>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${
                              isTop 
                                ? 'bg-gradient-to-br from-primary to-primary-dark text-white shadow-lg' 
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}>
                              {idx + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <div className="text-sm font-bold text-gray-900 dark:text-white truncate">{employee.name}</div>
                                {isTop && <Sparkles className="w-3 h-3 text-primary" />}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{employee.role}</div>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="text-sm font-bold text-gray-900 dark:text-white">{employee.tasksCompleted}</div>
                            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">{employee.successRate}%</div>
                          </div>
                        </div>
                        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.8, delay: idx * 0.15 }}
                            className={`h-full rounded-full ${
                              isTop 
                                ? 'bg-gradient-to-r from-primary via-primary-dark to-primary' 
                                : 'bg-gradient-to-r from-gray-400 to-gray-500'
                            }`}
                          />
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            </div>
            )}
          </div>
        </div>
      </div>

      {/* Shipments Table - Full Width */}
      <div className="mt-16">
        <ShipmentsTable 
          shipments={shipments} 
          previousShipmentIds={previousShipmentIds}
          selectedPhase={selectedPhase}
          onShipmentClick={handleShipmentClick}
        />
      </div>

      {/* Shipment Detail Drawer */}
      {isDetailOpen && selectedShipment && (
        <ShipmentDetailDrawer
          shipment={selectedShipment}
          actions={actions}
          onClose={() => {
            setIsDetailOpen(false)
            setSelectedShipment(null)
          }}
          onRecheckCompliance={handleRecheckComplianceForShipment}
          onAdvancePhaseDebug={handleAdvancePhaseForShipment}
        />
      )}

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg px-4 py-3 flex items-center gap-3 min-w-[300px]"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 text-sm font-medium text-gray-900 dark:text-white">
              {toast.message}
            </div>
            <button
              onClick={() => setToast(null)}
              className="flex-shrink-0 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
            >
              <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="mt-16 py-8 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>Derya AI ©2025 — The Autonomous Freight Platform</span>
          <span className="text-xs text-gray-400 dark:text-gray-600 font-mono">AI ACTIVE</span>
        </div>
      </footer>
    </div>
  )
}
