export function ClauseDelta({
  items
}) {
  return (
    <div className="rounded-2xl border p-4 bg-white">
      <div className="text-sm font-medium text-slate-700 mb-2">Clause vs Actual</div>
      <ul className="space-y-2">
        {items.map((i, idx) => (
          <li key={idx} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-slate-700">{i.label}</span>
              <span className="text-xs text-slate-400 border rounded px-1.5 py-0.5">ref {i.doc}</span>
            </div>
            <div className="text-sm tabular-nums">
              <span className="text-slate-400 mr-2">${i.quoted}</span>
              <span className="font-semibold">${i.actual}</span>
              <span className={`ml-2 ${i.actual - i.quoted > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                {(i.actual - i.quoted) > 0 ? "+" : ""}{i.actual - i.quoted}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
