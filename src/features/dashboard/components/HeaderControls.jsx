import { ChevronDown, Download, Calendar, Truck, Globe, FileText } from "lucide-react";

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

export function GenerateReportButton({ currentLoadId, onGenerateReport, isGenerating }) {
  return (
    <button
      onClick={onGenerateReport}
      disabled={isGenerating || !currentLoadId}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
        isGenerating || !currentLoadId
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
          : 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-700 hover:to-emerald-800 shadow-lg hover:shadow-xl'
      }`}
    >
      {isGenerating ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
          Generating...
        </>
      ) : (
        <>
          <FileText className="h-4 w-4" />
          Generate Report
        </>
      )}
    </button>
  );
}

export function SelectLoad({ selectedLoad, onLoadChange, availableLoads }) {
  const getShortRoute = (route) => {
    const origin = route.origin.split(',')[0].split(' ')[0]; // Get first word of origin
    const destination = route.destination.split(',')[0].split(' ')[0]; // Get first word of destination
    return `${origin} → ${destination}`;
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-slate-600">Load:</span>
      <select
        value={selectedLoad}
        onChange={(e) => onLoadChange(e.target.value)}
        className="px-3 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:shadow-md transition-all duration-200 shadow-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[180px] max-w-[280px] text-sm"
      >
        {availableLoads.map((load) => (
          <option key={load.id} value={load.id}>
            {load.id} - {getShortRoute(load.route)}
          </option>
        ))}
      </select>
    </div>
  );
}
