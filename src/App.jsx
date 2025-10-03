import { useState, useMemo } from 'react'
import { Upload, Archive, BarChart } from 'lucide-react'
import DataSources from './features/documents/DataSources'

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
  const [active, setActive] = useState('operations') // 'operations' | 'analytics' | 'documents'

  const title = useMemo(() => {
    switch(active) {
      case 'operations': return 'Operations'
      case 'analytics': return 'Analytics'
      case 'documents': return 'Document Upload'
      default: return 'Operations'
    }
  }, [active])
  
  const subtitle = useMemo(() => {
    switch(active) {
      case 'operations': return 'Track operations & milestones (coming soon).'
      case 'analytics': return 'Analyze performance data & insights (coming soon).'
      case 'documents': return 'Upload & manage freight docs (coming soon).'
      default: return 'Track operations & milestones (coming soon).'
    }
  }, [active])

  return (
    <div className="h-screen w-screen flex">
      {/* Sidebar */}
      <aside
        className="flex flex-col items-center gap-4 py-6"
        style={{ width: '72px', background: 'var(--deep-blue)' }}
      >
        <div className="text-white/70 text-xs font-medium">FF</div>
        <div className="flex-1 flex flex-col items-center gap-3 mt-2">
          <IconButton label="Operations" active={active==='operations'} onClick={() => setActive('operations')}>
            <Archive size={22} />
          </IconButton>
          <IconButton label="Analytics" active={active==='analytics'} onClick={() => setActive('analytics')}>
            <BarChart size={22} />
          </IconButton>
          <IconButton label="Document Upload" active={active==='documents'} onClick={() => setActive('documents')}>
            <Upload size={22} />
          </IconButton>
        </div>
        <div className="text-white/40 text-[10px]">v0.1</div>
      </aside>

      {/* Content */}
      <main className="flex-1 min-w-0 bg-offwhite">
        <div className="mx-auto max-w-6xl px-6 py-10">
          {active === 'documents' ? (
            <DataSources />
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
                        {active === 'operations' ? 'Operations Tracking Area' : 'Analytics Dashboard Area'}
                      </div>
                      <div className="text-sm">
                        {active === 'operations'
                          ? 'Monitor shipment progress and milestones'
                          : 'View charts, graphs, and insights'}
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
