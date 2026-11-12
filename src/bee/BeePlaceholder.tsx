import type { BeeState } from './types'

const EYES = [
  { cx: 80, cy: 108 },
  { cx: 120, cy: 108 },
]

/** 4-point twinkle star centred on (x, y). */
const star = (x: number, y: number, s: number) =>
  `M${x} ${y - s} Q${x} ${y} ${x + s} ${y} Q${x} ${y} ${x} ${y + s} Q${x} ${y} ${x - s} ${y} Q${x} ${y} ${x} ${y - s}Z`

/** Scalloped ellipse outline: gives the bee a soft, fuzzy bumblebee silhouette. */
function fluffy(cx: number, cy: number, rx: number, ry: number, n: number, bump: number) {
  const pts = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2
    return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry].map((v) => +v.toFixed(2))
  })
  let d = `M${pts[0][0]} ${pts[0][1]}`
  for (let i = 1; i <= n; i++) {
    const [x, y] = pts[i % n]
    d += ` A${bump} ${bump} 0 0 1 ${x} ${y}`
  }
  return d + 'Z'
}

const BODY = fluffy(100, 120, 64, 58, 40, 5.5)

/**
 * Temporary SVG/CSS bee used until the Fable 5.2 exports land.
 * Chubby, fuzzy bumblebee: scalloped fluffy outline, fuzzy stripes and tail, bright eyes, small smile.
 * Each state gets its own pose and CSS animation (see bee.css).
 */
export function BeePlaceholder({ state }: { state: BeeState }) {
  const sleepy = state === 'low_battery'
  const openSmile = state === 'shift_finished' || state === 'step_complete'

  return (
    <svg viewBox="0 0 200 200" className={`bee-ph bee-ph--${state}`} role="img" aria-label={`Bee (${state.replace('_', ' ')})`}>
      <defs>
        <radialGradient id="bee-body" cx="42%" cy="32%" r="78%">
          <stop offset="0%" stopColor="#fff2b0" />
          <stop offset="50%" stopColor="#ffd34d" />
          <stop offset="100%" stopColor="#f2ad1c" />
        </radialGradient>
        <linearGradient id="bee-wing" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#bfe3ff" stopOpacity="0.6" />
        </linearGradient>
        <clipPath id="bee-body-clip">
          <path d={BODY} />
        </clipPath>
      </defs>

      <ellipse className="bee-shadow" cx="100" cy="190" rx="44" ry="6" fill="#3b2a0a" opacity="0.12" />

      <g className="bee-float">
        <g className="bee-tilt">
          {/* glassy wings */}
          <g className="bee-wings">
            <g transform="rotate(-32 62 60)">
              <ellipse className="bee-wing bee-wing--l" cx="62" cy="60" rx="22" ry="32" fill="url(#bee-wing)" stroke="#8cc4ea" strokeWidth="2.5" />
            </g>
            <g transform="rotate(32 138 60)">
              <ellipse className="bee-wing bee-wing--r" cx="138" cy="60" rx="22" ry="32" fill="url(#bee-wing)" stroke="#8cc4ea" strokeWidth="2.5" />
            </g>
          </g>

          {/* antennae */}
          <g className="bee-antennae">
            <path d="M84 70 Q76 48 66 36" stroke="#3b2a0a" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <path d="M116 70 Q124 48 134 36" stroke="#3b2a0a" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <circle cx="66" cy="34" r="7" fill="#3b2a0a" />
            <circle cx="134" cy="34" r="7" fill="#3b2a0a" />
            <circle cx="68" cy="32" r="2.2" fill="#fff" opacity="0.8" />
            <circle cx="136" cy="32" r="2.2" fill="#fff" opacity="0.8" />
          </g>

          {/* stubby arms */}
          <ellipse className="bee-arm bee-arm--l" cx="38" cy="132" rx="9" ry="13" fill="#ffc93a" stroke="#3b2a0a" strokeWidth="3" />
          <ellipse className="bee-arm bee-arm--r" cx="162" cy="132" rx="9" ry="13" fill="#ffc93a" stroke="#3b2a0a" strokeWidth="3" />

          {/* fluffy round body */}
          <path d={BODY} fill="url(#bee-body)" />
          <g clipPath="url(#bee-body-clip)">
            {/* fuzzy dark band + fluffy white tail, bumblebee style */}
            <path d="M20 142 Q60 134 100 138 Q140 134 180 142 L180 162 Q140 156 100 160 Q60 156 20 162 Z" fill="#3b2a0a" />
            <path d="M20 168 Q60 162 100 166 Q140 162 180 168 L180 200 L20 200 Z" fill="#fff6e6" />
            {/* little fur strokes */}
            <g stroke="#e8a21a" strokeWidth="2" strokeLinecap="round" opacity="0.55">
              <path d="M58 90 l-3 -5 M140 92 l3 -5 M48 112 l-5 -2 M152 112 l5 -2 M70 74 l-1 -5 M130 74 l1 -5" />
            </g>
            <g stroke="#5a4320" strokeWidth="2" strokeLinecap="round" opacity="0.7">
              <path d="M40 150 l-2 4 M70 148 l0 5 M100 150 l0 5 M130 148 l0 5 M160 150 l2 4" />
            </g>
          </g>
          <path d={BODY} fill="none" stroke="#3b2a0a" strokeWidth="3.5" strokeLinejoin="round" />

          {/* fuzzy tuft on top */}
          <path d="M90 66 q3 -9 8 -2 q4 -9 8 0 q5 -6 6 3" fill="#ffd34d" stroke="#3b2a0a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

          {/* soft highlight */}
          <ellipse cx="76" cy="84" rx="16" ry="7" fill="#fff" opacity="0.4" transform="rotate(-20 76 84)" />

          {/* face */}
          <g className="bee-head">
            <g className="bee-eyes">
              {EYES.map(({ cx, cy }) =>
                sleepy ? (
                  <path key={cx} d={`M${cx - 9} ${cy} Q${cx} ${cy + 7} ${cx + 9} ${cy}`} stroke="#3b2a0a" strokeWidth="3.5" strokeLinecap="round" fill="none" />
                ) : state === 'step_complete' ? (
                  <path key={cx} d={`M${cx - 9} ${cy + 3} Q${cx} ${cy - 7} ${cx + 9} ${cy + 3}`} stroke="#3b2a0a" strokeWidth="3.5" strokeLinecap="round" fill="none" />
                ) : (
                  <g key={cx} className="bee-eye">
                    <ellipse cx={cx} cy={cy} rx="10" ry="12" fill="#3b2a0a" />
                    {state === 'shift_finished' ? (
                      <path d={star(cx + 3, cy - 4, 6)} fill="#fff" />
                    ) : (
                      <circle cx={cx + 3.5} cy={cy - 4.5} r="4.2" fill="#fff" />
                    )}
                    <circle cx={cx - 3.5} cy={cy + 4.5} r="1.8" fill="#fff" />
                  </g>
                ),
              )}
            </g>

            {/* blush */}
            <ellipse cx="62" cy="122" rx="9" ry="5.5" fill="#ff9fb0" opacity="0.65" />
            <ellipse cx="138" cy="122" rx="9" ry="5.5" fill="#ff9fb0" opacity="0.65" />

            {/* small smile */}
            {openSmile ? (
              <path d="M94 121 Q100 130 106 121 Z" fill="#c2453a" stroke="#3b2a0a" strokeWidth="2.5" strokeLinejoin="round" />
            ) : (
              <path d={sleepy ? 'M96 123 Q100 126 104 123' : 'M95 121 Q100 126.5 105 121'} stroke="#3b2a0a" strokeWidth="3" strokeLinecap="round" fill="none" />
            )}
          </g>

          {/* cozy blanket for low battery */}
          {sleepy && (
            <g className="bee-blanket">
              <path d="M30 140 Q62 128 100 136 Q140 144 172 132 L166 178 Q100 192 36 178 Z" fill="#9cc2e6" stroke="#3b2a0a" strokeWidth="3" strokeLinejoin="round" />
              <path d="M40 152 Q100 164 162 148" stroke="#fff" strokeWidth="3" strokeDasharray="6 7" fill="none" opacity="0.85" />
              <circle cx="70" cy="166" r="3" fill="#fff" opacity="0.7" />
              <circle cx="104" cy="170" r="3" fill="#fff" opacity="0.7" />
              <circle cx="138" cy="164" r="3" fill="#fff" opacity="0.7" />
            </g>
          )}
        </g>
      </g>

      {sleepy && (
        <g className="bee-zzz" fill="#6d84a3" fontWeight="800" fontFamily="ui-rounded, system-ui, sans-serif">
          <text x="150" y="70" fontSize="16">z</text>
          <text x="162" y="52" fontSize="20">z</text>
          <text x="176" y="32" fontSize="24">Z</text>
        </g>
      )}

      {state === 'encouraging' && (
        <g className="bee-hearts" fill="#ff8fa3">
          <path d="M172 92 c-4-6-12-2-8 4 l8 8 8-8 c4-6-4-10-8-4z" />
        </g>
      )}

      {state === 'step_complete' && (
        <g className="bee-burst">
          {Array.from({ length: 8 }, (_, i) => {
            const a = (i / 8) * Math.PI * 2
            return <path key={i} d={star(100 + Math.cos(a) * 88, 112 + Math.sin(a) * 82, i % 2 ? 6 : 9)} fill={i % 2 ? '#ff8fa3' : '#f6b828'} />
          })}
        </g>
      )}

      {state === 'shift_finished' && (
        <g className="bee-confetti">
          {Array.from({ length: 14 }, (_, i) => {
            const colors = ['#f6b828', '#ff8fa3', '#8fb8de', '#9bd59b', '#c9a0f0']
            const x = 14 + ((i * 53) % 172)
            return <rect key={i} x={x} y={-10} width="7" height="11" rx="2" fill={colors[i % colors.length]} style={{ animationDelay: `${(i % 7) * 0.22}s` }} />
          })}
        </g>
      )}
    </svg>
  )
}
