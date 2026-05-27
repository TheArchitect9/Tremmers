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
const SESSIONS_KEY = 'awt_sessions_v2';
const MAINTENANCE_KEY = 'awt_maintenance_v2';
const OFFLINE_QUEUE_KEY = 'awt_offline_queue_v1';

const copy = {
  nl: {
    home: 'Home',
    maintenance: 'Onderhoud',
    owner: 'Eigenaar',
    logout: 'Uitloggen',
    roleOwner: 'Eigenaar',
    roleWorker: 'Medewerker',
    langLabel: 'English'
  },
  en: {
    home: 'Home',
    maintenance: 'Maintenance',
    owner: 'Owner',
    logout: 'Log out',
    roleOwner: 'Owner',
    roleWorker: 'Worker',
    langLabel: 'Nederlands',
    invalidCredentials: 'Username or password is incorrect'
  }
};

export default function App() {
  const [step, setStep] = useState('login');
  const [state, setState] = useState({});
  const [lang, setLang] = useState('nl');
  const [legacyUsers, setLegacyUsers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [maintenanceLogs, setMaintenanceLogs] = useState([]);
  const [activeSessions, setActiveSessions] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const rawUsers = localStorage.getItem(USERS_KEY);
        setLegacyUsers(rawUsers ? JSON.parse(rawUsers) : []);
        setSessions(JSON.parse(localStorage.getItem(SESSIONS_KEY) || '[]'));
        setMaintenanceLogs(JSON.parse(localStorage.getItem(MAINTENANCE_KEY) || '[]'));
      } catch (err) {
        console.warn('Could not load local app data', err);
      }

      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        await setSignedInUser(data.session.user);
      }
      setIsInitialized(true);
    };

    initializeApp();
  }, []);

  useEffect(() => {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions.slice(0, 500)));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem(MAINTENANCE_KEY, JSON.stringify(maintenanceLogs.slice(0, 500)));
  }, [maintenanceLogs]);

  useEffect(() => {
    if (!currentUser?.id || currentUser?.isLegacy) return undefined;

    refreshOwnerData();
    flushOfflineQueue();

    const channel = supabase
      .channel('owner-live-activity')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sessions' }, refreshOwnerData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'maintenance' }, refreshOwnerData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'active_sessions' }, refreshOwnerData)
      .subscribe();

    const retry = setInterval(flushOfflineQueue, 30000);
    window.addEventListener('online', flushOfflineQueue);

    return () => {
      clearInterval(retry);
      window.removeEventListener('online', flushOfflineQueue);
      supabase.removeChannel(channel);
    };
  }, [currentUser?.id, currentUser?.isLegacy]);

  const go = (next, patch = {}) => {
    setState(s => ({ ...s, ...patch }));
    setStep(next);
  };

  function t(key) {
    return copy[lang][key] || key;
  }

  async function refreshOwnerData() {
    const [{ data: remoteSessions }, { data: remoteMaintenance }, { data: remoteActive }] = await Promise.all([
      supabase.from('sessions').select('*').order('created_at', { ascending: false }),
      supabase.from('maintenance').select('*').order('ts', { ascending: false }),
      supabase.from('active_sessions').select('*').order('updated_at', { ascending: false })
    ]);

    if (remoteSessions) setSessions(remoteSessions);
    if (remoteMaintenance) setMaintenanceLogs(remoteMaintenance);
    if (remoteActive) setActiveSessions(remoteActive);
  }

  function queueOfflineWrite(table, payload, action = 'insert') {
    const queue = JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]');
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify([...queue, { table, payload, action, ts: Date.now() }]));
  }

  async function flushOfflineQueue() {
    const queue = JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]');
    if (!queue.length) return;

    const remaining = [];
    for (const item of queue) {
      const query = item.action === 'upsert'
        ? supabase.from(item.table).upsert(item.payload)
        : supabase.from(item.table).insert(item.payload);
      const { error } = await query;
      if (error) remaining.push(item);
    }
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remaining));
  }

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
    // User confirms by email; profile data can be synced after confirmation.
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
    if (!legacyUser) return { ok: false, message: lang === 'en' ? t('invalidCredentials') : 'Gebruikersnaam of wachtwoord klopt niet' };

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
      const payload = {
        user_id: currentUser?.id,
        function: record.function,
        machine: record.machine,
        boat: record.boat,
        hold: record.hold,
        start: record.start,
        end: record.end,
        duration_ms: record.duration_ms
      };
      const { error } = await supabase.from('sessions').insert(payload);
      if (error) throw error;
    } catch (err) {
      console.warn('Remote session save failed', err);
      queueOfflineWrite('sessions', {
        user_id: currentUser?.id,
        function: record.function,
        machine: record.machine,
        boat: record.boat,
        hold: record.hold,
        start: record.start,
        end: record.end,
        duration_ms: record.duration_ms
      });
    }
  }

  async function saveMaintenance(record) {
    setMaintenanceLogs(prev => [record, ...prev]);

    if (currentUser?.isLegacy) return;

    try {
      const payload = {
        user_id: currentUser?.id,
        machine: record.machine,
        options: record.options,
        ts: record.ts
      };
      const { error } = await supabase.from('maintenance').insert(payload);
      if (error) throw error;
    } catch (err) {
      console.warn('Remote maintenance save failed', err);
      queueOfflineWrite('maintenance', {
        user_id: currentUser?.id,
        machine: record.machine,
        options: record.options,
        ts: record.ts
      });
    }
  }

  async function updateActiveSession(record, action = 'upsert') {
    const enriched = {
      ...record,
      user_id: currentUser?.id,
      username: displayName,
      updated_at: new Date().toISOString()
    };

    setActiveSessions(prev => {
      if (action === 'delete') return prev.filter(s => s.local_id !== record.local_id);
      const exists = prev.some(s => s.local_id === record.local_id);
      return exists ? prev.map(s => (s.local_id === record.local_id ? enriched : s)) : [enriched, ...prev];
    });

    if (currentUser?.isLegacy) return;

    try {
      if (action === 'delete') {
        await supabase.from('active_sessions').delete().eq('local_id', record.local_id);
      } else {
        const { error } = await supabase.from('active_sessions').upsert(enriched, { onConflict: 'local_id' });
        if (error) throw error;
      }
    } catch (err) {
      console.warn('Active session sync failed', err);
      if (action !== 'delete') queueOfflineWrite('active_sessions', enriched, 'upsert');
    }
  }

  const displayName = profile?.username || currentUser?.email;
  const isOwner = Boolean(profile?.is_admin) || displayName === 'apdewinter';

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
    <div className="app-container min-h-screen">
      {!currentUser ? (
        <Login
          onLogin={(creds) => loginUser(creds)}
          onRegister={(creds) => registerUser(creds)}
          lang={lang}
          onToggleLanguage={() => setLang(lang === 'nl' ? 'en' : 'nl')}
        />
      ) : (
        <>
          <header className="sticky top-0 z-20 border-b border-white/70 bg-white/75 backdrop-blur-xl">
            <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-3 sm:px-6 lg:px-8 md:flex-row md:items-center md:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <img 
                  src="/images/alpha-logo.png" 
                  alt="Alpha" 
                  className="h-11 w-11 shrink-0 rounded-2xl object-cover shadow-md"
                />
                <div className="min-w-0">
                  <h1 className="truncate text-base font-bold text-slate-950 sm:text-lg">Alpha Work Tracker</h1>
                  <p className="truncate text-sm text-slate-500">{isOwner ? t('roleOwner') : t('roleWorker')} - {displayName}</p>
                </div>
              </div>
              <nav className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end sm:gap-3">
                <button 
                  onClick={() => go('function')} 
                  className="pill-button bg-slate-100 text-slate-700 hover:bg-slate-200"
                >
                  {t('home')}
                </button>
                <button 
                  onClick={() => go('maintenance')} 
                  className="pill-button bg-slate-100 text-slate-700 hover:bg-slate-200"
                >
                  {t('maintenance')}
                </button>
                {isOwner && (
                  <button 
                    onClick={() => go('admin')} 
                    className="pill-button bg-slate-950 text-white hover:bg-slate-800"
                  >
                    {t('owner')}
                  </button>
                )}
                <button
                  onClick={() => setLang(lang === 'nl' ? 'en' : 'nl')}
                  className="pill-button bg-white text-slate-700 shadow-sm hover:bg-slate-100"
                >
                  {t('langLabel')}
                </button>
                <button 
                  onClick={logout} 
                  className="pill-button bg-red-50 text-red-700 hover:bg-red-100"
                >
                  {t('logout')}
                </button>
              </nav>
            </div>
          </header>

          <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
            {step === 'function' && (
              <FunctionSelection
                onSelect={(fn) => go('machine', { function: fn })}
                onAdmin={() => go('admin')}
                isOwner={isOwner}
                sessions={sessions}
                maintenanceLogs={maintenanceLogs}
                activeSessions={activeSessions}
                userName={displayName}
                lang={lang}
              />
            )}

            {step === 'machine' && (
              <MachineSelection
                fn={state.function}
                onSelect={(machine) => go('boat', { machine })}
                onBack={() => go('function')}
                lang={lang}
              />
            )}

            {step === 'boat' && (
              <BoatInfo
                onContinue={(data) => go('session', data)}
                onBack={() => go('machine')}
                lang={lang}
              />
            )}

            {step === 'session' && (
              <ActiveSession
                sessionInfo={{ ...state, user: displayName }}
                onSave={(rec) => saveSession(rec)}
                onActiveChange={updateActiveSession}
                onEnd={() => go('function')}
                lang={lang}
              />
            )}

            {step === 'maintenance' && (
              <Maintenance
                user={displayName}
                onSave={(rec) => saveMaintenance(rec)}
                onBack={() => go('function')}
                lang={lang}
              />
            )}

            {step === 'admin' && isOwner && (
              <AdminPanel
                sessions={sessions}
                maintenance={maintenanceLogs}
                activeSessions={activeSessions}
                onBack={() => go('function')}
                lang={lang}
              />
            )}
          </main>

        </>
      )}
    </div>
  );
}
