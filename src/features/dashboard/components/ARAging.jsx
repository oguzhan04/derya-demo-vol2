import { DollarSign, Clock, AlertTriangle, Send } from "lucide-react";

export function ARAging({ data }) {
  const getPeriodColor = (period) => {
    switch(period) {
      case '0-30': return 'text-emerald-600 bg-emerald-100';
      case '31-60': return 'text-amber-600 bg-amber-100';
      case '61-90': return 'text-orange-600 bg-orange-100';
      case '90+': return 'text-rose-600 bg-rose-100';
      default: return 'text-slate-600 bg-slate-100';
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
    <div className="rounded-2xl border border-slate-200 p-6 bg-gradient-to-br from-slate-50 to-white shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
          <DollarSign className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="text-lg font-bold text-slate-800">AR Aging</div>
          <div className="text-xs text-slate-500">Outstanding receivables</div>
        </div>
      </div>
      
      <div className="text-center mb-4">
        <div className="text-2xl font-bold text-slate-800 mb-1">${data.total.toLocaleString()}</div>
        <div className="text-sm text-slate-500">Total Outstanding</div>
      </div>
      
      <div className="space-y-2 mb-4">
        {data.buckets.map((bucket, idx) => (
          <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-white/80 border border-slate-100">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-600" />
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPeriodColor(bucket.period)}`}>
                {bucket.period} days
              </span>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-slate-800">${bucket.amount.toLocaleString()}</div>
              <div className="text-xs text-slate-500">{bucket.count} invoices</div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex items-center gap-2 mb-3">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(data.confidence)}`}>
          {data.confidence}
        </span>
        <span className="text-xs text-slate-500">{data.source}</span>
      </div>
      
      <button className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
        <Send className="h-4 w-4" />
        Send Reminder
      </button>
    </div>
  );
}
