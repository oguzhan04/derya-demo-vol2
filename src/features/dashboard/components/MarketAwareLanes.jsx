import { MapPin, TrendingUp, TrendingDown, AlertTriangle, ArrowRight } from "lucide-react";

export function MarketAwareLanes({ data }) {
  const getConfidenceColor = (confidence) => {
    switch(confidence) {
      case 'High': return 'text-emerald-600 bg-emerald-100';
      case 'Medium': return 'text-amber-600 bg-amber-100';
      case 'Low': return 'text-rose-600 bg-rose-100';
      default: return 'text-slate-600 bg-slate-100';
    }
  };

  const getGapColor = (gap) => {
    if (gap < -2) return 'text-rose-600 bg-rose-100';
    if (gap < 0) return 'text-amber-600 bg-amber-100';
    return 'text-emerald-600 bg-emerald-100';
  };

  const getOnTimeColor = (onTime) => {
    if (onTime < 85) return 'text-rose-600';
    if (onTime < 90) return 'text-amber-600';
    return 'text-emerald-600';
  };

  return (
    <div className="rounded-2xl border border-slate-200 p-8 bg-gradient-to-br from-slate-50 to-white shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
          <MapPin className="h-6 w-6 text-white" />
        </div>
        <div>
          <div className="text-2xl font-bold text-slate-800">Lanes (Market Gap)</div>
          <div className="text-sm text-slate-500">Your margin vs market with repricing suggestions</div>
        </div>
      </div>
      
      <div className="space-y-4">
        {data.map((lane, idx) => (
          <div key={idx} className="p-4 rounded-xl bg-white/80 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-slate-600" />
                <span className="font-semibold text-slate-800">{lane.name}</span>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(lane.confidence)}`}>
                {lane.confidence}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <div className="text-xs text-slate-500 mb-1">Your Margin</div>
                <div className="text-lg font-bold text-slate-800">{lane.yourMargin}%</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">Market Margin</div>
                <div className="text-lg font-bold text-slate-800">{lane.marketMargin}%</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">Gap:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGapColor(lane.gap)}`}>
                  {lane.gap > 0 ? '+' : ''}{lane.gap}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">On-time:</span>
                <span className={`text-sm font-semibold ${getOnTimeColor(lane.onTime)}`}>
                  {lane.onTime}%
                </span>
              </div>
            </div>
            
            {lane.suggestion && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 border border-amber-200">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-800">{lane.suggestion}</span>
                </div>
                <button className="flex items-center gap-1 px-3 py-1 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-xs font-medium">
                  Action
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            )}
            
            <div className="mt-2 text-xs text-slate-500">{lane.source}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
