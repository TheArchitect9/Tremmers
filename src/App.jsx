import React, { useEffect, useState } from 'react';
import Login from './components/Login';
import FunctionSelection from './components/FunctionSelection';
import MachineSelection from './components/MachineSelection';
import BoatInfo from './components/BoatInfo';
import ActiveSession from './components/ActiveSession';
import AdminPanel from './components/AdminPanel';
import Maintenance from './components/Maintenance';
import { supabase } from './lib/supabase';

const USERS_KEY = 'awt_users_v1';
const SESSIONS_KEY = 'awt_sessions_v1';
const MAINT_KEY = 'awt_maintenance_v1';

function ensureAdmin(users) {
  const admin = users.find(u => u.username === 'apdewinter');
  if (!admin) {
    users.push({ username: 'apdewinter', password: 'TremmersDash1', approved: true, isAdmin: true });
  }
}

export default function App() {
  const [step, setStep] = useState('login');
  const [state, setState] = useState({});
  const [users, setUsers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [maintenanceLogs, setMaintenanceLogs] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const raw = localStorage.getItem(USERS_KEY);
        const u = raw ? JSON.parse(raw) : [];
        ensureAdmin(u);
        setUsers(u);
        localStorage.setItem(USERS_KEY, JSON.stringify(u));

        const rawS = localStorage.getItem(SESSIONS_KEY);
        setSessions(rawS ? JSON.parse(rawS) : []);

        const rawM = localStorage.getItem(MAINT_KEY);
        setMaintenanceLogs(rawM ? JSON.parse(rawM) : []);
      } catch (error) {
        console.error('Initialization error:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeApp();
  }, []);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
  }, [users, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
    }
  }, [sessions, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(MAINT_KEY, JSON.stringify(maintenanceLogs));
    }
  }, [maintenanceLogs, isInitialized]);

  const go = (next, patch = {}) => {
    setState(s => ({ ...s, ...patch }));
    setStep(next);
  };

  async function registerUser({ username, password }) {
    if (users.find(u => u.username === username)) {
      return { ok: false, message: 'Username exists' };
    }
    const u = { username, password, approved: true, isAdmin: false };
    setUsers(prev => [...prev, u]);

    try {
      await supabase.from('app_users').upsert({ username });
    } catch (err) {
      console.warn('Supabase upsert failed', err);
    }

    return { ok: true };
  }

  function loginUser({ username, password }) {
    const u = users.find(x => x.username === username && x.password === password);
    if (!u) return { ok: false, message: 'Invalid credentials' };
    
    setCurrentUser(u);
    return { ok: true, user: u };
  }

  function logout() {
    setCurrentUser(null);
    setStep('login');
  }

  async function saveSession(record) {
    setSessions(prev => [record, ...prev]);

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
      });
    } catch (err) {
      console.warn('Supabase insert failed', err);
    }
  }

  function saveMaintenance(record) {
    setMaintenanceLogs(prev => [record, ...prev]);
  }

  const isAdmin = currentUser && currentUser.isAdmin;

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading application...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container min-h-screen bg-gray-50">
      {!currentUser ? (
        <Login
          onLogin={(creds) => {
            const res = loginUser(creds);
            if (res.ok) setStep('function');
            return res;
          }}
          onRegister={(creds) => registerUser(creds)}
        />
      ) : (
        <>
          <header className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <img 
                  src="/images/alpha-logo.jpg" 
                  alt="Alpha" 
                  className="h-10 w-10 rounded-full"
                />
                <div>
                  <h1 className="text-lg font-medium text-gray-900">Alpha Work Tracker</h1>
                  <p className="text-sm text-gray-500">Welcome, {currentUser.username}</p>
                </div>
              </div>
              <nav className="flex space-x-4">
                <button 
                  onClick={() => go('function')} 
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Home
                </button>
                <button 
                  onClick={() => go('maintenance')} 
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Maintenance
                </button>
                {isAdmin && (
                  <button 
                    onClick={() => go('admin')} 
                    className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    Admin
                  </button>
                )}
                <button 
                  onClick={logout} 
                  className="px-3 py-2 text-sm font-medium text-red-600 hover:text-red-800"
                >
                  Logout
                </button>
              </nav>
            </div>
          </header>

          <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            {step === 'function' && (
              <FunctionSelection
                onSelect={(fn) => go('machine', { function: fn })}
              />
            )}

            {step === 'machine' && (
              <MachineSelection
                fn={state.function}
                onSelect={(machine) => go('boat', { machine })}
                onBack={() => go('function')}
              />
            )}

            {step === 'boat' && (
              <BoatInfo
                onContinue={(data) => go('session', data)}
                onBack={() => go('machine')}
              />
            )}

            {step === 'session' && (
              <ActiveSession
                sessionInfo={{ ...state, user: currentUser.username }}
                onSave={(rec) => saveSession(rec)}
                onEnd={() => go('function')}
              />
            )}

            {step === 'maintenance' && (
              <Maintenance
                user={currentUser.username}
                onSave={(rec) => saveMaintenance(rec)}
                onBack={() => go('function')}
              />
            )}

            {step === 'admin' && isAdmin && (
              <AdminPanel
                users={users}
                sessions={sessions}
                maintenance={maintenanceLogs}
                onBack={() => go('function')}
              />
            )}
          </main>

        </>
      )}
    </div>
  );
}
