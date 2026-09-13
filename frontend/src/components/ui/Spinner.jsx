export default function Spinner({ size = 24, className = '' }) {
  return (
    <div
      className={`rounded-full border-[3px] border-ink/15 border-t-ink animate-spin ${className}`}
      style={{ width: size, height: size }}
    />
  )
}
