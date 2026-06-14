import { useState, useEffect } from 'react';
import { Plus, Package, UserPlus, Copy, Check } from 'lucide-react';
import {
  fetchCustomers,
  fetchPackages,
  createCustomer,
  createPackage,
} from '@/lib/packages/packagePersistence';
import { PACKAGE_STATUSES, getStatusMeta, formatAddress } from '@/lib/packages/constants';

const EMPTY_ADDRESS = { line1: '', line2: '', city: '', state: '', zip: '', country: '' };

function CustomerForm({ onCreated }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError('');
    try {
      const customer = await createCustomer({ name: name.trim(), email, phone });
      onCreated(customer);
      setName('');
      setEmail('');
      setPhone('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <h3 className="text-sm font-bold text-white flex items-center gap-2">
        <UserPlus className="w-4 h-4 text-sky-400" />
        Add Customer
      </h3>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Customer name *"
        required
        className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-lg py-2 px-3 focus:outline-none focus:border-sky-500"
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email (optional)"
        className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-lg py-2 px-3 focus:outline-none focus:border-sky-500"
      />
      <input
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Phone (optional)"
        className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-lg py-2 px-3 focus:outline-none focus:border-sky-500"
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={loading || !name.trim()}
        className="w-full bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-sm font-bold py-2 rounded-lg transition-colors"
      >
        {loading ? 'Adding...' : 'Add Customer'}
      </button>
    </form>
  );
}

function PackageForm({ customers, onCreated }) {
  const [customerId, setCustomerId] = useState('');
  const [address, setAddress] = useState(EMPTY_ADDRESS);
  const [status, setStatus] = useState('pending');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customerId || !address.line1.trim() || !address.city.trim()) return;
    setLoading(true);
    setError('');
    try {
      const pkg = await createPackage({
        customerId,
        destinationAddress: {
          line1: address.line1.trim(),
          line2: address.line2.trim() || null,
          city: address.city.trim(),
          state: address.state.trim() || null,
          zip: address.zip.trim() || null,
          country: address.country.trim() || 'US',
        },
        status,
        notes: notes.trim() || null,
      });
      onCreated(pkg);
      setAddress(EMPTY_ADDRESS);
      setNotes('');
      setStatus('pending');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <h3 className="text-sm font-bold text-white flex items-center gap-2">
        <Package className="w-4 h-4 text-sky-400" />
        Create Shipment
      </h3>

      <select
        value={customerId}
        onChange={(e) => setCustomerId(e.target.value)}
        required
        className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-lg py-2 px-3 focus:outline-none focus:border-sky-500"
      >
        <option value="">Select customer *</option>
        {customers.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      <input
        type="text"
        value={address.line1}
        onChange={(e) => setAddress({ ...address, line1: e.target.value })}
        placeholder="Address line 1 *"
        required
        className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-lg py-2 px-3 focus:outline-none focus:border-sky-500"
      />
      <input
        type="text"
        value={address.line2}
        onChange={(e) => setAddress({ ...address, line2: e.target.value })}
        placeholder="Address line 2"
        className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-lg py-2 px-3 focus:outline-none focus:border-sky-500"
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          type="text"
          value={address.city}
          onChange={(e) => setAddress({ ...address, city: e.target.value })}
          placeholder="City *"
          required
          className="bg-slate-950 border border-slate-800 text-white text-sm rounded-lg py-2 px-3 focus:outline-none focus:border-sky-500"
        />
        <input
          type="text"
          value={address.state}
          onChange={(e) => setAddress({ ...address, state: e.target.value })}
          placeholder="State"
          className="bg-slate-950 border border-slate-800 text-white text-sm rounded-lg py-2 px-3 focus:outline-none focus:border-sky-500"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input
          type="text"
          value={address.zip}
          onChange={(e) => setAddress({ ...address, zip: e.target.value })}
          placeholder="ZIP"
          className="bg-slate-950 border border-slate-800 text-white text-sm rounded-lg py-2 px-3 focus:outline-none focus:border-sky-500"
        />
        <input
          type="text"
          value={address.country}
          onChange={(e) => setAddress({ ...address, country: e.target.value })}
          placeholder="Country"
          className="bg-slate-950 border border-slate-800 text-white text-sm rounded-lg py-2 px-3 focus:outline-none focus:border-sky-500"
        />
      </div>

      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-lg py-2 px-3 focus:outline-none focus:border-sky-500"
      >
        {PACKAGE_STATUSES.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notes (optional)"
        rows={2}
        className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-lg py-2 px-3 focus:outline-none focus:border-sky-500 resize-none"
      />

      {error && <p className="text-xs text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={loading || !customerId || customers.length === 0}
        className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-bold py-2 rounded-lg transition-colors"
      >
        <Plus className="w-4 h-4" />
        {loading ? 'Creating...' : 'Create Shipment'}
      </button>
    </form>
  );
}

export default function AdminDashboard() {
  const [customers, setCustomers] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [customerData, packageData] = await Promise.all([
        fetchCustomers(),
        fetchPackages(),
      ]);
      setCustomers(customerData);
      setPackages(packageData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const copyTrackingId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(''), 2000);
  };

  return (
    <div className="space-y-8">
      <header className="border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-black text-white">Admin Dashboard</h1>
        <p className="mt-2 text-slate-400 text-sm">
          Add customers, set destination addresses, and create shipments with initial status.
        </p>
      </header>

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">
            <CustomerForm
              onCreated={(customer) => {
                setCustomers((prev) => [...prev, customer].sort((a, b) => a.name.localeCompare(b.name)));
              }}
            />
          </div>
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">
            <PackageForm
              customers={customers}
              onCreated={(pkg) => {
                setPackages((prev) => [pkg, ...prev]);
                copyTrackingId(pkg.tracking_id);
              }}
            />
          </div>
        </div>

        <div className="lg:col-span-2">
          <h2 className="text-lg font-bold text-white mb-4">All Shipments</h2>
          {loading ? (
            <p className="text-slate-400 text-sm">Loading shipments...</p>
          ) : packages.length === 0 ? (
            <p className="text-slate-500 text-sm bg-slate-950 border border-slate-800 rounded-xl p-8 text-center">
              No shipments yet. Add a customer and create your first shipment.
            </p>
          ) : (
            <div className="space-y-3">
              {packages.map((pkg) => {
                const meta = getStatusMeta(pkg.status);
                const customer = pkg.shipping_customers;
                return (
                  <div
                    key={pkg.id}
                    className="bg-slate-950 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                      <div>
                        <button
                          type="button"
                          onClick={() => copyTrackingId(pkg.tracking_id)}
                          className="flex items-center gap-2 font-mono text-sm font-bold text-sky-400 hover:text-sky-300 transition-colors"
                        >
                          {pkg.tracking_id}
                          {copiedId === pkg.tracking_id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <p className="text-white font-medium mt-1">{customer?.name ?? 'Unknown'}</p>
                      </div>
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md border ${meta.color}`}>
                        {meta.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 whitespace-pre-line">
                      {formatAddress(pkg.destination_address)}
                    </p>
                    <p className="text-xs text-slate-600 mt-2">
                      Created {new Date(pkg.created_at).toLocaleString()}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
