import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Plus, TrendingUp, FileText, Boxes, AlertTriangle, ArrowRight, Users } from 'lucide-react'
import { useResource } from '../hooks/useResource'
import { invoicesApi } from '../api/invoices'
import { stockApi } from '../api/stock'
import { partiesApi } from '../api/parties'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import { useAuth } from '../context/AuthContext'
import { formatCurrency, formatDate, statusTone } from '../utils/format'

export default function Dashboard() {
  const { user } = useAuth()
  const { data: invoices, loading: loadingInvoices } = useResource(() => invoicesApi.list())
  const { data: stock, loading: loadingStock } = useResource(() => stockApi.list())
  const { data: parties, loading: loadingParties } = useResource(() => partiesApi.list())

  const stats = useMemo(() => {
    const list = invoices || []
    const today = new Date().toDateString()
    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)

    const paid = list.filter((i) => i.status === 'PAID')
    const pending = list.filter((i) => i.status === 'PENDING')
    const monthlyRevenue = paid
      .filter((i) => new Date(i.date || i.createdAt) >= monthStart)
      .reduce((sum, i) => sum + Number(i.total || 0), 0)
    const todayRevenue = paid
      .filter((i) => new Date(i.date || i.createdAt).toDateString() === today)
      .reduce((sum, i) => sum + Number(i.total || 0), 0)
    const todayBills = list.filter((i) => new Date(i.createdAt || i.date).toDateString() === today).length
    const outstandingAmount = pending.reduce((sum, i) => sum + Number(i.total || 0), 0)

    return { monthlyRevenue, todayRevenue, todayBills, pendingCount: pending.length, outstandingAmount, totalInvoices: list.length }
  }, [invoices])

  const lowStock = useMemo(() => {
    return (stock || []).filter((s) => Number(s.quantity) <= Number(s.lowStockThreshold ?? 5))
  }, [stock])

  const recentInvoices = (invoices || [])
    .slice()
    .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
    .slice(0, 5)

  const loading = loadingInvoices || loadingStock || loadingParties

  return (
    <div className="animate-rise">
      <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-muted">Overview</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight">
            Hi, {user?.name?.split(' ')[0] || 'there'}
          </h1>
          <p className="mt-1 text-sm text-ink-soft">Here's how your business is doing.</p>
        </div>
        <Link to="/invoices/new">
          <Button icon={Plus} size="lg">New Invoice</Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><Spinner size={32} /></div>
      ) : (
        <>
          <Card className="mb-6 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-ink-soft">
                <TrendingUp size={17} strokeWidth={2.25} />
                <span className="text-sm font-bold">Monthly Revenue</span>
              </div>
              <Badge tone="paid">This month</Badge>
            </div>
            <p className="mt-3 text-4xl font-extrabold tracking-tight">{formatCurrency(stats.monthlyRevenue)}</p>
            <p className="mt-1 text-sm text-ink-soft">from {(invoices || []).filter(i => i.status === 'PAID').length} paid invoices, all time</p>
          </Card>

          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard icon={FileText} label="Today's Bills" value={stats.todayBills} />
            <StatCard icon={TrendingUp} label="Today's Revenue" value={formatCurrency(stats.todayRevenue)} />
            <StatCard icon={FileText} label="Pending Invoices" value={stats.pendingCount} sub={formatCurrency(stats.outstandingAmount)} />
            <StatCard icon={Users} label="Parties" value={(parties || []).length} />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="p-6 lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-extrabold">Recent Activity</h2>
                <Link to="/invoices" className="flex items-center gap-1 text-sm font-bold text-ink-soft hover:text-ink">
                  View all <ArrowRight size={14} />
                </Link>
              </div>
              {recentInvoices.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title="No invoices yet"
                  description="Create your first invoice to see it appear here."
                  action={<Link to="/invoices/new"><Button icon={Plus} size="sm">New Invoice</Button></Link>}
                />
              ) : (
                <div className="flex flex-col divide-y-2 divide-hair">
                  {recentInvoices.map((inv) => (
                    <Link
                      key={inv.id}
                      to={`/invoices/${inv.id}`}
                      className="flex items-center justify-between gap-3 py-3.5 first:pt-0 last:pb-0 hover:opacity-70"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl hand-border bg-tint text-xs font-extrabold">
                          {inv.invoiceNumber?.slice(-3) || '#'}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold">{inv.customerName}</p>
                          <p className="truncate text-xs text-ink-soft">{formatDate(inv.date)} · {inv.invoiceNumber}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-extrabold">{formatCurrency(inv.total)}</p>
                        <Badge tone={statusTone(inv.status)} className="mt-1">{inv.status}</Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </Card>

            <Card className="p-6">
              <div className="mb-4 flex items-center gap-2">
                <Boxes size={17} strokeWidth={2.25} />
                <h2 className="text-base font-extrabold">Stock Alerts</h2>
              </div>
              {lowStock.length === 0 ? (
                <p className="text-sm text-ink-soft">All stock levels look healthy.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 rounded-2xl hand-border bg-[var(--color-warn-bg)] px-3.5 py-2.5">
                    <AlertTriangle size={16} strokeWidth={2.25} />
                    <p className="text-sm font-bold">{lowStock.length} item{lowStock.length !== 1 ? 's' : ''} running low</p>
                  </div>
                  <div className="flex flex-col divide-y-2 divide-hair">
                    {lowStock.slice(0, 4).map((s) => (
                      <div key={s.id} className="flex items-center justify-between py-2.5 first:pt-0">
                        <p className="text-sm font-semibold truncate">{s.name}</p>
                        <p className="text-xs font-bold text-ink-soft shrink-0 ml-2">{s.quantity} left</p>
                      </div>
                    ))}
                  </div>
                  <Link to="/stock">
                    <Button variant="secondary" size="sm" className="w-full mt-1">Manage Inventory</Button>
                  </Link>
                </div>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <Card className="p-4">
      <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full hand-border bg-tint">
        <Icon size={15} strokeWidth={2.25} />
      </div>
      <p className="text-xs font-bold text-ink-soft">{label}</p>
      <p className="mt-0.5 text-xl font-extrabold tracking-tight truncate">{value}</p>
      {sub && <p className="text-xs text-muted">{sub}</p>}
    </Card>
  )
}
