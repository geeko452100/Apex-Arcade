import { useState, useEffect } from 'react';
import { RefreshCw, Save } from 'lucide-react';
import { fetchPackages, updatePackageStatus } from '@/lib/packages/packagePersistence';
import { PACKAGE_STATUSES, getStatusMeta, formatAddress } from '@/lib/packages/constants';
import PageHeader from '@/components/PageHeader';

function StatusUpdateRow({ pkg, onUpdated }) {
  const [status, setStatus] = useState(pkg.status);
  const [notes, setNotes] = useState(pkg.notes ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSaved(false);
    try {
      const updated = await updatePackageStatus(pkg.id, status, notes || null);
      onUpdated(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const meta = getStatusMeta(pkg.status);
  const customer = pkg.shipping_customers;
  const hasChanges = status !== pkg.status || (notes || '') !== (pkg.notes || '');

  return (
    <tr>
      <td className="font-mono text-sm font-medium text-blue-900">{pkg.tracking_id}</td>
      <td className="font-medium text-slate-900">{customer?.name ?? '—'}</td>
      <td className="text-xs whitespace-pre-line max-w-[180px]">{formatAddress(pkg.destination_address)}</td>
      <td>
        <span className={`biz-status-badge ${meta.color}`}>{meta.label}</span>
      </td>
      <td>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="biz-input py-1.5 text-xs min-w-[140px]"
        >
          {PACKAGE_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </td>
      <td>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add a note"
          className="biz-input py-1.5 text-xs min-w-[160px]"
        />
      </td>
      <td>
        {error && <p className="text-xs text-red-700 mb-1">{error}</p>}
        <button
          type="button"
          onClick={handleSave}
          disabled={loading || !hasChanges}
          className="biz-btn-primary py-1.5 text-xs"
        >
          <Save className="w-3.5 h-3.5" />
          {loading ? 'Saving…' : saved ? 'Saved' : 'Update'}
        </button>
      </td>
    </tr>
  );
}

export default function StaffDashboard() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadPackages = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchPackages();
      setPackages(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPackages(); }, []);

  const handleUpdated = (updated) => {
    setPackages((prev) =>
      prev.map((p) => (p.id === updated.id ? { ...p, ...updated, shipping_customers: p.shipping_customers } : p))
    );
  };

  return (
    <div>
      <PageHeader
        title="Operations"
        description="Review active shipments and update delivery status as packages move through the fulfillment pipeline."
        action={
          <button
            type="button"
            onClick={loadPackages}
            disabled={loading}
            className="biz-btn-secondary"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        }
      />

      {error && <p className="biz-alert-error mb-6">{error}</p>}

      <div className="biz-card overflow-hidden">
        {loading && packages.length === 0 ? (
          <div className="biz-card-body text-sm text-slate-500">Loading shipments…</div>
        ) : packages.length === 0 ? (
          <div className="biz-card-body text-sm text-slate-500 text-center py-10">
            No shipments are currently assigned. New shipments will appear here once created by an administrator.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="biz-table">
              <thead>
                <tr>
                  <th>Tracking #</th>
                  <th>Customer</th>
                  <th>Destination</th>
                  <th>Current status</th>
                  <th>New status</th>
                  <th>Notes</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {packages.map((pkg) => (
                  <StatusUpdateRow key={pkg.id} pkg={pkg} onUpdated={handleUpdated} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
