import React from 'react'
import { getFunctionLabel } from '../utils/functionLabels'

const functions = [
  { id: 'tremmer-1', accent: 'from-sky-500 to-cyan-400' },
  { id: 'tremmer-2', accent: 'from-emerald-500 to-teal-400' },
  { id: 'tremmer-3', accent: 'from-amber-500 to-orange-400' }
]

const copy = {
  nl: {
    ownerBadge: 'Eigenaarsoverzicht',
    workerBadge: 'Werkdag',
    ownerTitle: 'Alles in beeld, zonder zoeken.',
    workerTitle: name => `Klaar voor je shift${name ? `, ${name}` : ''}?`,
    subtitle: 'Start sneller, houd ruimen strak bij en zie direct wat vandaag is vastgelegd.',
    today: 'Vandaag',
    hours: 'Uren',
    service: 'Service',
    quickActions: 'Snelle acties',
    newHold: 'Nieuwe ruim starten',
    ownerPanel: 'Open eigenaarspaneel',
    lastEntry: 'Laatste registratie',
    noSessions: 'Nog geen sessies vandaag',
    activeNow: 'Nu bezig',
    start: 'Start',
    functionDetails: {
      'tremmer-1': 'Kraan en hoofdwerk',
      'tremmer-2': 'Shovel en ondersteuning',
      'tremmer-3': 'Controle en afronding'
    },
    duration: (hours, minutes) => `${hours}u ${minutes}m`
  },
  en: {
    ownerBadge: 'Owner overview',
    workerBadge: 'Workday',
    ownerTitle: 'Everything visible without searching.',
    workerTitle: name => `Ready for your shift${name ? `, ${name}` : ''}?`,
    subtitle: 'Start faster, track holds clearly, and see what was logged today.',
    today: 'Today',
    hours: 'Hours',
    service: 'Service',
    quickActions: 'Quick actions',
    newHold: 'Start new hold',
    ownerPanel: 'Open owner panel',
    lastEntry: 'Latest entry',
    noSessions: 'No sessions today yet',
    activeNow: 'Active now',
    start: 'Start',
    functionDetails: {
      'tremmer-1': 'Crane and primary work',
      'tremmer-2': 'Loader and support work',
      'tremmer-3': 'Inspection and wrap-up'
    },
    duration: (hours, minutes) => `${hours}h ${minutes}m`
  }
}

function formatDuration(ms = 0, t) {
  const hours = Math.floor(ms / 3600000)
  const minutes = Math.floor((ms % 3600000) / 60000)
  return t.duration(hours, minutes)
}

export default function FunctionSelection({
  onSelect = () => {},
  onAdmin = () => {},
  isOwner = false,
  sessions = [],
  maintenanceLogs = [],
  activeSessions = [],
  userName = '',
  lang = 'nl'
}) {
  const t = copy[lang]
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
              {isOwner ? t.ownerBadge : t.workerBadge}
            </div>
            <h2 className="text-fit text-2xl font-black tracking-normal text-slate-950 sm:text-4xl">
              {isOwner ? t.ownerTitle : t.workerTitle(userName)}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              {t.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
            <div className="rounded-2xl bg-white p-3 shadow-sm">
              <div className="text-xs font-semibold uppercase text-slate-400">{t.today}</div>
              <div className="mt-1 text-xl font-black text-slate-950 sm:text-2xl">{todaysSessions.length}</div>
            </div>
            <div className="rounded-2xl bg-white p-3 shadow-sm">
              <div className="text-xs font-semibold uppercase text-slate-400">{t.hours}</div>
              <div className="mt-1 text-xl font-black text-slate-950 sm:text-2xl">{formatDuration(totalMs, t)}</div>
            </div>
            <div className="rounded-2xl bg-white p-3 shadow-sm">
              <div className="text-xs font-semibold uppercase text-slate-400">{t.service}</div>
              <div className="mt-1 text-xl font-black text-slate-950 sm:text-2xl">{maintenanceLogs.length}</div>
            </div>
            <div className="rounded-2xl bg-white p-3 shadow-sm">
              <div className="text-xs font-semibold uppercase text-slate-400">{t.activeNow}</div>
              <div className="mt-1 text-xl font-black text-slate-950 sm:text-2xl">{activeSessions.length}</div>
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
              <div className="text-fit text-xl font-black text-slate-950">{getFunctionLabel(fn.id, lang)}</div>
              <div className="mt-1 text-sm text-slate-500">{t.functionDetails[fn.id]}</div>
              <div className="mt-6 flex items-center justify-between gap-3">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{t.start}</span>
                <span className="grid h-9 w-9 place-items-center rounded-full bg-slate-950 text-white transition group-hover:translate-x-1">-&gt;</span>
              </div>
            </button>
          ))}
        </div>

        <aside className="glass-panel rounded-[1.5rem] p-4">
          <div className="text-sm font-bold text-slate-950">{t.quickActions}</div>
          <div className="mt-3 grid gap-2">
            <button onClick={() => onSelect('tremmer-1')} className="rounded-2xl bg-white px-4 py-3 text-left text-sm font-semibold shadow-sm">
              {t.newHold}
            </button>
            {isOwner && (
              <button onClick={onAdmin} className="rounded-2xl bg-slate-950 px-4 py-3 text-left text-sm font-semibold text-white shadow-sm">
                {t.ownerPanel}
              </button>
            )}
          </div>

          <div className="mt-5 rounded-2xl bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase text-slate-400">{t.lastEntry}</div>
            <div className="text-fit mt-2 text-sm font-semibold text-slate-900">
              {lastSession ? `${lastSession.machine || '-'} - ${lastSession.hold || '-'}` : t.noSessions}
            </div>
          </div>
        </aside>
      </section>
    </div>
  )
}
