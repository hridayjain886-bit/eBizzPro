const STYLES = {
  neutral: 'bg-tint text-ink border border-black/10',
  paid: 'bg-[var(--color-success-bg)] text-[var(--color-success-ink)] border border-[var(--color-success-strong)]/20',
  pending: 'bg-[var(--color-warn-bg)] text-[var(--color-warn-ink)] border border-[var(--color-warn-strong)]/25',
  cancelled: 'bg-[var(--color-bad-bg)] text-[var(--color-bad-ink)] border border-[var(--color-bad-strong)]/20 line-through decoration-2',
  active: 'bg-[var(--color-success-bg)] text-[var(--color-success-ink)] border border-[var(--color-success-strong)]/20',
  inactive: 'bg-tint text-muted border border-black/10',
  draft: 'bg-[var(--color-warn-bg)] text-[var(--color-warn-ink)] border border-[var(--color-warn-strong)]/25',
}

export default function Badge({ children, tone = 'neutral', className = '' }) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide hand-border ${STYLES[tone] || STYLES.neutral} ${className}`}>
      {children}
    </span>
  )
}
