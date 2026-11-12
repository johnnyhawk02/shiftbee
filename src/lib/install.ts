import { useEffect, useState } from 'react'

/** Chrome/Edge/Samsung's install prompt event (not in the TS DOM lib yet). */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

// The browser can fire `beforeinstallprompt` before React mounts, so catch it
// at module load (this file is imported from main.tsx) and keep it for later.
let deferred: BeforeInstallPromptEvent | null = null
let installedThisSession = false
const listeners = new Set<() => void>()
const notify = () => listeners.forEach((l) => l())

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault() // we show our own button instead of the mini-infobar
  deferred = e as BeforeInstallPromptEvent
  notify()
})
window.addEventListener('appinstalled', () => {
  deferred = null
  installedThisSession = true
  notify()
})

export function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

/** iPhone/iPad: no install prompt API, only Share > Add to Home Screen. */
export function isIOS() {
  const ua = navigator.userAgent
  return /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}

export type InstallMode = 'prompt' | 'ios' | null

/**
 * How (or whether) we can offer installing the app right now.
 * 'prompt' = we can show the browser's own install dialog.
 * 'ios'    = show Add to Home Screen instructions.
 * null     = already installed, or this browser can't install.
 */
export function useInstall(): { mode: InstallMode; install: () => Promise<void> } {
  const [, force] = useState(0)
  useEffect(() => {
    const l = () => force((n) => n + 1)
    listeners.add(l)
    return () => void listeners.delete(l)
  }, [])

  let mode: InstallMode = null
  if (!isStandalone() && !installedThisSession) {
    if (deferred) mode = 'prompt'
    else if (isIOS()) mode = 'ios'
  }

  async function install() {
    const e = deferred
    if (!e) return
    await e.prompt()
    const { outcome } = await e.userChoice
    // A prompt event can only be used once.
    deferred = null
    if (outcome === 'accepted') installedThisSession = true
    notify()
  }

  return { mode, install }
}
