interface Props {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  description?: string
  icon?: string
}

export function Toggle({ checked, onChange, label, description, icon }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition-colors ${checked ? 'bg-night text-white' : 'bg-white text-ink shadow-sm'}`}
    >
      {icon && <span className="text-2xl" aria-hidden>{icon}</span>}
      <span className="flex-1">
        <span className="block text-base font-bold">{label}</span>
        {description && <span className={`block text-sm ${checked ? 'text-white/75' : 'text-ink-soft'}`}>{description}</span>}
      </span>
      <span className={`relative h-8 w-14 flex-none rounded-full transition-colors ${checked ? 'bg-sky-calm' : 'bg-ink/15'}`}>
        <span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${checked ? 'left-7' : 'left-1'}`} />
      </span>
    </button>
  )
}
