import { useState } from 'react'

export default function BrandMark({ compact = false, className = '' }) {
  const [imgError, setImgError] = useState(false)
  const sizeClass = compact ? 'h-9 w-9' : 'h-11 w-11'

  return (
    <div className={`relative flex items-center justify-center overflow-hidden rounded-[28px] bg-[#1a1a1d] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_12px_30px_rgba(0,0,0,0.18)] ${sizeClass} ${className}`}>
      {!imgError ? (
        <img
          src="/logo.png"
          alt="eBizzPro brand"
          className="h-full w-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <span
          className="select-none font-black leading-none text-[#f5f1e9]"
          style={{
            fontSize: compact ? '2rem' : '2.5rem',
            letterSpacing: '-0.12em',
            transform: 'translateY(-1px)',
            fontFamily: 'Segoe UI, Arial, sans-serif',
          }}
        >
          e
        </span>
      )}
    </div>
  )
}
