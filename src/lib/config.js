// ── Central place to tweak the couple + the big day ─────────────────
// Edit these and the whole app updates (countdown, hero, titles).
export const WEDDING = {
  couple: 'Gowtham & Harsha', // full names (hero banner)
  monogram: 'G & H', // compact mark for the header
  hashtag: '#GowthamKuKalyanam',
  // The main ceremony date/time (used for the countdown). ISO format.
  date: '2026-11-22T09:00:00+05:30',
  venue: 'Shree Shakthi Convention Centre - Pollachi',
  mapUrl: 'https://maps.app.goo.gl/ZPPA9yznVg9ohH1y7',
}

// Idea categories — neutral, text-only labels.
export const CATEGORY_STYLES = {
  menu: { label: 'Menu' },
  decor: { label: 'Decor' },
  logistics: { label: 'Logistics' },
  other: { label: 'Other' },
}

// Task statuses with restrained color coding.
export const TASK_STATUS = {
  todo: { label: 'To do', ring: 'bg-line text-muted' },
  doing: { label: 'In progress', ring: 'bg-accent-soft text-accent' },
  done: { label: 'Done', ring: 'bg-sage/15 text-sage' },
}
