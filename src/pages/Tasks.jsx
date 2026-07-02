import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useTable } from '../lib/useTable'
import { useAuth } from '../contexts/AuthContext'
import { TASK_STATUS } from '../lib/config'
import { PageHeader, EmptyState, Loading, SetupNotice } from '../components/ui'
import { SignInPrompt } from './Timeline'

const ORDER = ['todo', 'doing', 'done']

export default function Tasks() {
  const { isEditor } = useAuth()
  const { requireLogin } = useOutletContext()
  const { rows, loading, insert, update, remove } = useTable('tasks', {
    order: { column: 'created_at', ascending: true },
  })
  const [form, setForm] = useState({ title: '', assignee: '', due_date: '' })
  const [saving, setSaving] = useState(false)

  const add = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await insert({ ...form, status: 'todo', due_date: form.due_date || null })
      setForm({ title: '', assignee: '', due_date: '' })
    } finally {
      setSaving(false)
    }
  }

  const cycle = (t) => {
    const next = ORDER[(ORDER.indexOf(t.status) + 1) % ORDER.length]
    update(t.id, { status: next })
  }

  const done = rows.filter((t) => t.status === 'done').length
  const pct = rows.length ? Math.round((done / rows.length) * 100) : 0

  return (
    <div className="animate-fade-up">
      <PageHeader title="To-dos" subtitle="Track shopping and tasks across the family." />
      <div className="space-y-6">
        <SetupNotice />

        {rows.length > 0 && (
          <div className="card">
            <div className="flex justify-between text-sm text-muted mb-2">
              <span>Progress</span><span className="text-ink font-medium">{done}/{rows.length} · {pct}%</span>
            </div>
            <div className="h-2 rounded-full bg-line overflow-hidden">
              <div className="h-full bg-accent transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>
          </div>
        )}

        {isEditor ? (
          <form onSubmit={add} className="card grid sm:grid-cols-4 gap-4">
            <input className="input sm:col-span-2" required placeholder="What needs doing?"
              value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <input className="input" placeholder="Assignee"
              value={form.assignee} onChange={(e) => setForm({ ...form, assignee: e.target.value })} />
            <input type="date" className="input"
              value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
            <button className="btn-primary sm:col-span-4" disabled={saving}>
              {saving ? 'Adding…' : 'Add task'}
            </button>
          </form>
        ) : (
          <SignInPrompt onClick={requireLogin} />
        )}

        {loading ? (
          <Loading />
        ) : rows.length === 0 ? (
          <EmptyState title="Nothing on the list yet" hint="Add the first task above." />
        ) : (
          <ul className="space-y-2.5">
            {rows.map((t) => {
              const st = TASK_STATUS[t.status] || TASK_STATUS.todo
              const overdue = t.due_date && t.status !== 'done' && new Date(t.due_date) < new Date()
              return (
                <li key={t.id} className="card py-3.5 flex items-center gap-3 animate-fade-up">
                  <button
                    onClick={() => (isEditor ? cycle(t) : requireLogin())}
                    className={`chip shrink-0 ${st.ring}`} title="Click to change status">
                    {st.label}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${t.status === 'done' ? 'line-through text-muted' : 'text-ink'}`}>
                      {t.title}
                    </p>
                    <p className="text-xs text-muted mt-0.5">
                      {t.assignee && <>{t.assignee}</>}
                      {t.due_date && (
                        <span className={overdue ? 'text-accent font-medium' : ''}>
                          {t.assignee ? ' · ' : ''}Due {new Date(t.due_date).toLocaleDateString()}
                          {overdue && ' (overdue)'}
                        </span>
                      )}
                    </p>
                  </div>
                  {isEditor && (
                    <button onClick={() => remove(t.id)} className="text-muted hover:text-accent text-sm">Remove</button>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
