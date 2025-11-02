import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function AdminPanel({ onBack = () => {} }) {
  const [users, setUsers] = useState([])
  const [sessions, setSessions] = useState([])

  useEffect(() => {
    ;(async () => {
      const { data: u } = await supabase
        .from('app_users').select('username, created_at').order('created_at', { ascending: false })
      setUsers(u || [])

      const { data: s } = await supabase
        .from('work_sessions')
        .select('id, username, function, machine, boat, hold, start, end, duration_ms, created_at')
        .order('created_at', { ascending: false })
      setSessions(s || [])
    })()
  }, [])

  return (
    <div className="p-4">
      <button onClick={onBack} className="mb-4">← Back</button>

      <h2 className="text-xl font-semibold mb-2">Users</h2>
      <ul className="mb-6">
        {users.map(u => (
          <li key={u.username}>{u.username} <span className="text-xs text-gray-500">({new Date(u.created_at).toLocaleString()})</span></li>
        ))}
      </ul>

      <h2 className="text-xl font-semibold mb-2">Sessions</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left">
            <th>User</th><th>Function</th><th>Machine</th><th>Boat</th><th>Hold</th>
            <th>Start</th><th>End</th><th>Duration (ms)</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map(s => (
            <tr key={s.id}>
              <td>{s.username}</td>
              <td>{s.function}</td>
              <td>{s.machine}</td>
              <td>{s.boat}</td>
              <td>{s.hold}</td>
              <td>{s.start ? new Date(s.start).toLocaleString() : ''}</td>
              <td>{s.end ? new Date(s.end).toLocaleString() : ''}</td>
              <td>{s.duration_ms ?? ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
