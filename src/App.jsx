import React, { useEffect, useState } from 'react';
import Login from './components/Login';
import FunctionSelection from './components/FunctionSelection';
import MachineSelection from './components/MachineSelection';
import BoatInfo from './components/BoatInfo';
import ActiveSession from './components/ActiveSession';
import AdminPanel from './components/AdminPanel';
import Maintenance from './components/Maintenance';
import { supabase } from './lib/supabaseClient';

const USERS_KEY = 'awt_users_v1';

export default function App() {
  const [step, setStep] = useState('login');
  const [state, setState] = useState({});
  const [legacyUsers, setLegacyUsers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [maintenanceLogs, setMaintenanceLogs] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const rawUsers = localStorage.getItem(USERS_KEY);
        setLegacyUsers(rawUsers ? JSON.parse(rawUsers) : []);
      } catch (err) {
        console.warn('Could not load local users', err);
      }

      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        await setSignedInUser(data.session.user);
      }
      setIsInitialized(true);
    };

    initializeApp();
  }, []);

  const go = (next, patch = {}) => {
    setState(s => ({ ...s, ...patch }));
    setStep(next);
  };

  async function setSignedInUser(user) {
    setCurrentUser(user);

    const { data } = await supabase
      .from('profiles')
      .select('username, approved, is_admin')
      .eq('id', user.id)
      .maybeSingle();

    setProfile(data || null);
    setStep('function');
  }

  async function registerUser({ identifier, email, password }) {
    const loginName = (identifier || email || '').trim();

    if (!loginName.includes('@')) {
      if (legacyUsers.find(u => u.username === loginName)) {
        return { ok: false, message: 'Gebruikersnaam bestaat al' };
      }

      const user = { username: loginName, password, isAdmin: false, isLegacy: true };
      const nextUsers = [...legacyUsers, user];
      setLegacyUsers(nextUsers);
      localStorage.setItem(USERS_KEY, JSON.stringify(nextUsers));
      return { ok: true };
    }

    const { error } = await supabase.auth.signUp({ email: loginName, password });
    if (error) return { ok: false, message: error.message };
    // User will confirm email; after confirmation Supabase profile can be synced if needed
    return { ok: true };
  }

  async function loginUser({ identifier, email, password }) {
    const loginName = (identifier || email || '').trim();

    if (loginName.includes('@')) {
      const { error, data } = await supabase.auth.signInWithPassword({ email: loginName, password });
      if (error) return { ok: false, message: error.message };
      await setSignedInUser(data.user);
      return { ok: true, user: data.user };
    }

    const legacyUser = legacyUsers.find(u => u.username === loginName && u.password === password);
    if (!legacyUser) return { ok: false, message: 'Gebruikersnaam of wachtwoord klopt niet' };

    setCurrentUser({ ...legacyUser, email: legacyUser.username, isLegacy: true });
    setProfile({ username: legacyUser.username, is_admin: Boolean(legacyUser.isAdmin) });
    setStep('function');
    return { ok: true, user: legacyUser };
  }

  async function logout() {
    if (!currentUser?.isLegacy) {
      await supabase.auth.signOut();
    }
    setCurrentUser(null);
    setProfile(null);
    setStep('login');
  }

  async function saveSession(record) {
    setSessions(prev => [record, ...prev]);

    if (currentUser?.isLegacy) return;

    try {
      await supabase.from('sessions').insert({
        user_id: currentUser?.id,
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

  async function saveMaintenance(record) {
    setMaintenanceLogs(prev => [record, ...prev]);

    if (currentUser?.isLegacy) return;

    try {
      await supabase.from('maintenance').insert({
        user_id: currentUser?.id,
        machine: record.machine,
        options: record.options,
        ts: record.ts
      });
    } catch (err) {
      console.warn('Supabase maintenance insert failed', err);
    }
  }

  const displayName = profile?.username || currentUser?.email;
  const isAdmin = Boolean(profile?.is_admin);

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
          onLogin={(creds) => loginUser(creds)}
          onRegister={(creds) => registerUser(creds)}
        />
      ) : (
        <>
          <header className="bg-white shadow-sm">
            <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8 md:flex-row md:items-center md:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <img 
                  src="/images/alpha-logo.png" 
                  alt="Alpha" 
                  className="h-10 w-10 shrink-0 rounded-full"
                />
                <div className="min-w-0">
                  <h1 className="truncate text-base font-medium text-gray-900 sm:text-lg">Alpha Work Tracker</h1>
                  <p className="truncate text-sm text-gray-500">Welcome, {displayName}</p>
                </div>
              </div>
              <nav className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end sm:gap-3">
                <button 
                  onClick={() => go('function')} 
                  className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                >
                  Home
                </button>
                <button 
                  onClick={() => go('maintenance')} 
                  className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                >
                  Maintenance
                </button>
                {isAdmin && (
                  <button 
                    onClick={() => go('admin')} 
                    className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  >
                    Admin
                  </button>
                )}
                <button 
                  onClick={logout} 
                  className="rounded-md px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-800"
                >
                  Logout
                </button>
              </nav>
            </div>
          </header>

          <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
            {step === 'function' && (
              <FunctionSelection
                onSelect={(fn) => go('machine', { function: fn })}
                onAdmin={() => go('admin')}
                isAdmin={isAdmin}
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
                sessionInfo={{ ...state, user: displayName }}
                onSave={(rec) => saveSession(rec)}
                onEnd={() => go('function')}
              />
            )}

            {step === 'maintenance' && (
              <Maintenance
                user={displayName}
                onSave={(rec) => saveMaintenance(rec)}
                onBack={() => go('function')}
              />
            )}

            {step === 'admin' && isAdmin && (
              <AdminPanel
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
