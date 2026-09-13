export default function Input({ label, error, className = '', id, hint, required, ...props }) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <label htmlFor={inputId} className="block w-full">
      {label && (
        <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-ink-soft">
          {label}
          {required && <span className="ml-1 text-[#8a2e20]">*</span>}
        </span>
      )}
      <input
        id={inputId}
        required={required}
        className={`w-full rounded-2xl hand-border bg-surface px-4 py-2.5 text-sm text-ink placeholder:text-muted outline-none focus:ring-2 focus:ring-ink/20 ${error ? 'border-[#8a2e20]' : ''} ${className}`}
        {...props}
      />
      {hint && !error && <span className="mt-1 block text-xs text-muted">{hint}</span>}
      {error && <span className="mt-1 block text-xs font-semibold text-[#8a2e20]">{error}</span>}
    </label>
  )
}
