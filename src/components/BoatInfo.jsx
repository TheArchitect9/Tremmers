import React, { useState } from 'react'

const copy = {
  nl: {
    back: 'Terug',
    title: 'Bootinformatie',
    boat: 'Bootnaam',
    boatPlaceholder: 'Bootnaam',
    location: 'Locatie',
    west: 'West boot',
    east: 'Oost boot',
    continue: 'Verder'
  },
  en: {
    back: 'Back',
    title: 'Vessel information',
    boat: 'Vessel name',
    boatPlaceholder: 'Vessel name',
    location: 'Location',
    west: 'West vessel',
    east: 'East vessel',
    continue: 'Continue'
  }
}

export default function BoatInfo({ onContinue = () => {}, onBack = () => {}, lang = 'nl' }) {
  const [boat, setBoat] = useState('')
  const [location, setLocation] = useState('west')
  const t = copy[lang]

  return (
    <div className="glass-panel mx-auto w-full max-w-3xl rounded-[1.75rem] p-5 sm:p-8">
      <button className="mb-4 text-sm font-semibold text-sky-700" onClick={onBack}>{t.back}</button>
      <h3 className="text-fit mb-4 text-2xl font-black text-slate-950 sm:text-3xl">{t.title}</h3>
      <div className="flex flex-col gap-6 sm:gap-8">
        <label className="flex flex-col">
          <span className="text-base font-medium">{t.boat}</span>
          <input value={boat} onChange={e => setBoat(e.target.value)} className="soft-input mt-2" placeholder={t.boatPlaceholder} />
        </label>

        <div>
          <span className="text-base font-medium">{t.location}</span>
          <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            <button onClick={() => setLocation('west')} className={`min-h-14 rounded-2xl text-base font-semibold sm:min-h-16 sm:text-lg ${location === 'west' ? 'bg-slate-950 text-white' : 'bg-white border border-slate-200'}`}>
              {t.west}
            </button>
            <button onClick={() => setLocation('east')} className={`min-h-14 rounded-2xl text-base font-semibold sm:min-h-16 sm:text-lg ${location === 'east' ? 'bg-slate-950 text-white' : 'bg-white border border-slate-200'}`}>
              {t.east}
            </button>
          </div>
        </div>

        <button onClick={() => onContinue({ boat, location })} className="w-full rounded-2xl bg-emerald-600 py-3 text-base font-semibold text-white sm:py-4 sm:text-lg">
          {t.continue}
        </button>
      </div>
    </div>
  )
}
