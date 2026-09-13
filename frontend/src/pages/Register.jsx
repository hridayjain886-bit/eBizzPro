import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserPlus } from 'lucide-react'
import AuthLayout from '../components/AuthLayout'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { authApi } from '../api/auth'
import { extractError } from '../api/client'
import { useToast } from '../context/ToastContext'

export default function Register() {
  const navigate = useNavigate()
  const toast = useToast()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) {
      setError('Passwords do not match.')
      return
    }
    if (form.password.length < 4) {
      setError('Password must be at least 4 characters.')
      return
    }
    setLoading(true)
    try {
      await authApi.register({ name: form.name.trim(), email: form.email.trim(), password: form.password })
      toast.success('Verification code sent to your email.')
      navigate('/verify-email', { state: { email: form.email.trim() } })
    } catch (err) {
      setError(extractError(err, 'Could not create your account. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Set up billing and inventory in minutes"
      footer={
        <>
          Already have an account? <Link to="/login" className="font-bold text-ink scribble-underline">Sign in</Link>
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
          label="Full name"
          required
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="Priya Sharma"
        />
        <Input
          label="Email"
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          placeholder="you@business.com"
        />
        <Input
          label="Password"
          type="password"
          required
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          placeholder="At least 4 characters"
        />
        <Input
          label="Confirm password"
          type="password"
          required
          value={form.confirm}
          onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
          placeholder="Re-enter your password"
        />
        <Button type="submit" size="lg" loading={loading} icon={UserPlus} className="mt-2 w-full">
          Create account
        </Button>
      </form>
    </AuthLayout>
  )
}
