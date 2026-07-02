import { useEffect, useRef, useState } from 'react'
import { WEDDING } from '../lib/config'
import mandapam from '../assets/mandapam-bg.webp'
import couple from '../assets/caricatures/couple-namaste.webp'
import leaf from '../assets/banana-leaf.webp'

// Bouncy per-WORD reveal (keeps the Great Vibes script letters connected).
function AnimatedName({ text, base = 0.7 }) {
  const words = text.split(' ')
  return (
    <span aria-label={text}>
      {words.map((w, i) => (
        <span
          key={i}
          aria-hidden
          className="inline-block animate-letter-pop"
          style={{ animationDelay: `${base + i * 0.22}s` }}
        >
          {w}
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </span>
  )
}

// One-time confetti burst on load — the "crazy celebration" bit.
const BURST = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  delay: Math.random() * 0.5,
  dur: 2.4 + Math.random() * 1.6,
  size: 7 + Math.random() * 8,
  color: ['#F4A02C', '#F5C242', '#E23E6B', '#2FB8A0', '#7C1E3A', '#FFFFFF'][i % 6],
  rot: Math.random() * 360,
}))

function ConfettiBurst() {
  return (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden" aria-hidden>
      {BURST.map((p) => (
        <span
          key={p.id}
          className="absolute top-0 animate-confetti"
          style={{
            left: `${p.left}%`,
            width: p.size, height: p.size * 1.4,
            background: p.color,
            borderRadius: 2,
            transform: `rotate(${p.rot}deg)`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.dur}s`,
          }}
        />
      ))}
    </div>
  )
}

function useCountdown(dateStr) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  const diff = Math.max(0, new Date(dateStr) - now)
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    mins: Math.floor((diff % 3600000) / 60000),
    secs: Math.floor((diff % 60000) / 1000),
    passed: diff === 0,
  }
}

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))

// Normalized (-1..1) parallax input from mouse (desktop) OR device tilt (mobile).
function useParallax() {
  const [p, setP] = useState({ x: 0, y: 0 })
  const raf = useRef(0)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const push = (x, y) => {
      cancelAnimationFrame(raf.current)
      raf.current = requestAnimationFrame(() => setP({ x, y }))
    }

    // ── Desktop: mouse ──
    const onMove = (e) =>
      push((e.clientX / window.innerWidth - 0.5) * 2, (e.clientY / window.innerHeight - 0.5) * 2)
    window.addEventListener('mousemove', onMove)

    // ── Mobile: device tilt (gyroscope) ──
    // Offsets are measured RELATIVE to however the phone is first held, and a
    // ~22° tilt maps to the full parallax range.
    let base = null
    const RANGE = 22
    const onOrient = (e) => {
      if (e.gamma == null || e.beta == null) return
      const landscape = Math.abs(window.orientation) === 90
      const g = landscape ? e.beta : e.gamma // left/right tilt
      const b = landscape ? e.gamma : e.beta // front/back tilt
      if (!base) base = { g, b }
      push(clamp((g - base.g) / RANGE, -1, 1), clamp((b - base.b) / RANGE, -1, 1))
    }

    let orientAdded = false
    const addOrient = () => {
      if (orientAdded) return
      window.addEventListener('deviceorientation', onOrient)
      orientAdded = true
    }

    const DOE = window.DeviceOrientationEvent
    if (DOE) {
      if (typeof DOE.requestPermission === 'function') {
        // iOS 13+: needs a user gesture to grant motion access.
        const ask = () => {
          DOE.requestPermission().then((s) => s === 'granted' && addOrient()).catch(() => {})
        }
        window.addEventListener('touchend', ask, { once: true })
        window.addEventListener('click', ask, { once: true })
      } else {
        addOrient()
      }
    }

    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('deviceorientation', onOrient)
      cancelAnimationFrame(raf.current)
    }
  }, [])

  // Returns a style whose transform is ONLY the parallax offset.
  // Keep centering (-translate-x-1/2 etc.) on a separate wrapper element.
  return (dx, dy, extra = '') => ({
    transform: `translate3d(${(p.x * dx).toFixed(1)}px, ${(p.y * dy).toFixed(1)}px, 0)${extra ? ' ' + extra : ''}`,
  })
}

const PETALS = [
  { top: '20%', left: '16%', c: '#F4A02C', s: 14, d: 26 },
  { top: '30%', left: '80%', c: '#E23E6B', s: 18, d: 34 },
  { top: '58%', left: '10%', c: '#F5C242', s: 12, d: 30 },
  { top: '16%', left: '58%', c: '#FFFFFF', s: 9, d: 40 },
  { top: '66%', left: '86%', c: '#F4A02C', s: 16, d: 36 },
]

export default function StageHero() {
  const layer = useParallax()
  const c = useCountdown(WEDDING.date)
  const weddingDate = new Date(WEDDING.date).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#E7C24A]">
      {/* Layer 0 — mandapam stage background (scaled up so parallax never shows edges) */}
      <img
        src={mandapam}
        alt="Wedding mandapam stage"
        className="absolute inset-0 h-full w-full object-cover object-center will-change-transform"
        style={layer(-12, -7, 'scale(1.12)')}
      />
      <div className="absolute inset-0 bg-[radial-gradient(120%_100%_at_50%_45%,transparent_45%,rgba(60,20,10,0.30))]" />
      {/* Edge vignette — darkens the far left/right so wide screens focus centrally */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(30,15,8,0.5),transparent_16%,transparent_84%,rgba(30,15,8,0.5))]" />

      {/* Layer 1 — floating petals */}
      {PETALS.map((p, i) => (
        <span key={i} className="absolute rounded-full"
          style={{ top: p.top, left: p.left, width: p.s, height: p.s, background: p.c, opacity: 0.85, ...layer(p.d, p.d) }} />
      ))}

      {/* Confetti celebration burst on load */}
      <ConfettiBurst />

      {/* Layer 2 — banana-leaf nameboard: leaf gets the 3D tilt, text stays flat */}
      <div className="absolute top-[74px] md:top-[4%] left-1/2 -translate-x-1/2 z-20 w-[min(82%,540px)] px-2">
        <div className="relative" style={layer(14, 8)}>
          {/* Soft dark halo so the leaf separates from the busy green backdrop */}
          <div className="absolute inset-0 scale-125 blur-2xl bg-[radial-gradient(60%_55%_at_50%_50%,rgba(35,12,12,0.6),transparent_72%)]" />

          {/* Tilted leaf (behind) — brighter & more saturated than the background greens */}
          <div style={{ perspective: '900px' }}>
            <div style={{ transform: 'rotate3d(1, 1, 2, -35deg)' }}>
              <div className="animate-leaf-sway origin-center">
                <div className="animate-leaf-in">
                  <img
                    src={leaf}
                    alt=""
                    className="w-full select-none"
                    style={{ filter: 'saturate(1.4) brightness(1.06) contrast(1.05) drop-shadow(0 16px 24px rgba(0,0,0,0.55))' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Flat, upright names on top of the leaf */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
            <p className="font-body text-[#FFF3D6] text-[9px] sm:text-xs tracking-[0.35em] uppercase drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] animate-fade-up"
              style={{ animationDelay: '0.5s' }}>
              Together forever
            </p>
            <h1 className="font-script leading-[1.0] mt-1 text-3xl sm:text-5xl text-[#FFD83A]
                           [text-shadow:_1px_1px_0_#4A0E22,_-1px_-1px_0_#4A0E22,_1px_-1px_0_#4A0E22,_-1px_1px_0_#4A0E22,_0_0_14px_rgba(255,216,80,0.65),_0_4px_10px_rgba(0,0,0,0.45)]">
              <AnimatedName text={WEDDING.couple} />
            </h1>
            <p className="font-body font-semibold text-[#FFF3D6] text-[10px] sm:text-sm tracking-[0.28em] uppercase mt-2 drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)] animate-fade-up"
              style={{ animationDelay: '1.6s' }}>
              {weddingDate}
            </p>
          </div>
        </div>
      </div>

      {/* Layer 3 — the couple, centre stage (nearest layer, largest movement) */}
      <div className="absolute bottom-[19%] sm:bottom-[16%] left-1/2 -translate-x-1/2 z-10">
        <img
          src={couple}
          alt="Gowtham and Harsha wedding caricature"
          className="h-[42vh] sm:h-[54vh] max-w-[88vw] object-contain drop-shadow-[0_18px_30px_rgba(0,0,0,0.35)] will-change-transform"
          style={layer(24, 12)}
        />
      </div>

      {/* Bottom scrim — keeps the venue / button / hashtag readable over the light floor */}
      <div className="absolute inset-x-0 bottom-0 h-[34%] z-20 pointer-events-none bg-gradient-to-t from-black/65 via-black/30 to-transparent" />

      {/* Layer 4 — details on the stage floor */}
      <div className="absolute bottom-[3%] left-1/2 -translate-x-1/2 z-30 w-full px-4">
        <div className="flex flex-col items-center gap-4" style={layer(16, 10)}>
          {!c.passed && (
            <div className="flex items-stretch gap-2 sm:gap-3">
              {[['Days', c.days], ['Hrs', c.hours], ['Min', c.mins], ['Sec', c.secs]].map(([l, v]) => (
                <div key={l} className="rounded-2xl bg-white/95 backdrop-blur border border-[#E7C24A] shadow-[0_6px_16px_rgba(0,0,0,0.28)] px-3 sm:px-5 py-2 min-w-[56px] sm:min-w-[66px] text-center">
                  <div className="font-body font-bold text-2xl sm:text-3xl text-[#7C1E3A] tabular-nums leading-none">
                    {String(v).padStart(2, '0')}
                  </div>
                  <div className="text-[9px] sm:text-[10px] uppercase tracking-[0.18em] text-[#7C1E3A]/55 mt-1.5">{l}</div>
                </div>
              ))}
            </div>
          )}

          {WEDDING.venue && (
            <p className="inline-flex items-center gap-1.5 font-body font-medium text-[#FFF3D6] text-sm sm:text-base text-center drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
              <span aria-hidden>📍</span> {WEDDING.venue}
            </p>
          )}

          <div className="flex flex-col items-center gap-2.5">
            {WEDDING.mapUrl && (
              <a href={WEDDING.mapUrl} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#7C1E3A] text-[#FBE6AE] text-sm font-semibold px-6 py-2.5 shadow-[0_6px_16px_rgba(0,0,0,0.3)] border border-[#E7C24A] hover:-translate-y-0.5 hover:bg-[#8f2c41] transition">
                View venue &amp; directions
              </a>
            )}
            <span className="font-script text-[#F8D26A] text-xl sm:text-2xl leading-none drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)]">
              {WEDDING.hashtag}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
