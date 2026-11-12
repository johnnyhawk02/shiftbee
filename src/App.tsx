import { useEffect, useState } from 'react'
import { db, type ShiftTemplate } from './db'
import { Home } from './screens/Home'
import { BeforePhoto } from './screens/BeforePhoto'
import { ActiveShift } from './screens/ActiveShift'
import { AfterReveal } from './screens/AfterReveal'
import { BeeGallery } from './screens/BeeGallery'
import { RotaEditor } from './screens/RotaEditor'

export type Stage =
  | { name: 'loading' }
  | { name: 'home' }
  | { name: 'rota' }
  | { name: 'before'; template: ShiftTemplate }
  | { name: 'active'; sessionId: number }
  | { name: 'after'; sessionId: number; fromHistory?: boolean }

export default function App() {
  const [stage, setStage] = useState<Stage>({ name: 'loading' })

  // Resume an in-progress shift if the tab was reloaded or killed mid-chore.
  useEffect(() => {
    db.sessions
      .where('status')
      .equals('active')
      .last()
      .then((s) => setStage(s?.id ? { name: 'active', sessionId: s.id } : { name: 'home' }))
      .catch(() => setStage({ name: 'home' }))
  }, [])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [stage.name])

  if (new URLSearchParams(location.search).has('bees')) return <BeeGallery />

  switch (stage.name) {
    case 'loading':
      return null
    case 'home':
      return (
        <Home
          onPick={(template) => setStage({ name: 'before', template })}
          onOpenSession={(sessionId) => setStage({ name: 'after', sessionId, fromHistory: true })}
          onOpenRota={() => setStage({ name: 'rota' })}
        />
      )
    case 'rota':
      return <RotaEditor onBack={() => setStage({ name: 'home' })} />
    case 'before':
      return (
        <BeforePhoto
          template={stage.template}
          onBack={() => setStage({ name: 'home' })}
          onStarted={(sessionId) => setStage({ name: 'active', sessionId })}
        />
      )
    case 'active':
      return <ActiveShift sessionId={stage.sessionId} onFinished={() => setStage({ name: 'after', sessionId: stage.sessionId })} />
    case 'after':
      return <AfterReveal sessionId={stage.sessionId} fromHistory={stage.fromHistory} onHome={() => setStage({ name: 'home' })} />
  }
}
