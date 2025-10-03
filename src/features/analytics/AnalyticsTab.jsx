import { useState, useMemo } from 'react';

// Simplified analytics without the complex insight engine for now
function generateSimpleInsights(rows) {
  if (!rows || rows.length === 0) return [];
  
  const insights = [];
  
  // Simple carrier analysis
  const carriers = {};
  rows.forEach(row => {
    if (row.carrier) {
      carriers[row.carrier] = (carriers[row.carrier] || 0) + 1;
    }
  });
  
  // Find carrier with most shipments
  const topCarrier = Object.keys(carriers).reduce((a, b) => 
    carriers[a] > carriers[b] ? a : b, Object.keys(carriers)[0]
  );
  
  if (topCarrier) {
    insights.push({
      id: 'top-carrier',
      title: `Top Carrier: ${topCarrier}`,
      summary: `${topCarrier} handles ${carriers[topCarrier]} shipments, ${Math.round(carriers[topCarrier] / rows.length * 100)}% of total volume.`,
      tags: ['ops'],
      severity: 2,
      confidence: 0.95,
      evidence: [{
        label: 'Carrier Breakdown',
        metrics: {
          'Top Carrier': topCarrier,
          'Shipments': carriers[topCarrier].toString(),
          'Market Share': `${Math.round(carriers[topCarrier] / rows.length * 100)}%`,
          'Total Carriers': Object.keys(carriers).length.toString()
        }
      }],
      action: `Consider negotiating volume discounts with ${topCarrier}.`
    });
  }
  
  // Simple mode analysis
  const modes = {};
  rows.forEach(row => {
    if (row.mode) {
      modes[row.mode] = (modes[row.mode] || 0) + 1;
    }
  });
  
  if (Object.keys(modes).length > 0) {
    const topMode = Object.keys(modes).reduce((a, b) => 
      modes[a] > modes[b] ? a : b, Object.keys(modes)[0]
    );
    
    insights.push({
      id: 'mode-distribution',
      title: `Primary Mode: ${topMode}`,
      summary: `${topMode} represents ${Math.round(modes[topMode] / rows.length * 100)}% of your shipment volume.`,
      tags: ['ops'],
      severity: 1,
      confidence: 0.9,
      evidence: [{
        label: 'Mode Distribution',
        metrics: {
          'Primary Mode': topMode,
          'Shipments': modes[topMode].toString(),
          'Percentage': `${Math.round(modes[topMode] / rows.length * 100)}%`,
          'Total Shipments': rows.length.toString()
        }
      }],
      action: `Optimize ${topMode} operations for maximum efficiency.`
    });
  }
  
  // Simple cost analysis
  const costs = rows.filter(r => r.costUsd).map(r => r.costUsd);
  if (costs.length > 0) {
    const avgCost = costs.reduce((sum, cost) => sum + cost, 0) / costs.length;
    const maxCost = Math.max(...costs);
    const minCost = Math.min(...costs);
    
    insights.push({
      id: 'cost-summary',
      title: 'Cost Overview',
      summary: `Average shipment cost is $${avgCost.toFixed(0)}, ranging from $${minCost.toFixed(0)} to $${maxCost.toFixed(0)}.`,
      tags: ['cost'],
      severity: 2,
      confidence: 0.85,
      evidence: [{
        label: 'Cost Metrics',
        metrics: {
          'Avg Cost': `$${avgCost.toFixed(0)}`,
          'Min Cost': `$${minCost.toFixed(0)}`,
          'Max Cost': `$${maxCost.toFixed(0)}`,
          'Cost Range': `$${(maxCost - minCost).toFixed(0)}`
        }
      }],
      action: 'Review high-cost shipments for optimization opportunities.'
    });
  }
  
  return insights.slice(0, 5); // Limit to 5 insights max
}

const TAG_COLORS = {
  delay: 'bg-red-100 text-red-800 border-red-200',
  cost: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  risk: 'bg-red-100 text-red-800 border-red-200',
  emissions: 'bg-green-100 text-green-800 border-green-200',
  savings: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  ops: 'bg-blue-100 text-blue-800 border-blue-200',
};

function InsightCard({ insight }) {
  return (
    <div className="rounded-xl border border-slate-200/70 bg-white shadow-soft p-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="font-semibold text-slate-900 text-lg">{insight.title}</h3>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-xs rounded-full px-2 py-1 ${
            insight.severity >= 4 ? 'bg-red-100 text-red-800' :
            insight.severity >= 3 ? 'bg-orange-100 text-orange-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {insight.severity}/5
          </span>
          <div className="w-16 h-1.5 bg-slate-200 rounded-full">
            <div 
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${Math.round(insight.confidence * 100)}%` }}
            />
          </div>
        </div>
      </div>
      
      <p className="text-slate-600 text-sm mb-3">{insight.summary}</p>
      
      {insight.evidence?.length > 0 && (
        <div className="mb-3 overflow-x-auto">
          <div className="text-xs text-slate-500 mb-2 font-medium">Evidence:</div>
          <table className="text-sm w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                {Object.keys(insight.evidence[0].metrics).map(key => (
                  <th key={key} className="text-left pr-3 py-1 text-slate-500 text-xs font-medium">
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {insight.evidence.slice(0, 3).map((ev, idx) => (
                <tr key={idx} className="border-b border-slate-50 last:border-b-0">
                  {Object.values(ev.metrics).map((value, j) => (
                    <td key={j} className="pr-3 py-1 text-slate-700 text-xs">
                      {String(value)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {insight.action && (
        <div className="text-slate-700 text-sm mb-3 p-2 bg-slate-50 rounded-lg border">
          <span className="font-medium text-slate-800">💡 Action:</span> {insight.action}
        </div>
      )}
      
      <div className="flex gap-1 flex-wrap">
        {insight.tags.map(tag => (
          <span 
            key={tag} 
            className={`text-xs px-2 py-1 rounded-full border ${TAG_COLORS[tag] || 'bg-gray-100 text-gray-600 border-gray-200'}`}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function AnalyticsTab({ rows = [], loading = false }) {
  const [selectedTag, setSelectedTag] = useState('all');
  
  const insights = useMemo(() => {
    if (!rows || rows.length === 0) return [];
    return generateSimpleInsights(rows);
  }, [rows]);
  
  const filteredInsights = useMemo(() => {
    if (selectedTag === 'all') return insights;
    return insights.filter(insight => insight.tags.includes(selectedTag));
  }, [insights, selectedTag]);
  
  const tagCounts = useMemo(() => {
    const counts = {};
    insights.forEach(insight => {
      insight.tags.forEach(tag => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });
    return counts;
  }, [insights]);
  
  const TAGS = [
    { key: 'all', label: 'All', count: insights.length },
    { key: 'delay', label: 'Delay', count: tagCounts.delay || 0 },
    { key: 'cost', label: 'Cost', count: tagCounts.cost || 0 },
    { key: 'risk', label: 'Risk', count: tagCounts.risk || 0 },
    { key: 'emissions', label: 'Emissions', count: tagCounts.emissions || 0 },
    { key: 'savings', label: 'Savings', count: tagCounts.savings || 0 },
    { key: 'ops', label: 'Operations', count: tagCounts.ops || 0 },
  ];
  
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[color:var(--deep-blue)] tracking-tight mb-2">
            Analytics
          </h1>
          <p className="text-slate-600">Generating insights...</p>
        </div>
        
        <div className="animate-pulse">
          <div className="h-4 bg-slate-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  const downloadCSV = () => {
    if (!rows || rows.length === 0) return;
    
    const headers = 'id,mode,carrier,origin,destination,departDate,promisedDate,arrivalDate,distanceKm,weightKg,costUsd,lane,risklevel,commodity';
    const csvContent = [
      headers,
      ...rows.map(row => [
        row.id || '',
        row.mode || '',
        row.carrier || '',
        row.origin || '',
        row.destination || '',
        row.departDate || '',
        row.promisedDate || '',
        row.arrivalDate || '',
        row.distanceKm || '',
        row.weightKg || '',
        row.costUsd || '',
        row.lane || '',
        row.riskLevel || '',
        row.commodity || ''
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `freight-data-analysis-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[color:var(--deep-blue)] tracking-tight mb-2">
              Analytics
            </h1>
            <p className="text-slate-600">
              AI-powered insights from your freight data
              {rows.length > 0 && (
                <span className="ml-2 text-sm bg-slate-100 px-2 py-1 rounded-full">
                  {rows.length} shipments analyzed
                </span>
              )}
            </p>
          </div>
          {rows.length > 0 && (
            <button
              onClick={downloadCSV}
              className="inline-flex items-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[color:var(--accent)] transition-colors duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download Data
            </button>
          )}
        </div>
      </div>
      
      {rows.length === 0 ? (
        <div className="rounded-3xl shadow-soft bg-white border border-slate-200/60 p-12 text-center">
          <div className="text-slate-400 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">No Data to Analyze</h3>
          <p className="text-slate-500 mb-4">Upload freight shipment data to see AI-generated insights</p>
          <div className="text-sm text-slate-400">
            Upload CSV or Excel files from Document Upload tab →
          </div>
        </div>
      ) : (
        <>
          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2 mb-6">
            {TAGS.map(tag => (
              <button
                key={tag.key}
                onClick={() => setSelectedTag(tag.key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  selectedTag === tag.key
                    ? 'bg-[color:var(--accent)] text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {tag.label}
                {tag.count > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs bg-white/20">
                    {tag.count}
                  </span>
                )}
              </button>
            ))}
          </div>
          
          {/* Insights Grid */}
          {filteredInsights.length === 0 ? (
            <div className="rounded-3xl shadow-soft bg-white border border-slate-200/60 p-8 text-center">
              <div className="text-slate-400 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-1">No {selectedTag === 'all' ? '' : selectedTag} Insights Found</h3>
              <p className="text-slate-500">
                Great news! No major issues detected for this category.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInsights.map((insight) => (
                <InsightCard key={insight.id} insight={insight} />
              ))}
            </div>
          )}
          
          {/* Summary Stats */}
          {insights.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <div className="bg-white rounded-xl border border-slate-200/60 p-4 text-center shadow-soft">
                <div className="text-2xl font-bold text-slate-900">{insights.length}</div>
                <div className="text-sm text-slate-500">Total Insights</div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200/60 p-4 text-center shadow-soft">
                <div className="text-2xl font-bold text-red-600">{insights.filter(i => i.severity >= 4).length}</div>
                <div className="text-sm text-slate-500">High Priority</div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200/60 p-4 text-center shadow-soft">
                <div className="text-2xl font-bold text-emerald-600">{tagCounts.savings || 0}</div>
                <div className="text-sm text-slate-500">Savings Opportunities</div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200/60 p-4 text-center shadow-soft">
                <div className="text-2xl font-bold text-slate-600">
                  {rows.length}
                </div>
                <div className="text-sm text-slate-500">Shipments Analyzed</div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}