import { useState, useMemo } from 'react'
import { Upload, BarChart, Network } from 'lucide-react'
import DataSources from './features/documents/DataSources'
import DocumentUpload from './features/documents/DocumentUpload'

function IconButton({ label, active, onClick, children }) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      className={[
        'relative flex items-center justify-center',
        'h-12 w-12 rounded-2xl transition-all duration-200',
        active ? 'bg-white/20 text-white shadow-lg' : 'text-white/80 hover:text-white hover:bg-white/10',
        'focus:outline-none focus:ring-2 focus:ring-white/60 focus:ring-offset-2 focus:ring-offset-[var(--deep-blue)]'
      ].join(' ')}
      title={label}
    >
      {children}
      {/* active ring pill */}
      {active && <span className="pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-white/70" />}
    </button>
  )
}

export default function App() {
  const [active, setActive] = useState('analytics') // 'analytics' | 'data-integration' | 'documents'

  const title = useMemo(() => {
    switch(active) {
      case 'analytics': return 'Analytics'
      case 'data-integration': return 'Data Source Integration'
      case 'documents': return 'Document Upload'
      default: return 'Analytics'
    }
  }, [active])
  
  const subtitle = useMemo(() => {
    switch(active) {
      case 'analytics': return 'Analyze performance data & insights (coming soon).'
      case 'data-integration': return 'Connect business systems & data sources.'
      case 'documents': return 'Upload freight documents & files.'
      default: return 'Analyze performance data & insights (coming soon).'
    }
  }, [active])

  return (
    <div className="relative min-h-screen">
      {/* Sidebar */}
      <aside
        className="fixed left-0 top-0 h-full flex flex-col items-center gap-4 py-6 z-10"
        style={{ width: '72px', background: 'var(--deep-blue)' }}
      >
        <div className="text-white/70 text-xs font-medium">FF</div>
        <div className="flex-1 flex flex-col items-center gap-3 mt-2">
          <IconButton label="Analytics" active={active==='analytics'} onClick={() => setActive('analytics')}>
            <BarChart size={22} />
          </IconButton>
          <IconButton label="Data Integration" active={active==='data-integration'} onClick={() => setActive('data-integration')}>
            <Network size={22} />
          </IconButton>
          <IconButton label="Document Upload" active={active==='documents'} onClick={() => setActive('documents')}>
            <Upload size={22} />
          </IconButton>
        </div>
        <div className="text-white/40 text-[10px]">v0.1</div>
      </aside>

      {/* Content */}
      <main className="ml-[72px] min-h-screen bg-offwhite">
        <div className="mx-auto max-w-6xl px-6 py-10">
          {active === 'data-integration' ? (
            <DataSources />
          ) : active === 'documents' ? (
            <DocumentUpload />
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-[color:var(--deep-blue)] tracking-tight mb-2">{title}</h1>
                <p className="text-slate-600">{subtitle}</p>
              </div>

              {/* Placeholder card */}
              <section className="rounded-3xl shadow-soft bg-white border border-slate-200/60">
                <div className="p-8">
              <div className="h-80 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500 border-2 border-dashed border-slate-300">
                <div className="text-center">
                  <div className="text-lg font-medium mb-1">
                    Analytics Dashboard Area
                  </div>
                  <div className="text-sm">
                    View charts, graphs, and insights
                  </div>
                </div>
              </div>
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
