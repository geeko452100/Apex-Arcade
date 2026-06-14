export const PACKAGE_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'text-slate-400 bg-slate-500/10 border-slate-500/30' },
  { value: 'picked_up', label: 'Picked Up', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
  { value: 'in_transit', label: 'In Transit', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30' },
  { value: 'out_for_delivery', label: 'Out for Delivery', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  { value: 'delivered', label: 'Delivered', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
  { value: 'exception', label: 'Exception', color: 'text-red-400 bg-red-500/10 border-red-500/30' },
];

export function getStatusMeta(status) {
  return PACKAGE_STATUSES.find((s) => s.value === status) ?? PACKAGE_STATUSES[0];
}

export function formatAddress(address) {
  if (!address) return '';
  const parts = [
    address.line1,
    address.line2,
    [address.city, address.state, address.zip].filter(Boolean).join(', '),
    address.country,
  ].filter(Boolean);
  return parts.join('\n');
}
