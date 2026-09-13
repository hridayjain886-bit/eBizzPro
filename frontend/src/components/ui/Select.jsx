export default function Select({ label, error, className = '', id, children, required, ...props }) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <label htmlFor={selectId} className="block w-full">
      {label && (
        <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-ink-soft">
          {label}
          {required && <span className="ml-1 text-[#8a2e20]">*</span>}
        </span>
      )}
      <select
        id={selectId}
        required={required}
        className={`w-full rounded-2xl hand-border bg-surface px-4 py-2.5 text-sm text-ink outline-none focus:ring-2 focus:ring-ink/20 ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <span className="mt-1 block text-xs font-semibold text-[#8a2e20]">{error}</span>}
    </label>
  )
}
