import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import AuthLayout from '../components/AuthLayout'
import Button from '../components/ui/Button'
import { authApi } from '../api/auth'
import { extractError } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function VerifyEmail() {
  const location = useLocation()
  const navigate = useNavigate()
  const { loginWithAuthResponse } = useAuth()
  const toast = useToast()
  const [email, setEmail] = useState(location.state?.email || '')
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState('')
  const inputsRef = useRef([])

  useEffect(() => {
    inputsRef.current[0]?.focus()
  }, [])

  function handleChange(idx, value) {
    const v = value.replace(/\D/g, '').slice(-1)
    setDigits((d) => {
      const next = [...d]
      next[idx] = v
      return next
    })
    if (v && idx < 5) inputsRef.current[idx + 1]?.focus()
  }

  function handleKeyDown(idx, e) {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus()
    }
  }

  function handlePaste(e) {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!text) return
    e.preventDefault()
    setDigits(text.split('').concat(Array(6).fill('')).slice(0, 6))
    inputsRef.current[Math.min(text.length, 5)]?.focus()
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const otp = digits.join('')
    if (otp.length !== 6) {
      setError('Enter the 6-digit code sent to your email.')
      return
    }
    setLoading(true)
    try {
      const res = await authApi.verifyEmail({ email: email.trim(), otp })
      loginWithAuthResponse(res.data)
      toast.success('Email verified. Welcome to eBizzPro!')
      navigate('/', { replace: true })
    } catch (err) {
      setError(extractError(err, 'Invalid or expired code.'))
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    if (!email) {
      setError('Enter your email above first.')
      return
    }
    setResending(true)
    setError('')
    try {
      await authApi.resendOtp({ email: email.trim() })
      toast.success('A new code has been sent.')
    } catch (err) {
      setError(extractError(err, 'Could not resend the code.'))
    } finally {
      setResending(false)
    }
  }

  return (
    <AuthLayout
      title="Verify your email"
      subtitle={email ? `Enter the code we sent to ${email}` : 'Enter the code we emailed you'}
      footer={
        <>
          Wrong email? <Link to="/register" className="font-bold text-ink scribble-underline">Start over</Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {error && (
          <div className="rounded-2xl hand-border bg-[var(--color-bad-bg)] px-4 py-2.5 text-sm font-semibold">
            {error}
          </div>
        )}
        {!location.state?.email && (
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-ink-soft">
              Email
              <span className="ml-1 text-[#8a2e20]">*</span>
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl hand-border bg-surface px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ink/20"
              placeholder="you@business.com"
              required
            />
          </label>
        )}
        <div className="flex justify-center gap-2" onPaste={handlePaste}>
          {digits.map((d, idx) => (
            <input
              key={idx}
              ref={(el) => (inputsRef.current[idx] = el)}
              value={d}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              inputMode="numeric"
              maxLength={1}
              className="h-14 w-11 rounded-2xl hand-border bg-surface text-center text-xl font-extrabold outline-none focus:ring-2 focus:ring-ink/20"
            />
          ))}
        </div>
        <Button type="submit" size="lg" loading={loading} icon={ShieldCheck} className="w-full">
          Verify email
        </Button>
        <button
          type="button"
          onClick={handleResend}
          disabled={resending}
          className="mx-auto text-sm font-bold text-ink-soft hover:text-ink disabled:opacity-50"
        >
          {resending ? 'Resending…' : "Didn't get a code? Resend"}
        </button>
      </form>
    </AuthLayout>
  )
}
