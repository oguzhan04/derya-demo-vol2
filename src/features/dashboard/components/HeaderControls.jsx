import { ChevronDown, Download, Calendar, Truck, Globe } from "lucide-react";

export function ModeToggle({ mode, onModeChange }) {
  return (
    <div className="flex bg-gradient-to-r from-slate-100 to-slate-50 rounded-xl p-1 shadow-inner">
      <button
        onClick={() => onModeChange('trip')}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
          mode === 'trip' 
            ? 'bg-white text-slate-900 shadow-lg border border-slate-200' 
            : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
        }`}
      >
        <Truck className="h-4 w-4" />
        Trip
      </button>
      <button
        onClick={() => onModeChange('global')}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
          mode === 'global' 
            ? 'bg-white text-slate-900 shadow-lg border border-slate-200' 
            : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
        }`}
      >
        <Globe className="h-4 w-4" />
        Global
      </button>
    </div>
  );
}

export function PeriodSelect({ period, onPeriodChange }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-slate-500" />
        <select
          value={period}
          onChange={(e) => onPeriodChange(e.target.value)}
          className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm hover:shadow-md transition-all duration-200"
        >
          <option value="week">Week</option>
          <option value="month">Month</option>
          <option value="quarter">Quarter</option>
        </select>
      </div>
      <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl font-medium">
        <Download className="h-4 w-4" />
        Export
      </button>
    </div>
  );
}

export function SelectLoad({ selectedLoad, onLoadChange }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-slate-600">Load:</span>
      <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:shadow-md transition-all duration-200 shadow-sm font-medium">
        <Truck className="h-4 w-4 text-slate-500" />
        {selectedLoad}
        <ChevronDown className="h-4 w-4 text-slate-400" />
      </button>
    </div>
  );
}
