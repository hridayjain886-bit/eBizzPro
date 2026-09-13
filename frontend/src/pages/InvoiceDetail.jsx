import { useParams, useNavigate, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ArrowLeft, Printer, Trash2, CheckCircle2, XCircle } from 'lucide-react'
import { invoicesApi } from '../api/invoices'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Spinner from '../components/ui/Spinner'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import BrandMark from '../components/ui/BrandMark'
import { useToast } from '../context/ToastContext'
import { extractError } from '../api/client'
import { formatCurrency, formatDate, statusTone } from '../utils/format'
import { useAuth } from '../context/AuthContext'

export default function InvoiceDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { user } = useAuth()
  const [invoice, setInvoice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [statusLoading, setStatusLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [restoreStock, setRestoreStock] = useState(true)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function load() {
    setLoading(true)
    try {
      const res = await invoicesApi.get(id)
      setInvoice(res.data)
    } catch (err) {
      toast.error(extractError(err, 'Could not load this invoice.'))
      navigate('/invoices')
    } finally {
      setLoading(false)
    }
  }

  async function setStatus(status) {
    setStatusLoading(true)
    try {
      const res = await invoicesApi.updateStatus(id, { status })
      setInvoice(res.data)
      toast.success(`Invoice marked as ${status.toLowerCase()}.`)
    } catch (err) {
      toast.error(extractError(err, 'Could not update status.'))
    } finally {
      setStatusLoading(false)
    }
  }

  async function handleDelete() {
    setDeleteLoading(true)
    try {
      await invoicesApi.remove(id, restoreStock)
      toast.success(restoreStock ? 'Invoice deleted and stock restored.' : 'Invoice deleted.')
      navigate('/invoices')
    } catch (err) {
      toast.error(extractError(err, 'Could not delete this invoice.'))
    } finally {
      setDeleteLoading(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center py-24"><Spinner size={32} /></div>
  }
  if (!invoice) return null

  return (
    <div className="animate-rise">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <button onClick={() => navigate('/invoices')} className="flex items-center gap-1.5 text-sm font-bold text-ink-soft hover:text-ink">
          <ArrowLeft size={15} /> Back to invoices
        </button>
        <div className="flex flex-wrap gap-2">
          {invoice.status === 'PENDING' && (
            <Button size="sm" variant="success" icon={CheckCircle2} loading={statusLoading} onClick={() => setStatus('PAID')}>Mark Paid</Button>
          )}
          {invoice.status !== 'CANCELLED' && (
            <Button size="sm" variant="danger" icon={XCircle} loading={statusLoading} onClick={() => setStatus('CANCELLED')}>Cancel</Button>
          )}
          <Button size="sm" variant="secondary" icon={Printer} onClick={() => window.print()}>Print</Button>
          <Button size="sm" variant="danger" icon={Trash2} onClick={() => setDeleting(true)}>Delete</Button>
        </div>
      </div>

      <Card className="invoice-print p-6 sm:p-10 print:border-0 print:shadow-none" id="invoice-print">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-ink pb-6">
          <div>
            <BrandMark />
            <h1 className="mt-3 text-xl font-extrabold">{user?.businessProfile?.businessName || user?.name}</h1>
            {user?.businessProfile?.gstin && <p className="text-xs text-ink-soft">GSTIN: {user.businessProfile.gstin}</p>}
            {user?.businessProfile?.address && <p className="text-xs text-ink-soft">{user.businessProfile.address}</p>}
          </div>
          <div className="text-right">
            <p className="text-xs font-bold uppercase tracking-wide text-muted">Invoice</p>
            <p className="text-2xl font-extrabold">{invoice.invoiceNumber}</p>
            <p className="mt-1 text-sm text-ink-soft">{formatDate(invoice.date)}</p>
            <Badge tone={statusTone(invoice.status)} className="mt-2">{invoice.status}</Badge>
          </div>
        </div>

        <div className="grid gap-6 border-b-2 border-ink py-6 sm:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-muted">Billed to</p>
            <p className="mt-1 text-base font-extrabold">{invoice.customerName}</p>
            {invoice.customerGstin && <p className="text-sm text-ink-soft">GSTIN: {invoice.customerGstin}</p>}
            {invoice.customerPhone && <p className="text-sm text-ink-soft">{invoice.customerPhone}</p>}
            {invoice.customerAddress && <p className="text-sm text-ink-soft">{invoice.customerAddress}</p>}
          </div>
          {invoice.transporterName && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted">Transport</p>
              <p className="mt-1 text-base font-extrabold">{invoice.transporterName}</p>
              {invoice.vehicleNumber && <p className="text-sm text-ink-soft">Vehicle: {invoice.vehicleNumber}</p>}
              {invoice.transporterPhone && <p className="text-sm text-ink-soft">{invoice.transporterPhone}</p>}
            </div>
          )}
        </div>

        <div className="overflow-x-auto py-6">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b-2 border-ink text-left text-xs font-bold uppercase tracking-wide text-muted">
                <th className="py-2.5 pr-3">Item</th>
                <th className="py-2.5 pr-3">HSN</th>
                <th className="py-2.5 pr-3 text-right">Qty</th>
                <th className="py-2.5 pr-3 text-right">Price</th>
                <th className="py-2.5 pr-3 text-right">GST%</th>
                <th className="py-2.5 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hair">
              {invoice.items?.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-2.5 pr-3 font-semibold">{item.name}</td>
                  <td className="py-2.5 pr-3 text-ink-soft">{item.hsn || '—'}</td>
                  <td className="py-2.5 pr-3 text-right">{item.qty}</td>
                  <td className="py-2.5 pr-3 text-right">{formatCurrency(item.price)}</td>
                  <td className="py-2.5 pr-3 text-right">{item.gstRate}%</td>
                  <td className="py-2.5 text-right font-bold">{formatCurrency(Number(item.qty) * Number(item.price))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end border-t-2 border-ink pt-6">
          <div className="w-full max-w-xs flex flex-col gap-2 text-sm">
            <SummaryRow label="Subtotal" value={formatCurrency(invoice.subtotal)} />
            {invoice.isIgst ? (
              <SummaryRow label="IGST" value={formatCurrency(invoice.igst)} />
            ) : (
              <>
                <SummaryRow label="CGST" value={formatCurrency(invoice.cgst)} />
                <SummaryRow label="SGST" value={formatCurrency(invoice.sgst)} />
              </>
            )}
            <SummaryRow label="Round off" value={formatCurrency(invoice.roundOffAmount)} />
            <div className="border-t-2 border-dashed border-hair my-1" />
            <SummaryRow label="Total" value={formatCurrency(invoice.total)} bold />
          </div>
        </div>

        {invoice.notes && (
          <div className="mt-4 border-t-2 border-ink pt-4">
            <p className="text-xs font-bold uppercase tracking-wide text-muted">Notes</p>
            <p className="mt-1 text-sm text-ink-soft">{invoice.notes}</p>
          </div>
        )}
      </Card>

      <ConfirmDialog
        open={deleting}
        onClose={() => {
          setDeleting(false)
          setRestoreStock(true)
        }}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Delete invoice?"
        description={`This will permanently delete invoice ${invoice.invoiceNumber}.`}
      >
        <label className="mt-4 flex items-center gap-2 rounded-2xl hand-border bg-tint px-3 py-2 text-sm font-semibold">
          <input
            type="checkbox"
            checked={restoreStock}
            onChange={(e) => setRestoreStock(e.target.checked)}
            className="h-4 w-4 accent-black"
          />
          Restore stock quantities for this invoice
        </label>
      </ConfirmDialog>
    </div>
  )
}

function SummaryRow({ label, value, bold }) {
  return (
    <div className="flex items-center justify-between">
      <span className={bold ? 'text-base font-extrabold' : 'text-ink-soft'}>{label}</span>
      <span className={bold ? 'text-lg font-extrabold' : 'font-semibold'}>{value}</span>
    </div>
  )
}
