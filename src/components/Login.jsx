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
    <div className="max-w-md mx-auto mt-12 bg-white rounded-xl shadow-md p-8">
      <h1 className="text-2xl font-bold mb-4">Login / Registratie</h1>
      <input
        className="w-full p-2 mb-4 border rounded"
        placeholder="E-mail of gebruikersnaam"
        value={identifier}
        onChange={e => setIdentifier(e.target.value)}
      />
      <input
        className="w-full p-2 mb-4 border rounded"
        type="password"
        placeholder="Wachtwoord"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      {message && <div className="mb-2 text-red-600">{message}</div>}
      <button
        className="w-full bg-blue-600 text-white py-2 rounded mb-2"
        onClick={mode === 'login' ? handleLogin : handleRegister}
      >
        {mode === 'login' ? 'Log in' : 'Maak account'}
      </button>
      <button
        className="w-full bg-gray-200 py-2 rounded"
        onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
      >
        {mode === 'login' ? 'Of maak een nieuw account' : 'Of log in'}
      </button>
    </div>
  );
}
