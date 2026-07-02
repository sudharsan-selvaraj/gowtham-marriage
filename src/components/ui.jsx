import { isConfigured } from '../lib/supabase'

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-8 flex-wrap">
      <div>
        <h1 className="font-display text-3xl font-medium text-ink">{title}</h1>
        {subtitle && <p className="text-muted mt-1.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function EmptyState({ title, hint }) {
  return (
    <div className="card text-center py-14 animate-fade-up">
      <p className="font-display text-lg text-ink">{title}</p>
      {hint && <p className="text-muted text-sm mt-1.5">{hint}</p>}
    </div>
  )
}

export function Loading({ label = 'Loading…' }) {
  return <div className="text-center py-16 text-muted text-sm">{label}</div>
}

/** Shown across the app when .env isn't set up yet. */
export function SetupNotice() {
  if (isConfigured) return null
  return (
    <div className="rounded-2xl border border-line bg-accent-soft/60 px-5 py-4">
      <p className="font-medium text-ink text-sm">Connect Supabase to finish setup</p>
      <p className="text-muted text-sm mt-1">
        Copy <code className="bg-white px-1.5 py-0.5 rounded border border-line text-xs">.env.example</code> to{' '}
        <code className="bg-white px-1.5 py-0.5 rounded border border-line text-xs">.env</code>, add your Supabase
        URL &amp; anon key, then restart the dev server. See the README for details.
      </p>
    </div>
  )
}
