import { useMemo, useState } from 'react'
import { Plus, Search, Users, Pencil, Trash2, Phone, MapPin } from 'lucide-react'
import { useResource } from '../hooks/useResource'
import { partiesApi } from '../api/parties'
import PageHeader from '../components/ui/PageHeader'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import PartyFormModal from '../components/forms/PartyFormModal'
import { useToast } from '../context/ToastContext'
import { extractError } from '../api/client'
import { statusTone } from '../utils/format'

export default function Parties() {
  const { data: parties, loading, reload } = useResource(() => partiesApi.list())
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const toast = useToast()

  const filtered = useMemo(() => {
    return (parties || []).filter((p) => {
      const matchesQuery = !query || p.name?.toLowerCase().includes(query.toLowerCase()) || p.gstin?.toLowerCase().includes(query.toLowerCase())
      const matchesType = typeFilter === 'ALL' || p.type === typeFilter
      return matchesQuery && matchesType
    })
  }, [parties, query, typeFilter])

  async function handleDelete() {
    if (!deleting) return
    setDeleteLoading(true)
    try {
      await partiesApi.remove(deleting.id)
      toast.success('Party removed.')
      setDeleting(null)
      reload()
    } catch (err) {
      toast.error(extractError(err, 'Could not remove this party.'))
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="animate-rise">
      <PageHeader
        title="Parties"
        subtitle="Customers and suppliers you bill and buy from."
        action={<Button icon={Plus} onClick={() => { setEditing(null); setModalOpen(true) }}>Add Party</Button>}
      />

      <div className="mb-5 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or GSTIN"
            className="w-full rounded-full hand-border bg-surface py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-ink/20"
          />
        </div>
        <div className="flex gap-2">
          {['ALL', 'B2B', 'B2C'].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`rounded-full hand-border px-4 py-2 text-xs font-bold ${typeFilter === t ? 'bg-ink text-paper' : 'bg-surface hover:bg-tint'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><Spinner size={32} /></div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title={parties?.length ? 'No matching parties' : 'No parties yet'}
          description={parties?.length ? 'Try a different search or filter.' : 'Add your first customer or supplier to start billing.'}
          action={!parties?.length && <Button icon={Plus} onClick={() => setModalOpen(true)}>Add Party</Button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <Card key={p.id} className="p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-base font-extrabold">{p.name}</p>
                  <p className="text-xs font-bold text-muted">{p.gstin || 'No GSTIN'}</p>
                </div>
                <Badge tone={p.type === 'B2B' ? 'neutral' : 'pending'}>{p.type}</Badge>
              </div>
              <div className="mt-3 flex flex-col gap-1.5 text-sm text-ink-soft">
                {p.phone && <span className="flex items-center gap-1.5"><Phone size={13} /> {p.phone}</span>}
                {p.address && <span className="flex items-center gap-1.5 truncate"><MapPin size={13} className="shrink-0" /> {p.address}</span>}
              </div>
              <div className="mt-4 flex items-center justify-between">
                <Badge tone={statusTone(p.status)}>{p.status}</Badge>
                <div className="flex gap-1.5">
                  <button onClick={() => { setEditing(p); setModalOpen(true) }} className="rounded-full p-2 hand-border hover:bg-tint" aria-label="Edit">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => setDeleting(p)} className="rounded-full p-2 hand-border hover:bg-[var(--color-bad-bg)]" aria-label="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <PartyFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        party={editing}
        onSaved={reload}
      />
      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Remove party?"
        description={`This will remove ${deleting?.name} from your parties list.`}
      />
    </div>
  )
}
