import { BeeCompanion, BEE_STATES, BEE_ANIMATIONS } from '../bee'

/** Open /?bees to see every bee state side by side (handy when dropping in new exports). */
export function BeeGallery() {
  return (
    <main className="safe-pad mx-auto grid max-w-4xl grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
      {BEE_STATES.map((s) => (
        <figure key={s} className="flex flex-col items-center rounded-2xl bg-white p-3 shadow-sm">
          <BeeCompanion state={s} message={null} size={150} />
          <figcaption className="mt-2 text-sm font-bold">{s}</figcaption>
          <span className="text-xs text-ink-soft">{BEE_ANIMATIONS[s].kind}</span>
        </figure>
      ))}
    </main>
  )
}
