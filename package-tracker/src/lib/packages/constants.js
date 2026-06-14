export const PACKAGE_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'text-slate-700 bg-slate-100 border-slate-200' },
  { value: 'picked_up', label: 'Picked Up', color: 'text-blue-800 bg-blue-50 border-blue-200' },
  { value: 'in_transit', label: 'In Transit', color: 'text-indigo-800 bg-indigo-50 border-indigo-200' },
  { value: 'out_for_delivery', label: 'Out for Delivery', color: 'text-amber-800 bg-amber-50 border-amber-200' },
  { value: 'delivered', label: 'Delivered', color: 'text-emerald-800 bg-emerald-50 border-emerald-200' },
  { value: 'exception', label: 'Exception', color: 'text-red-800 bg-red-50 border-red-200' },
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
