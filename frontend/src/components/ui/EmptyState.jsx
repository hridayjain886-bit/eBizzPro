export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl hand-border border-dashed bg-surface/60 px-6 py-14 text-center">
      {Icon && (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full hand-border bg-tint">
          <Icon size={28} strokeWidth={1.75} />
        </div>
      )}
      <h3 className="text-base font-extrabold">{title}</h3>
      {description && <p className="mt-1.5 max-w-xs text-sm text-ink-soft">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
