import React from 'react'
import { getFunctionLabel } from '../utils/functionLabels'

const machineSets = {
  'tremmer-1': ['140', '141', '142', '146'],
  'tremmer-2': ['341', '342'],
  'tremmer-3': ['Single']
}

export default function MachineSelection({ fn, onSelect = () => {}, onBack = () => {} }) {
  const machines = machineSets[fn] || []
  return (
    <div className="max-w-3xl mx-auto mt-8">
      <button className="text-sm text-blue-600 mb-4" onClick={onBack}>Back</button>
  <div className="text-lg text-gray-700 opacity-80 mb-4">Selected function: {getFunctionLabel(fn)}</div>

      <div className="flex justify-center mb-8">
        <img
          src={
            fn === 'tremmer-1'
              ? '/images/excavator.png'
              : fn === 'tremmer-2'
              ? '/images/shovel-1.png'
              : '/images/shovel-2.png'
          }
          alt="machine"
          className="w-48 h-48 object-contain"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {machines.map(m => (
          <button key={m} onClick={() => onSelect(m)} className="min-h-20 bg-white rounded-lg shadow p-4 text-xl">
            {m}
          </button>
        ))}
      </div>
    </div>
  )
}
