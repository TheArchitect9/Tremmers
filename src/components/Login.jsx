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
    <div className="mx-auto mt-6 w-full max-w-md rounded-lg bg-white p-5 shadow-md sm:mt-12 sm:p-8">
      <h1 className="mb-4 text-xl font-bold sm:text-2xl">Login / Registratie</h1>
      <input
        className="mb-4 w-full rounded border p-3 text-base"
        placeholder="E-mail of gebruikersnaam"
        value={identifier}
        onChange={e => setIdentifier(e.target.value)}
      />
      <input
        className="mb-4 w-full rounded border p-3 text-base"
        type="password"
        placeholder="Wachtwoord"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      {message && <div className="mb-2 text-red-600">{message}</div>}
      <button
        className="mb-2 w-full rounded bg-blue-600 py-3 text-white"
        onClick={mode === 'login' ? handleLogin : handleRegister}
      >
        {mode === 'login' ? 'Log in' : 'Maak account'}
      </button>
      <button
        className="w-full rounded bg-gray-200 py-3"
        onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
      >
        {mode === 'login' ? 'Of maak een nieuw account' : 'Of log in'}
      </button>
    </div>
  );
}
