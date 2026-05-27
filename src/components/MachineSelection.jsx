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
    <div className="mx-auto mt-5 w-full max-w-3xl sm:mt-8">
      <button className="text-sm text-blue-600 mb-4" onClick={onBack}>Back</button>
      <div className="mb-4 text-base text-gray-700 opacity-80 sm:text-lg">Selected function: {getFunctionLabel(fn)}</div>

      <div className="mb-6 flex justify-center sm:mb-8">
        <img
          src={
            fn === 'tremmer-1'
              ? '/images/excavator.png'
              : fn === 'tremmer-2'
              ? '/images/shovel-1.png'
              : '/images/shovel-2.png'
          }
          alt="machine"
          className="h-36 w-36 object-contain sm:h-48 sm:w-48"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        {machines.map(m => (
          <button key={m} onClick={() => onSelect(m)} className="min-h-16 rounded-lg bg-white p-4 text-lg shadow sm:min-h-20 sm:text-xl">
            {m}
          </button>
        ))}
      </div>
    </div>
  )
}
