import { ArrowUpRight, ArrowDownRight, TrendingUp, DollarSign, Percent, AlertTriangle, Target } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";

export function KpiCard({ label, value, delta, series, confidence, source }) {
  const isPositive = delta > 0;
  const color = isPositive ? "text-emerald-600" : "text-rose-600";
  const bgGradient = isPositive ? "from-emerald-50 to-emerald-100/50" : "from-rose-50 to-rose-100/50";
  const Icon = isPositive ? ArrowUpRight : ArrowDownRight;
  
  // Icon mapping for different KPI types
  const getIcon = (label) => {
    if (label.includes("Profit")) return DollarSign;
    if (label.includes("Margin")) return Percent;
    if (label.includes("Risk")) return AlertTriangle;
    if (label.includes("Quote")) return Target;
    if (label.includes("Unbilled")) return AlertTriangle;
    return TrendingUp;
  };
  
  const getConfidenceColor = (confidence) => {
    switch(confidence) {
      case 'High': return 'text-emerald-600 bg-emerald-100';
      case 'Medium': return 'text-amber-600 bg-amber-100';
      case 'Low': return 'text-rose-600 bg-rose-100';
      default: return 'text-slate-600 bg-slate-100';
    }
  };
  
  const KpiIcon = getIcon(label);
  
  return (
    <div className={`rounded-2xl border p-6 bg-gradient-to-br ${bgGradient} shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 relative overflow-hidden`}>
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
        <KpiIcon className="w-full h-full text-slate-400" />
      </div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg b   shadow-sm">
              <KpiIcon className="h-4 w-4 text-slate-600" />
            </div>
            <div className="text-sm font-medium text-slate-600">{label}</div>
          </div>
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full bg-white/80 shadow-sm ${color}`}>
            <Icon className="h-3 w-3" />
            <span className="text-xs font-semibold">{isPositive ? `+${delta}%` : `${delta}%`}</span>
          </div>
        </div>
        
        <div className="text-3xl font-bold tabular-nums mb-2 text-slate-800">{value}</div>
        
        {/* Source with hover for confidence */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-slate-500 truncate">{source}</span>
          <div className="relative group">
            <button className="text-xs text-slate-400 hover:text-slate-600 transition-colors">Details</button>
            <div className="absolute right-0 mt-2 w-48 p-2 rounded-lg border border-slate-200 bg-white shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-10">
              <div className="text-xs text-slate-600">Confidence: <span className={`font-medium ${getConfidenceColor(confidence).split(' ')[1]}`}>{confidence}</span></div>
            </div>
          </div>
        </div>
        
        <div className="h-12 bg-white/60 rounded-lg p-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series}>
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={isPositive ? "#10b981" : "#ef4444"} 
                strokeWidth={3}
                dot={false}
                strokeLinecap="round"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export function RiskBadge({ score }) {
  const hue = score < 4 ? "bg-emerald-100 text-emerald-700" :
              score < 7 ? "bg-amber-100 text-amber-700" :
                          "bg-rose-100 text-rose-700";
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${hue}`}>
      Risk {score.toFixed(1)}/10
    </span>
  );
}
