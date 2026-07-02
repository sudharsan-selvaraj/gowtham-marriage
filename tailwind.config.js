/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Restrained, editorial wedding palette
        paper: '#FBFAF8', // page background
        card: '#FFFFFF',
        line: '#ECE8E2', // borders / dividers
        ink: '#242020', // primary text
        muted: '#8A827C', // secondary text
        accent: '#A8384F', // single deep-rose accent
        'accent-soft': '#F6ECEE',
        gold: '#9A7B3F', // rare metallic touch
        sage: '#5F7A6B', // muted "done/confirmed" green
      },
      fontFamily: {
        script: ['"Great Vibes"', 'cursive'],
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        body: ['"Poppins"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(36, 32, 32, 0.04), 0 8px 24px -16px rgba(36, 32, 32, 0.16)',
        pop: '0 10px 40px -12px rgba(36, 32, 32, 0.22)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        confetti: {
          '0%': { transform: 'translateY(-10vh) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(110vh) rotate(720deg)', opacity: '0' },
        },
        // Wiggles hard in the first ~0.7s, then rests — a burst every 4s.
        coconutWiggle: {
          '0%, 18%, 100%': { transform: 'rotate(0deg)' },
          '3%': { transform: 'rotate(-14deg)' },
          '6%': { transform: 'rotate(12deg)' },
          '9%': { transform: 'rotate(-9deg)' },
          '12%': { transform: 'rotate(7deg)' },
          '15%': { transform: 'rotate(-3deg)' },
        },
        crack: {
          '0%': { transform: 'scale(0.6) rotate(-8deg)', opacity: '0' },
          '60%': { transform: 'scale(1.12) rotate(3deg)' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
        },
        // Banana-leaf nameboard drops in from above and settles
        leafIn: {
          '0%': { opacity: '0', transform: 'translateY(-130%) rotate(-8deg) scale(0.9)' },
          '65%': { opacity: '1', transform: 'translateY(5%) rotate(3deg) scale(1.02)' },
          '100%': { transform: 'translateY(0) rotate(0deg) scale(1)' },
        },
        leafSway: {
          '0%, 100%': { transform: 'rotate(-1.2deg)' },
          '50%': { transform: 'rotate(1.2deg)' },
        },
        // Each letter bounces in
        letterPop: {
          '0%': { opacity: '0', transform: 'translateY(-40px) scale(0.3) rotate(-12deg)' },
          '60%': { opacity: '1', transform: 'translateY(4px) scale(1.18) rotate(4deg)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1) rotate(0deg)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.4s ease-out both',
        confetti: 'confetti 3s linear forwards',
        'coconut-wiggle': 'coconutWiggle 4s ease-in-out infinite',
        crack: 'crack 0.35s ease-out both',
        'leaf-in': 'leafIn 0.9s cubic-bezier(0.22,1.3,0.4,1) both',
        'leaf-sway': 'leafSway 5s ease-in-out infinite',
        'letter-pop': 'letterPop 0.5s cubic-bezier(0.22,1.4,0.4,1) both',
      },
    },
  },
  plugins: [],
}
