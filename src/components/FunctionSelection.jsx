import React from 'react'

const functions = [
  { id: 'tremmer-1', label: '1e Tremmer' },
  { id: 'tremmer-2', label: '2e Tremmer' },
  { id: 'tremmer-3', label: '3e Tremmer' }
]

export default function FunctionSelection({ onSelect = () => {}, onAdmin = () => {}, isAdmin = false }) {
  return (
    <div className="mx-auto mt-5 w-full max-w-3xl sm:mt-8">
      <div className="mb-5 flex flex-col gap-2 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold sm:text-2xl">Select Your Function</h2>
        {isAdmin && <button onClick={onAdmin} className="text-sm text-gray-600">Admin</button>}
      </div>

      <div className="grid gap-4 sm:gap-6">
        {functions.map(fn => (
          <button
            key={fn.id}
            onClick={() => onSelect(fn.id)}
            className="flex min-h-20 w-full items-center justify-center rounded-lg bg-white px-4 py-5 text-xl font-medium shadow-md sm:min-h-24 sm:py-6 sm:text-2xl"
          >
            {fn.label}
          </button>
        ))}
      </div>
    </div>
  )
}
