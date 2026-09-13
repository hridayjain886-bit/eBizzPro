function round2(n) {
  return Math.round(n * 100) / 100
}

export function computeInvoiceTotals(items, isIgst) {
  let subtotal = 0
  let gstAmount = 0

  const lines = items.map((item) => {
    const qty = Number(item.qty || 0)
    const price = Number(item.price || 0)
    const gstRate = item.gstRate !== '' && item.gstRate != null ? Number(item.gstRate) : 18
    const inclusive = !!item.isInclusive

    const lineBase = inclusive ? round2((price * qty) / (1 + gstRate / 100)) : round2(price * qty)
    const lineGst = round2((lineBase * gstRate) / 100)

    subtotal += lineBase
    gstAmount += lineGst

    return { ...item, lineBase, lineGst, lineTotal: round2(lineBase + lineGst) }
  })

  subtotal = round2(subtotal)
  gstAmount = round2(gstAmount)

  let cgst = 0, sgst = 0, igst = 0
  if (isIgst) {
    igst = gstAmount
  } else {
    cgst = round2(gstAmount / 2)
    sgst = round2(gstAmount - cgst)
  }

  const rawTotal = subtotal + gstAmount
  const total = Math.round(rawTotal)
  const roundOff = round2(total - rawTotal)

  return { lines, subtotal, gstAmount, cgst, sgst, igst, total, roundOff }
}
