import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, ArrowLeft, FileText } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import { invoicesApi } from '../api/invoices'
import { partiesApi } from '../api/parties'
import { stockApi } from '../api/stock'
import { transportersApi } from '../api/transporters'
import { extractError } from '../api/client'
import { useToast } from '../context/ToastContext'
import { computeInvoiceTotals } from '../utils/gst'
import { formatCurrency } from '../utils/format'

function emptyItem() {
  return { stockId: '', name: '', hsn: '', qty: 1, price: '', gstRate: 18, isInclusive: false }
}

function generateInvoiceNumber() {
  const now = new Date()
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
  const rand = Math.floor(1000 + Math.random() * 9000)
  return `INV-${stamp}-${rand}`
}

export default function CreateInvoice() {
  const navigate = useNavigate()
  const toast = useToast()
  const [parties, setParties] = useState([])
  const [stockItems, setStockItems] = useState([])
  const [transporters, setTransporters] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    invoiceNumber: generateInvoiceNumber(),
    type: 'B2B',
    customerName: '',
    customerGstin: '',
    customerPhone: '',
    customerAddress: '',
    transporterName: '',
    transporterGstin: '',
    transporterPhone: '',
    transporterAddress: '',
    vehicleNumber: '',
    isIgst: false,
    isInterState: false,
    notes: '',
    date: new Date().toISOString().slice(0, 10),
  })
  const [items, setItems] = useState([emptyItem()])
  const [showTransport, setShowTransport] = useState(false)

  useEffect(() => {
    partiesApi.list().then((res) => setParties(res.data)).catch(() => {})
    stockApi.list().then((res) => setStockItems(res.data)).catch(() => {})
    transportersApi.list().then((res) => setTransporters(res.data)).catch(() => {})
  }, [])

  const totals = useMemo(() => computeInvoiceTotals(items, form.isIgst), [items, form.isIgst])

  function updateItem(idx, patch) {
    setItems((list) => list.map((it, i) => (i === idx ? { ...it, ...patch } : it)))
  }

  function selectStockForItem(idx, stockId) {
    const stock = stockItems.find((s) => s.id === stockId)
    if (!stock) {
      updateItem(idx, { stockId: '' })
      return
    }
    const inclusive = typeof stock.isInclusive === 'boolean' ? stock.isInclusive : !!stock.inclusive
    updateItem(idx, {
      stockId,
      name: stock.name,
      hsn: stock.hsn || '',
      price: stock.price,
      gstRate: stock.gstRate ?? 18,
      isInclusive: inclusive,
    })
  }

  function selectParty(partyId) {
    const party = parties.find((p) => p.id === partyId)
    if (!party) return
    setForm((f) => ({
      ...f,
      type: party.type || f.type,
      customerName: party.name,
      customerGstin: party.gstin || '',
      customerPhone: party.phone || '',
      customerAddress: party.address || '',
    }))
  }

  function selectTransporter(transporterId) {
    const transporter = transporters.find((t) => t.id === transporterId)
    if (!transporter) return
    setForm((f) => ({
      ...f,
      transporterName: transporter.name || '',
      transporterGstin: transporter.gstin || '',
      transporterPhone: transporter.phone || '',
      transporterAddress: transporter.address || '',
      vehicleNumber: transporter.vehicleNumber || '',
    }))
  }

  function addItem() {
    setItems((list) => [...list, emptyItem()])
  }

  function removeItem(idx) {
    setItems((list) => (list.length > 1 ? list.filter((_, i) => i !== idx) : list))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.customerName.trim()) {
      setError('Customer name is required.')
      return
    }
    const validItems = items.filter((it) => it.name.trim() && Number(it.qty) > 0)
    if (validItems.length === 0) {
      setError('Add at least one item with a name and quantity.')
      return
    }
    setLoading(true)
    try {
      const payload = {
        ...form,
        items: validItems.map((it) => ({
          stockId: it.stockId || undefined,
          name: it.name.trim(),
          hsn: it.hsn || undefined,
          qty: Number(it.qty),
          price: Number(it.price || 0),
          gstRate: Number(it.gstRate || 0),
          isInclusive: !!it.isInclusive,
        })),
      }
      const res = await invoicesApi.create(payload)
      toast.success('Invoice created.')
      navigate(`/invoices/${res.data.id}`)
    } catch (err) {
      setError(extractError(err, 'Could not create this invoice.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-rise">
      <button onClick={() => navigate('/invoices')} className="mb-3 flex items-center gap-1.5 text-sm font-bold text-ink-soft hover:text-ink">
        <ArrowLeft size={15} /> Back to invoices
      </button>
      <PageHeader title="New Invoice" subtitle="Fill in the details and add line items to bill your customer." />

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          {error && (
            <div className="rounded-2xl hand-border bg-[var(--color-bad-bg)] px-4 py-2.5 text-sm font-semibold">{error}</div>
          )}

          <Card className="p-6">
            <h2 className="mb-4 text-base font-extrabold">Invoice details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Invoice number" required value={form.invoiceNumber} onChange={(e) => setForm((f) => ({ ...f, invoiceNumber: e.target.value }))} />
              <Input label="Date" type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
              <Select label="Type" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
                <option value="B2B">B2B</option>
                <option value="B2C">B2C</option>
              </Select>
              {parties.length > 0 && (
                <Select label="Fill from saved party" defaultValue="" onChange={(e) => selectParty(e.target.value)}>
                  <option value="">Select a party (optional)</option>
                  {parties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </Select>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="mb-4 text-base font-extrabold">Customer</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Customer name" required value={form.customerName} onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))} />
              <Input label="GSTIN" value={form.customerGstin} onChange={(e) => setForm((f) => ({ ...f, customerGstin: e.target.value }))} />
              <Input label="Phone" value={form.customerPhone} onChange={(e) => setForm((f) => ({ ...f, customerPhone: e.target.value }))} />
              <label className="flex items-center gap-2.5 self-end pb-2.5">
                <input type="checkbox" checked={form.isIgst} onChange={(e) => setForm((f) => ({ ...f, isIgst: e.target.checked, isInterState: e.target.checked }))} className="h-4 w-4 accent-black" />
                <span className="text-sm font-semibold">Inter-state (apply IGST)</span>
              </label>
            </div>
            <label className="mt-4 block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-ink-soft">Address</span>
              <textarea rows={2} value={form.customerAddress} onChange={(e) => setForm((f) => ({ ...f, customerAddress: e.target.value }))} className="w-full rounded-2xl hand-border bg-surface px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ink/20" />
            </label>
          </Card>

          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-extrabold">Transport details</h2>
              <button type="button" onClick={() => setShowTransport((s) => !s)} className="text-sm font-bold text-ink-soft hover:text-ink">
                {showTransport ? 'Hide' : 'Add transport info'}
              </button>
            </div>
            {showTransport && (
              <div className="space-y-4">
                {transporters.length > 0 && (
                  <Select label="Fill from saved transporter" defaultValue="" onChange={(e) => selectTransporter(e.target.value)}>
                    <option value="">Select a saved transporter</option>
                    {transporters.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}{t.vehicleNumber ? ` · ${t.vehicleNumber}` : ''}
                      </option>
                    ))}
                  </Select>
                )}
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="Transporter name" value={form.transporterName} onChange={(e) => setForm((f) => ({ ...f, transporterName: e.target.value }))} />
                  <Input label="Vehicle number" value={form.vehicleNumber} onChange={(e) => setForm((f) => ({ ...f, vehicleNumber: e.target.value }))} />
                  <Input label="Transporter GSTIN" value={form.transporterGstin} onChange={(e) => setForm((f) => ({ ...f, transporterGstin: e.target.value }))} />
                  <Input label="Transporter phone" value={form.transporterPhone} onChange={(e) => setForm((f) => ({ ...f, transporterPhone: e.target.value }))} />
                </div>
              </div>
            )}
          </Card>

          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-extrabold">Items</h2>
              <Button type="button" size="sm" variant="secondary" icon={Plus} onClick={addItem}>Add Item</Button>
            </div>
            <div className="flex flex-col gap-4">
              {items.map((item, idx) => (
                <div key={idx} className="rounded-2xl hand-border p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-bold text-muted">ITEM {idx + 1}</span>
                    {items.length > 1 && (
                      <button type="button" onClick={() => removeItem(idx)} className="rounded-full p-1.5 hover:bg-[var(--color-bad-bg)]" aria-label="Remove item">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  {stockItems.length > 0 && (
                    <Select label="From stock (optional)" className="mb-3" defaultValue="" onChange={(e) => selectStockForItem(idx, e.target.value)}>
                      <option value="">Custom item</option>
                      {stockItems.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </Select>
                  )}
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="sm:col-span-2 lg:col-span-2">
                      <Input label="Item name" required value={item.name} onChange={(e) => updateItem(idx, { name: e.target.value })} />
                    </div>
                    <Input label="HSN" value={item.hsn} onChange={(e) => updateItem(idx, { hsn: e.target.value })} />
                    <Input label="Qty" type="number" min="0" step="any" required value={item.qty} onChange={(e) => updateItem(idx, { qty: e.target.value })} />
                    <Input label="Price (₹)" type="number" min="0" step="any" required value={item.price} onChange={(e) => updateItem(idx, { price: e.target.value })} />
                    <Input label="GST rate (%)" type="number" min="0" step="any" value={item.gstRate} onChange={(e) => updateItem(idx, { gstRate: e.target.value })} />
                    <label className="flex items-center gap-2 self-end pb-2.5">
                      <input type="checkbox" checked={item.isInclusive} onChange={(e) => updateItem(idx, { isInclusive: e.target.checked })} className="h-4 w-4 accent-black" />
                      <span className="text-xs font-bold text-ink-soft">GST inclusive</span>
                    </label>
                    <div className="flex items-end justify-end pb-2.5 text-sm font-bold">
                      {formatCurrency(totals.lines[idx]?.lineTotal || 0)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="mb-3 text-base font-extrabold">Notes</h2>
            <textarea rows={2} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Payment terms, thank-you note, etc." className="w-full rounded-2xl hand-border bg-surface px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ink/20" />
          </Card>
        </div>

        <div>
          <Card className="sticky top-6 p-6">
            <h2 className="mb-4 text-base font-extrabold">Summary</h2>
            <div className="flex flex-col gap-2.5 text-sm">
              <Row label="Subtotal" value={formatCurrency(totals.subtotal)} />
              {form.isIgst ? (
                <Row label="IGST" value={formatCurrency(totals.igst)} />
              ) : (
                <>
                  <Row label="CGST" value={formatCurrency(totals.cgst)} />
                  <Row label="SGST" value={formatCurrency(totals.sgst)} />
                </>
              )}
              <Row label="Round off" value={formatCurrency(totals.roundOff)} />
              <div className="my-2 border-t-2 border-dashed border-hair" />
              <Row label="Total" value={formatCurrency(totals.total)} bold />
            </div>
            <Button type="submit" size="lg" icon={FileText} loading={loading} className="mt-6 w-full">
              Create Invoice
            </Button>
          </Card>
        </div>
      </form>
    </div>
  )
}

function Row({ label, value, bold }) {
  return (
    <div className="flex items-center justify-between">
      <span className={bold ? 'text-base font-extrabold' : 'text-ink-soft'}>{label}</span>
      <span className={bold ? 'text-lg font-extrabold' : 'font-semibold'}>{value}</span>
    </div>
  )
}
