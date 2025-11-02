import React, { useState } from 'react'

export default function Login({ onLogin = () => {}, onRegister = () => {} }) {
  const [mode, setMode] = useState('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  async function handleLogin() {
    const res = await onLogin({ username, password })
    if (!res.ok) setMessage(res.message || 'Login failed')
  }

  async function handleRegister() {
    const res = await onRegister({ username, password })
    if (!res.ok) setMessage(res.message || 'Registration failed')
    else setMessage('Registration successful')
  }

  return (
    <div className="max-w-md mx-auto mt-12 bg-white rounded-xl shadow-md p-8">
      <div className="flex justify-center mb-6">
        <img src="/images/alpha-logo.jpg" alt="Alpha Logo" className="w-32 h-32 object-contain" />
      </div>
      <h1 className="text-3xl font-bold text-center mb-4">Alpha</h1>
      <div className="flex justify-center gap-4 mb-4">
        <button onClick={() => { setMode('login'); setMessage('') }} className={`px-4 py-2 ${mode === 'login' ? 'bg-blue-600 text-white rounded' : 'text-gray-600'}`}>Login</button>
        <button onClick={() => { setMode('register'); setMessage('') }} className={`px-4 py-2 ${mode === 'register' ? 'bg-green-600 text-white rounded' : 'text-gray-600'}`}>Register</button>
      </div>

      <div className="flex flex-col gap-6">
        <label className="flex flex-col">
          <span className="text-base font-medium">Username</span>
          <input value={username} onChange={e => setUsername(e.target.value)} className="mt-2 border-b-2 p-2 text-xl outline-none" placeholder="Enter username" />
        </label>
        <label className="flex flex-col">
          <span className="text-base font-medium">Password</span>
          <input value={password} onChange={e => setPassword(e.target.value)} type="password" className="mt-2 border-b-2 p-2 text-xl outline-none" placeholder="Password" />
        </label>

        {message && <div className="text-sm text-red-600">{message}</div>}

        {mode === 'login' ? (
          <button onClick={handleLogin} className="bg-blue-600 text-white rounded-lg py-4 text-lg font-medium w-full mt-2">Log in</button>
        ) : (
          <button onClick={handleRegister} className="bg-green-600 text-white rounded-lg py-4 text-lg font-medium w-full mt-2">Create account</button>
        )}
      </div>
    </div>
  )
}
