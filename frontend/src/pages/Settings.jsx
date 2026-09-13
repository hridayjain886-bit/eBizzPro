import { useEffect, useState } from 'react'
import { Save, LogOut } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { authApi } from '../api/auth'
import { extractError } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useNavigate } from 'react-router-dom'
import { gstinApi } from '../api/gstin'
import { applyGstinToProfile, normaliseGstin } from '../utils/gstinLookup'

const EMPTY_PROFILE = { gstin: '', businessName: '', tradeName: '', registrationType: '', state: '', stateCode: '', address: '' }

export default function Settings() {
  const { user, refreshMe, logout } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(EMPTY_PROFILE)
  const [loading, setLoading] = useState(false)
  const [lookupLoading, setLookupLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user?.businessProfile) {
      setProfile({ ...EMPTY_PROFILE, ...user.businessProfile })
    }
  }, [user])

  async function lookupGstin() {
    setError('')
    const gstin = normaliseGstin(profile.gstin || '')
    setProfile((p) => ({ ...p, gstin }))
    setLookupLoading(true)
    try {
      const { data } = await gstinApi.lookup(gstin)
      setProfile((p) => applyGstinToProfile(p, data))
      toast.success('Business details filled from GSTIN.')
    } catch (err) {
      setError(extractError(err, 'Could not fetch GSTIN details.'))
    } finally {
      setLookupLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authApi.updateProfile(profile)
      await refreshMe()
      toast.success('Business profile updated.')
    } catch (err) {
      setError(extractError(err, 'Could not update your business profile.'))
    } finally {
      setLoading(false)
    }
  }

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="animate-rise">
      <PageHeader title="Settings" subtitle="Manage your account and business details." />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6">
          <h2 className="mb-4 text-base font-extrabold">Account</h2>
          <div className="flex flex-col gap-3 text-sm">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted">Name</p>
              <p className="mt-0.5 font-semibold">{user?.name}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted">Email</p>
              <p className="mt-0.5 font-semibold">{user?.email}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted">Sign-in method</p>
              <p className="mt-0.5 font-semibold">{user?.authProvider === 'GOOGLE' ? 'Google' : 'Email & password'}</p>
            </div>
          </div>
          <Button variant="secondary" icon={LogOut} className="mt-6 w-full" onClick={handleLogout}>Log out</Button>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <h2 className="mb-4 text-base font-extrabold">Business profile</h2>
          <p className="mb-4 text-sm text-ink-soft">These details appear on your invoices.</p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="rounded-2xl hand-border bg-[var(--color-bad-bg)] px-4 py-2.5 text-sm font-semibold">{error}</div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Business name" value={profile.businessName || ''} onChange={(e) => setProfile((p) => ({ ...p, businessName: e.target.value }))} />
              <Input label="Trade name" value={profile.tradeName || ''} onChange={(e) => setProfile((p) => ({ ...p, tradeName: e.target.value }))} />
              <div className="flex items-end gap-2">
                <Input label="GSTIN" value={profile.gstin || ''} onChange={(e) => setProfile((p) => ({ ...p, gstin: e.target.value }))} />
                <Button type="button" variant="secondary" size="sm" loading={lookupLoading} onClick={lookupGstin}>Fetch</Button>
              </div>
              <Input label="Registration type" value={profile.registrationType || ''} onChange={(e) => setProfile((p) => ({ ...p, registrationType: e.target.value }))} placeholder="Regular / Composition" />
              <Input label="State" value={profile.state || ''} onChange={(e) => setProfile((p) => ({ ...p, state: e.target.value }))} />
              <Input label="State code" value={profile.stateCode || ''} onChange={(e) => setProfile((p) => ({ ...p, stateCode: e.target.value }))} />
            </div>
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-ink-soft">Address</span>
              <textarea rows={3} value={profile.address || ''} onChange={(e) => setProfile((p) => ({ ...p, address: e.target.value }))} className="w-full rounded-2xl hand-border bg-surface px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ink/20" />
            </label>
            <Button type="submit" icon={Save} loading={loading} className="self-start">Save changes</Button>
          </form>
        </Card>
      </div>
    </div>
  )
}
