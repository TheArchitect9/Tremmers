import React, { useState } from 'react';

export default function Login({ onLogin = () => {}, onRegister = () => {} }) {
  const [mode, setMode] = useState('login');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  async function handleLogin() {
    const res = await onLogin({ identifier, password });
    if (!res.ok) setMessage(res.message || 'Login failed');
  }

  async function handleRegister() {
    const res = await onRegister({ identifier, password });
    if (!res.ok) setMessage(res.message || 'Registration failed');
    else setMessage('Kijk in je mail voor bevestiging.');
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-8">
      <div className="grid w-full gap-5 lg:grid-cols-[1fr_26rem] lg:items-center">
        <section className="glass-panel rounded-[2rem] p-6 sm:p-8">
          <div className="mb-5 inline-flex rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">
            Alpha Work Tracker
          </div>
          <h1 className="text-fit text-3xl font-black text-slate-950 sm:text-5xl">Rustiger inloggen. Sneller aan het werk.</h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
            Gebruik je e-mail voor Supabase of je bestaande gebruikersnaam voor de oude lokale accounts.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {['Shift starten', 'Ruim sluiten', 'Onderhoud melden'].map(item => (
              <div key={item} className="rounded-2xl bg-white p-3 text-sm font-semibold text-slate-700 shadow-sm">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="glass-panel rounded-[2rem] p-5 sm:p-7">
          <h2 className="mb-1 text-xl font-black text-slate-950 sm:text-2xl">Login</h2>
          <p className="mb-5 text-sm text-slate-500">Eigenaar en medewerkers gebruiken hetzelfde scherm.</p>
      <input
        className="soft-input mb-3"
        placeholder="E-mail of gebruikersnaam"
        value={identifier}
        onChange={e => setIdentifier(e.target.value)}
      />
      <input
        className="soft-input mb-4"
        type="password"
        placeholder="Wachtwoord"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      {message && <div className="mb-3 rounded-2xl bg-red-50 p-3 text-sm text-red-700">{message}</div>}
      <button
        className="mb-2 w-full rounded-2xl bg-slate-950 py-3 font-semibold text-white"
        onClick={mode === 'login' ? handleLogin : handleRegister}
      >
        {mode === 'login' ? 'Log in' : 'Maak account'}
      </button>
      <button
        className="w-full rounded-2xl bg-slate-100 py-3 font-semibold text-slate-700"
        onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
      >
        {mode === 'login' ? 'Of maak een nieuw account' : 'Of log in'}
      </button>
        </section>
      </div>
    </div>
  );
}
