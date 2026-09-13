export default function Card({ children, className = '', as: As = 'div', ...props }) {
  return (
    <As className={`bg-surface hand-border rounded-3xl ${className}`} {...props}>
      {children}
    </As>
  )
}
