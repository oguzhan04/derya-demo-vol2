import { DollarSign, TrendingUp, TrendingDown, AlertTriangle, BarChart3, MapPin, Clock } from "lucide-react";

export function TableCard({ title, columns, rows }) {
  const getIcon = (title) => {
    if (title.includes("Finance")) return DollarSign;
    if (title.includes("Lanes")) return MapPin;
    return BarChart3;
  };

  const getRowIcon = (name, title) => {
    if (title.includes("Finance")) {
      if (name.includes("margin")) return TrendingUp;
      if (name.includes("risk")) return AlertTriangle;
      return DollarSign;
    }
    if (title.includes("Lanes")) {
      return MapPin;
    }
    return BarChart3;
  };

  const getProgressBar = (value, title) => {
    if (title.includes("Lanes")) {
      const [margin, onTime] = value.split('/');
      const marginNum = parseFloat(margin.replace('%', ''));
      const onTimeNum = parseFloat(onTime.replace('%', ''));
      
      return (
        <div className="flex-1 ml-4">
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>Margin</span>
            <span>On-time</span>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 bg-slate-100 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full h-2 transition-all duration-500"
                style={{ width: `${marginNum}%` }}
              ></div>
            </div>
            <div className="flex-1 bg-slate-100 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-400 to-blue-500 rounded-full h-2 transition-all duration-500"
                style={{ width: `${onTimeNum}%` }}
              ></div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const CardIcon = getIcon(title);

  return (
    <div className="rounded-2xl border border-slate-200 p-8 bg-gradient-to-br from-slate-50 to-white shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-3 rounded-xl shadow-lg ${
          title.includes("Finance") 
            ? "bg-gradient-to-br from-emerald-500 to-emerald-600" 
            : "bg-gradient-to-br from-blue-500 to-blue-600"
        }`}>
          <CardIcon className="h-6 w-6 text-white" />
        </div>
        <div>
          <div className="text-2xl font-bold text-slate-800">{title}</div>
          <div className="text-sm text-slate-500">
            {title.includes("Finance") ? "Financial metrics & risk analysis" : "Route performance overview"}
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        {rows.map((row, idx) => {
          const RowIcon = getRowIcon(row.name, title);
          const isPositive = row.delta && row.delta > 0;
          
          return (
            <div key={idx} className="group">
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/80 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-200">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    title.includes("Finance") 
                      ? isPositive ? "bg-emerald-100" : "bg-rose-100"
                      : "bg-blue-100"
                  }`}>
                    <RowIcon className={`h-4 w-4 ${
                      title.includes("Finance") 
                        ? isPositive ? "text-emerald-600" : "text-rose-600"
                        : "text-blue-600"
                    }`} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-800">{row.name}</div>
                    {title.includes("Finance") && row.name.includes("risk") && (
                      <div className="text-xs text-slate-500">Primary risk factor</div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-bold tabular-nums text-slate-800">{row.value}</div>
                    {row.delta && (
                      <div className={`flex items-center gap-1 text-xs font-semibold ${
                        row.delta > 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {row.delta > 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {row.delta > 0 ? '+' : ''}{row.delta}%
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {getProgressBar(row.value, title)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
