export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  disabled,
  icon: Icon,
  ...props
}) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-150 select-none disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97]'
  const sizes = {
    sm: 'text-xs px-3.5 py-1.5',
    md: 'text-sm px-5 py-2.5',
    lg: 'text-base px-6 py-3.5',
  }
  const variants = {
    primary: 'bg-ink text-paper hand-border border-ink hover:bg-[#2a2a20]',
    secondary: 'bg-surface text-ink hand-border hover:bg-tint',
    ghost: 'bg-transparent text-ink hover:bg-tint border-2 border-transparent',
    success: 'bg-[var(--color-success-bg)] text-[var(--color-success-ink)] hand-border border-[var(--color-success-strong)]/30 hover:brightness-95',
    warning: 'bg-[var(--color-warn-bg)] text-[var(--color-warn-ink)] hand-border border-[var(--color-warn-strong)]/30 hover:brightness-95',
    danger: 'bg-[var(--color-bad-bg)] text-[var(--color-bad-ink)] hand-border border-[var(--color-bad-strong)]/30 hover:brightness-95',
  }
  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
      ) : Icon ? (
        <Icon size={16} strokeWidth={2.25} />
      ) : null}
      {children}
    </button>
  )
}
