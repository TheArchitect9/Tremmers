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
    <div className="max-w-3xl mx-auto mt-8 bg-white rounded-xl p-8 shadow-md">
      <button className="text-sm text-blue-600 mb-4" onClick={onBack}>Back</button>
      <h3 className="text-xl font-bold mb-4">Maintenance</h3>

      <label className="flex flex-col mb-4">
        <span className="text-base font-medium">Machine number</span>
        <input value={machine} onChange={e => setMachine(e.target.value)} className="mt-2 border-b-2 p-2 text-xl outline-none" placeholder="e.g. 140" />
      </label>

      <div className="flex flex-col gap-3 mb-6">
        {OPTIONS.map(o => (
          <label key={o.key} className="flex items-center gap-3">
            <input type="checkbox" checked={!!checked[o.key]} onChange={() => toggle(o.key)} />
            <span>{o.label}</span>
          </label>
        ))}
      </div>

      <div className="flex gap-4">
        <button onClick={handleSave} className="bg-blue-600 text-white rounded-lg py-3 px-4">Save</button>
        <button onClick={onBack} className="bg-gray-200 rounded-lg py-3 px-4">Cancel</button>
      </div>
    </div>
  )
}
