import { useMemo } from 'react'
import { BarChart3, TrendingUp, Users, Boxes } from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useResource } from '../hooks/useResource'
import { invoicesApi } from '../api/invoices'
import { stockApi } from '../api/stock'
import { partiesApi } from '../api/parties'
import PageHeader from '../components/ui/PageHeader'
import Card from '../components/ui/Card'
import Spinner from '../components/ui/Spinner'
import { formatCurrency } from '../utils/format'

const INK = '#16160F'
const PIE_COLORS = ['#16160F', '#8F8C80', '#DEDACD']

export default function Reports() {
  const { data: invoices, loading: l1 } = useResource(() => invoicesApi.list())
  const { data: stock, loading: l2 } = useResource(() => stockApi.list())
  const { data: parties, loading: l3 } = useResource(() => partiesApi.list())
  const loading = l1 || l2 || l3

  const revenueByMonth = useMemo(() => {
    const map = {}
    ;(invoices || []).forEach((inv) => {
      if (inv.status === 'CANCELLED') return
      const d = new Date(inv.date || inv.createdAt)
      const key = d.toLocaleDateString('en-IN', { month: 'short' })
      map[key] = (map[key] || 0) + Number(inv.total || 0)
    })
    return Object.entries(map).map(([month, revenue]) => ({ month, revenue }))
  }, [invoices])

  const statusBreakdown = useMemo(() => {
    const counts = { PENDING: 0, PAID: 0, CANCELLED: 0 }
    ;(invoices || []).forEach((inv) => { counts[inv.status] = (counts[inv.status] || 0) + 1 })
    return [
      { name: 'Paid', value: counts.PAID },
      { name: 'Pending', value: counts.PENDING },
      { name: 'Cancelled', value: counts.CANCELLED },
    ].filter((s) => s.value > 0)
  }, [invoices])

  const topCustomers = useMemo(() => {
    const map = {}
    ;(invoices || []).forEach((inv) => {
      if (inv.status === 'CANCELLED') return
      map[inv.customerName] = (map[inv.customerName] || 0) + Number(inv.total || 0)
    })
    return Object.entries(map)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
  }, [invoices])

  const totalRevenue = (invoices || []).filter((i) => i.status !== 'CANCELLED').reduce((s, i) => s + Number(i.total || 0), 0)
  const lowStockCount = (stock || []).filter((s) => Number(s.quantity) <= Number(s.lowStockThreshold ?? 5)).length

  return (
    <div className="animate-rise">
      <PageHeader title="Reports" subtitle="A quick look at revenue, customers and inventory health." />

      {loading ? (
        <div className="flex justify-center py-24"><Spinner size={32} /></div>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard icon={TrendingUp} label="Total Revenue" value={formatCurrency(totalRevenue)} />
            <StatCard icon={BarChart3} label="Total Invoices" value={(invoices || []).length} />
            <StatCard icon={Users} label="Parties" value={(parties || []).length} />
            <StatCard icon={Boxes} label="Low Stock" value={lowStockCount} />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="p-6 lg:col-span-2">
              <h2 className="mb-4 text-base font-extrabold">Revenue trend</h2>
              {revenueByMonth.length === 0 ? (
                <p className="text-sm text-ink-soft">Not enough invoice data yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={revenueByMonth}>
                    <defs>
                      <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={INK} stopOpacity={0.25} />
                        <stop offset="95%" stopColor={INK} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" stroke="#DEDACD" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fontWeight: 700, fill: INK }} axisLine={{ stroke: INK }} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#8F8C80' }} axisLine={false} tickLine={false} width={70} tickFormatter={(v) => `₹${v}`} />
                    <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ borderRadius: 16, border: `2px solid ${INK}` }} />
                    <Area type="monotone" dataKey="revenue" stroke={INK} strokeWidth={2.5} fill="url(#rev)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </Card>

            <Card className="p-6">
              <h2 className="mb-4 text-base font-extrabold">Invoice status</h2>
              {statusBreakdown.length === 0 ? (
                <p className="text-sm text-ink-soft">No invoices yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={statusBreakdown} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                      {statusBreakdown.map((entry, idx) => (
                        <Cell key={entry.name} fill={PIE_COLORS[idx % PIE_COLORS.length]} stroke="#F5F3EE" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 16, border: `2px solid ${INK}` }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
              <div className="mt-2 flex flex-col gap-1.5">
                {statusBreakdown.map((s, idx) => (
                  <div key={s.name} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 font-semibold">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: PIE_COLORS[idx % PIE_COLORS.length] }} />
                      {s.name}
                    </span>
                    <span className="font-bold">{s.value}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 lg:col-span-3">
              <h2 className="mb-4 text-base font-extrabold">Top customers</h2>
              {topCustomers.length === 0 ? (
                <p className="text-sm text-ink-soft">No invoice data yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={topCustomers} layout="vertical" margin={{ left: 12 }}>
                    <CartesianGrid strokeDasharray="4 4" stroke="#DEDACD" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11, fill: '#8F8C80' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                    <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 12, fontWeight: 700, fill: INK }} axisLine={{ stroke: INK }} tickLine={false} />
                    <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ borderRadius: 16, border: `2px solid ${INK}` }} />
                    <Bar dataKey="total" fill={INK} radius={[0, 8, 8, 0]} barSize={22} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  )
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <Card className="p-4">
      <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full hand-border bg-tint">
        <Icon size={15} strokeWidth={2.25} />
      </div>
      <p className="text-xs font-bold text-ink-soft">{label}</p>
      <p className="mt-0.5 text-xl font-extrabold tracking-tight truncate">{value}</p>
    </Card>
  )
}
