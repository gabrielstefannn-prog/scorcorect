import { useState, useEffect } from 'react';
import { matchesApi, predictionsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import MatchCard from '../components/MatchCard';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';

export default function Matches() {
  const [matches, setMatches] = useState([]);
  const [predictions, setPredictions] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [syncing, setSyncing] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [matchRes, predRes] = await Promise.all([
        matchesApi.getAll(),
        predictionsApi.getByUser(user.id),
      ]);
      setMatches(matchRes.data);
      const predMap = {};
      predRes.data.forEach(p => { predMap[p.matchId] = p; });
      setPredictions(predMap);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await matchesApi.sync();
      alert(res.data.message);
      fetchData();
    } catch (e) {
      alert(e.response?.data?.error || 'Eroare la sincronizare');
    } finally {
      setSyncing(false);
    }
  };

  const filtered = matches.filter(m => {
    if (filter === 'live') return m.status === 'LIVE';
    if (filter === 'upcoming') return m.status === 'SCHEDULED';
    if (filter === 'finished') return m.status === 'FINISHED';
    return true;
  });

  // Grupăm meciurile pe grupe
  const grouped = {};
  filtered.forEach(m => {
    const key = m.group || m.round;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(m);
  });

  const liveCount = matches.filter(m => m.status === 'LIVE').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="text-4xl mb-3 animate-bounce">⚽</div>
          <p className="text-slate-500">Se încarcă meciurile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">🏆 Meciuri WC 2026</h1>
          <p className="text-slate-500 text-sm mt-1">{matches.length} meciuri • {Object.keys(predictions).length} pronosticuri</p>
        </div>
        {user?.isAdmin && (
          <button
            onClick={handleSync}
            disabled={syncing}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-all disabled:opacity-50"
          >
            {syncing ? 'Sincronizez...' : '🔄 Sync API'}
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'Toate' },
          { id: 'live', label: `● Live${liveCount > 0 ? ` (${liveCount})` : ''}` },
          { id: 'upcoming', label: 'Urmează' },
          { id: 'finished', label: 'Terminate' },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-4 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-all ${
              filter === f.id
                ? f.id === 'live' ? 'bg-green-500 text-black' : 'bg-amber-500 text-black'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Matches grouped */}
      {Object.keys(grouped).length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <div className="text-4xl mb-3">🔍</div>
          <p>Nu există meciuri pentru filtrul selectat</p>
        </div>
      ) : (
        Object.entries(grouped).map(([group, groupMatches]) => (
          <div key={group} className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider">{group}</h2>
              <div className="flex-1 h-px bg-slate-800" />
              <span className="text-xs text-slate-600">{groupMatches.length} meciuri</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {groupMatches.map(m => (
                <MatchCard key={m.id} match={m} prediction={predictions[m.id]} />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
