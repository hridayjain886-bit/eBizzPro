import { useEffect, useState } from 'react'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Button from '../ui/Button'
import { partiesApi } from '../../api/parties'
import { extractError } from '../../api/client'
import { useToast } from '../../context/ToastContext'
import { gstinApi } from '../../api/gstin'
import { applyGstinToContact, normaliseGstin } from '../../utils/gstinLookup'

const EMPTY = { name: '', gstin: '', phone: '', email: '', address: '', stateCode: '', type: 'B2B', status: 'ACTIVE' }

export default function PartyFormModal({ open, onClose, party, onSaved }) {
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const [lookupLoading, setLookupLoading] = useState(false)
  const [error, setError] = useState('')
  const toast = useToast()

  useEffect(() => {
    if (open) {
      setForm(party ? { ...EMPTY, ...party } : EMPTY)
      setError('')
    }
  }, [open, party])

  async function lookupGstin() {
    setError('')
    const gstin = normaliseGstin(form.gstin || '')
    setForm((f) => ({ ...f, gstin }))
    setLookupLoading(true)
    try {
      const { data } = await gstinApi.lookup(gstin)
      setForm((f) => applyGstinToContact(f, data))
      toast.success('Party details filled from GSTIN.')
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
      if (party?.id) {
        await partiesApi.update(party.id, form)
        toast.success('Party updated.')
      } else {
        await partiesApi.create(form)
        toast.success('Party added.')
      }
      onSaved?.()
      onClose()
    } catch (err) {
      setError(extractError(err, 'Could not save this party.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={party?.id ? 'Edit Party' : 'Add Party'} size="lg">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="rounded-2xl hand-border bg-[var(--color-bad-bg)] px-4 py-2.5 text-sm font-semibold">{error}</div>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Name" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <Select label="Type" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
            <option value="B2B">B2B</option>
            <option value="B2C">B2C</option>
          </Select>
          <div className="flex items-end gap-2">
            <Input label="GSTIN" value={form.gstin || ''} onChange={(e) => setForm((f) => ({ ...f, gstin: e.target.value }))} />
            <Button type="button" variant="secondary" size="sm" loading={lookupLoading} onClick={lookupGstin}>Fetch</Button>
          </div>
          <Input label="State code" value={form.stateCode || ''} onChange={(e) => setForm((f) => ({ ...f, stateCode: e.target.value }))} />
          <Input label="Phone" value={form.phone || ''} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
          <Input label="Email" type="email" value={form.email || ''} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          <Select label="Status" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="DRAFT">Draft</option>
          </Select>
        </div>
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-ink-soft">Address</span>
          <textarea
            rows={3}
            value={form.address || ''}
            onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
            className="w-full rounded-2xl hand-border bg-surface px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ink/20"
          />
        </label>
        <div className="mt-2 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading}>{party?.id ? 'Save changes' : 'Add party'}</Button>
        </div>
      </form>
    </Modal>
  )
}
