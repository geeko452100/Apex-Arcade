import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';

export default function PublicHeader({ showStaffLink = true }) {
  return (
    <header className="bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/track" className="flex items-center gap-3 no-underline">
          <div className="flex items-center justify-center w-9 h-9 rounded-md bg-blue-900 text-white">
            <Package className="w-5 h-5" strokeWidth={2} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900 leading-tight">Package Tracker</p>
            <p className="text-xs text-slate-500 leading-tight">Logistics Management</p>
          </div>
        </Link>
        {showStaffLink && (
          <Link
            to="/login"
            className="text-sm font-medium text-blue-900 hover:text-blue-700 no-underline"
          >
            Staff sign in
          </Link>
        )}
      </div>
    </header>
  );
}
