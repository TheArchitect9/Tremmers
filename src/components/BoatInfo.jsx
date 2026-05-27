import React, { useState } from 'react'

export default function BoatInfo({ onContinue = () => {}, onBack = () => {} }) {
  const [boat, setBoat] = useState('')
  const [location, setLocation] = useState('west')

  return (
    <div className="mx-auto mt-5 w-full max-w-3xl rounded-lg bg-white p-5 shadow-md sm:mt-8 sm:p-8">
      <button className="text-sm text-blue-600 mb-4" onClick={onBack}>Back</button>
      <h3 className="mb-4 text-lg font-bold sm:text-xl">Boat Information</h3>
      <div className="flex flex-col gap-6 sm:gap-8">
        <label className="flex flex-col">
          <span className="text-base font-medium">Boat name</span>
          <input value={boat} onChange={e => setBoat(e.target.value)} className="mt-2 border-b-2 p-2 text-lg outline-none sm:text-xl" placeholder="Boat name" />
        </label>

        <div>
          <span className="text-base font-medium">Location</span>
          <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            <button onClick={() => setLocation('west')} className={`min-h-14 rounded-lg text-base sm:min-h-16 sm:text-lg ${location === 'west' ? 'bg-blue-600 text-white' : 'bg-white border'}`}>
              West Boat
            </button>
            <button onClick={() => setLocation('east')} className={`min-h-14 rounded-lg text-base sm:min-h-16 sm:text-lg ${location === 'east' ? 'bg-blue-600 text-white' : 'bg-white border'}`}>
              East Boat
            </button>
          </div>
        </div>

        <button onClick={() => onContinue({ boat, location })} className="w-full rounded-lg bg-green-600 py-3 text-base font-medium text-white sm:py-4 sm:text-lg">
          Continue
        </button>
      </div>
    </div>
  )
}
