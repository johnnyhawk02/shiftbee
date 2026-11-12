import { useState } from 'react'
import { useInstall } from '../lib/install'

/** "Install ShiftBee" row for the home screen. Hidden once the app is installed. */
export function InstallButton() {
  const { mode, install } = useInstall()
  const [showIosHelp, setShowIosHelp] = useState(false)

  if (!mode) return null

  return (
    <>
      <button
        type="button"
        onClick={() => (mode === 'prompt' ? void install() : setShowIosHelp(true))}
        className="flex w-full items-center gap-3 rounded-2xl bg-honey-400 px-4 py-3 text-left text-ink shadow-sm active:bg-honey-500"
      >
        <span className="text-2xl" aria-hidden>📲</span>
        <span className="flex-1">
          <span className="block text-base font-extrabold">Install ShiftBee</span>
          <span className="block text-sm">Add it to your home screen. Works offline.</span>
        </span>
        <span className="rounded-full bg-white px-3 py-1 text-sm font-bold">Install</span>
      </button>

      {showIosHelp && (
        <div className="fade-in fixed inset-0 z-50 flex items-end justify-center bg-ink/40" onClick={() => setShowIosHelp(false)}>
          <div
            className="card-in safe-pad w-full max-w-lg rounded-t-3xl bg-white"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Install ShiftBee"
          >
            <h2 className="mb-4 text-xl font-extrabold">Add ShiftBee to your home screen</h2>
            <ol className="mb-5 flex flex-col gap-3 text-base">
              <li className="flex items-center gap-3">
                <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-honey-100 font-bold">1</span>
                <span>
                  Tap the <b>Share</b> button <ShareIcon /> in Safari's toolbar.
                </span>
              </li>
              <li className="flex items-center gap-3">
                <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-honey-100 font-bold">2</span>
                <span>
                  Scroll down and tap <b>Add to Home Screen</b> <span aria-hidden>➕</span>
                </span>
              </li>
              <li className="flex items-center gap-3">
                <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-honey-100 font-bold">3</span>
                <span>
                  Tap <b>Add</b>. ShiftBee will open from your home screen like an app.
                </span>
              </li>
            </ol>
            <button
              type="button"
              onClick={() => setShowIosHelp(false)}
              className="w-full rounded-2xl bg-honey-400 py-3 text-base font-extrabold active:bg-honey-500"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  )
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" className="inline h-5 w-5 align-text-bottom text-[#007aff]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label="Share icon">
      <path d="M12 3v12" />
      <path d="M8 7l4-4 4 4" />
      <path d="M6 11H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1" />
    </svg>
  )
}
