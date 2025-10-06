import { DollarSign, TrendingDown, FileText, AlertTriangle } from "lucide-react";

export function ProfitWaterfall({ data, missedBilling }) {
  const getConfidenceColor = (confidence) => {
    switch(confidence) {
      case 'High': return 'text-emerald-600 bg-emerald-100';
      case 'Medium': return 'text-amber-600 bg-amber-100';
      case 'Low': return 'text-rose-600 bg-rose-100';
      default: return 'text-slate-600 bg-slate-100';
    }
  };

  const getStepColor = (step, delta) => {
    if (step === 'Quote') return 'bg-blue-500';
    if (step === 'True Net') return delta < -500 ? 'bg-rose-500' : 'bg-emerald-500';
    return delta < -100 ? 'bg-amber-500' : 'bg-slate-500';
  };

  return (
    <div className="rounded-2xl border border-slate-200 p-8 bg-gradient-to-br from-slate-50 to-white shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg">
          <DollarSign className="h-6 w-6 text-white" />
        </div>
        <div>
          <div className="text-2xl font-bold text-slate-800">True Profit (after Clauses)</div>
          <div className="text-sm text-slate-500">Quote → Carrier → Fees → Taxes → Clauses → True Net</div>
        </div>
      </div>
      
      {/* Waterfall Steps */}
      <div className="space-y-4 mb-6">
        {data.map((step, idx) => (
          <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-white/80 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${getStepColor(step.step, step.delta)}`}></div>
              <div>
                <div className="font-semibold text-slate-800">{step.step}</div>
                <div className="text-xs text-slate-500">{step.source}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-lg font-bold text-slate-800">${step.value.toLocaleString()}</div>
                {step.delta !== 0 && (
                  <div className={`flex items-center gap-1 text-sm ${step.delta < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    <TrendingDown className="h-3 w-3" />
                    {step.delta < 0 ? step.delta : `+${step.delta}`}
                  </div>
                )}
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(step.confidence)}`}>
                {step.confidence}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      {/* Missed Billing Section */}
      <div className="border-t border-slate-200 pt-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-rose-100">
            <AlertTriangle className="h-5 w-5 text-rose-600" />
          </div>
          <div>
            <div className="font-semibold text-slate-800">Missed Billing</div>
            <div className="text-sm text-slate-500">Fees detected but not invoiced</div>
          </div>
          <div className="ml-auto text-2xl font-bold text-rose-600">{missedBilling.total}</div>
        </div>
        
        <div className="space-y-2">
          {missedBilling.breakdown.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-rose-50 border border-rose-200">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-rose-600" />
                <span className="text-sm font-medium text-slate-800">{item.type}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-rose-600">{item.amount}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(item.confidence)}`}>
                  {item.confidence}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        <button className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors font-medium">
          <FileText className="h-4 w-4" />
          Generate Debit Note
        </button>
      </div>
    </div>
  );
}
