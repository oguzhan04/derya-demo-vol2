import { User, TrendingUp, Clock, AlertTriangle, Target } from "lucide-react";

export function CustomerQualityIndex({ data }) {
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
          <div className="text-xs text-slate-500">Current customer performance</div>
        </div>
      </div>
      
      <div className="text-center mb-4">
        <div className="text-3xl font-bold text-slate-800 mb-1">{data.score}/100</div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(data.score)}`}>
          {data.score >= 80 ? 'Excellent' : data.score >= 60 ? 'Good' : 'Needs Attention'}
        </span>
      </div>
      
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-slate-600" />
            <span className="text-sm text-slate-600">Margin</span>
          </div>
          <span className="text-sm font-semibold text-slate-800">{data.metrics.margin}%</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-600" />
            <span className="text-sm text-slate-600">Pay Speed</span>
          </div>
          <span className="text-sm font-semibold text-slate-800">{data.metrics.paySpeed} days</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-slate-600" />
            <span className="text-sm text-slate-600">Dispute Rate</span>
          </div>
          <span className="text-sm font-semibold text-slate-800">{data.metrics.disputeRate}%</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-slate-600" />
            <span className="text-sm text-slate-600">Win Rate</span>
          </div>
          <span className="text-sm font-semibold text-slate-800">{data.metrics.winRate}%</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2 mb-3">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(data.confidence)}`}>
          {data.confidence}
        </span>
        <span className="text-xs text-slate-500">{data.source}</span>
      </div>
      
      <button className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium">
        <Target className="h-4 w-4" />
        Adjust Terms
      </button>
    </div>
  );
}
