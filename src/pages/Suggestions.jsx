import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useTable } from '../lib/useTable'
import { useAuth } from '../contexts/AuthContext'
import { CATEGORY_STYLES } from '../lib/config'
import { PageHeader, EmptyState, Loading, SetupNotice } from '../components/ui'
import { SignInPrompt } from './Timeline'

export default function Suggestions() {
  const { isEditor, user, displayName } = useAuth()
  const { requireLogin } = useOutletContext()
  const { rows, loading, insert, update, remove } = useTable('suggestions', {
    order: { column: 'created_at', ascending: false },
  })
  const [form, setForm] = useState({ title: '', body: '', category: 'menu' })
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState('all')

  const add = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await insert({ ...form, author_name: displayName, author_id: user.id })
      setForm({ title: '', body: '', category: 'menu' })
    } finally {
      setSaving(false)
    }
  }

  const toggleVote = async (s) => {
    if (!isEditor) return requireLogin()
    const voters = s.voters || []
    const next = voters.includes(user.id)
      ? voters.filter((v) => v !== user.id)
      : [...voters, user.id]
    await update(s.id, { voters: next })
  }

  const shown = filter === 'all' ? rows : rows.filter((r) => r.category === filter)

  return (
    <div className="animate-fade-up">
      <PageHeader title="Ideas" subtitle="Share suggestions and vote on your favourites." />
      <div className="space-y-6">
        <SetupNotice />

        {isEditor ? (
          <form onSubmit={add} className="card space-y-4">
            <div className="flex gap-2 flex-wrap">
              {Object.entries(CATEGORY_STYLES).map(([key, c]) => (
                <button type="button" key={key} onClick={() => setForm({ ...form, category: key })}
                  className={`chip border ${form.category === key ? 'bg-accent text-white border-accent' : 'bg-white text-muted border-line'}`}>
                  {c.label}
                </button>
              ))}
            </div>
            <input className="input" required placeholder="Your idea in one line…"
              value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <textarea className="input" rows={2} placeholder="Add details (optional)"
              value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
            <button className="btn-primary w-full" disabled={saving}>
              {saving ? 'Posting…' : 'Share idea'}
            </button>
          </form>
        ) : (
          <SignInPrompt onClick={requireLogin} />
        )}

        <div className="flex gap-2 flex-wrap">
          <FilterChip active={filter === 'all'} onClick={() => setFilter('all')}>All</FilterChip>
          {Object.entries(CATEGORY_STYLES).map(([key, c]) => (
            <FilterChip key={key} active={filter === key} onClick={() => setFilter(key)}>
              {c.label}
            </FilterChip>
          ))}
        </div>

        {loading ? (
          <Loading />
        ) : shown.length === 0 ? (
          <EmptyState title="No ideas here yet" hint="Be the first to add one." />
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {shown.map((s) => {
              const cat = CATEGORY_STYLES[s.category] || CATEGORY_STYLES.other
              const votes = (s.voters || []).length
              const iVoted = user && (s.voters || []).includes(user.id)
              return (
                <div key={s.id} className="card animate-fade-up flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <span className="chip bg-line/60 text-muted">{cat.label}</span>
                    {isEditor && s.author_id === user?.id && (
                      <button onClick={() => remove(s.id)} className="text-muted hover:text-accent text-sm">Remove</button>
                    )}
                  </div>
                  <h3 className="font-display text-lg text-ink">{s.title}</h3>
                  {s.body && <p className="text-muted text-sm mt-1">{s.body}</p>}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-line">
                    <span className="text-sm text-muted">{s.author_name}</span>
                    <button onClick={() => toggleVote(s)}
                      className={`chip border transition-colors ${iVoted ? 'bg-accent-soft text-accent border-accent/30' : 'bg-white text-muted border-line hover:border-accent/30'}`}>
                      {iVoted ? '♥' : '♡'} {votes || 0}
                    </button>
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

function FilterChip({ active, onClick, children }) {
  return (
    <button onClick={onClick}
      className={`chip border transition-colors ${active ? 'bg-ink text-white border-ink' : 'bg-white text-muted border-line hover:text-ink'}`}>
      {children}
    </button>
  )
}
