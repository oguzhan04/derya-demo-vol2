import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, DollarSign } from "lucide-react";

export function HeroProfitChart({ data }) {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-200">
          <p className="text-sm font-semibold text-slate-600 mb-2">Week {label}</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span className="text-sm text-slate-600">Profit: <span className="font-semibold text-emerald-600">${payload[0].value.toLocaleString()}</span></span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500"></div>
              <span className="text-sm text-slate-600">Cost: <span className="font-semibold text-rose-600">${payload[1].value.toLocaleString()}</span></span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-2xl border border-slate-200 p-8 bg-gradient-to-br from-slate-50 to-white shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">Profit vs Cost</div>
            <div className="text-sm text-slate-500">6-week performance overview</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span className="text-sm font-medium text-slate-600">Profit</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500"></div>
            <span className="text-sm font-medium text-slate-600">Cost</span>
          </div>
        </div>
      </div>
      
      <div className="h-80 bg-gradient-to-br from-white to-slate-50/50 rounded-xl p-4 border border-slate-100">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <defs>
              <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.4}/>
                <stop offset="100%" stopColor="#10b981" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity={0.4}/>
                <stop offset="100%" stopColor="#ef4444" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="week" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 14, fill: '#64748b', fontWeight: 500 }}
              tickMargin={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 14, fill: '#64748b', fontWeight: 500 }}
              tickMargin={10}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="profit"
              stackId="1"
              stroke="#10b981"
              fill="url(#profitGradient)"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Area
              type="monotone"
              dataKey="cost"
              stackId="1"
              stroke="#ef4444"
              fill="url(#costGradient)"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
