export function EmptyGlobal() {
  return (
    <div className="rounded-2xl border p-8 bg-white text-center">
      <div className="text-lg font-semibold">No load selected</div>
      <p className="text-slate-500 mt-1">Select a shipment or import documents to see insights.</p>
      <div className="mt-4 flex items-center justify-center gap-3">
        <button className="px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors">
          Upload BoL / Invoice
        </button>
        <button className="px-4 py-2 rounded-xl border hover:bg-gray-50 transition-colors">
          Connect Email
        </button>
      </div>
    </div>
  );
}
