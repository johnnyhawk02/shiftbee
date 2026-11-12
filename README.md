# ShiftBee

A mobile-first, offline, 100% local PWA for 10-minute housekeeping and self-care "shifts". No backend, no accounts: templates, session logs and photos live in IndexedDB on the device.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build with service worker
npm run preview    # serve the build (test install / offline here)
```

Camera capture and Wake Lock need HTTPS on a phone. For on-device testing use `npm run dev -- --host` behind an HTTPS tunnel, or deploy `dist/` to any static host.

## Layout

| Path | What |
| --- | --- |
| `src/db/` | Dexie schema (`ShiftTemplate`, `ShiftSession`, `PhotoBlob`, settings) and the 5 seeded presets with Standard + Low Battery steps |
| `src/bee/` | `<BeeCompanion />`, `useBeeState` / `useBeeScene`, `BEE_ANIMATIONS` config map, copy bank, SVG placeholder bee |
| `src/lib/` | Canvas compression, Web Audio (brown noise + chimes), Wake Lock hook, drift-free countdown |
| `src/screens/` | Home → BeforePhoto → ActiveShift → AfterReveal |
| `src/components/` | Before/After slider, Proof Wall, photo capture, template editor |

## Swapping in the Fable 5.2 bee

1. Put exports in `public/bee/` (they are precached for offline use).
2. Edit `src/bee/animations.ts` (open `/?bees` to preview all five states side by side), e.g.

```ts
idle: { kind: 'lottie', src: '/bee/idle.json', loop: true },
step_complete: { kind: 'video', loop: false, sources: [
  { src: '/bee/step_complete.webm', type: 'video/webm' },               // Chrome/Android (VP9 alpha)
  { src: '/bee/step_complete.mov', type: 'video/mp4; codecs="hvc1"' },  // Safari/iOS (HEVC alpha)
]},
shift_finished: { kind: 'sprite', src: '/bee/finished.png', frames: 24, fps: 24, frameWidth: 256, frameHeight: 256 },
```

Any asset that fails to load falls back to the placeholder. Rive needs `npm i @rive-app/react-canvas` and the stub in `BeeCompanion.tsx` filled in. `step_complete` plays for `BEE_TRANSIENT_MS.step_complete` (1.3s) then returns to the screen's base state.

## Behaviour notes

- Timer is `endTime - Date.now()`, so backgrounding never drifts it. Shift state is saved to IndexedDB on every change; a reload or killed tab resumes mid-shift, and a shift whose time ran out while closed is wrapped up automatically.
- Soft chime every 2.5 minutes, three-note bell at 00:00, pop + vibration on Done. The soundscape toggle controls the brown noise.
- Photos: max 900px wide, JPEG 0.75 (stepping down if still over ~220KB). `navigator.storage.persist()` is requested so the browser is less likely to evict them.
