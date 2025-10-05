import React, { useState, useEffect } from 'react';
import { DEFAULT_SLA, DEFAULT_WEIGHTS } from './config.ts';

// ============================================================================
// Settings Panel Component
// ============================================================================

export default function SettingsPanel({ isOpen, onClose }) {
  const [settings, setSettings] = useState({
    sla: { ...DEFAULT_SLA },
    weights: { ...DEFAULT_WEIGHTS }
  });
  const [hasChanges, setHasChanges] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('cx.settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({
          sla: { ...DEFAULT_SLA, ...parsed.sla },
          weights: { ...DEFAULT_WEIGHTS, ...parsed.weights }
        });
      } catch (error) {
        console.error('Failed to parse saved settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = () => {
    localStorage.setItem('cx.settings', JSON.stringify(settings));
    setHasChanges(false);
    onClose();
  };

  // Reset to defaults
  const resetToDefaults = () => {
    setSettings({
      sla: { ...DEFAULT_SLA },
      weights: { ...DEFAULT_WEIGHTS }
    });
    setHasChanges(true);
  };

  // Handle SLA field changes
  const handleSlaChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      sla: {
        ...prev.sla,
        [field]: typeof value === 'number' ? value : parseInt(value) || 0
      }
    }));
    setHasChanges(true);
  };

  // Handle owner touch hours changes
  const handleOwnerTouchChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      sla: {
        ...prev.sla,
        owner_touch_hours: {
          ...prev.sla.owner_touch_hours,
          [field]: parseInt(value) || 0
        }
      }
    }));
    setHasChanges(true);
  };

  // Handle weights changes
  const handleWeightChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      weights: {
        ...prev.weights,
        [field]: parseFloat(value) || 0
      }
    }));
    setHasChanges(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">CX Settings</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-8">
          {/* SLA Settings */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">SLA Thresholds</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quote Hours
                </label>
                <input
                  type="number"
                  value={settings.sla.quote_hours}
                  onChange={(e) => handleSlaChange('quote_hours', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Booking Confirm Hours
                </label>
                <input
                  type="number"
                  value={settings.sla.booking_confirm_hours}
                  onChange={(e) => handleSlaChange('booking_confirm_hours', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dwell Days
                </label>
                <input
                  type="number"
                  value={settings.sla.dwell_days}
                  onChange={(e) => handleSlaChange('dwell_days', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  POD Hours
                </label>
                <input
                  type="number"
                  value={settings.sla.pod_hours}
                  onChange={(e) => handleSlaChange('pod_hours', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  No Reply Days
                </label>
                <input
                  type="number"
                  value={settings.sla.no_reply_days}
                  onChange={(e) => handleSlaChange('no_reply_days', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Owner Touch Hours */}
            <div className="mt-4">
              <h5 className="text-md font-medium text-gray-900 mb-3">Owner Touch Hours</h5>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pre-deal Hours
                  </label>
                  <input
                    type="number"
                    value={settings.sla.owner_touch_hours.pre}
                    onChange={(e) => handleOwnerTouchChange('pre', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Post-deal Hours
                  </label>
                  <input
                    type="number"
                    value={settings.sla.owner_touch_hours.post}
                    onChange={(e) => handleOwnerTouchChange('post', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Weights Settings */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Scoring Weights</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quote SLA Weight
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={settings.weights.quote_sla}
                  onChange={(e) => handleWeightChange('quote_sla', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dwell Weight
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={settings.weights.dwell}
                  onChange={(e) => handleWeightChange('dwell', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Exceptions Weight
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={settings.weights.exceptions}
                  onChange={(e) => handleWeightChange('exceptions', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  No Reply Weight
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={settings.weights.no_reply}
                  onChange={(e) => handleWeightChange('no_reply', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sentiment Weight
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={settings.weights.sentiment}
                  onChange={(e) => handleWeightChange('sentiment', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={resetToDefaults}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Reset to Defaults
          </button>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            
            <button
              onClick={saveSettings}
              disabled={!hasChanges}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Gets current settings from localStorage or returns defaults.
 * @returns {Object} Current settings with sla and weights
 */
export function getCurrentSettings() {
  try {
    const savedSettings = localStorage.getItem('cx.settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      return {
        sla: { ...DEFAULT_SLA, ...parsed.sla },
        weights: { ...DEFAULT_WEIGHTS, ...parsed.weights }
      };
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
  
  return {
    sla: { ...DEFAULT_SLA },
    weights: { ...DEFAULT_WEIGHTS }
  };
}

/**
 * Saves settings to localStorage.
 * @param {Object} settings - Settings object with sla and weights
 */
export function saveCurrentSettings(settings) {
  try {
    localStorage.setItem('cx.settings', JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
}

/**
 * Resets settings to defaults and saves to localStorage.
 */
export function resetSettingsToDefaults() {
  const defaultSettings = {
    sla: { ...DEFAULT_SLA },
    weights: { ...DEFAULT_WEIGHTS }
  };
  saveCurrentSettings(defaultSettings);
  return defaultSettings;
}
