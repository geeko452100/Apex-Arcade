import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Package, Search, MapPin, Clock, ArrowRight } from 'lucide-react';
import { trackPackageById } from '@/lib/packages/packagePersistence';
import { getStatusMeta } from '@/lib/packages/constants';
import BackToPortfolio from '@/components/BackToPortfolio';

function StatusTimeline({ history, currentStatus }) {
  if (!history?.length) return null;

  return (
    <ol className="relative border-l border-slate-700 ml-3 space-y-6">
      {history.map((entry, index) => {
        const meta = getStatusMeta(entry.status);
        const isLatest = index === history.length - 1 && entry.status === currentStatus;
        return (
          <li key={`${entry.status}-${entry.changed_at}-${index}`} className="ml-6">
            <span
              className={`absolute -left-1.5 flex h-3 w-3 rounded-full ring-4 ring-slate-950 ${
                isLatest ? 'bg-sky-400' : 'bg-slate-600'
              }`}
            />
            <p className={`text-sm font-semibold ${isLatest ? 'text-white' : 'text-slate-400'}`}>
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
    <div className="mt-8 space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Tracking ID</p>
            <p className="text-xl font-mono font-bold text-white">{result.tracking_id}</p>
          </div>
          <span className={`text-xs uppercase font-bold tracking-wider px-3 py-1.5 rounded-lg border ${meta.color}`}>
            {meta.label}
          </span>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div className="flex items-start gap-3 bg-slate-950/60 rounded-xl p-4 border border-slate-800">
            <MapPin className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Destination</p>
              <p className="text-slate-200">
                {[result.destination_city, result.destination_state, result.destination_country]
                  .filter(Boolean)
                  .join(', ') || '—'}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-slate-950/60 rounded-xl p-4 border border-slate-800">
            <Clock className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Last Updated</p>
              <p className="text-slate-200">
                {result.updated_at ? new Date(result.updated_at).toLocaleString() : '—'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {result.history?.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider">Shipment History</h3>
          <StatusTimeline history={result.history} currentStatus={result.status} />
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
          setError('No package found with that tracking ID. Please check and try again.');
        } else {
          setResult(data);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message ?? 'Unable to look up package. Please try again.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [urlTrackingId]);

  const handleTrack = async () => {
    const trimmed = trackingId.trim();
    if (!trimmed) return;
    navigate(`/track/${encodeURIComponent(trimmed)}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <BackToPortfolio className="mb-8" />

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/20 mb-4">
            <Package className="w-8 h-8 text-sky-400" />
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Track Your Package</h1>
          <p className="text-slate-400 text-sm">
            Enter your tracking ID below — no account required.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
          <label htmlFor="tracking-id" className="block text-xs uppercase tracking-widest text-slate-500 mb-2">
            Tracking ID
          </label>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              <input
                id="tracking-id"
                type="text"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
                placeholder="e.g. PKG-A1B2C3D4E5"
                className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-sky-500 transition-colors font-mono uppercase"
              />
            </div>
            <button
              type="button"
              onClick={handleTrack}
              disabled={loading || !trackingId.trim()}
              className="flex items-center gap-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold px-5 py-2.5 rounded-lg transition-colors"
            >
              {loading ? 'Searching...' : 'Track'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>

          {error && (
            <p className="mt-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
              {error}
            </p>
          )}
        </div>

        {result && <TrackingResult result={result} />}

        <p className="text-center mt-8 text-xs text-slate-600">
          Staff member?{' '}
          <Link to="/login" className="text-sky-400 hover:text-sky-300 transition-colors">
            Sign in to manage shipments
          </Link>
        </p>
      </div>
    </div>
  );
}
