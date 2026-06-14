import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Search, MapPin, Clock, ArrowRight } from 'lucide-react';
import { trackPackageById } from '@/lib/packages/packagePersistence';
import { getStatusMeta } from '@/lib/packages/constants';
import PublicHeader from '@/components/PublicHeader';

function StatusTimeline({ history, currentStatus }) {
  if (!history?.length) return null;

  return (
    <ol className="relative border-l border-slate-200 ml-3 space-y-5">
      {history.map((entry, index) => {
        const meta = getStatusMeta(entry.status);
        const isLatest = index === history.length - 1 && entry.status === currentStatus;
        return (
          <li key={`${entry.status}-${entry.changed_at}-${index}`} className="ml-6">
            <span
              className={`absolute -left-1.5 flex h-3 w-3 rounded-full ring-4 ring-white ${
                isLatest ? 'bg-blue-900' : 'bg-slate-300'
              }`}
            />
            <p className={`text-sm font-medium ${isLatest ? 'text-slate-900' : 'text-slate-600'}`}>
              {meta.label}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {new Date(entry.changed_at).toLocaleString()}
            </p>
          </li>
        );
      })}
    </ol>
  );
}

function TrackingResult({ result }) {
  const meta = getStatusMeta(result.status);

  return (
    <div className="mt-6 space-y-6">
      <div className="biz-card">
        <div className="biz-card-body">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div>
              <p className="biz-label mb-1">Tracking number</p>
              <p className="text-lg font-semibold font-mono text-slate-900">{result.tracking_id}</p>
            </div>
            <span className={`biz-status-badge ${meta.color}`}>{meta.label}</span>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 rounded-md bg-slate-50 border border-slate-100 p-4">
              <MapPin className="w-5 h-5 text-blue-900 shrink-0 mt-0.5" />
              <div>
                <p className="biz-label mb-1">Destination</p>
                <p className="text-sm text-slate-700">
                  {[result.destination_city, result.destination_state, result.destination_country]
                    .filter(Boolean)
                    .join(', ') || '—'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-md bg-slate-50 border border-slate-100 p-4">
              <Clock className="w-5 h-5 text-blue-900 shrink-0 mt-0.5" />
              <div>
                <p className="biz-label mb-1">Last updated</p>
                <p className="text-sm text-slate-700">
                  {result.updated_at ? new Date(result.updated_at).toLocaleString() : '—'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {result.history?.length > 0 && (
        <div className="biz-card">
          <div className="biz-card-header">
            <h3 className="text-sm font-semibold text-slate-900">Shipment activity</h3>
          </div>
          <div className="biz-card-body">
            <StatusTimeline history={result.history} currentStatus={result.status} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackPackage() {
  const { trackingId: urlTrackingId } = useParams();
  const navigate = useNavigate();
  const [trackingId, setTrackingId] = useState(urlTrackingId ?? '');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!urlTrackingId) return;

    let cancelled = false;
    setTrackingId(urlTrackingId);
    setLoading(true);
    setError('');
    setResult(null);

    trackPackageById(urlTrackingId)
      .then((data) => {
        if (cancelled) return;
        if (!data) {
          setError('No shipment was found for that tracking number. Please verify and try again.');
        } else {
          setResult(data);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message ?? 'Unable to retrieve shipment details. Please try again.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [urlTrackingId]);

  const handleTrack = () => {
    const trimmed = trackingId.trim();
    if (!trimmed) return;
    navigate(`/track/${encodeURIComponent(trimmed)}`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <PublicHeader />

      <main className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Track a shipment</h1>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            Enter your tracking number below to view current status and delivery progress. No account is required.
          </p>
        </div>

        <div className="biz-card">
          <div className="biz-card-body">
            <label htmlFor="tracking-id" className="biz-label">Tracking number</label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  id="tracking-id"
                  type="text"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
                  placeholder="e.g. PKG-A1B2C3D4E5"
                  className="biz-input pl-10 font-mono uppercase"
                />
              </div>
              <button
                type="button"
                onClick={handleTrack}
                disabled={loading || !trackingId.trim()}
                className="biz-btn-primary px-5"
              >
                {loading ? 'Searching…' : 'Track shipment'}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>

            {error && <p className="biz-alert-error mt-4">{error}</p>}
          </div>
        </div>

        {result && <TrackingResult result={result} />}

        <p className="text-center mt-8 text-sm text-slate-500">
          Need to manage shipments?{' '}
          <Link to="/login" className="font-medium text-blue-900 hover:text-blue-700 no-underline">
            Sign in to the operations portal
          </Link>
        </p>
      </main>
    </div>
  );
}
