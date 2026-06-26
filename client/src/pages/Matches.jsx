import { useState, useEffect } from 'react';
import { matchesApi, predictionsApi, standingsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import MatchCard from '../components/MatchCard';
import GroupCard from '../components/GroupCard';

const TABS = [
  { id: 'standings', label: 'STANDINGS' },
  { id: 'fixtures', label: 'FIXTURES' },
  { id: 'knockout', label: 'KNOCKOUT' },
];

export default function Matches() {
  const [tab, setTab] = useState('standings');
  const [matches, setMatches] = useState([]);
  const [predictions, setPredictions] = useState({});
  const [standings, setStandings] = useState([]);
  const [standingsLoading, setStandingsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [filter, setFilter] = useState('all');
  const [syncing, setSyncing] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (standings.length === 0) {
      setStandingsLoading(true);
      standingsApi.get()
        .then(res => setStandings(res.data))
        .catch(e => console.error(e))
        .finally(() => setStandingsLoading(false));
    }
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

  const groupMatches = matches.filter(m => m.group && m.group.startsWith('GROUP'));
  const knockoutMatches = matches.filter(m => !m.group || !m.group.startsWith('GROUP'));
  const liveCount = matches.filter(m => m.status === 'LIVE').length;

  const filteredGroup = groupMatches.filter(m => {
    if (filter === 'live') return m.status === 'LIVE';
    if (filter === 'upcoming') return m.status === 'SCHEDULED';
    if (filter === 'finished') return m.status === 'FINISHED';
    return true;
  });

  const grouped = {};
  filteredGroup.forEach(m => {
    if (!grouped[m.group]) grouped[m.group] = [];
    grouped[m.group].push(m);
  });

  const selectedGroupMatches = selectedGroup ? (grouped[selectedGroup] || groupMatches.filter(m => m.group === selectedGroup)) : [];

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
    <div className="w-full max-w-6xl px-4 py-6">
      {/* Header */}
      <div className="text-center mb-5">
        <h1 className="text-xl font-black text-slate-100 tracking-tight">
          {tab === 'standings' ? 'Group Standings' : tab === 'fixtures' ? 'Fixtures' : 'Knockout Stage'}
        </h1>
        <p className="text-slate-600 text-[11px] uppercase tracking-widest font-semibold mt-0.5">FIFA World Cup 2026</p>
        {user?.isAdmin && (
          <button onClick={handleSync} disabled={syncing}
            className="mt-2 px-3 py-1 text-xs font-medium rounded-lg bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 transition-all disabled:opacity-50">
            {syncing ? 'Sincronizez...' : '🔄 Sync API'}
          </button>
        )}
      </div>

      {/* Tab bar */}
      <div className="flex justify-center mb-7">
        <div className="flex gap-0.5 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setSelectedGroup(null); }}
              className={`px-5 py-1.5 text-xs font-black rounded-lg tracking-widest transition-all ${
                tab === t.id ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-slate-500 hover:text-slate-300'
              }`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* STANDINGS TAB */}
      {tab === 'standings' && (
        standingsLoading ? (
          <div className="text-center py-16 text-slate-500">
            <div className="text-3xl mb-3 animate-bounce">⚽</div>
            <p className="text-sm">Se calculează standings...</p>
          </div>
        ) : (
          <>
            {/* Group cards grid */}
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
              {standings.map(s => (
                <GroupCard
                  key={s.group}
                  group={s.group}
                  table={s.table}
                  selected={selectedGroup === s.group}
                  onSelect={() => setSelectedGroup(selectedGroup === s.group ? null : s.group)}
                />
              ))}
            </div>

            {/* Expanded group matches */}
            {selectedGroup && (
              <div className="mt-8">
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex-1 h-px bg-slate-800/60" />
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-amber-400 uppercase tracking-widest px-3 py-1 rounded-full border border-amber-400/30 bg-amber-400/5">
                      {selectedGroup.replace('_', ' ')} — Meciuri & Rezultate
                    </span>
                    <button onClick={() => setSelectedGroup(null)} className="text-slate-600 hover:text-slate-400 text-xs px-2 py-1 rounded hover:bg-slate-800 transition-all">✕</button>
                  </div>
                  <div className="flex-1 h-px bg-slate-800/60" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2 max-w-4xl mx-auto">
                  {groupMatches.filter(m => m.group === selectedGroup).map(m => (
                    <MatchCard key={m.id} match={m} prediction={predictions[m.id]} />
                  ))}
                </div>
              </div>
            )}
          </>
        )
      )}

      {/* FIXTURES TAB */}
      {tab === 'fixtures' && (
        <>
          <div className="flex justify-center gap-2 mb-6 overflow-x-auto pb-1">
            {[
              { id: 'all', label: 'Toate' },
              { id: 'live', label: `● Live${liveCount > 0 ? ` (${liveCount})` : ''}` },
              { id: 'upcoming', label: 'Urmează' },
              { id: 'finished', label: 'Terminate' },
            ].map(f => (
              <button key={f.id} onClick={() => setFilter(f.id)}
                className={`px-4 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-all ${
                  filter === f.id
                    ? f.id === 'live' ? 'bg-green-500 text-black' : 'bg-amber-500 text-black'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}>
                {f.label}
              </button>
            ))}
          </div>

          {Object.keys(grouped).length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <div className="text-4xl mb-3">🔍</div>
              <p>Nu există meciuri pentru filtrul selectat</p>
            </div>
          ) : (
            Object.entries(grouped).map(([group, gMatches]) => (
              <div key={group} style={{ marginBottom: '60px' }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex-1 h-px bg-slate-800/60" />
                  <span className="text-xs font-bold text-amber-400/80 uppercase tracking-widest px-3 py-1 rounded-full border border-amber-400/20 bg-amber-400/5">
                    {group.replace(/_/g, ' ')}
                  </span>
                  <div className="flex-1 h-px bg-slate-800/60" />
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  {gMatches.map(m => (
                    <MatchCard key={m.id} match={m} prediction={predictions[m.id]} />
                  ))}
                </div>
              </div>
            ))
          )}
        </>
      )}

      {/* KNOCKOUT TAB */}
      {tab === 'knockout' && (
        knockoutMatches.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <div className="text-5xl mb-4">🏆</div>
            <p className="font-semibold text-slate-400 mb-1">Faza eliminatorie</p>
            <p className="text-sm">Meciurile vor apărea după încheierea grupelor</p>
          </div>
        ) : (
          (() => {
            const kGrouped = {};
            knockoutMatches.forEach(m => {
              const key = m.round || 'Knockout';
              if (!kGrouped[key]) kGrouped[key] = [];
              kGrouped[key].push(m);
            });
            return Object.entries(kGrouped).map(([round, rMatches]) => (
              <div key={round} style={{ marginBottom: '60px' }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex-1 h-px bg-slate-800/60" />
                  <span className="text-xs font-bold text-amber-400/80 uppercase tracking-widest px-3 py-1 rounded-full border border-amber-400/20 bg-amber-400/5">
                    {round.replace(/_/g, ' ')}
                  </span>
                  <div className="flex-1 h-px bg-slate-800/60" />
                </div>
                <div className="grid gap-5 sm:grid-cols-2 max-w-4xl mx-auto">
                  {rMatches.map(m => (
                    <MatchCard key={m.id} match={m} prediction={predictions[m.id]} />
                  ))}
                </div>
              </div>
            ));
          })()
        )
      )}
    </div>
  );
}
