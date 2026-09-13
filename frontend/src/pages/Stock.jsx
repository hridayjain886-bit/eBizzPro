import { useMemo, useState } from 'react'
import { Plus, Search, Boxes, Pencil, Trash2, AlertTriangle } from 'lucide-react'
import { useResource } from '../hooks/useResource'
import { stockApi } from '../api/stock'
import PageHeader from '../components/ui/PageHeader'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import StockFormModal from '../components/forms/StockFormModal'
import { useToast } from '../context/ToastContext'
import { extractError } from '../api/client'
import { formatCurrency } from '../utils/format'

export default function Stock() {
  const { data: stock, loading, reload } = useResource(() => stockApi.list())
  const [query, setQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const toast = useToast()

  const filtered = useMemo(() => {
    return (stock || []).filter((s) =>
      !query || s.name?.toLowerCase().includes(query.toLowerCase()) || s.sku?.toLowerCase().includes(query.toLowerCase())
    )
  }, [stock, query])

  async function handleDelete() {
    if (!deleting) return
    setDeleteLoading(true)
    try {
      await stockApi.remove(deleting.id)
      toast.success('Item removed.')
      setDeleting(null)
      reload()
    } catch (err) {
      toast.error(extractError(err, 'Could not remove this item.'))
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="animate-rise">
      <PageHeader
        title="Stock"
        subtitle="Track quantities, pricing and GST for every item you sell."
        action={<Button icon={Plus} onClick={() => { setEditing(null); setModalOpen(true) }}>Add Item</Button>}
      />

      <div className="relative mb-5 max-w-md">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or SKU"
          className="w-full rounded-full hand-border bg-surface py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-ink/20"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><Spinner size={32} /></div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Boxes}
          title={stock?.length ? 'No matching items' : 'No stock items yet'}
          description={stock?.length ? 'Try a different search.' : 'Add items to track inventory and use them in invoices.'}
          action={!stock?.length && <Button icon={Plus} onClick={() => setModalOpen(true)}>Add Item</Button>}
        />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b-2 border-ink text-left text-xs font-bold uppercase tracking-wide text-muted">
                <th className="px-5 py-3.5">Item</th>
                <th className="px-5 py-3.5">Qty</th>
                <th className="px-5 py-3.5">Price</th>
                <th className="px-5 py-3.5">GST</th>
                <th className="px-5 py-3.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-hair">
              {filtered.map((s) => {
                const low = Number(s.quantity) <= Number(s.lowStockThreshold ?? 5)
                return (
                  <tr key={s.id} className="hover:bg-tint/40">
                    <td className="px-5 py-4">
                      <p className="font-bold">{s.name}</p>
                      <p className="text-xs text-muted">{s.sku || '—'} {s.hsn ? `· HSN ${s.hsn}` : ''}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-bold">{s.quantity}</span>
                      {low && (
                        <span className="ml-2 inline-flex items-center gap-1 text-xs font-bold text-[#8a5a10]">
                          <AlertTriangle size={12} /> Low
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 font-semibold">{formatCurrency(s.price)}</td>
                    <td className="px-5 py-4">
                      <Badge tone="neutral">{s.gstRate ?? 0}% {s.isInclusive ? '· incl.' : ''}</Badge>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1.5">
                        <button onClick={() => { setEditing(s); setModalOpen(true) }} className="rounded-full p-2 hand-border hover:bg-tint" aria-label="Edit">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => setDeleting(s)} className="rounded-full p-2 hand-border hover:bg-[var(--color-bad-bg)]" aria-label="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Card>
      )}

      <StockFormModal open={modalOpen} onClose={() => setModalOpen(false)} item={editing} onSaved={reload} />
      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Remove item?"
        description={`This will remove ${deleting?.name} from your stock.`}
      />
    </div>
  )
}
