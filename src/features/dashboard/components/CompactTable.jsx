export function CompactTable({ title, data, columns }) {
  return (
    <div className="rounded-2xl border p-4 bg-white">
      <div className="text-sm font-medium text-slate-700 mb-3">{title}</div>
      <div className="space-y-2">
        {data.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between py-1">
            <span className="text-sm text-slate-600">{item.name}</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold tabular-nums">{item.value}</span>
              {item.trend && (
                <span className={`text-xs ${item.trend > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {item.trend > 0 ? '+' : ''}{item.trend}%
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
