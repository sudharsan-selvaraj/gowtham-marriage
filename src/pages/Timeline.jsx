import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useTable } from '../lib/useTable'
import { useAuth } from '../contexts/AuthContext'
import { PageHeader, EmptyState, Loading, SetupNotice } from '../components/ui'

export default function Timeline() {
  const { isEditor } = useAuth()
  const { requireLogin } = useOutletContext()
  const { rows, loading, insert, remove } = useTable('events', {
    order: { column: 'starts_at', ascending: true },
  })
  const [form, setForm] = useState({ title: '', starts_at: '', venue: '', notes: '' })
  const [saving, setSaving] = useState(false)

  const add = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await insert({ ...form, starts_at: new Date(form.starts_at).toISOString() })
      setForm({ title: '', starts_at: '', venue: '', notes: '' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="animate-fade-up">
      <PageHeader title="Timeline" subtitle="Every event, in order." />
      <div className="space-y-6">
        <SetupNotice />

        {isEditor ? (
          <form onSubmit={add} className="card grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Event name</label>
              <input className="input" required placeholder="Mehendi, Sangeet, Muhurtham…"
                value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label className="label">Date & time</label>
              <input type="datetime-local" className="input" required
                value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} />
            </div>
            <div>
              <label className="label">Venue</label>
              <input className="input" placeholder="Where?"
                value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Notes (optional)</label>
              <input className="input" placeholder="Dress code, coordinator, etc."
                value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            <button className="btn-primary sm:col-span-2" disabled={saving}>
              {saving ? 'Adding…' : 'Add event'}
            </button>
          </form>
        ) : (
          <SignInPrompt onClick={requireLogin} />
        )}

        {loading ? (
          <Loading />
        ) : rows.length === 0 ? (
          <EmptyState title="No events yet" hint="Add the first ceremony above." />
        ) : (
          <div className="relative pl-6">
            <div className="absolute left-[5px] top-2 bottom-2 w-px bg-line" />
            <div className="space-y-4">
              {rows.map((ev) => (
                <div key={ev.id} className="relative animate-fade-up">
                  <span className="absolute -left-[1.4rem] top-2.5 h-2.5 w-2.5 rounded-full bg-accent ring-4 ring-paper" />
                  <div className="card">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm text-accent font-medium">
                          {new Date(ev.starts_at).toLocaleString(undefined, {
                            weekday: 'long', month: 'long', day: 'numeric',
                            hour: 'numeric', minute: '2-digit',
                          })}
                        </p>
                        <h3 className="font-display text-xl text-ink mt-0.5">{ev.title}</h3>
                        {ev.venue && <p className="text-muted text-sm mt-1">{ev.venue}</p>}
                        {ev.notes && <p className="text-muted text-sm mt-1">{ev.notes}</p>}
                      </div>
                      {isEditor && (
                        <button onClick={() => remove(ev.id)}
                          className="text-muted hover:text-accent text-sm" title="Delete">Remove</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function SignInPrompt({ onClick }) {
  return (
    <div className="card flex items-center justify-between gap-4 flex-wrap">
      <p className="text-sm text-muted">You're viewing in read-only mode. Sign in to add or edit.</p>
      <button onClick={onClick} className="btn-primary py-1.5 px-4">Sign in</button>
    </div>
  )
}
