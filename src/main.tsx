import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App'
import { BeeProvider } from './bee'
import { unlockAudio } from './lib/audio'

registerSW({ immediate: true })

// iOS only lets audio start after a user gesture; unlock on the first tap anywhere.
window.addEventListener('pointerdown', () => void unlockAudio(), { once: true, capture: true })

// Ask the browser not to evict our IndexedDB (photos) under storage pressure.
navigator.storage?.persist?.().catch(() => {})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BeeProvider>
      <App />
    </BeeProvider>
  </StrictMode>,
)
