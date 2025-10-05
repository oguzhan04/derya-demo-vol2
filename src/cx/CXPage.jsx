import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, 
  Settings, 
  RefreshCw, 
  Upload, 
  Database, 
  FileText,
  AlertTriangle,
  TrendingUp,
  Clock,
  Lightbulb
} from 'lucide-react';
import SettingsPanel, { getCurrentSettings } from './SettingsPanel.jsx';
import { getDemoData, filterDemoData } from './demoData.ts';
import { DEFAULT_SLA } from './config.ts';

// ============================================================================
// CXPage Component
// ============================================================================

export default function CXPage() {
  // Local state
  const [filters, setFilters] = useState({
    source: 'Connected data',
    stage: 'all',
    severity: 'all',
    owner: 'all'
  });
  
  const [notifications, setNotifications] = useState([]);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('brief');
  const [brief, setBrief] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  // Sample data for MVP
  const sampleNotifications = [
    {
      id: 'notif-001',
      time: '2024-01-15T10:30:00Z',
      type: 'deal_at_risk',
      severity: 'high',
      entity: { kind: 'deal', id: 'deal-001', name: 'Acme Corp - Q1 Logistics' },
      score: { cxRisk: 85, winLikelihood: 35 },
      evidence: [
        { label: 'No communication in 7 days', value: '7', timestamp: '2024-01-15T10:30:00Z' },
        { label: 'Quote turnaround exceeded SLA', value: '72 hours', timestamp: '2024-01-12T14:20:00Z' }
      ],
      recommendation: 'Schedule immediate follow-up call to address concerns',
      links: [
        { label: 'View Deal', ref: '/deals/deal-001' },
        { label: 'Email Thread', ref: '/communications/deal-001' }
      ]
    },
    {
      id: 'notif-002',
      time: '2024-01-15T14:45:00Z',
      type: 'shipment_delay',
      severity: 'medium',
      entity: { kind: 'shipment', id: 'ship-001', name: 'SHIP-001 - NYC to LA' },
      score: { cxRisk: 65 },
      evidence: [
        { label: 'Dwell time exceeded SLA', value: '5 days', timestamp: '2024-01-15T14:45:00Z' }
      ],
      recommendation: 'Provide proactive status update to customer',
      links: [
        { label: 'View Shipment', ref: '/shipments/ship-001' }
      ]
    }
  ];

  const sampleScores = [
    {
      entity: { kind: 'deal', id: 'deal-001', name: 'Acme Corp - Q1 Logistics' },
      winLikelihood: 35,
      cxRisk: 85,
      signals: [
        { key: 'comm_gap', label: 'Communication gap', value: 0.8, weight: 0.25 },
        { key: 'sla_breach', label: 'SLA breach', value: 0.7, weight: 0.4 }
      ]
    },
    {
      entity: { kind: 'deal', id: 'deal-002', name: 'TechCorp - Express Shipping' },
      winLikelihood: 75,
      cxRisk: 25,
      signals: [
        { key: 'positive_sentiment', label: 'Positive sentiment', value: 0.6, weight: 0.15 },
        { key: 'active_comm', label: 'Active communication', value: 0.8, weight: 0.2 }
      ]
    }
  ];

  // Initialize with sample data
  useEffect(() => {
    setNotifications(sampleNotifications);
    setScores(sampleScores);
  }, []);

  // Filter notifications based on current filters
  const filteredNotifications = notifications.filter(notif => {
    if (filters.stage !== 'all' && notif.entity.kind === 'deal') {
      // For MVP, we'll use a simple mapping
      const stageMap = { 'proposal': 'deal', 'negotiation': 'deal', 'lead': 'deal' };
      if (stageMap[filters.stage] !== notif.entity.kind) return false;
    }
    if (filters.severity !== 'all' && notif.severity !== filters.severity) return false;
    return true;
  });

  // Handle Analyze Now
  const handleAnalyzeNow = async () => {
    setLoading(true);
    try {
      // Get current settings
      const currentSettings = getCurrentSettings();
      
      // Try API call first, fallback to local processing
      try {
        const response = await fetch('/api/cx/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            scope: 'all',
            sla: currentSettings.sla
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          setNotifications(data.notifications || []);
          return;
        }
      } catch (apiError) {
        console.log('API not available, using local processing');
      }
      
      // Fallback: Use local demo data and heuristics
      const demoData = getDemoData();
      const { deriveNotifications } = await import('./heuristics.ts');
      const localNotifications = deriveNotifications({
        deals: demoData.deals,
        shipments: demoData.shipments,
        comms: demoData.comms,
        sla: currentSettings.sla
      });
      
      setNotifications(localNotifications);
    } catch (error) {
      console.error('Failed to analyze:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle Recompute Scores
  const handleRecomputeScores = async () => {
    setLoading(true);
    try {
      // Try API call first, fallback to local processing
      try {
        const response = await fetch('/api/cx/score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ scope: 'all' })
        });
        
        if (response.ok) {
          const data = await response.json();
          setScores(data.scores || []);
          return;
        }
      } catch (apiError) {
        console.log('API not available, using local processing');
      }
      
      // Fallback: Use local demo data and heuristics
      const demoData = getDemoData();
      const localScores = [];
      
      for (const deal of demoData.deals) {
        const dealShipments = demoData.shipments.filter(s => s.dealId === deal.id);
        const dealComms = demoData.comms.filter(c => c.entityId === deal.id);
        
        // Import scoring functions
        const { scoreWinLikelihood, scoreCxRisk } = await import('./heuristics.ts');
        
        const winLikelihoodResult = scoreWinLikelihood(deal, dealComms, DEFAULT_SLA);
        const cxRiskResult = scoreCxRisk(deal, dealShipments, dealComms, DEFAULT_SLA);
        
        localScores.push({
          entity: { kind: 'deal', id: deal.id, name: `Deal ${deal.id}` },
          winLikelihood: winLikelihoodResult.score,
          cxRisk: cxRiskResult.score,
          signals: [...winLikelihoodResult.signals, ...cxRiskResult.signals]
        });
      }
      
      setScores(localScores);
    } catch (error) {
      console.error('Failed to recompute scores:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle row click
  const handleRowClick = async (entity) => {
    setSelectedEntity(entity);
    setDrawerOpen(true);
    setActiveTab('brief');
    
    // Fetch brief
    try {
      const response = await fetch('/api/cx/brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          entity: { kind: entity.kind, id: entity.id },
          include: { context: true, actions: true }
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setBrief(data);
      }
    } catch (error) {
      console.error('Failed to fetch brief:', error);
      // Set fallback brief
      setBrief({
        summary_md: `## ${entity.name} Analysis\n\nThis ${entity.kind} requires attention based on recent activity.`,
        actions: [
          { action: 'Review recent communications', confidence: 80, rationale: 'Communication patterns indicate issues' }
        ]
      });
    }
  };

  // Get severity color
  const getSeverityColor = (severity) => {
    const colors = {
      low: 'text-green-600 bg-green-100',
      medium: 'text-yellow-600 bg-yellow-100',
      high: 'text-orange-600 bg-orange-100',
      critical: 'text-red-600 bg-red-100'
    };
    return colors[severity] || colors.medium;
  };

  // Get risk color
  const getRiskColor = (risk) => {
    if (risk >= 80) return 'text-red-600';
    if (risk >= 60) return 'text-orange-600';
    if (risk >= 40) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[color:var(--deep-blue)] tracking-tight mb-2">
              Customer Experience Analytics
            </h1>
            <p className="text-slate-600">
              Monitor deal health and CX issues
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Source Picker */}
            <select
              value={filters.source}
              onChange={(e) => setFilters(prev => ({ ...prev, source: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Connected data">Connected data</option>
              <option value="Existing uploads">Existing uploads</option>
              <option value="Upload new">Upload new</option>
            </select>

            {/* Action Buttons */}
            <button
              onClick={handleAnalyzeNow}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[color:var(--accent)] transition-colors duration-200 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Analyze Now
            </button>
            
            <button
              onClick={handleRecomputeScores}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[color:var(--accent)] transition-colors duration-200 disabled:opacity-50"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Recompute Scores
            </button>
            
            <button
              onClick={() => setShowSettings(true)}
              className="inline-flex items-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[color:var(--accent)] transition-colors duration-200"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4 mt-4">
          <select
            value={filters.stage}
            onChange={(e) => setFilters(prev => ({ ...prev, stage: e.target.value }))}
            className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Stages</option>
            <option value="lead">Lead</option>
            <option value="proposal">Proposal</option>
            <option value="negotiation">Negotiation</option>
          </select>
          
          <select
            value={filters.severity}
            onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value }))}
            className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Severities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex">
        {/* Table */}
        <div className="flex-1 p-6">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">CX Analysis Results</h2>
              <p className="text-sm text-gray-600">{filteredNotifications.length} notifications found</p>
            </div>
            
            {filteredNotifications.length === 0 ? (
              <div className="p-12 text-center">
                <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
                <p className="text-gray-600">Try adjusting your filters or run a new analysis.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stage</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CX Risk</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Win Likelihood</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Touch</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Best Action</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredNotifications.map((notif) => (
                      <tr
                        key={notif.id}
                        onClick={() => handleRowClick(notif.entity)}
                        className="hover:bg-gray-50 cursor-pointer"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8">
                              {notif.entity.kind === 'deal' ? (
                                <FileText className="h-8 w-8 text-blue-600" />
                              ) : (
                                <Database className="h-8 w-8 text-green-600" />
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{notif.entity.name}</div>
                              <div className="text-sm text-gray-500">{notif.entity.kind}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {notif.entity.kind === 'deal' ? 'Proposal' : 'In Transit'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-medium ${getRiskColor(notif.score.cxRisk || 0)}`}>
                            {notif.score.cxRisk || 0}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-medium ${getRiskColor(100 - (notif.score.winLikelihood || 0))}`}>
                            {notif.score.winLikelihood || 0}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {new Date(notif.time).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                          <div className="flex items-center">
                            <Lightbulb className="w-4 h-4 mr-1 text-yellow-500" />
                            {notif.recommendation}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(notif.severity)}`}>
                            {notif.severity}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Drawer */}
        {drawerOpen && selectedEntity && (
          <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">{selectedEntity.name}</h3>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              {['brief', 'signals', 'timeline'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-sm font-medium ${
                    activeTab === tab
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {activeTab === 'brief' && (
                <div>
                  {brief ? (
                    <div>
                      <div className="prose prose-sm max-w-none">
                        <div dangerouslySetInnerHTML={{ __html: brief.summary_md.replace(/\n/g, '<br>') }} />
                      </div>
                      {brief.actions && (
                        <div className="mt-6">
                          <h4 className="text-sm font-semibold text-gray-900 mb-3">Recommended Actions</h4>
                          <div className="space-y-3">
                            {brief.actions.map((action, index) => (
                              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                                <div className="text-sm font-medium text-gray-900">{action.action}</div>
                                <div className="text-xs text-gray-600 mt-1">{action.rationale}</div>
                                <div className="text-xs text-blue-600 mt-1">Confidence: {action.confidence}%</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-sm text-gray-600 mt-2">Loading brief...</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'signals' && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Key Signals</h4>
                  <div className="space-y-3">
                    {notifications
                      .filter(n => n.entity.id === selectedEntity.id)
                      .flatMap(n => n.evidence)
                      .slice(0, 5)
                      .map((signal, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-sm font-medium text-gray-900">{signal.label}</div>
                          <div className="text-xs text-gray-600">{signal.value}</div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {activeTab === 'timeline' && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Timeline</h4>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">Deal Created</div>
                        <div className="text-xs text-gray-600">2024-01-01</div>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2"></div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">Quote Requested</div>
                        <div className="text-xs text-gray-600">2024-01-10</div>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-red-600 rounded-full mt-2"></div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">SLA Breach Detected</div>
                        <div className="text-xs text-gray-600">2024-01-15</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Settings Panel */}
      <SettingsPanel 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />
    </div>
  );
}
