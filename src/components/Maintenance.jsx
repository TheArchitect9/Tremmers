import React, { useState } from 'react'

const OPTIONS = [
  { key: 'fluids_topped', label: 'Fluids topped up' },
  { key: 'fluids_good', label: 'Fluids good' },
  { key: 'fueled', label: 'Fueled up' },
  { key: 'grease', label: 'Grease topped up' }
]

export default function Maintenance({ user, onSave = () => {}, onBack = () => {} }) {
  const [machine, setMachine] = useState('')
  const [checked, setChecked] = useState({})

  function toggle(k) {
    setChecked(c => ({ ...c, [k]: !c[k] }))
  }

  function handleSave() {
    const rec = {
      id: Date.now(),
      user,
      machine,
      options: Object.keys(checked).filter(k => checked[k]),
      ts: new Date().toISOString()
    }
    onSave(rec)
    onBack()
  }

  return (
    <div className="glass-panel mx-auto w-full max-w-3xl rounded-[1.75rem] p-5 sm:p-8">
      <button className="mb-4 text-sm font-semibold text-sky-700" onClick={onBack}>Back</button>
      <h3 className="text-fit mb-4 text-2xl font-black text-slate-950 sm:text-3xl">Maintenance</h3>

      <label className="flex flex-col mb-4">
        <span className="text-base font-medium">Machine number</span>
        <input value={machine} onChange={e => setMachine(e.target.value)} className="soft-input mt-2" placeholder="e.g. 140" />
      </label>

      <div className="flex flex-col gap-3 mb-6">
        {OPTIONS.map(o => (
          <label key={o.key} className="tap-card flex items-center gap-3 p-4">
            <input type="checkbox" checked={!!checked[o.key]} onChange={() => toggle(o.key)} />
            <span>{o.label}</span>
          </label>
        ))}
      </div>

      <div className="grid gap-3 sm:flex sm:gap-4">
        <button onClick={handleSave} className="rounded-2xl bg-slate-950 px-4 py-3 font-semibold text-white">Save</button>
        <button onClick={onBack} className="rounded-2xl bg-slate-100 px-4 py-3 font-semibold text-slate-700">Cancel</button>
      </div>
    </div>
  )
}
