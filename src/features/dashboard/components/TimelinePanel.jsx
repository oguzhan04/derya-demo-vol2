import { Clock, CheckCircle, AlertTriangle, FileText } from "lucide-react";

export function TimelinePanel({ items, onItemClick }) {
  const getIcon = (title) => {
    if (title.includes("BoL")) return FileText;
    if (title.includes("Alert")) return AlertTriangle;
    if (title.includes("Invoice")) return CheckCircle;
    return Clock;
  };

  const getStatusColor = (title) => {
    if (title.includes("BoL")) return "bg-emerald-500";
    if (title.includes("Alert")) return "bg-amber-500";
    if (title.includes("Invoice")) return "bg-blue-500";
    return "bg-slate-500";
  };

  const getCategory = (title) => {
    if (title.includes("BoL")) return "Document";
    if (title.includes("Alert")) return "Risk";
    if (title.includes("Invoice")) return "Finance";
    return "General";
  };

  return (
    <div className="rounded-2xl border border-slate-200 p-8 bg-gradient-to-br from-slate-50 to-white shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
          <Clock className="h-6 w-6 text-white" />
        </div>
        <div>
          <div className="text-2xl font-bold text-slate-800">Timeline</div>
          <div className="text-sm text-slate-500">Latest doc, risk, and finance events</div>
        </div>
      </div>
      
      <div className="space-y-4">
        {items.slice(0, 3).map((item, idx) => {
          const Icon = getIcon(item.title);
          const statusColor = getStatusColor(item.title);
          const category = getCategory(item.title);
          
          return (
            <div key={idx} className="relative">
              {/* Timeline line */}
              {idx < Math.min(items.length, 3) - 1 && (
                <div className="absolute left-6 top-12 w-0.5 h-8 bg-gradient-to-b from-slate-200 to-slate-100"></div>
              )}
              
              <div 
                className="flex items-start gap-4 p-4 rounded-xl bg-white/80 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-200 cursor-pointer"
                onClick={() => onItemClick && onItemClick(category)}
              >
                <div className={`relative flex-shrink-0 w-12 h-12 rounded-full ${statusColor} shadow-lg flex items-center justify-center`}>
                  <Icon className="h-5 w-5 text-white" />
                  <div className="absolute -inset-1 rounded-full bg-white/20 animate-pulse"></div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                    <span className="text-xs text-slate-500 font-medium">{item.time}</span>
                  </div>
                  <div className="mt-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.dotColor }}></div>
                      <span className="text-xs text-slate-500">Status: {item.title.includes("Alert") ? "Warning" : item.title.includes("BoL") ? "Completed" : "Processed"}</span>
                    </div>
                    <div className="mt-1">
                      <span className="text-xs text-blue-600 font-medium">Click to filter {category} section</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
