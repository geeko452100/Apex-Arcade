import { useState, useEffect } from 'react';
import { RefreshCw, Save } from 'lucide-react';
import { fetchPackages, updatePackageStatus } from '@/lib/packages/packagePersistence';
import { PACKAGE_STATUSES, getStatusMeta, formatAddress } from '@/lib/packages/constants';

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
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <p className="font-mono text-sm font-bold text-sky-400">{pkg.tracking_id}</p>
          <p className="text-white font-medium mt-1">{customer?.name ?? 'Unknown'}</p>
          <p className="text-xs text-slate-500 whitespace-pre-line mt-1">
            {formatAddress(pkg.destination_address)}
          </p>
        </div>
        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md border ${meta.color}`}>
          {meta.label}
        </span>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-800">
        <div>
          <label className="block text-xs uppercase tracking-wider text-slate-500 mb-1">
            Update Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-lg py-2 px-3 focus:outline-none focus:border-sky-500"
          >
            {PACKAGE_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider text-slate-500 mb-1">
            Notes
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional update notes"
            className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-lg py-2 px-3 focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {error && <p className="text-xs text-red-400 mt-2">{error}</p>}

      <button
        type="button"
        onClick={handleSave}
        disabled={loading || !hasChanges}
        className="mt-3 flex items-center gap-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors"
      >
        <Save className="w-3.5 h-3.5" />
        {loading ? 'Saving...' : saved ? 'Saved!' : 'Save Status'}
      </button>
    </div>
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
    <div className="space-y-8">
      <header className="border-b border-slate-800 pb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">Staff Dashboard</h1>
          <p className="mt-2 text-slate-400 text-sm">
            View shipments and update delivery status.
          </p>
        </div>
        <button
          type="button"
          onClick={loadPackages}
          disabled={loading}
          className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium px-3 py-2 rounded-lg border border-slate-800 hover:border-slate-600 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </header>

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      {loading && packages.length === 0 ? (
        <p className="text-slate-400 text-sm">Loading shipments...</p>
      ) : packages.length === 0 ? (
        <p className="text-slate-500 text-sm bg-slate-950 border border-slate-800 rounded-xl p-8 text-center">
          No shipments to manage yet.
        </p>
      ) : (
        <div className="space-y-4">
          {packages.map((pkg) => (
            <StatusUpdateRow key={pkg.id} pkg={pkg} onUpdated={handleUpdated} />
          ))}
        </div>
      )}
    </div>
  );
}
