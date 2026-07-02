import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useTable } from '../lib/useTable'
import { useAuth } from '../contexts/AuthContext'
import { PageHeader, EmptyState, Loading, SetupNotice } from '../components/ui'
import { SignInPrompt } from './Timeline'

const COURSES = [
  { key: 'welcome', label: 'Welcome drinks' },
  { key: 'starters', label: 'Starters' },
  { key: 'main', label: 'Main course' },
  { key: 'sweets', label: 'Sweets' },
  { key: 'live', label: 'Live counters' },
]
const STATUS = {
  proposed: { label: 'Proposed', ring: 'bg-line text-muted' },
  confirmed: { label: 'Confirmed', ring: 'bg-sage/15 text-sage' },
}

export default function Catering() {
  const { isEditor } = useAuth()
  const { requireLogin } = useOutletContext()
  const { rows, loading, insert, update, remove } = useTable('catering_menu', {
    order: { column: 'created_at', ascending: true },
  })
  const [form, setForm] = useState({ dish: '', course: 'main', vendor: '', notes: '' })
  const [saving, setSaving] = useState(false)

  const add = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await insert({ ...form, status: 'proposed' })
      setForm({ dish: '', course: 'main', vendor: '', notes: '' })
    } finally {
      setSaving(false)
    }
  }

  const confirmedCount = rows.filter((r) => r.status === 'confirmed').length

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Catering"
        subtitle="Compare dishes, then confirm the final menu."
        action={
          rows.length > 0 && (
            <span className="chip bg-line/60 text-muted">{confirmedCount} of {rows.length} confirmed</span>
          )
        }
      />
      <div className="space-y-6">
        <SetupNotice />

        {isEditor ? (
          <form onSubmit={add} className="card grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 flex gap-2 flex-wrap">
              {COURSES.map((c) => (
                <button type="button" key={c.key} onClick={() => setForm({ ...form, course: c.key })}
                  className={`chip border ${form.course === c.key ? 'bg-accent text-white border-accent' : 'bg-white text-muted border-line'}`}>
                  {c.label}
                </button>
              ))}
            </div>
            <input className="input" required placeholder="Dish name"
              value={form.dish} onChange={(e) => setForm({ ...form, dish: e.target.value })} />
            <input className="input" placeholder="Vendor (RK Catering, Sabari…)"
              value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })} />
            <input className="input sm:col-span-2" placeholder="Notes — spice level, portion, etc."
              value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            <button className="btn-primary sm:col-span-2" disabled={saving}>
              {saving ? 'Adding…' : 'Add dish'}
            </button>
          </form>
        ) : (
          <SignInPrompt onClick={requireLogin} />
        )}

        {loading ? (
          <Loading />
        ) : rows.length === 0 ? (
          <EmptyState title="No dishes yet" hint="Start adding dishes to compare." />
        ) : (
          <div className="space-y-8">
            {COURSES.map((course) => {
              const items = rows.filter((r) => r.course === course.key)
              if (items.length === 0) return null
              return (
                <div key={course.key}>
                  <h2 className="text-xs uppercase tracking-[0.15em] text-muted mb-3">{course.label}</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {items.map((item) => {
                      const st = STATUS[item.status] || STATUS.proposed
                      return (
                        <div key={item.id} className="card animate-fade-up">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="font-display text-lg text-ink">{item.dish}</h3>
                              {item.vendor && <p className="text-muted text-sm mt-0.5">{item.vendor}</p>}
                              {item.notes && <p className="text-muted text-sm mt-1">{item.notes}</p>}
                            </div>
                            {isEditor && (
                              <button onClick={() => remove(item.id)} className="text-muted hover:text-accent text-sm">Remove</button>
                            )}
                          </div>
                          <div className="mt-4">
                            {isEditor ? (
                              <button
                                onClick={() =>
                                  update(item.id, {
                                    status: item.status === 'confirmed' ? 'proposed' : 'confirmed',
                                  })
                                }
                                className={`chip ${st.ring} hover:opacity-80`}>
                                {st.label}
                              </button>
                            ) : (
                              <span className={`chip ${st.ring}`}>{st.label}</span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
