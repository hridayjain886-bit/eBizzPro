import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, FileText, Trash2, Eye } from 'lucide-react'
import { useResource } from '../hooks/useResource'
import { invoicesApi } from '../api/invoices'
import PageHeader from '../components/ui/PageHeader'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { useToast } from '../context/ToastContext'
import { extractError } from '../api/client'
import { formatCurrency, formatDate, statusTone } from '../utils/format'

const STATUS_FILTERS = ['ALL', 'PENDING', 'PAID', 'CANCELLED']

export default function Invoices() {
  const { data: invoices, loading, reload } = useResource(() => invoicesApi.list())
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('ALL')
  const [deleting, setDeleting] = useState(null)
  const [restoreStock, setRestoreStock] = useState(true)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const toast = useToast()

  const filtered = useMemo(() => {
    return (invoices || [])
      .filter((i) => status === 'ALL' || i.status === status)
      .filter((i) => !query || i.customerName?.toLowerCase().includes(query.toLowerCase()) || i.invoiceNumber?.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
  }, [invoices, query, status])

  async function handleDelete() {
    if (!deleting) return
    setDeleteLoading(true)
    try {
      await invoicesApi.remove(deleting.id, restoreStock)
      toast.success(restoreStock ? 'Invoice deleted and stock restored.' : 'Invoice deleted.')
      setDeleting(null)
      setRestoreStock(true)
      reload()
    } catch (err) {
      toast.error(extractError(err, 'Could not delete this invoice.'))
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="animate-rise">
      <PageHeader
        title="Invoices"
        subtitle="Create, track and manage your GST invoices."
        action={<Link to="/invoices/new"><Button icon={Plus}>New Invoice</Button></Link>}
      />

      <div className="mb-5 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by customer or invoice number"
            className="w-full rounded-full hand-border bg-surface py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-ink/20"
          />
        </div>
        <div className="flex gap-2">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`rounded-full hand-border px-4 py-2 text-xs font-bold ${status === s ? 'bg-ink text-paper' : 'bg-surface hover:bg-tint'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><Spinner size={32} /></div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={invoices?.length ? 'No matching invoices' : 'No invoices yet'}
          description={invoices?.length ? 'Try a different search or filter.' : 'Create your first invoice to start billing customers.'}
          action={!invoices?.length && <Link to="/invoices/new"><Button icon={Plus}>New Invoice</Button></Link>}
        />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b-2 border-ink text-left text-xs font-bold uppercase tracking-wide text-muted">
                <th className="px-5 py-3.5">Invoice</th>
                <th className="px-5 py-3.5">Customer</th>
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5">Amount</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-hair">
              {filtered.map((inv) => (
                <tr key={inv.id} className="hover:bg-tint/40">
                  <td className="px-5 py-4 font-bold">{inv.invoiceNumber}</td>
                  <td className="px-5 py-4">
                    <p className="font-semibold">{inv.customerName}</p>
                    <p className="text-xs text-muted">{inv.type}</p>
                  </td>
                  <td className="px-5 py-4 text-ink-soft">{formatDate(inv.date)}</td>
                  <td className="px-5 py-4 font-bold">{formatCurrency(inv.total)}</td>
                  <td className="px-5 py-4"><Badge tone={statusTone(inv.status)}>{inv.status}</Badge></td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-1.5">
                      <Link to={`/invoices/${inv.id}`} className="rounded-full p-2 hand-border hover:bg-tint" aria-label="View">
                        <Eye size={14} />
                      </Link>
                      <button onClick={() => setDeleting(inv)} className="rounded-full p-2 hand-border hover:bg-[var(--color-bad-bg)]" aria-label="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Delete invoice?"
        description={`This will permanently delete invoice ${deleting?.invoiceNumber}.`}
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
