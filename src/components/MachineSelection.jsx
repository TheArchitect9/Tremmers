import React from 'react'
import { getFunctionLabel } from '../utils/functionLabels'

const machineSets = {
  'tremmer-1': ['140', '141', '142', '146'],
  'tremmer-2': ['341', '342'],
  'tremmer-3': ['Single']
}

const copy = {
  nl: { back: 'Terug', selected: 'Gekozen functie', machine: 'Machine' },
  en: { back: 'Back', selected: 'Selected role', machine: 'Machine' }
}

export default function MachineSelection({ fn, onSelect = () => {}, onBack = () => {}, lang = 'nl' }) {
  const machines = machineSets[fn] || []
  const t = copy[lang]
  return (
    <div className="mx-auto w-full max-w-5xl space-y-5">
      <button className="text-sm font-semibold text-sky-700" onClick={onBack}>{t.back}</button>
      <section className="glass-panel rounded-[1.75rem] p-5 sm:p-7">
        <div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <div className="text-sm font-semibold text-slate-500">{t.selected}</div>
            <h2 className="text-fit mt-1 text-2xl font-black text-slate-950 sm:text-4xl">{getFunctionLabel(fn, lang)}</h2>
          </div>

          <img
            src={
              fn === 'tremmer-1'
                ? '/images/excavator.png'
                : fn === 'tremmer-2'
                ? '/images/shovel-1.png'
                : '/images/shovel-2.png'
            }
            alt="machine"
            className="mx-auto h-32 w-32 object-contain sm:h-44 sm:w-44"
          />
        </div>
      </section>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        {machines.map(m => (
          <button key={m} onClick={() => onSelect(m)} className="tap-card min-h-20 p-5 text-left">
            <span className="block text-xs font-semibold uppercase text-slate-400">{t.machine}</span>
            <span className="text-fit mt-1 block text-2xl font-black text-slate-950">{m}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
