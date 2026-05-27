import React from 'react'

const functions = [
  {
    id: 'tremmer-1',
    label: '1e Tremmer',
    detail: 'Kraan en hoofdwerk',
    accent: 'from-sky-500 to-cyan-400'
  },
  {
    id: 'tremmer-2',
    label: '2e Tremmer',
    detail: 'Shovel en ondersteuning',
    accent: 'from-emerald-500 to-teal-400'
  },
  {
    id: 'tremmer-3',
    label: '3e Tremmer',
    detail: 'Controle en afronding',
    accent: 'from-amber-500 to-orange-400'
  }
]

function formatDuration(ms = 0) {
  const hours = Math.floor(ms / 3600000)
  const minutes = Math.floor((ms % 3600000) / 60000)
  return `${hours}u ${minutes}m`
}

export default function FunctionSelection({
  onSelect = () => {},
  onAdmin = () => {},
  isOwner = false,
  sessions = [],
  maintenanceLogs = [],
  userName = ''
}) {
  const today = new Date().toDateString()
  const todaysSessions = sessions.filter(s => s.start && new Date(s.start).toDateString() === today)
  const totalMs = todaysSessions.reduce((sum, s) => sum + (s.duration_ms || 0), 0)
  const lastSession = sessions[0]

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 sm:space-y-6">
      <section className="glass-panel overflow-hidden rounded-[1.75rem] p-5 sm:p-7">
        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="min-w-0">
            <div className="mb-3 inline-flex rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">
              {isOwner ? 'Eigenaarsoverzicht' : 'Werkdag'}
            </div>
            <h2 className="text-fit text-2xl font-black tracking-normal text-slate-950 sm:text-4xl">
              {isOwner ? 'Alles in beeld, zonder zoeken.' : `Klaar voor je shift${userName ? `, ${userName}` : ''}?`}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              Start sneller, houd ruimen strak bij en zie direct wat vandaag is vastgelegd.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="rounded-2xl bg-white p-3 shadow-sm">
              <div className="text-xs font-semibold uppercase text-slate-400">Vandaag</div>
              <div className="mt-1 text-xl font-black text-slate-950 sm:text-2xl">{todaysSessions.length}</div>
            </div>
            <div className="rounded-2xl bg-white p-3 shadow-sm">
              <div className="text-xs font-semibold uppercase text-slate-400">Uren</div>
              <div className="mt-1 text-xl font-black text-slate-950 sm:text-2xl">{formatDuration(totalMs)}</div>
            </div>
            <div className="rounded-2xl bg-white p-3 shadow-sm">
              <div className="text-xs font-semibold uppercase text-slate-400">Service</div>
              <div className="mt-1 text-xl font-black text-slate-950 sm:text-2xl">{maintenanceLogs.length}</div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_18rem]">
        <div className="grid gap-4 sm:grid-cols-3">
          {functions.map(fn => (
            <button
              key={fn.id}
              onClick={() => onSelect(fn.id)}
              className="tap-card group min-w-0 overflow-hidden p-4 text-left"
            >
              <div className={`mb-5 h-2 w-20 rounded-full bg-gradient-to-r ${fn.accent}`} />
              <div className="text-fit text-xl font-black text-slate-950">{fn.label}</div>
              <div className="mt-1 text-sm text-slate-500">{fn.detail}</div>
              <div className="mt-6 flex items-center justify-between gap-3">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">Start</span>
                <span className="grid h-9 w-9 place-items-center rounded-full bg-slate-950 text-white transition group-hover:translate-x-1">→</span>
              </div>
            </button>
          ))}
        </div>

        <aside className="glass-panel rounded-[1.5rem] p-4">
          <div className="text-sm font-bold text-slate-950">Snelle acties</div>
          <div className="mt-3 grid gap-2">
            <button onClick={() => onSelect('tremmer-1')} className="rounded-2xl bg-white px-4 py-3 text-left text-sm font-semibold shadow-sm">
              Nieuwe ruim starten
            </button>
            {isOwner && (
              <button onClick={onAdmin} className="rounded-2xl bg-slate-950 px-4 py-3 text-left text-sm font-semibold text-white shadow-sm">
                Open eigenaarspaneel
              </button>
            )}
          </div>

          <div className="mt-5 rounded-2xl bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase text-slate-400">Laatste registratie</div>
            <div className="text-fit mt-2 text-sm font-semibold text-slate-900">
              {lastSession ? `${lastSession.machine || '-'} · ${lastSession.hold || 'geen ruim'}` : 'Nog geen sessies vandaag'}
            </div>
          </div>
        </aside>
      </section>
    </div>
  )
}
