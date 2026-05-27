import React, { useEffect, useState } from 'react'
import { getFunctionLabel } from '../utils/functionLabels'

function formatDuration(ms) {
  const s = Math.floor(ms / 1000)
  const hh = Math.floor(s / 3600)
  const mm = Math.floor((s % 3600) / 60)
  const ss = s % 60
  return `${hh.toString().padStart(2, '0')}:${mm.toString().padStart(2, '0')}:${ss.toString().padStart(2, '0')}`
}

export default function ActiveSession({ sessionInfo = {}, onSave = () => {}, onEnd = () => {} }) {
  const [startedAt, setStartedAt] = useState(null)
  const [now, setNow] = useState(Date.now())
  const [hold, setHold] = useState('')
  const [paused, setPaused] = useState(false)
  const [pauseStart, setPauseStart] = useState(null)
  const [accumulatedPause, setAccumulatedPause] = useState(0)

  useEffect(() => {
    let id = null
    if (startedAt && !paused) {
      id = setInterval(() => setNow(Date.now()), 1000)
    }
    return () => { if (id) clearInterval(id) }
  }, [startedAt, paused])

  const elapsed = startedAt ? (now - startedAt - accumulatedPause) : 0

  function startSession() {
    if (!hold) return alert('Enter hold number before starting')
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
    if (!startedAt) return alert('Session not started')
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
    // reset session but keep on page
    setStartedAt(null)
    setPaused(false)
    setPauseStart(null)
    setAccumulatedPause(0)
    alert('Hold closed and recorded')
  }

  function endSession() {
    // close overall session and navigate back
    if (startedAt) closeHold()
    onEnd()
  }

  return (
    <div className="mx-auto mt-5 w-full max-w-3xl rounded-lg bg-white p-5 shadow-md sm:mt-8 sm:p-6">
      <div className="mb-4 grid grid-cols-1 gap-3 border-b pb-4 sm:grid-cols-2 sm:gap-4">
        <div className="min-w-0">
          <div className="text-sm text-gray-500">Employee</div>
          <div className="truncate font-medium">{sessionInfo.user}</div>
        </div>
        <div className="min-w-0">
          <div className="text-sm text-gray-500">Function</div>
          <div className="truncate font-medium">{getFunctionLabel(sessionInfo.function)}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Machine</div>
          <div className="font-medium">{sessionInfo.machine}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Boat</div>
          <div className="font-medium">{sessionInfo.boat || '-'}</div>
        </div>
      </div>

      <div className="mb-6 text-center">
        <div className="text-xl sm:text-3xl">Start: {startedAt ? new Date(startedAt).toLocaleTimeString() : '-'}</div>
        <div className="mt-2 text-3xl font-bold sm:text-4xl">{formatDuration(elapsed)}</div>
        {paused && <div className="text-sm text-yellow-600 mt-2">Paused</div>}
      </div>

      <label className="flex flex-col mb-4">
        <span className="text-base font-medium">Hold number</span>
        <input value={hold} onChange={e => setHold(e.target.value)} inputMode="numeric" className="mt-2 border-b-2 p-2 text-lg outline-none sm:text-xl" placeholder="Enter hold number" />
      </label>

      <div className="flex flex-col gap-4">
        {!startedAt ? (
          <button onClick={startSession} className="rounded-lg bg-blue-600 py-3 text-lg text-white sm:py-4 sm:text-xl">Start Session</button>
        ) : (
          <>
            <button onClick={closeHold} className="rounded-lg bg-red-600 py-3 text-lg text-white sm:py-4 sm:text-xl">Close Hold</button>
            <button onClick={togglePause} className="rounded-lg bg-yellow-400 py-3 text-lg text-black sm:py-4 sm:text-xl">{paused ? 'Continue Work' : 'Pause Break'}</button>
            <button onClick={endSession} className="rounded-lg bg-green-600 py-3 text-lg text-white sm:py-4 sm:text-xl">End Session</button>
          </>
        )}
      </div>
    </div>
  )
}
