import { AlertTriangle, DollarSign, TrendingUp, Clock, ArrowRight } from "lucide-react";

export function ActionStrip({ alerts }) {
  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'border-rose-200 bg-rose-50';
      case 'medium': return 'border-amber-200 bg-amber-50';
      case 'low': return 'border-blue-200 bg-blue-50';
      default: return 'border-slate-200 bg-slate-50';
    }
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
    <div className="rounded-2xl border border-slate-200 p-6 bg-gradient-to-r from-slate-50 to-white shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg">
          <AlertTriangle className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="text-xl font-bold text-slate-800">Action Required</div>
          <div className="text-sm text-slate-500">High-impact opportunities to capture revenue</div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {alerts.map((alert) => (
          <div key={alert.id} className={`rounded-xl border p-4 ${getPriorityColor(alert.priority)} hover:shadow-md transition-all duration-200`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-slate-600" />
                <span className="font-semibold text-slate-800">{alert.title}</span>
              </div>
              <span className="text-lg font-bold text-emerald-600">{alert.impact}</span>
            </div>
            
            <div className="space-y-2 mb-3">
              <div className="text-sm text-slate-600">{alert.reason}</div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(alert.confidence)}`}>
                  {alert.confidence}
                </span>
                <span className="text-xs text-slate-500">{alert.source}</span>
              </div>
            </div>
            
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium text-sm">
              {alert.action}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
