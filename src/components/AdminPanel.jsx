import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function AdminPanel({ onBack = () => {} }) {
  const [users, setUsers] = useState([])
  const [sessions, setSessions] = useState([])

  useEffect(() => {
    ;(async () => {
      const { data: u } = await supabase
        .from('profiles')
        .select('id, username, approved, is_admin, created_at')
        .order('created_at', { ascending: false })
      setUsers(u || [])

      const { data: s } = await supabase
        .from('sessions')
        .select('id, user_id, function, machine, boat, hold, start, end, duration_ms, created_at')
        .order('created_at', { ascending: false })
      setSessions(s || [])
    })()
  }, [])

  return (
    <div className="w-full overflow-hidden">
      <button onClick={onBack} className="mb-4 text-sm text-blue-600">Back</button>

      <h2 className="mb-2 text-lg font-semibold sm:text-xl">Users</h2>
      <ul className="mb-6 space-y-2 break-words text-sm sm:text-base">
        {users.map(u => (
          <li key={u.id} className="rounded-lg bg-white p-3 shadow-sm">
            <span className="font-medium">{u.username || u.id}</span>
            <span className="block text-xs text-gray-500 sm:inline">
              {u.created_at ? ` ${new Date(u.created_at).toLocaleString()}` : ''}
            </span>
            {u.is_admin && <span className="ml-2 text-xs text-blue-600">admin</span>}
          </li>
        ))}
      </ul>

      <h2 className="mb-2 text-lg font-semibold sm:text-xl">Sessions</h2>
      <div className="w-full overflow-x-auto rounded-lg border bg-white">
        <table className="min-w-[760px] w-full text-sm">
          <thead>
            <tr className="text-left">
              <th className="p-2">User</th>
              <th className="p-2">Function</th>
              <th className="p-2">Machine</th>
              <th className="p-2">Boat</th>
              <th className="p-2">Hold</th>
              <th className="p-2">Start</th>
              <th className="p-2">End</th>
              <th className="p-2">Duration (ms)</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map(s => (
              <tr key={s.id} className="border-t">
                <td className="p-2">{s.user_id}</td>
                <td className="p-2">{s.function}</td>
                <td className="p-2">{s.machine}</td>
                <td className="p-2">{s.boat}</td>
                <td className="p-2">{s.hold}</td>
                <td className="p-2">{s.start ? new Date(s.start).toLocaleString() : ''}</td>
                <td className="p-2">{s.end ? new Date(s.end).toLocaleString() : ''}</td>
                <td className="p-2">{s.duration_ms ?? ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
