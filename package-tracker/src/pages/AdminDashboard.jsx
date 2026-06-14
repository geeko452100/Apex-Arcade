import { useState, useEffect } from 'react';
import { Plus, UserPlus, Copy, Check, Package } from 'lucide-react';
import {
  fetchCustomers,
  fetchPackages,
  createCustomer,
  createPackage,
} from '@/lib/packages/packagePersistence';
import { PACKAGE_STATUSES, getStatusMeta, formatAddress } from '@/lib/packages/constants';
import PageHeader from '@/components/PageHeader';

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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-2">
        <UserPlus className="w-4 h-4 text-blue-900" />
        <h3 className="text-sm font-semibold text-slate-900">Register customer</h3>
      </div>
      <div>
        <label className="biz-label">Full name *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Customer or company name"
          required
          className="biz-input"
        />
      </div>
      <div>
        <label className="biz-label">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="customer@email.com"
          className="biz-input"
        />
      </div>
      <div>
        <label className="biz-label">Phone</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+1 (555) 000-0000"
          className="biz-input"
        />
      </div>
      {error && <p className="text-xs text-red-700">{error}</p>}
      <button type="submit" disabled={loading || !name.trim()} className="biz-btn-primary w-full">
        {loading ? 'Saving…' : 'Add customer'}
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-2">
        <Package className="w-4 h-4 text-blue-900" />
        <h3 className="text-sm font-semibold text-slate-900">Create shipment</h3>
      </div>

      <div>
        <label className="biz-label">Customer *</label>
        <select
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
          required
          className="biz-input"
        >
          <option value="">Select a customer</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="biz-label">Street address *</label>
        <input
          type="text"
          value={address.line1}
          onChange={(e) => setAddress({ ...address, line1: e.target.value })}
          placeholder="123 Main Street"
          required
          className="biz-input"
        />
      </div>
      <div>
        <label className="biz-label">Address line 2</label>
        <input
          type="text"
          value={address.line2}
          onChange={(e) => setAddress({ ...address, line2: e.target.value })}
          placeholder="Suite, unit, etc."
          className="biz-input"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="biz-label">City *</label>
          <input
            type="text"
            value={address.city}
            onChange={(e) => setAddress({ ...address, city: e.target.value })}
            required
            className="biz-input"
          />
        </div>
        <div>
          <label className="biz-label">State / Province</label>
          <input
            type="text"
            value={address.state}
            onChange={(e) => setAddress({ ...address, state: e.target.value })}
            className="biz-input"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="biz-label">Postal code</label>
          <input
            type="text"
            value={address.zip}
            onChange={(e) => setAddress({ ...address, zip: e.target.value })}
            className="biz-input"
          />
        </div>
        <div>
          <label className="biz-label">Country</label>
          <input
            type="text"
            value={address.country}
            onChange={(e) => setAddress({ ...address, country: e.target.value })}
            placeholder="US"
            className="biz-input"
          />
        </div>
      </div>

      <div>
        <label className="biz-label">Initial status</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="biz-input">
          {PACKAGE_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="biz-label">Internal notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional notes for your team"
          rows={2}
          className="biz-input resize-none"
        />
      </div>

      {error && <p className="text-xs text-red-700">{error}</p>}
      <button
        type="submit"
        disabled={loading || !customerId || customers.length === 0}
        className="biz-btn-primary w-full"
      >
        <Plus className="w-4 h-4" />
        {loading ? 'Creating…' : 'Create shipment'}
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
    <div>
      <PageHeader
        title="Administration"
        description="Register customers, assign destination addresses, and create shipments with an initial delivery status."
      />

      {error && <p className="biz-alert-error mb-6">{error}</p>}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <div className="biz-card">
            <div className="biz-card-body">
              <CustomerForm
                onCreated={(customer) => {
                  setCustomers((prev) => [...prev, customer].sort((a, b) => a.name.localeCompare(b.name)));
                }}
              />
            </div>
          </div>
          <div className="biz-card">
            <div className="biz-card-body">
              <PackageForm
                customers={customers}
                onCreated={(pkg) => {
                  setPackages((prev) => [pkg, ...prev]);
                  copyTrackingId(pkg.tracking_id);
                }}
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="biz-card overflow-hidden">
            <div className="biz-card-header flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">Active shipments</h2>
              <span className="text-xs text-slate-500">{packages.length} total</span>
            </div>
            {loading ? (
              <div className="biz-card-body text-sm text-slate-500">Loading shipments…</div>
            ) : packages.length === 0 ? (
              <div className="biz-card-body text-sm text-slate-500 text-center py-10">
                No shipments on record. Register a customer and create your first shipment to get started.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="biz-table">
                  <thead>
                    <tr>
                      <th>Tracking #</th>
                      <th>Customer</th>
                      <th>Destination</th>
                      <th>Status</th>
                      <th>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {packages.map((pkg) => {
                      const meta = getStatusMeta(pkg.status);
                      const customer = pkg.shipping_customers;
                      return (
                        <tr key={pkg.id}>
                          <td>
                            <button
                              type="button"
                              onClick={() => copyTrackingId(pkg.tracking_id)}
                              className="inline-flex items-center gap-1.5 font-mono text-sm font-medium text-blue-900 hover:text-blue-700"
                            >
                              {pkg.tracking_id}
                              {copiedId === pkg.tracking_id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5 text-slate-400" />
                              )}
                            </button>
                          </td>
                          <td className="font-medium text-slate-900">{customer?.name ?? '—'}</td>
                          <td className="text-xs whitespace-pre-line max-w-[200px]">
                            {formatAddress(pkg.destination_address)}
                          </td>
                          <td>
                            <span className={`biz-status-badge ${meta.color}`}>{meta.label}</span>
                          </td>
                          <td className="text-xs text-slate-500 whitespace-nowrap">
                            {new Date(pkg.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
