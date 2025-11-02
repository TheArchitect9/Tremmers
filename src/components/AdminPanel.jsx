import React from 'react'
import { getFunctionLabel } from '../utils/functionLabels'

export default function AdminPanel({ users = [], sessions = [], maintenance = [], onBack = () => {} }) {
  // The app now auto-approves new accounts; pending approvals removed.

  return (
    <div className="max-w-7xl mx-auto mt-8 flex gap-6">
      <aside className="w-64 bg-white rounded-xl shadow-md p-4">
        <nav className="flex flex-col gap-4">
          <div className="font-medium">Admin</div>
          <button className="text-left">User Management</button>
          <button className="text-left">App Settings</button>
          <button className="text-left">Work Records</button>
        </nav>
      </aside>
      <main className="flex-1 bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Admin Dashboard</h3>
          <button onClick={onBack} className="text-sm text-blue-600">Back</button>
        </div>

        <section className="mb-6">
          <h4 className="font-semibold mb-2">Work Records</h4>
          <div className="overflow-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="text-left text-sm text-gray-500">
                  <th className="pb-2">User</th>
                  <th className="pb-2">Function</th>
                  <th className="pb-2">Machine</th>
                  <th className="pb-2">Boat</th>
                  <th className="pb-2">Hold</th>
                  <th className="pb-2">Duration</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map(s => (
                  <tr key={s.id} className="border-t text-sm">
                    <td className="py-2 align-top">{s.user}</td>
                    <td className="py-2 align-top">{getFunctionLabel(s.function)}</td>
                    <td className="py-2 align-top">{s.machine}</td>
                    <td className="py-2 align-top">{s.boat}</td>
                    <td className="py-2 align-top">{s.hold}</td>
                    <td className="py-2 align-top">{Math.round((s.duration_ms || 0) / 1000)}s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h4 className="font-semibold mb-2">Maintenance logs</h4>
          <div className="flex flex-col gap-2">
            {maintenance.map(m => (
              <div key={m.id} className="bg-gray-50 p-2 rounded text-sm">
                <div><strong>{m.user}</strong> — {m.machine} — {new Date(m.ts).toLocaleString()}</div>
                <div className="text-gray-600">{m.options.join(', ')}</div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
