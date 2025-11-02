import React from 'react'

const functions = [
  { id: 'tremmer-1', label: '1e Tremmer' },
  { id: 'tremmer-2', label: '2e Tremmer' },
  { id: 'tremmer-3', label: '3e Tremmer' }
]

export default function FunctionSelection({ onSelect = () => {}, onAdmin = () => {} }) {
  return (
    <div className="max-w-3xl mx-auto mt-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Select Your Function</h2>
        <button onClick={onAdmin} className="text-sm text-gray-600">Admin</button>
      </div>

      <div className="flex flex-col gap-6">
        {functions.map(fn => (
          <button
            key={fn.id}
            onClick={() => onSelect(fn.id)}
            className="w-full min-h-24 rounded-lg shadow-md bg-white flex items-center justify-center text-2xl font-medium py-6"
          >
            {fn.label}
          </button>
        ))}
      </div>
    </div>
  )
}
