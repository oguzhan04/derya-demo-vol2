import { useState, useEffect } from 'react'
import { Key, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react'

export default function ApiKeyConfig({ onApiKeySet }) {
  const [apiKey, setApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [validationStatus, setValidationStatus] = useState(null) // 'valid', 'invalid', null

  useEffect(() => {
    // Check if API key is already set in localStorage
    const storedKey = localStorage.getItem('openai_api_key')
    if (storedKey) {
      setApiKey(storedKey)
      setValidationStatus('valid')
    }
  }, [])

  const validateApiKey = async (key) => {
    if (!key || !key.startsWith('sk-')) {
      return false
    }

    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${key}`,
        },
      })
      return response.ok
    } catch (error) {
      return false
    }
  }

  const handleSaveKey = async () => {
    if (!apiKey.trim()) {
      setValidationStatus('invalid')
      return
    }

    setIsValidating(true)
    setValidationStatus(null)

    try {
      const isValid = await validateApiKey(apiKey)
      
      if (isValid) {
        localStorage.setItem('openai_api_key', apiKey)
        setValidationStatus('valid')
        onApiKeySet?.(apiKey)
      } else {
        setValidationStatus('invalid')
      }
    } catch (error) {
      setValidationStatus('invalid')
    } finally {
      setIsValidating(false)
    }
  }

  const handleClearKey = () => {
    localStorage.removeItem('openai_api_key')
    setApiKey('')
    setValidationStatus(null)
    onApiKeySet?.('')
  }

  const getStatusIcon = () => {
    if (isValidating) {
      return <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    }
    
    switch (validationStatus) {
      case 'valid':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'invalid':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      default:
        return <Key className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusText = () => {
    if (isValidating) return 'Validating...'
    
    switch (validationStatus) {
      case 'valid':
        return 'API Key is valid and connected'
      case 'invalid':
        return 'Invalid API key. Please check and try again.'
      default:
        return 'Enter your OpenAI API key'
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-soft border border-slate-200/60 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <Key className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">OpenAI API Configuration</h3>
          <p className="text-sm text-slate-600">Configure your OpenAI API key for ChatGPT integration</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            OpenAI API Key
          </label>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-proj-..."
              className="w-full px-4 py-3 pr-20 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className={`text-sm ${
            validationStatus === 'valid' ? 'text-green-600' :
            validationStatus === 'invalid' ? 'text-red-600' :
            'text-slate-600'
          }`}>
            {getStatusText()}
          </span>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSaveKey}
            disabled={!apiKey.trim() || isValidating}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isValidating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Validating...
              </>
            ) : (
              'Save & Test'
            )}
          </button>
          
          {validationStatus === 'valid' && (
            <button
              onClick={handleClearKey}
              className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors duration-200"
            >
              Clear Key
            </button>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">How to get your API key:</h4>
          <ol className="text-sm text-blue-800 space-y-1">
            <li>1. Go to <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">OpenAI Platform</a></li>
            <li>2. Sign in to your OpenAI account</li>
            <li>3. Click "Create new secret key"</li>
            <li>4. Copy the key and paste it above</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
