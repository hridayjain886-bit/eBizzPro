import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { KeyRound, Mail, ShieldCheck, ArrowLeft } from 'lucide-react'
import AuthLayout from '../components/AuthLayout'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { authApi } from '../api/auth'
import { useToast } from '../context/ToastContext'
import { extractError } from '../api/client'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const toast = useToast()
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [step, setStep] = useState('request')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const inputsRef = useRef([])

  function handleOtpChange(idx, value) {
    const v = value.replace(/\D/g, '').slice(-1)
    setOtp((current) => {
      const next = [...current]
      next[idx] = v
      return next
    })
    if (v && idx < 5) inputsRef.current[idx + 1]?.focus()
  }

  function handleOtpKeyDown(idx, e) {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus()
    }
  }

  async function handleRequestOtp(e) {
    e.preventDefault()
    setError('')
    if (!email.trim()) {
      setError('Email is required.')
      return
    }

    setLoading(true)
    try {
      await authApi.forgotPassword({ email: email.trim() })
      toast.success('Reset code sent to your email.')
      setStep('verify')
    } catch (err) {
      setError(extractError(err, 'Could not send reset code.'))
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyOtp(e) {
    e.preventDefault()
    setError('')
    const otpValue = otp.join('')
    if (otpValue.length !== 6) {
      setError('Enter the 6-digit code sent to your email.')
      return
    }

    setLoading(true)
    try {
      await authApi.verifyResetOtp({ email: email.trim(), otp: otpValue })
      toast.success('OTP verified.')
      setStep('reset')
    } catch (err) {
      setError(extractError(err, 'Invalid or expired OTP.'))
    } finally {
      setLoading(false)
    }
  }

  async function handleResetPassword(e) {
    e.preventDefault()
    setError('')
    if (!password || password.length < 4) {
      setError('Password must be at least 4 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const otpValue = otp.join('')
      await authApi.resetPassword({ email: email.trim(), otp: otpValue, password })
      toast.success('Password updated successfully.')
      navigate('/login')
    } catch (err) {
      setError(extractError(err, 'Could not reset password.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle={
        step === 'request'
          ? 'Enter your email to receive a one-time code'
          : step === 'verify'
            ? 'Enter the 6-digit OTP sent to your email'
            : 'Choose a new password'
      }
      footer={
        <>
          <Link to="/login" className="inline-flex items-center gap-2 font-bold text-ink scribble-underline">
            <ArrowLeft size={14} /> Back to login
          </Link>
        </>
      }
    >
      {step === 'request' && (
        <form onSubmit={handleRequestOtp} className="flex flex-col gap-4">
          {error && (
            <div className="rounded-2xl hand-border bg-[var(--color-bad-bg)] px-4 py-2.5 text-sm font-semibold">
              {error}
            </div>
          )}
          <Input
            label="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@business.com"
          />
          <Button type="submit" size="lg" loading={loading} icon={Mail} className="w-full">
            Send OTP
          </Button>
        </form>
      )}

      {step === 'verify' && (
        <form onSubmit={handleVerifyOtp} className="flex flex-col gap-5">
          {error && (
            <div className="rounded-2xl hand-border bg-[var(--color-bad-bg)] px-4 py-2.5 text-sm font-semibold">
              {error}
            </div>
          )}
          <div className="flex justify-center gap-2">
            {otp.map((d, idx) => (
              <input
                key={idx}
                ref={(el) => (inputsRef.current[idx] = el)}
                value={d}
                onChange={(e) => handleOtpChange(idx, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                inputMode="numeric"
                maxLength={1}
                className="h-14 w-11 rounded-2xl hand-border bg-surface text-center text-xl font-extrabold outline-none focus:ring-2 focus:ring-ink/20"
              />
            ))}
          </div>
          <Button type="submit" size="lg" loading={loading} icon={ShieldCheck} className="w-full">
            Verify OTP
          </Button>
          <button
            type="button"
            onClick={handleRequestOtp}
            className="mx-auto text-sm font-bold text-ink-soft hover:text-ink"
          >
            Resend code
          </button>
        </form>
      )}

      {step === 'reset' && (
        <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
          {error && (
            <div className="rounded-2xl hand-border bg-[var(--color-bad-bg)] px-4 py-2.5 text-sm font-semibold">
              {error}
            </div>
          )}
          <Input
            label="New password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 4 characters"
          />
          <Input
            label="Confirm password"
            type="password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Re-enter password"
          />
          <Button type="submit" size="lg" loading={loading} icon={KeyRound} className="w-full">
            Reset password
          </Button>
        </form>
      )}
    </AuthLayout>
  )
}
