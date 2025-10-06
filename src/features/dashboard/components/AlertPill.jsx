export function AlertPill({ label, cta }) {
  return (
    <button 
      onClick={cta} 
      className="px-3 py-1.5 rounded-full border bg-amber-50 border-amber-200 text-amber-800 text-xs hover:bg-amber-100 transition-colors"
    >
      {label}
    </button>
  );
}
