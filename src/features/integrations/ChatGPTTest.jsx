import { useState, useEffect } from 'react'
import { Send, Bot, User, Loader, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { chatGPTService } from '../../services/chatgpt'
import ApiKeyConfig from './ApiKeyConfig'

export default function ChatGPTTest() {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState('unknown') // 'connected', 'error', 'unknown'
  const [apiKey, setApiKey] = useState('')
  const [showConfig, setShowConfig] = useState(false)
  const [chatMode, setChatMode] = useState('conversational') // 'conversational' or 'document-analysis'

  useEffect(() => {
    // Check if API key is available
    const storedKey = localStorage.getItem('openai_api_key')
    if (storedKey) {
      setApiKey(storedKey)
      setConnectionStatus('connected')
    } else {
      setShowConfig(true)
    }
  }, [])

  const testConnection = async () => {
    setIsLoading(true)
    setConnectionStatus('unknown')
    
    try {
      // Test with a simple document analysis
      const testDocument = `
        BILL OF LADING
        Shipper: Test Company
        Consignee: Test Customer
        Carrier: Test Carrier
        Vessel: MV Test Vessel
        Commodity: Test Goods
        Weight: 1000 kg
      `
      
      const result = await chatGPTService.analyzeDocument(testDocument, 'freight')
      
      setConnectionStatus('connected')
      setMessages(prev => [...prev, {
        id: Date.now(),
        type: 'system',
        content: `✅ Connection successful! ChatGPT API is working properly.`,
        timestamp: new Date()
      }])
    } catch (error) {
      setConnectionStatus('error')
      setMessages(prev => [...prev, {
        id: Date.now(),
        type: 'system',
        content: `❌ Connection failed: ${error.message}`,
        timestamp: new Date()
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const currentMessage = inputMessage
    setInputMessage('')
    setIsLoading(true)

    try {
      let response;
      
      if (chatMode === 'conversational') {
        // Build conversation history from previous messages
        const conversationHistory = messages
          .filter(msg => msg.type === 'user' || msg.type === 'bot')
          .slice(-10) // Keep last 10 messages for context
          .map(msg => ({
            role: msg.type === 'user' ? 'user' : 'assistant',
            content: msg.content
          }))

        // Use the new chat method for conversational responses
        response = await chatGPTService.chat(currentMessage, conversationHistory)
      } else {
        // Use document analysis mode for structured data extraction
        response = await chatGPTService.analyzeDocument(currentMessage, 'freight')
      }
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: response,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'system',
        content: `Error: ${error.message}`,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const clearMessages = () => {
    setMessages([])
  }

  const handleApiKeySet = (key) => {
    setApiKey(key)
    if (key) {
      setConnectionStatus('connected')
      setShowConfig(false)
    } else {
      setConnectionStatus('unknown')
      setShowConfig(true)
    }
  }

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
    }
  }

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Connected'
      case 'error':
        return 'Connection Error'
      default:
        return 'Not Tested'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[color:var(--deep-blue)] tracking-tight mb-2">
            ChatGPT Integration Test
          </h1>
          <p className="text-slate-600">
            Test the ChatGPT API integration for document analysis and freight forwarding insights.
          </p>
        </div>
        
        {/* Connection Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="text-sm font-medium">{getStatusText()}</span>
          </div>
          <button
            onClick={testConnection}
            disabled={isLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2 disabled:opacity-50"
          >
            {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : 'Test Connection'}
          </button>
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors duration-200"
          >
            {showConfig ? 'Hide Config' : 'Show Config'}
          </button>
        </div>
      </div>

      {/* API Key Configuration */}
      {showConfig && (
        <ApiKeyConfig onApiKeySet={handleApiKeySet} />
      )}

      {/* Chat Interface */}
      <div className="bg-white rounded-xl shadow-soft border border-slate-200/60 overflow-hidden">
        {/* Chat Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">ChatGPT Test Chat</h3>
                <p className="text-sm text-slate-600">Test document analysis and freight forwarding queries</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Mode Selector */}
              <div className="flex bg-slate-100 rounded-lg p-1">
                <button
                  onClick={() => setChatMode('conversational')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                    chatMode === 'conversational'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Chat
                </button>
                <button
                  onClick={() => setChatMode('document-analysis')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                    chatMode === 'document-analysis'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Analysis
                </button>
              </div>
              <button
                onClick={clearMessages}
                className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
              >
                Clear Chat
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="h-96 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-slate-500 py-8">
              <Bot className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <p className="text-lg font-medium mb-2">Start a conversation</p>
              <p className="text-sm">Send a message to test the ChatGPT integration</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.type !== 'user' && (
                  <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
                    {message.type === 'bot' ? (
                      <Bot className="w-4 h-4 text-slate-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-slate-600" />
                    )}
                  </div>
                )}
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : message.type === 'bot'
                      ? 'bg-slate-100 text-slate-900'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
                {message.type === 'user' && (
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-slate-600" />
              </div>
              <div className="bg-slate-100 text-slate-900 px-4 py-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <Loader className="w-4 h-4 animate-spin" />
                  <span className="text-sm">ChatGPT is thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-slate-200 p-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message to test ChatGPT integration..."
              className="flex-1 px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Test Examples */}
      <div className="bg-slate-50 rounded-xl p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Test Examples</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-slate-700">Conversational Chat</h4>
            <button
              onClick={() => setInputMessage("Hello! Can you help me understand freight forwarding?")}
              className="text-left text-sm text-slate-600 hover:text-blue-600 transition-colors"
            >
              • General Introduction
            </button>
            <button
              onClick={() => setInputMessage("What's the difference between FCL and LCL shipping?")}
              className="text-left text-sm text-slate-600 hover:text-blue-600 transition-colors"
            >
              • Shipping Methods
            </button>
            <button
              onClick={() => setInputMessage("How do I calculate freight costs?")}
              className="text-left text-sm text-slate-600 hover:text-blue-600 transition-colors"
            >
              • Cost Calculation
            </button>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-slate-700">Document Analysis</h4>
            <button
              onClick={() => setInputMessage("Analyze this bill of lading: Shipper: ABC Corp, Consignee: XYZ Ltd, Vessel: MV Atlantic, Commodity: Electronics")}
              className="text-left text-sm text-slate-600 hover:text-blue-600 transition-colors"
            >
              • Bill of Lading Analysis
            </button>
            <button
              onClick={() => setInputMessage("Extract key information from this freight invoice: Invoice #12345, Amount: $2,500, Carrier: Ocean Express")}
              className="text-left text-sm text-slate-600 hover:text-blue-600 transition-colors"
            >
              • Invoice Data Extraction
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
