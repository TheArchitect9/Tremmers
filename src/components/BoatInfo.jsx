import React, { useState } from 'react'

export default function BoatInfo({ onContinue = () => {}, onBack = () => {} }) {
  const [boat, setBoat] = useState('')
  const [location, setLocation] = useState('west')

  return (
    <div className="max-w-3xl mx-auto mt-8 bg-white rounded-xl p-8 shadow-md">
      <button className="text-sm text-blue-600 mb-4" onClick={onBack}>Back</button>
      <h3 className="text-xl font-bold mb-4">Boat Information</h3>
      <div className="flex flex-col gap-8">
        <label className="flex flex-col">
          <span className="text-base font-medium">Boat name</span>
          <input value={boat} onChange={e => setBoat(e.target.value)} className="mt-2 border-b-2 p-2 text-xl outline-none" placeholder="Boat name" />
        </label>

        <div>
          <span className="text-base font-medium">Location</span>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <button onClick={() => setLocation('west')} className={`min-h-16 text-lg rounded-lg ${location === 'west' ? 'bg-blue-600 text-white' : 'bg-white border'}`}>
              West Boat
            </button>
            <button onClick={() => setLocation('east')} className={`min-h-16 text-lg rounded-lg ${location === 'east' ? 'bg-blue-600 text-white' : 'bg-white border'}`}>
              East Boat
            </button>
          </div>
        </div>

        <button onClick={() => onContinue({ boat, location })} className="bg-green-600 text-white rounded-lg py-4 text-lg font-medium w-full">
          Continue
        </button>
      </div>
    </div>
  )
}
