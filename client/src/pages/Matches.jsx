import React, { useState, useEffect } from 'react';
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
  const [gridCols, setGridCols] = useState(window.innerWidth < 640 ? 1 : 2);

  useEffect(() => {
    const handleResize = () => setGridCols(window.innerWidth < 640 ? 1 : 2);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [filter, setFilter] = useState('upcoming');
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
      <div className="text-center" style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '10px' }}>
          <img src="/wc-ball.avif" alt="WC Ball" style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', objectPosition: 'center' }} />
          <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '44px', letterSpacing: '0.2em', color: '#ffffff', textTransform: 'uppercase', margin: 0, textShadow: '0 0 6px rgba(0,0,0,0.6)' }}>
            FIFA World Cup 2026
          </p>
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.1, color: '#f1f5f9', WebkitTextStroke: '0px transparent', textShadow: '0 0 8px rgba(0,0,0,0.9), 0 0 16px rgba(0,0,0,0.6)', marginBottom: '6px' }}>
          {tab === 'standings' ? 'Group Standings' : tab === 'fixtures' ? 'Fixtures' : 'Knockout Stage'}
        </h1>
        <div style={{ width: '40px', height: '2px', background: 'linear-gradient(90deg, #f59e0b, #ef4444)', borderRadius: '2px', margin: '0 auto' }} />
        {user?.isAdmin && (
          <button onClick={handleSync} disabled={syncing}
            className="mt-4 px-3 py-1 text-xs font-medium rounded-lg bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 transition-all disabled:opacity-50">
            {syncing ? 'Sincronizez...' : '🔄 Sync API'}
          </button>
        )}
      </div>

      {/* Tab bar */}
      <div className="flex justify-center" style={{ marginBottom: '32px' }}>
        <div className="flex gap-1 p-1.5 rounded-2xl" style={{ background: 'rgba(8,14,28,0.6)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setSelectedGroup(null); }}
              className="transition-all"
              style={{
                padding: '8px 24px',
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '0.15em',
                borderRadius: '12px',
                background: tab === t.id ? 'linear-gradient(135deg, #f59e0b, #ef4444)' : 'transparent',
                color: tab === t.id ? '#000' : 'rgba(148,163,184,0.7)',
                boxShadow: tab === t.id ? '0 4px 16px rgba(245,158,11,0.25)' : 'none',
              }}>
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
            {/* Group cards grid cu popup inline */}
            <div className="grid gap-5 grid-cols-1 sm:grid-cols-2">
              {(() => {
                const cols = gridCols;
                const chunks = [];
                for (let i = 0; i < standings.length; i += cols) {
                  chunks.push(standings.slice(i, i + cols));
                }
                return chunks.map((chunk, ci) => (
                  <React.Fragment key={ci}>
                    {chunk.map(s => (
                      <GroupCard
                        key={s.group}
                        group={s.group}
                        table={s.table}
                        selected={selectedGroup === s.group}
                        onSelect={() => setSelectedGroup(selectedGroup === s.group ? null : s.group)}
                      />
                    ))}
                    {chunk.some(s => s.group === selectedGroup) && (
                      <div key={selectedGroup} style={{ gridColumn: '1 / -1', background: 'rgba(8, 14, 28, 0.88)', backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '20px', padding: '28px 32px' }}
                        className="popup-enter">
                        <div className="flex items-center justify-between mb-6">
                          <span className="text-sm font-black uppercase tracking-widest flex items-center gap-3">
                            <span className="py-1 rounded-lg text-black" style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)', paddingLeft: '20px', paddingRight: '20px' }}>
                              {selectedGroup.replace('GROUP_', 'GROUP ')}
                            </span>
                            <span className="text-slate-400 font-semibold">Meciuri & Rezultate</span>
                          </span>
                          <button onClick={() => setSelectedGroup(null)}
                            className="text-slate-500 hover:text-slate-200 text-lg w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-800 transition-all">✕</button>
                        </div>
                        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                          {groupMatches.filter(m => m.group === selectedGroup).map(m => (
                            <MatchCard key={m.id} match={m} prediction={predictions[m.id]} />
                          ))}
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                ));
              })()}
            </div>
          </>
        )
      )}

      {/* FIXTURES TAB */}
      {tab === 'fixtures' && (
        <>
          <div className="flex justify-center" style={{ marginBottom: '36px' }}>
            <div className="flex gap-1 p-1.5 rounded-2xl" style={{ background: 'rgba(8,14,28,0.6)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)' }}>
              {[
                { id: 'live', label: `● Live${liveCount > 0 ? ` (${liveCount})` : ''}` },
                { id: 'upcoming', label: 'Urmează' },
                { id: 'finished', label: 'Terminate' },
              ].map(f => (
                <button key={f.id} onClick={() => setFilter(f.id)}
                  className="transition-all"
                  style={{
                    padding: '8px 24px',
                    fontSize: '11px',
                    fontWeight: 800,
                    letterSpacing: '0.15em',
                    borderRadius: '12px',
                    background: filter === f.id
                      ? f.id === 'live' ? '#22c55e' : 'linear-gradient(135deg, #f59e0b, #ef4444)'
                      : 'transparent',
                    color: filter === f.id ? '#000' : 'rgba(148,163,184,0.7)',
                    boxShadow: filter === f.id ? '0 4px 16px rgba(245,158,11,0.25)' : 'none',
                    whiteSpace: 'nowrap',
                  }}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {Object.keys(grouped).length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <div className="text-4xl mb-3">🔍</div>
              <p>Nu există meciuri pentru filtrul selectat</p>
            </div>
          ) : (
            Object.entries(grouped).map(([group, gMatches]) => (
              <div key={group} style={{ marginBottom: '60px' }}>
                <div className="flex items-center gap-4" style={{ marginBottom: '24px' }}>
                  <div className="flex-1" style={{ height: '2px', background: 'rgba(245,158,11,0.25)' }} />
                  <span style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: '20px',
                    letterSpacing: '0.15em',
                    color: '#000',
                    background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                    padding: '4px 20px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 16px rgba(245,158,11,0.3)',
                  }}>
                    {group.replace(/_/g, ' ')}
                  </span>
                  <div className="flex-1" style={{ height: '2px', background: 'rgba(245,158,11,0.25)' }} />
                </div>
                <div className="grid gap-5 sm:grid-cols-2" style={{ marginTop: '20px' }}>
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
