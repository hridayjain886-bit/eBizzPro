export function formatCurrency(amount) {
  const n = Number(amount || 0)
  return '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 2 })
}

export function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return dateStr
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export function statusTone(status) {
  const s = (status || '').toLowerCase()
  if (s === 'paid' || s === 'active') return s === 'paid' ? 'paid' : 'active'
  if (s === 'pending') return 'pending'
  if (s === 'cancelled' || s === 'inactive') return s === 'cancelled' ? 'cancelled' : 'inactive'
  if (s === 'draft') return 'draft'
  return 'neutral'
}
