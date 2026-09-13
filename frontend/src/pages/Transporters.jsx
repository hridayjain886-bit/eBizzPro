import { useMemo, useState } from 'react'
import { Plus, Search, Truck, Pencil, Trash2 } from 'lucide-react'
import { useResource } from '../hooks/useResource'
import { transportersApi } from '../api/transporters'
import PageHeader from '../components/ui/PageHeader'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import TransporterFormModal from '../components/forms/TransporterFormModal'
import { useToast } from '../context/ToastContext'
import { extractError } from '../api/client'
import { statusTone } from '../utils/format'

export default function Transporters() {
  const { data: transporters, loading, reload } = useResource(() => transportersApi.list())
  const [query, setQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const toast = useToast()

  const filtered = useMemo(() => {
    return (transporters || []).filter((t) =>
      !query || t.name?.toLowerCase().includes(query.toLowerCase()) || t.vehicleNumber?.toLowerCase().includes(query.toLowerCase())
    )
  }, [transporters, query])

  async function handleDelete() {
    if (!deleting) return
    setDeleteLoading(true)
    try {
      await transportersApi.remove(deleting.id)
      toast.success('Transporter removed.')
      setDeleting(null)
      reload()
    } catch (err) {
      toast.error(extractError(err, 'Could not remove this transporter.'))
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="animate-rise">
      <PageHeader
        title="Transporters"
        subtitle="Vehicles and logistics partners used for shipments."
        action={<Button icon={Plus} onClick={() => { setEditing(null); setModalOpen(true) }}>Add Transporter</Button>}
      />

      <div className="relative mb-5 max-w-md">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or vehicle number"
          className="w-full rounded-full hand-border bg-surface py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-ink/20"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><Spinner size={32} /></div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Truck}
          title={transporters?.length ? 'No matching transporters' : 'No transporters yet'}
          description={transporters?.length ? 'Try a different search.' : 'Add transporters to attach to shipment invoices.'}
          action={!transporters?.length && <Button icon={Plus} onClick={() => setModalOpen(true)}>Add Transporter</Button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t) => (
            <Card key={t.id} className="p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-base font-extrabold">{t.name}</p>
                  <p className="text-xs font-bold text-muted">{t.vehicleNumber || 'No vehicle number'}</p>
                </div>
                <Badge tone={statusTone(t.status)}>{t.status}</Badge>
              </div>
              <div className="mt-3 flex flex-col gap-1.5 text-sm text-ink-soft">
                {t.phone && <span>{t.phone}</span>}
                {t.gstin && <span className="text-xs text-muted">{t.gstin}</span>}
              </div>
              <div className="mt-4 flex justify-end gap-1.5">
                <button onClick={() => { setEditing(t); setModalOpen(true) }} className="rounded-full p-2 hand-border hover:bg-tint" aria-label="Edit">
                  <Pencil size={14} />
                </button>
                <button onClick={() => setDeleting(t)} className="rounded-full p-2 hand-border hover:bg-[var(--color-bad-bg)]" aria-label="Delete">
                  <Trash2 size={14} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <TransporterFormModal open={modalOpen} onClose={() => setModalOpen(false)} transporter={editing} onSaved={reload} />
      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Remove transporter?"
        description={`This will remove ${deleting?.name} from your transporters.`}
      />
    </div>
  )
}
