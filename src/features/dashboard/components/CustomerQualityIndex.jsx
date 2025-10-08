import { User, TrendingUp, Clock, AlertTriangle, Target } from "lucide-react";

export function CustomerQualityIndex({ data, currentLoadId }) {
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-100';
    if (score >= 60) return 'text-amber-600 bg-amber-100';
    return 'text-rose-600 bg-rose-100';
  };

  const getConfidenceColor = (confidence) => {
    switch(confidence) {
      case 'High': return 'text-emerald-600 bg-emerald-100';
      case 'Medium': return 'text-amber-600 bg-amber-100';
      case 'Low': return 'text-rose-600 bg-rose-100';
      default: return 'text-slate-600 bg-slate-100';
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 p-6 bg-gradient-to-br from-slate-50 to-white shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
          <User className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="text-lg font-bold text-slate-800">Customer Quality Index</div>
          <div className="text-xs text-slate-500">All customer performance history</div>
        </div>
      </div>
      
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {data.slice(0, 4).map((customer, idx) => (
          <div 
            key={`${customer.customerId}-${idx}`}
            className={`p-4 rounded-lg border transition-all duration-200 ${
              customer.isCurrent 
                ? 'bg-blue-50 border-blue-200 shadow-md ring-2 ring-blue-200' 
                : 'bg-white border-slate-100 hover:shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-slate-600" />
                <span className="font-semibold text-slate-800">{customer.customerName}</span>
                {customer.isCurrent && (
                  <span className="px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">
                    Current
                  </span>
                )}
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-slate-800">{customer.score}/100</div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(customer.score)}`}>
                  {customer.score >= 80 ? 'Excellent' : customer.score >= 60 ? 'Good' : 'Needs Attention'}
                </span>
              </div>
            </div>
            
            <div className="text-xs text-slate-500 mb-2">
              {customer.route} • {customer.cargo} • {customer.loadId}
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-slate-600" />
                  <span className="text-xs text-slate-600">Margin</span>
                </div>
                <span className="text-xs font-semibold text-slate-800">{customer.metrics.margin}%</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-slate-600" />
                  <span className="text-xs text-slate-600">Pay Speed</span>
                </div>
                <span className="text-xs font-semibold text-slate-800">{customer.metrics.paySpeed}d</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3 text-slate-600" />
                  <span className="text-xs text-slate-600">Disputes</span>
                </div>
                <span className="text-xs font-semibold text-slate-800">{customer.metrics.disputeRate}%</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Target className="h-3 w-3 text-slate-600" />
                  <span className="text-xs text-slate-600">Win Rate</span>
                </div>
                <span className="text-xs font-semibold text-slate-800">{customer.metrics.winRate}%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(customer.confidence)}`}>
                {customer.confidence}
              </span>
              <span className="text-xs text-slate-500">{customer.source}</span>
            </div>
          </div>
        ))}
      </div>
      
      <button className="w-full mt-4 flex items-center justify-center gap-2 px-3 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium">
        <Target className="h-4 w-4" />
        Adjust Terms
      </button>
    </div>
  );
}
