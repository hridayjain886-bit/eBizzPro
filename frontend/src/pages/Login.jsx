import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import AuthLayout from '../components/AuthLayout'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { extractError } from '../api/client'

export default function Login() {
  const { login } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.email.trim(), form.password)
      toast.success('Welcome back!')
      navigate(location.state?.from || '/', { replace: true })
    } catch (err) {
      const message = extractError(err, 'Could not sign in. Check your details and try again.')
      if (err?.response?.status === 403 || /verify/i.test(message)) {
        navigate('/verify-email', { state: { email: form.email.trim() } })
        return
      }
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to manage your billing and inventory"
      footer={
        <>
          New to eBizzPro? <Link to="/register" className="font-bold text-ink scribble-underline">Create an account</Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="rounded-2xl hand-border bg-[var(--color-bad-bg)] px-4 py-2.5 text-sm font-semibold">
            {error}
          </div>
        )}
        <Input
          label="Email"
          type="email"
          required
          autoComplete="email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          placeholder="you@business.com"
        />
        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            required
            autoComplete="current-password"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            placeholder="Enter your password"
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-4 top-9 text-ink-soft hover:text-ink"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <div className="flex items-center justify-end">
          <Link to="/forgot-password" className="text-sm font-bold text-ink-soft hover:text-ink">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" size="lg" loading={loading} icon={LogIn} className="mt-2 w-full">
          Sign in
        </Button>
      </form>
    </AuthLayout>
  )
}
