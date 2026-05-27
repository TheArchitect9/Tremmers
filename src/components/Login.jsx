import React, { useState } from 'react';

const copy = {
  nl: {
    badge: 'Alpha Work Tracker',
    title: 'Rustiger inloggen. Sneller aan het werk.',
    subtitle: 'Log veilig in en ga direct door naar je werkdag.',
    cardTitle: 'Login',
    cardSubtitle: 'Eigenaar en medewerkers gebruiken hetzelfde scherm.',
    identifier: 'E-mail of gebruikersnaam',
    password: 'Wachtwoord',
    login: 'Log in',
    register: 'Maak account',
    switchRegister: 'Of maak een nieuw account',
    switchLogin: 'Of log in',
    success: 'Account aangemaakt. Je kunt nu inloggen.',
    loginFailed: 'Inloggen mislukt',
    registerFailed: 'Registreren mislukt',
    lang: 'English',
    tiles: ['Shift starten', 'Ruim sluiten', 'Onderhoud melden']
  },
  en: {
    badge: 'Alpha Work Tracker',
    title: 'Cleaner sign-in. Faster shifts.',
    subtitle: 'Sign in securely and continue straight to your workday.',
    cardTitle: 'Sign in',
    cardSubtitle: 'Owner and workers use the same screen.',
    identifier: 'Email or username',
    password: 'Password',
    login: 'Sign in',
    register: 'Create account',
    switchRegister: 'Create a new account',
    switchLogin: 'Sign in instead',
    success: 'Account created. You can sign in now.',
    loginFailed: 'Sign-in failed',
    registerFailed: 'Registration failed',
    lang: 'Nederlands',
    tiles: ['Start shift', 'Close hold', 'Report maintenance']
  }
};

export default function Login({ onLogin = () => {}, onRegister = () => {}, lang = 'nl', onToggleLanguage = () => {} }) {
  const [mode, setMode] = useState('login');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const t = copy[lang];

  async function handleLogin() {
    const res = await onLogin({ identifier, password });
    if (!res.ok) setMessage(res.message || t.loginFailed);
  }

  async function handleRegister() {
    const res = await onRegister({ identifier, password });
    if (!res.ok) setMessage(res.message || t.registerFailed);
    else setMessage(t.success);
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-8">
      <div className="grid w-full gap-5 lg:grid-cols-[1fr_26rem] lg:items-center">
        <section className="glass-panel rounded-[2rem] p-6 sm:p-8">
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">
              {t.badge}
            </div>
            <button onClick={onToggleLanguage} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
              {t.lang}
            </button>
          </div>
          <h1 className="text-fit text-3xl font-black text-slate-950 sm:text-5xl">{t.title}</h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
            {t.subtitle}
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {t.tiles.map(item => (
              <div key={item} className="rounded-2xl bg-white p-3 text-sm font-semibold text-slate-700 shadow-sm">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="glass-panel rounded-[2rem] p-5 sm:p-7">
          <h2 className="mb-1 text-xl font-black text-slate-950 sm:text-2xl">{t.cardTitle}</h2>
          <p className="mb-5 text-sm text-slate-500">{t.cardSubtitle}</p>
      <input
        className="soft-input mb-3"
        placeholder={t.identifier}
        value={identifier}
        onChange={e => setIdentifier(e.target.value)}
      />
      <input
        className="soft-input mb-4"
        type="password"
        placeholder={t.password}
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      {message && <div className="mb-3 rounded-2xl bg-red-50 p-3 text-sm text-red-700">{message}</div>}
      <button
        className="mb-2 w-full rounded-2xl bg-slate-950 py-3 font-semibold text-white"
        onClick={mode === 'login' ? handleLogin : handleRegister}
      >
        {mode === 'login' ? t.login : t.register}
      </button>
      <button
        className="w-full rounded-2xl bg-slate-100 py-3 font-semibold text-slate-700"
        onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
      >
        {mode === 'login' ? t.switchRegister : t.switchLogin}
      </button>
        </section>
      </div>
    </div>
  );
}
