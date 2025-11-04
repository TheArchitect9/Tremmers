import React, { useEffect, useState } from 'react'
import Login from './components/Login'
import FunctionSelection from './components/FunctionSelection'
import MachineSelection from './components/MachineSelection'
import BoatInfo from './components/BoatInfo'
import ActiveSession from './components/ActiveSession'
import AdminPanel from './components/AdminPanel'
import Maintenance from './components/Maintenance'
import { supabase } from './lib/supabase'

const USERS_KEY = 'awt_users_v1'
const SESSIONS_KEY = 'awt_sessions_v1'
const MAINT_KEY = 'awt_maintenance_v1'

function ensureAdmin(users) {
  const admin = users.find(u => u.username === 'apdewinter')
  if (!admin) {
    users.push({ username: 'apdewinter', password: 'TremmersDash1', approved: true, isAdmin: true })
  }
}

export default function App() {
  const [step, setStep] = useState('login')
  const [state, setState] = useState({})
  const [users, setUsers] = useState([])
  const [sessions, setSessions] = useState([])
  const [maintenanceLogs, setMaintenanceLogs] = useState([])
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    const raw = localStorage.getItem(USERS_KEY)
    const u = raw ? JSON.parse(raw) : []
    ensureAdmin(u)
    setUsers(u)
    localStorage.setItem(USERS_KEY, JSON.stringify(u))

    const rawS = localStorage.getItem(SESSIONS_KEY)
    setSessions(rawS ? JSON.parse(rawS) : [])

    const rawM = localStorage.getItem(MAINT_KEY)
    setMaintenanceLogs(rawM ? JSON.parse(rawM) : [])
  }, [])

  useEffect(() => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
  }, [users])

  useEffect(() => {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions))
  }, [sessions])

  useEffect(() => {
    localStorage.setItem(MAINT_KEY, JSON.stringify(maintenanceLogs))
  }, [maintenanceLogs])

  const go = (next, patch = {}) => {
    setState(s => ({ ...s, ...patch }))
    setStep(next)
  }

  async function registerUser({ username, password }) {
    if (users.find(u => u.username === username)) return { ok: false, message: 'Username exists' }
    const u = { username, password, approved: true, isAdmin: false }
    setUsers(prev => [...prev, u])

    // schrijf ook centraal naar Supabase (tabel: app_users)
    try {
      await supabase.from('app_users').upsert({ username })
    } catch (err) {
      console.warn('Supabase upsert failed', err)
    }

    return { ok: true }
  }

  function loginUser({ username, password }) {
    const u = users.find(x => x.username === username && x.password === password)
    if (!u) return { ok: false, message: 'Invalid credentials' }
    
    setCurrentUser(u)
    return { ok: true, user: u }
  }

  function logout() {
    setCurrentUser(null)
    setStep('login')
  }

  async function saveSession(record) {
    // lokaal
    setSessions(prev => [record, ...prev])

    // centraal in Supabase (work_sessions)
    try {
      await supabase.from('work_sessions').insert({
        username: currentUser?.username,
        function: record.function,
        machine: record.machine,
        boat: record.boat,
        hold: record.hold,
        start: record.start,
        end: record.end,
        duration_ms: record.duration_ms
      })
    } catch (err) {
      console.warn('Supabase insert failed', err)
    }
  }

  function saveMaintenance(record) {
    setMaintenanceLogs(prev => [record, ...prev])
  }

  // simple gating helper
  const isAdmin = currentUser && currentUser.isAdmin

  return (
    <div className="app-container min-h-screen">
      {!currentUser && (
        <Login
          onLogin={(creds) => {
            const res = loginUser(creds)
            if (res.ok) setStep('function')
            return res
          }}
          onRegister={(creds) => registerUser(creds)}
        />
      )}

      {currentUser && (
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/images/alpha-logo.jpg" alt="Alpha" className="w-10 h-10" />
            <div>
              <div className="text-sm">Alpha</div>
              <div className="font-medium">{currentUser.username}</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-sm" onClick={() => go('function')}>Home</button>
            <button className="text-sm" onClick={() => go('maintenance')}>Maintenance</button>
            {isAdmin && <button className="text-sm" onClick={() => go('admin')}>Admin</button>}
            <button className="text-sm text-red-600" onClick={logout}>Logout</button>
          
          </div>
          {currentUser && step !== 'login' && (
  <button
    type="button"
    style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      padding: '12px 18px',
      background: '#0672ff',
      color: '#fff',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px'
    }}
    onClick={() => { window.location.href = '/tremmer-suite/index.html'; }}
  >
    Open Tremmer Suite
  </button>
)}
        </div>
      )}

      {currentUser && step === 'function' && (
        <FunctionSelection
          onSelect={(fn) => go('machine', { function: fn })}
        />
      )}

      {currentUser && step === 'machine' && (
        <MachineSelection
          fn={state.function}
          onSelect={(machine) => go('boat', { machine })}
          onBack={() => go('function')}
        />
      )}

      {currentUser && step === 'boat' && (
        <BoatInfo
          onContinue={(data) => go('session', data)}
          onBack={() => go('machine')}
        />
      )}

      {currentUser && step === 'session' && (
        <ActiveSession
          sessionInfo={{ ...state, user: currentUser.username }}
          onSave={(rec) => saveSession(rec)}
          onEnd={() => go('function')}
        />
      )}

      {currentUser && step === 'maintenance' && (
        <Maintenance
          user={currentUser.username}
          onSave={(rec) => saveMaintenance(rec)}
          onBack={() => go('function')}
        />
      )}

      {currentUser && step === 'admin' && isAdmin && (
        <AdminPanel
          users={users}
          sessions={sessions}
          maintenance={maintenanceLogs}
          onBack={() => go('function')}
        />

      )}{/* tijdelijk testen: zonder currentUser check */}
  <button
    type="button"
    style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      padding: '12px 18px',
      background: '#0672ff',
      color: '#fff',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px'
    }}
    onClick={() => { window.location.href = '/tremmer-suite/index.html'; }}
  >
    Open Tremmer Suite
  </button>
</div>
 );
 }
{currentUser && step !== 'login' && (
  <button
    type="button"
    style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      padding: '12px 18px',
      background: '#0672ff',
      color: '#fff',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px'
    }}
    onClick={() => { window.location.href = '/tremmer-suite/'; }}
  >
    Open Tremmer Suite
  </button>
)}