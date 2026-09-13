import { useEffect, useState } from 'react'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Button from '../ui/Button'
import { stockApi } from '../../api/stock'
import { extractError } from '../../api/client'
import { useToast } from '../../context/ToastContext'

const EMPTY = { name: '', sku: '', hsn: '', quantity: '', price: '', gstRate: '18', gstType: 'CGST_SGST', isInclusive: false, lowStockThreshold: '5' }

export default function StockFormModal({ open, onClose, item, onSaved }) {
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const toast = useToast()

  useEffect(() => {
    if (open) {
      setForm(item ? { ...EMPTY, ...item } : EMPTY)
      setError('')
    }
  }, [open, item])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload = {
        ...form,
        quantity: Number(form.quantity || 0),
        price: Number(form.price || 0),
        gstRate: Number(form.gstRate || 0),
        lowStockThreshold: Number(form.lowStockThreshold || 0),
      }
      if (item?.id) {
        await stockApi.update(item.id, payload)
        toast.success('Stock item updated.')
      } else {
        await stockApi.create(payload)
        toast.success('Stock item added.')
      }
      onSaved?.()
      onClose()
    } catch (err) {
      setError(extractError(err, 'Could not save this item.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={item?.id ? 'Edit Stock Item' : 'Add Stock Item'} size="lg">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="rounded-2xl hand-border bg-[var(--color-bad-bg)] px-4 py-2.5 text-sm font-semibold">{error}</div>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Item name" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <Input label="SKU" value={form.sku || ''} onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))} />
          <Input label="HSN code" value={form.hsn || ''} onChange={(e) => setForm((f) => ({ ...f, hsn: e.target.value }))} />
          <Input label="Quantity" type="number" min="0" step="any" value={form.quantity} onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))} />
          <Input label="Price (₹)" type="number" min="0" step="any" required value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} />
          <Input label="GST rate (%)" type="number" min="0" step="any" value={form.gstRate} onChange={(e) => setForm((f) => ({ ...f, gstRate: e.target.value }))} />
          <Select label="GST type" value={form.gstType || 'CGST_SGST'} onChange={(e) => setForm((f) => ({ ...f, gstType: e.target.value }))}>
            <option value="CGST_SGST">CGST + SGST</option>
            <option value="IGST">IGST</option>
          </Select>
          <Input label="Low stock threshold" type="number" min="0" step="any" value={form.lowStockThreshold} onChange={(e) => setForm((f) => ({ ...f, lowStockThreshold: e.target.value }))} />
        </div>
        <label className="flex items-center gap-2.5">
          <input
            type="checkbox"
            checked={!!form.isInclusive}
            onChange={(e) => setForm((f) => ({ ...f, isInclusive: e.target.checked }))}
            className="h-4 w-4 accent-black"
          />
          <span className="text-sm font-semibold">Price is GST-inclusive</span>
        </label>
        <div className="mt-2 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading}>{item?.id ? 'Save changes' : 'Add item'}</Button>
        </div>
      </form>
    </Modal>
  )
}
