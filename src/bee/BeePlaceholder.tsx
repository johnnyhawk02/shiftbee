import type { BeeState } from './types'

const EYES = [
  { cx: 80, cy: 108 },
  { cx: 120, cy: 108 },
]

/** 4-point twinkle star centred on (x, y). */
const star = (x: number, y: number, s: number) =>
  `M${x} ${y - s} Q${x} ${y} ${x + s} ${y} Q${x} ${y} ${x} ${y + s} Q${x} ${y} ${x - s} ${y} Q${x} ${y} ${x} ${y - s}Z`

/**
 * Temporary SVG/CSS bee used until the Fable 5.2 exports land.
 * Chibi style: round body, bright friendly eyes, small smile.
 * Each state gets its own pose and CSS animation (see bee.css).
 */
export function BeePlaceholder({ state }: { state: BeeState }) {
  const sleepy = state === 'low_battery'
  const openSmile = state === 'shift_finished' || state === 'step_complete'

  return (
    <svg viewBox="0 0 200 200" className={`bee-ph bee-ph--${state}`} role="img" aria-label={`Bee (${state.replace('_', ' ')})`}>
      <defs>
        <radialGradient id="bee-body" cx="40%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#fff0a8" />
          <stop offset="45%" stopColor="#ffd045" />
          <stop offset="100%" stopColor="#f0a514" />
        </radialGradient>
        <linearGradient id="bee-wing" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#bfe3ff" stopOpacity="0.6" />
        </linearGradient>
        <clipPath id="bee-body-clip">
          <ellipse cx="100" cy="118" rx="62" ry="56" />
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
          <ellipse className="bee-arm bee-arm--l" cx="40" cy="132" rx="9" ry="14" fill="#ffc93a" stroke="#3b2a0a" strokeWidth="3" />
          <ellipse className="bee-arm bee-arm--r" cx="160" cy="132" rx="9" ry="14" fill="#ffc93a" stroke="#3b2a0a" strokeWidth="3" />

          {/* round body */}
          <ellipse cx="100" cy="118" rx="62" ry="56" fill="url(#bee-body)" stroke="#3b2a0a" strokeWidth="3.5" />
          <g clipPath="url(#bee-body-clip)" fill="#3b2a0a">
            <path d="M30 146 Q100 160 170 146 L170 158 Q100 172 30 158 Z" />
            <path d="M30 168 Q100 182 170 168 L170 190 L30 190 Z" />
          </g>
          {/* glossy top highlight */}
          <ellipse cx="78" cy="78" rx="20" ry="9" fill="#fff" opacity="0.45" transform="rotate(-18 78 78)" />

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
