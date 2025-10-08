import { useState } from 'react';
import { RiskBadge } from './KpiCard';
import { Truck, MapPin, Package, Building2, TrendingUp, Award, Clock, AlertTriangle, DollarSign, FileText, CheckCircle, ArrowRight, ChevronDown, Ship } from "lucide-react";

export function ContextPanel({ currentLoadData, actionAlerts, timelineItems }) {
  const [isDoThisNowExpanded, setIsDoThisNowExpanded] = useState(false);
  const [isLatestEventsExpanded, setIsLatestEventsExpanded] = useState(false);

  return (
    <div className="rounded-2xl border border-slate-200 p-6 bg-gradient-to-br from-slate-50 to-white shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
          <Truck className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="text-2xl font-bold text-slate-800">Current Load</div>
          <div className="text-sm text-slate-500">Active shipment details</div>
        </div>
      </div>
      
      <div className="space-y-4">
        {/* Enhanced Journey Visualization */}
        <div className="p-6 rounded-xl bg-white/80 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-slate-500">Route</div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Progress: {currentLoadData.progress}%</span>
              <span>•</span>
              <span>ETA: {currentLoadData.remainingDays} days</span>
            </div>
          </div>
          
          {/* Route with waypoints */}
          <div className="relative">
            {/* Main route line */}
            <div className="flex items-center justify-between relative">
              {/* Origin */}
              <div className="flex flex-col items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-lg flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-semibold text-slate-800">{currentLoadData.origin.split(' ')[0]}</div>
                  <div className="text-xs text-slate-500">{currentLoadData.origin}</div>
                </div>
              </div>
              
              {/* Route line with waypoints */}
              <div className="flex-1 mx-6 relative">
                {/* Clean straight shipping route line */}
                <div className="relative h-2">
                  {/* Background straight line */}
                  <div className="absolute inset-0 border-t-2 border-dashed border-slate-300"></div>
                  
                  {/* Progress straight line */}
                  <div className="absolute inset-0 border-t-2 border-dashed border-blue-500" style={{width: `${currentLoadData.progress}%`}}></div>
                </div>
                
                {/* Waypoints positioned on straight line */}
                <div className="absolute top-0 left-1/4 transform -translate-x-1/2 -translate-y-1">
                  <div className="w-3 h-3 rounded-full bg-blue-300 border-2 border-white shadow-md"></div>
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-xs text-slate-500 whitespace-nowrap">
                    Port
                  </div>
                </div>
                
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 -translate-y-1">
                  <div className="w-12 h-12 rounded-full bg-blue-600 border-4 border-white shadow-2xl flex items-center justify-center animate-pulse">
                    <Ship className="h-7 w-7 text-white" />
                  </div>
                  <div className="absolute top-14 left-1/2 transform -translate-x-1/2 text-xs text-blue-600 font-semibold whitespace-nowrap">
                    Current
                  </div>
                </div>
                
                <div className="absolute top-0 left-3/4 transform -translate-x-1/2 -translate-y-1">
                  <div className="w-3 h-3 rounded-full bg-blue-300 border-2 border-white shadow-md"></div>
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-xs text-slate-500 whitespace-nowrap">
                    Transit
                  </div>
                </div>
              </div>
              
              {/* Destination */}
              <div className="flex flex-col items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-lg flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-semibold text-slate-800">{currentLoadData.destination.split(' ')[0]}</div>
                  <div className="text-xs text-slate-500">{currentLoadData.destination}</div>
                </div>
              </div>
            </div>
            
            {/* Route details */}
            <div className="mt-6 grid grid-cols-3 gap-4 text-center">
              <div className="p-3 rounded-lg bg-slate-50">
                <div className="text-lg font-bold text-slate-800">{currentLoadData.distance.toLocaleString()} mi</div>
                <div className="text-xs text-slate-500">Distance</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50">
                <div className="text-lg font-bold text-blue-600">{currentLoadData.progress}%</div>
                <div className="text-xs text-slate-500">Complete</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50">
                <div className="text-lg font-bold text-emerald-600">{currentLoadData.remainingDays} days</div>
                <div className="text-xs text-slate-500">Remaining</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/80 shadow-sm border border-slate-100">
          <div className="p-2 rounded-lg bg-blue-100">
            <Building2 className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <div className="text-sm text-slate-500 mb-1">Customer</div>
            <div className="text-lg font-semibold text-slate-800">{currentLoadData.customer}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/80 shadow-sm border border-slate-100">
          <div className="p-2 rounded-lg bg-amber-100">
            <Package className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <div className="text-sm text-slate-500 mb-1">Cargo</div>
            <div className="text-lg font-semibold text-slate-800">{currentLoadData.cargo}</div>
          </div>
        </div>
        
        {/* Removed provenance and verbose risk driver boxes per request */}
        
      </div>

      {/* Integrated Action Alerts */}
      <div className="mt-8 pt-6 border-t border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <div className="text-lg font-bold text-slate-800">Do This Now</div>
          </div>
          <button 
            onClick={() => setIsDoThisNowExpanded(!isDoThisNowExpanded)}
            className="p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ChevronDown 
              className={`h-4 w-4 text-slate-600 transition-transform duration-200 ${
                isDoThisNowExpanded ? 'rotate-0' : '-rotate-90'
              }`} 
            />
          </button>
        </div>
        
        {isDoThisNowExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {actionAlerts.slice(0, 3).map((alert) => (
              <div key={alert.id} className="p-3 rounded-lg bg-white/80 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-800">{alert.title}</span>
                  <span className="text-sm font-bold text-emerald-600">{alert.impact}</span>
                </div>
                <div className="text-xs text-slate-600 mb-2">{alert.reason}</div>
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    alert.confidence === 'High' ? 'bg-emerald-100 text-emerald-600' :
                    alert.confidence === 'Medium' ? 'bg-amber-100 text-amber-600' :
                    'bg-rose-100 text-rose-600'
                  }`}>
                    {alert.confidence}
                  </span>
                  <button className="flex items-center gap-1 px-2 py-1 bg-slate-900 text-white rounded text-xs font-medium hover:bg-slate-800 transition-colors">
                    {alert.action}
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Integrated Timeline */}
      <div className="mt-6 pt-6 border-t border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <div className="text-lg font-bold text-slate-800">Latest Events</div>
          </div>
          <button 
            onClick={() => setIsLatestEventsExpanded(!isLatestEventsExpanded)}
            className="p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ChevronDown 
              className={`h-4 w-4 text-slate-600 transition-transform duration-200 ${
                isLatestEventsExpanded ? 'rotate-0' : '-rotate-90'
              }`} 
            />
          </button>
        </div>
        
        {isLatestEventsExpanded && (
          <div className="space-y-3">
            {timelineItems.slice(0, 3).map((item, idx) => {
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

              const Icon = getIcon(item.title);
              const statusColor = getStatusColor(item.title);
              
              return (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-white/80 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-200">
                  <div className={`w-8 h-8 rounded-full ${statusColor} flex items-center justify-center`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-800">{item.title}</span>
                      <span className="text-xs text-slate-500">{item.time}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.dotColor }}></div>
                      <span className="text-xs text-slate-500">
                        {item.title.includes("Alert") ? "Warning" : item.title.includes("BoL") ? "Completed" : "Processed"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
