import React, { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

function formatDuration(ms = 0) {
  const hours = Math.floor(ms / 3600000)
  const minutes = Math.floor((ms % 3600000) / 60000)
  return `${hours}u ${minutes}m`
}

function downloadCsv(rows) {
  const header = ['user_id', 'function', 'machine', 'boat', 'hold', 'start', 'end', 'duration_ms']
  const csv = [
    header.join(','),
    ...rows.map(row => header.map(key => `"${String(row[key] ?? '').replaceAll('"', '""')}"`).join(','))
  ].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `alpha-sessions-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

const copy = {
  nl: {
    back: 'Terug naar app',
    badge: 'Eigenaar',
    title: 'Live inzicht in iedereen die werkt.',
    subtitle: 'Zie wie bezig is, wat er is afgerond, waar onderhoud speelt en exporteer registraties wanneer je wilt.',
    export: 'Exporteer CSV',
    users: 'Gebruikers',
    active: 'Nu bezig',
    today: 'Sessies vandaag',
    hours: 'Uren vandaag',
    maintenance: 'Onderhoud',
    approved: 'goedgekeurd',
    waiting: 'wacht',
    owner: 'eigenaar',
    noUsers: 'Nog geen gebruikers gevonden.',
    activeTitle: 'Live werkzaamheden',
    noActive: 'Niemand is nu actief bezig.',
    latest: 'Laatste sessies',
    total: 'totaal',
    worker: 'Medewerker',
    role: 'Functie',
    machine: 'Machine',
    boat: 'Boot',
    hold: 'Ruim',
    start: 'Start',
    duration: 'Duur'
  },
  en: {
    back: 'Back to app',
    badge: 'Owner',
    title: 'Live insight into everyone at work.',
    subtitle: 'See who is active, what was completed, where maintenance is happening, and export logs whenever needed.',
    export: 'Export CSV',
    users: 'Users',
    active: 'Active now',
    today: 'Sessions today',
    hours: 'Hours today',
    maintenance: 'Maintenance',
    approved: 'approved',
    waiting: 'waiting',
    owner: 'owner',
    noUsers: 'No users found yet.',
    activeTitle: 'Live work',
    noActive: 'No one is active right now.',
    latest: 'Latest sessions',
    total: 'total',
    worker: 'Worker',
    role: 'Role',
    machine: 'Machine',
    boat: 'Vessel',
    hold: 'Hold',
    start: 'Start',
    duration: 'Duration'
  }
}

export default function AdminPanel({ sessions: localSessions = [], maintenance = [], activeSessions = [], onBack = () => {}, lang = 'nl' }) {
  const [users, setUsers] = useState([])
  const [sessions, setSessions] = useState(localSessions)
  const t = copy[lang]

  useEffect(() => {
    ;(async () => {
      const { data: u } = await supabase
        .from('profiles')
        .select('id, username, approved, is_admin, created_at')
        .order('created_at', { ascending: false })
      setUsers(u || [])

      const { data: s } = await supabase
        .from('sessions')
        .select('id, user_id, function, machine, boat, hold, start, end, duration_ms, created_at')
        .order('created_at', { ascending: false })
      setSessions(s?.length ? s : localSessions)
    })()
  }, [localSessions])

  const stats = useMemo(() => {
    const today = new Date().toDateString()
    const todaysSessions = sessions.filter(s => s.start && new Date(s.start).toDateString() === today)
    const totalMs = todaysSessions.reduce((sum, s) => sum + (s.duration_ms || 0), 0)
    const activeUsers = new Set(sessions.map(s => s.user_id || s.user).filter(Boolean)).size

    return {
      users: users.length,
      activeUsers: activeSessions.length || activeUsers,
      today: todaysSessions.length,
      hours: formatDuration(totalMs),
      maintenance: maintenance.length
    }
  }, [activeSessions.length, maintenance.length, sessions, users.length])

  const userMap = useMemo(() => {
    return users.reduce((map, user) => {
      map[user.id] = user.username || user.id
      return map
    }, {})
  }, [users])

  const nameFor = id => userMap[id] || id || '-'

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 sm:space-y-6">
      <section className="glass-panel rounded-[1.75rem] p-5 sm:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <button onClick={onBack} className="mb-4 text-sm font-semibold text-sky-700">{t.back}</button>
            <div className="mb-3 inline-flex rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">
              {t.badge}
            </div>
            <h2 className="text-fit text-2xl font-black text-slate-950 sm:text-4xl">{t.title}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              {t.subtitle}
            </p>
          </div>
          <button
            onClick={() => downloadCsv(sessions)}
            className="pill-button bg-slate-950 text-white hover:bg-slate-800"
          >
            {t.export}
          </button>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[
          [t.users, stats.users],
          [t.active, stats.activeUsers],
          [t.today, stats.today],
          [t.hours, stats.hours],
          [t.maintenance, stats.maintenance]
        ].map(([label, value]) => (
          <div key={label} className="tap-card p-4">
            <div className="text-xs font-semibold uppercase text-slate-400">{label}</div>
            <div className="text-fit mt-2 text-2xl font-black text-slate-950">{value}</div>
          </div>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-[20rem_1fr]">
        <div className="glass-panel rounded-[1.5rem] p-4">
          <h3 className="mb-3 text-lg font-bold text-slate-950">{t.users}</h3>
          <div className="space-y-2">
            {users.length === 0 && <div className="text-sm text-slate-500">{t.noUsers}</div>}
            {users.map(u => (
              <div key={u.id} className="rounded-2xl bg-white p-3 shadow-sm">
                <div className="text-fit font-semibold text-slate-950">{u.username || u.id}</div>
                <div className="mt-1 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-600">{u.approved ? t.approved : t.waiting}</span>
                  {u.is_admin && <span className="rounded-full bg-sky-100 px-2 py-1 text-sky-700">{t.owner}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="glass-panel rounded-[1.5rem] p-4">
            <h3 className="mb-3 text-lg font-bold text-slate-950">{t.activeTitle}</h3>
            <div className="grid gap-3 md:grid-cols-2">
              {activeSessions.length === 0 && <div className="text-sm text-slate-500">{t.noActive}</div>}
              {activeSessions.map(s => (
                <div key={s.local_id || s.id} className="rounded-2xl bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-fit font-black text-slate-950">{s.username || nameFor(s.user_id)}</div>
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${s.status === 'paused' ? 'bg-yellow-100 text-yellow-800' : 'bg-emerald-100 text-emerald-700'}`}>
                      {s.status || 'active'}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-slate-500">{s.function || '-'} · {s.machine || '-'} · {s.boat || '-'}</div>
                  <div className="mt-1 text-sm font-semibold text-slate-700">{t.hold}: {s.hold || '-'}</div>
                  <div className="mt-2 text-xs text-slate-400">{s.updated_at ? new Date(s.updated_at).toLocaleTimeString() : ''}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-bold text-slate-950">{t.latest}</h3>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500 shadow-sm">{sessions.length} {t.total}</span>
          </div>

          <div className="grid gap-3 lg:hidden">
            {sessions.map(s => (
              <div key={s.id} className="tap-card p-4">
                <div className="text-fit font-bold text-slate-950">{nameFor(s.user_id || s.user)} · {s.machine || '-'} · {t.hold} {s.hold || '-'}</div>
                <div className="mt-1 text-sm text-slate-500">{s.function || '-'} · {s.boat || '-'}</div>
                <div className="mt-3 text-xs font-semibold text-slate-400">{s.start ? new Date(s.start).toLocaleString() : ''}</div>
              </div>
            ))}
          </div>

          <div className="hidden w-full overflow-x-auto rounded-2xl border border-slate-200 bg-white lg:block">
            <table className="min-w-[860px] w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left text-xs uppercase text-slate-400">
                  <th className="p-3">{t.worker}</th>
                  <th className="p-3">{t.role}</th>
                  <th className="p-3">{t.machine}</th>
                  <th className="p-3">{t.boat}</th>
                  <th className="p-3">{t.hold}</th>
                  <th className="p-3">{t.start}</th>
                  <th className="p-3">{t.duration}</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map(s => (
                  <tr key={s.id} className="border-t">
                    <td className="p-3">{nameFor(s.user_id || s.user)}</td>
                    <td className="p-3">{s.function}</td>
                    <td className="p-3">{s.machine}</td>
                    <td className="p-3">{s.boat}</td>
                    <td className="p-3">{s.hold}</td>
                    <td className="p-3">{s.start ? new Date(s.start).toLocaleString() : ''}</td>
                    <td className="p-3">{formatDuration(s.duration_ms)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}
