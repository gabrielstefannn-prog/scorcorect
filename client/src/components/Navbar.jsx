import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const links = [
    { to: '/', label: 'Meciuri' },
    { to: '/leaderboard', label: 'Clasament' },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800" style={{ background: 'rgba(10,14,26,0.95)', backdropFilter: 'blur(12px)' }}>
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-2xl">⚽</span>
          <span className="font-bold text-xl" style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            ScorCorect
          </span>
          <span className="text-xs text-slate-500 font-medium hidden sm:block">WC 2026</span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-4">
          {links.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                location.pathname === l.to
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {l.label}
            </Link>
          ))}

          {user && (
            <div className="flex items-center gap-2 ml-2">
              <span className="hidden sm:block text-sm text-slate-400">
                <span className="text-amber-400 font-semibold">{user.username}</span>
                {user.isAdmin && <span className="ml-1 text-xs bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded">Admin</span>}
              </span>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 text-sm rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-all"
              >
                Ieși
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
