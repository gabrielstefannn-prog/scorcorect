import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [tab, setTab] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (tab === 'login') await login(username, password);
      else await register(username, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Eroare. Încearcă din nou.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{
      background: 'radial-gradient(ellipse at top, #1a2744 0%, #0a0e1a 60%)'
    }}>
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full opacity-5" style={{ background: '#f59e0b', filter: 'blur(80px)' }} />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 rounded-full opacity-5" style={{ background: '#ef4444', filter: 'blur(80px)' }} />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src="/wc-ball.avif" alt="WC Ball" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', objectPosition: 'center', margin: '0 auto 12px' }} />
          <h1 className="text-3xl font-bold" style={{
            background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>Football & Friends</h1>
          <p className="text-slate-500 text-sm mt-1" style={{ marginBottom: '32px' }}>FIFA World Cup 2026</p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl shadow-2xl" style={{ padding: '36px 40px' }}>
          {/* Tabs */}
          <div className="flex bg-slate-800/50 rounded-lg p-1" style={{ marginBottom: '32px' }}>
            {['login', 'register'].map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(''); }}
                className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all ${
                  tab === t ? 'bg-amber-500 text-black shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t === 'login' ? 'Intră în cont' : 'Cont nou'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">Nume</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Nume jucator"
                required
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">Parolă</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••"
                required
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-all"
              />
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-semibold text-black transition-all disabled:opacity-50"
              style={{ marginTop: '24px', background: loading ? '#78350f' : 'linear-gradient(135deg, #f59e0b, #ef4444)' }}
            >
              {loading ? 'Se încarcă...' : tab === 'login' ? 'Intră în cont' : 'Creează cont'}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          Made with ❤️ for football friends
        </p>
      </div>
    </div>
  );
}
