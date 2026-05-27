import React, { useEffect, useState } from 'react'
import { getFunctionLabel } from '../utils/functionLabels'

const copy = {
  nl: {
    employee: 'Medewerker',
    function: 'Functie',
    machine: 'Machine',
    boat: 'Boot',
    start: 'Start',
    paused: 'Gepauzeerd',
    hold: 'Ruimnummer',
    holdPlaceholder: 'Vul ruimnummer in',
    startSession: 'Start sessie',
    closeHold: 'Sluit ruim',
    pause: 'Pauze',
    continue: 'Verder werken',
    endSession: 'Stop sessie',
    holdRequired: 'Vul eerst een ruimnummer in',
    notStarted: 'Sessie is nog niet gestart',
    recorded: 'Ruim gesloten en opgeslagen'
  },
  en: {
    employee: 'Worker',
    function: 'Role',
    machine: 'Machine',
    boat: 'Vessel',
    start: 'Start',
    paused: 'Paused',
    hold: 'Hold number',
    holdPlaceholder: 'Enter hold number',
    startSession: 'Start session',
    closeHold: 'Close hold',
    pause: 'Break',
    continue: 'Continue work',
    endSession: 'End session',
    holdRequired: 'Enter a hold number first',
    notStarted: 'Session has not started',
    recorded: 'Hold closed and saved'
  }
}

function formatDuration(ms) {
  const s = Math.floor(ms / 1000)
  const hh = Math.floor(s / 3600)
  const mm = Math.floor((s % 3600) / 60)
  const ss = s % 60
  return `${hh.toString().padStart(2, '0')}:${mm.toString().padStart(2, '0')}:${ss.toString().padStart(2, '0')}`
}

export default function ActiveSession({ sessionInfo = {}, onSave = () => {}, onActiveChange = () => {}, onEnd = () => {}, lang = 'nl' }) {
  const [startedAt, setStartedAt] = useState(null)
  const [now, setNow] = useState(Date.now())
  const [hold, setHold] = useState('')
  const [paused, setPaused] = useState(false)
  const [pauseStart, setPauseStart] = useState(null)
  const [accumulatedPause, setAccumulatedPause] = useState(0)
  const [localId] = useState(() => {
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()
    return `active-${Date.now()}-${Math.random().toString(16).slice(2)}`
  })
  const t = copy[lang]

  useEffect(() => {
    let id = null
    if (startedAt && !paused) {
      id = setInterval(() => setNow(Date.now()), 1000)
    }
    return () => { if (id) clearInterval(id) }
  }, [startedAt, paused])

  const elapsed = startedAt ? (now - startedAt - accumulatedPause) : 0

  useEffect(() => {
    if (!startedAt) return undefined

    const sync = () => onActiveChange({
      local_id: localId,
      function: sessionInfo.function,
      machine: sessionInfo.machine,
      boat: sessionInfo.boat,
      hold,
      start: new Date(startedAt).toISOString(),
      elapsed_ms: Date.now() - startedAt - accumulatedPause,
      status: paused ? 'paused' : 'active'
    })

    sync()
    const id = setInterval(sync, 15000)
    return () => clearInterval(id)
  }, [accumulatedPause, hold, localId, onActiveChange, paused, sessionInfo.boat, sessionInfo.function, sessionInfo.machine, startedAt])

  function startSession() {
    if (!hold) return alert(t.holdRequired)
    setStartedAt(Date.now())
    setNow(Date.now())
    setAccumulatedPause(0)
    setPaused(false)
  }

  function togglePause() {
    if (!startedAt) return
    if (!paused) {
      setPaused(true)
      setPauseStart(Date.now())
    } else {
      // unpause
      const added = Date.now() - (pauseStart || Date.now())
      setAccumulatedPause(prev => prev + added)
      setPauseStart(null)
      setPaused(false)
      setNow(Date.now())
    }
  }

  function closeHold() {
    if (!startedAt) return alert(t.notStarted)
    const end = Date.now()
    const duration = end - startedAt - accumulatedPause
    const rec = {
      id: Date.now(),
      user: sessionInfo.user,
      function: sessionInfo.function,
      machine: sessionInfo.machine,
      boat: sessionInfo.boat,
      hold,
      start: new Date(startedAt).toISOString(),
      end: new Date(end).toISOString(),
      duration_ms: duration,
      type: 'hold'
    }
    onSave(rec)
    onActiveChange({ local_id: localId }, 'delete')
    // reset session but keep on page
    setStartedAt(null)
    setPaused(false)
    setPauseStart(null)
    setAccumulatedPause(0)
    alert(t.recorded)
  }

  function endSession() {
    // close overall session and navigate back
    if (startedAt) closeHold()
    onEnd()
  }

  return (
    <div className="glass-panel mx-auto w-full max-w-3xl rounded-[1.75rem] p-5 sm:p-6">
      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        <div className="rounded-2xl bg-white p-4 shadow-sm min-w-0">
          <div className="text-sm text-gray-500">{t.employee}</div>
          <div className="truncate font-medium">{sessionInfo.user}</div>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm min-w-0">
          <div className="text-sm text-gray-500">{t.function}</div>
          <div className="truncate font-medium">{getFunctionLabel(sessionInfo.function)}</div>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="text-sm text-gray-500">{t.machine}</div>
          <div className="font-medium">{sessionInfo.machine}</div>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="text-sm text-gray-500">{t.boat}</div>
          <div className="font-medium">{sessionInfo.boat || '-'}</div>
        </div>
      </div>

      <div className="mb-6 rounded-[1.5rem] bg-slate-950 p-5 text-center text-white">
        <div className="text-xl sm:text-3xl">{t.start}: {startedAt ? new Date(startedAt).toLocaleTimeString() : '-'}</div>
        <div className="mt-2 text-4xl font-black sm:text-5xl">{formatDuration(elapsed)}</div>
        {paused && <div className="mt-2 text-sm text-yellow-300">{t.paused}</div>}
      </div>

      <label className="flex flex-col mb-4">
        <span className="text-base font-medium">{t.hold}</span>
        <input value={hold} onChange={e => setHold(e.target.value)} inputMode="numeric" className="soft-input mt-2" placeholder={t.holdPlaceholder} />
      </label>

      <div className="flex flex-col gap-4">
        {!startedAt ? (
          <button onClick={startSession} className="rounded-2xl bg-slate-950 py-4 text-lg font-semibold text-white sm:text-xl">{t.startSession}</button>
        ) : (
          <>
            <button onClick={closeHold} className="rounded-2xl bg-red-600 py-4 text-lg font-semibold text-white sm:text-xl">{t.closeHold}</button>
            <button onClick={togglePause} className="rounded-2xl bg-yellow-400 py-4 text-lg font-semibold text-black sm:text-xl">{paused ? t.continue : t.pause}</button>
            <button onClick={endSession} className="rounded-2xl bg-emerald-600 py-4 text-lg font-semibold text-white sm:text-xl">{t.endSession}</button>
          </>
        )}
      </div>
    </div>
  )
}
