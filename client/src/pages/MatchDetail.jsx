import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import { matchesApi, predictionsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import FlagEmoji from '../components/FlagEmoji';
import LineupView from '../components/LineupView';

const MINUTES_BEFORE_LOCK = 10;

function canPredict(matchDate) {
  const lock = new Date(new Date(matchDate).getTime() - MINUTES_BEFORE_LOCK * 60000);
  return new Date() < lock;
}

const glass = {
  background: 'rgba(8, 14, 28, 0.88)',
  backdropFilter: 'blur(2px)',
  WebkitBackdropFilter: 'blur(2px)',
};

export default function MatchDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [match, setMatch] = useState(null);
  const [allPredictions, setAllPredictions] = useState([]);
  const [myPrediction, setMyPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('predict');

  const [predWinner, setPredWinner] = useState('');
  const [predHome, setPredHome] = useState('');
  const [predAway, setPredAway] = useState('');
  const [useExactScore, setUseExactScore] = useState(false);

  const [lineup, setLineup] = useState(null);
  const [lineupLoading, setLineupLoading] = useState(false);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [id]);

  const fetchData = async () => {
    try {
      const [matchRes, predRes] = await Promise.all([
        matchesApi.getById(id),
        predictionsApi.getByMatch(id),
      ]);
      setMatch(matchRes.data);
      setAllPredictions(predRes.data);
      const mine = predRes.data.find(p => p.userId === user.id);
      if (mine) {
        setMyPrediction(mine);
        setPredWinner(mine.predictedWinner || '');
        if (mine.predictedHomeScore !== null && mine.predictedHomeScore !== undefined) {
          setUseExactScore(true);
          setPredHome(mine.predictedHomeScore.toString());
          setPredAway(mine.predictedAwayScore.toString());
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadLineup = async () => {
    if (lineup !== null) return;
    setLineupLoading(true);
    try {
      const res = await matchesApi.getLineup(id);
      setLineup(res.data);
    } catch (e) {
      setLineup({ available: false });
    } finally {
      setLineupLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      const payload = {
        matchId: parseInt(id),
        predictedWinner: predWinner || null,
        predictedHomeScore: useExactScore && predHome !== '' ? parseInt(predHome) : null,
        predictedAwayScore: useExactScore && predAway !== '' ? parseInt(predAway) : null,
      };
      if (!payload.predictedWinner && payload.predictedHomeScore === null) {
        setError('Selectează câștigătoarea sau introdu un scor exact');
        setSaving(false);
        return;
      }
      await predictionsApi.upsert(payload);
      setSuccess('Pronostic salvat!');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Eroare la salvare');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-96">
      <div className="text-4xl animate-bounce">⚽</div>
    </div>
  );

  if (!match) return (
    <div className="text-center py-16 text-slate-500">Meciul nu a fost găsit</div>
  );

  const locked = !canPredict(match.matchDate);
  const isFinished = match.status === 'FINISHED';
  const isLive = match.status === 'LIVE';
  const isScheduled = match.status === 'SCHEDULED';
  const liveData = match.liveData;
  const events = liveData?.events || [];
  const lineups = liveData?.lineups || [];
  const statistics = liveData?.statistics || [];
  const goals = events.filter(e => e.type === 'Goal');

  return (
    <div className="w-full max-w-4xl px-4 py-6">
      {/* Back */}
      <button onClick={() => navigate('/')}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm mb-6 transition-colors">
        ← Înapoi la meciuri
      </button>

      {/* Match header */}
      <div className="rounded-2xl border overflow-hidden mb-6 relative"
        style={{
          ...glass,
          border: isLive ? '1px solid rgba(74,222,128,0.4)' : '1px solid rgba(255,255,255,0.08)',
          boxShadow: isLive ? '0 0 30px rgba(74,222,128,0.1)' : '0 4px 32px rgba(0,0,0,0.4)',
        }}>

        {/* Corner glow */}
        {isScheduled && (
          <div className="absolute inset-0 pointer-events-none rounded-2xl" style={{
            background: `
              radial-gradient(ellipse 90% 80% at 100% 0%, rgba(74,222,128,0.18) 0%, rgba(74,222,128,0.04) 50%, transparent 75%),
              radial-gradient(ellipse 90% 80% at 0% 100%, rgba(74,222,128,0.18) 0%, rgba(74,222,128,0.04) 50%, transparent 75%)
            `,
          }} />
        )}
        {isFinished && (
          <div className="absolute inset-0 pointer-events-none rounded-2xl" style={{
            background: `
              radial-gradient(ellipse 90% 80% at 100% 0%, rgba(239,68,68,0.22) 0%, rgba(239,68,68,0.05) 50%, transparent 75%),
              radial-gradient(ellipse 90% 80% at 0% 100%, rgba(239,68,68,0.22) 0%, rgba(239,68,68,0.05) 50%, transparent 75%)
            `,
          }} />
        )}

        {isLive && <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-green-500 via-emerald-400 to-green-500" />}

        <div className="relative p-6">
          {/* Group / round badge */}
          <div className="flex justify-center mb-5">
            <span style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: '16px',
              letterSpacing: '0.15em',
              color: '#000',
              background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
              padding: '3px 18px',
              borderRadius: '8px',
            }}>
              {(match.group || match.round || '').replace(/_/g, ' ')}
            </span>
          </div>

          {/* Teams */}
          <div className="flex items-center gap-4">
            {/* Home */}
            <div className="flex-1 flex flex-col items-center gap-3">
              <FlagEmoji code={match.homeTeamCode} size="72" />
              <p className="font-bold text-slate-100 text-sm sm:text-base text-center leading-tight">{match.homeTeam}</p>
            </div>

            {/* Score / Time */}
            <div className="flex flex-col items-center min-w-[110px]">
              {(isLive || isFinished) && match.homeScore !== null ? (
                <>
                  {isFinished && <span className="text-xs font-bold text-red-500 uppercase tracking-widest mb-1">Final</span>}
                  <div className={`text-5xl font-black tracking-tight ${isLive ? 'text-green-400' : 'text-white'}`}
                    style={{ textShadow: '0 0 20px rgba(255,255,255,0.1)' }}>
                    {match.homeScore}<span className="text-slate-600 mx-2">-</span>{match.awayScore}
                  </div>
                  {isLive && (
                    <div className="mt-2 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-xs font-bold text-green-400 tracking-widest">LIVE</span>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="text-3xl font-black text-slate-500 mb-1">vs</div>
                  <div className="text-2xl font-black text-amber-400" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.05em' }}>
                    {format(new Date(match.matchDate), 'HH:mm')}
                  </div>
                  <div className="text-xs text-slate-500 mt-1 font-medium">
                    {format(new Date(match.matchDate), 'EEE, d MMM', { locale: ro })}
                  </div>
                </>
              )}
            </div>

            {/* Away */}
            <div className="flex-1 flex flex-col items-center gap-3">
              <FlagEmoji code={match.awayTeamCode} size="72" />
              <p className="font-bold text-slate-100 text-sm sm:text-base text-center leading-tight">{match.awayTeam}</p>
            </div>
          </div>

          {/* Venue */}
          {match.venue && (
            <p className="text-center text-xs text-slate-600 mt-4">📍 {match.venue}</p>
          )}

          {/* Goals */}
          {goals.length > 0 && (
            <div className="mt-5 pt-4 border-t border-white/5 grid grid-cols-2 gap-x-4 text-xs">
              <div className="space-y-1 text-right">
                {goals.filter(g => g.team.name === match.homeTeam).map((g, i) => (
                  <div key={i} className="text-slate-300">⚽ {g.player.name} <span className="text-slate-500">{g.time.elapsed}'</span></div>
                ))}
              </div>
              <div className="space-y-1">
                {goals.filter(g => g.team.name === match.awayTeam).map((g, i) => (
                  <div key={i} className="text-slate-300">⚽ {g.player.name} <span className="text-slate-500">{g.time.elapsed}'</span></div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-center" style={{ marginTop: '28px', marginBottom: '28px' }}>
        <div className="flex gap-1 p-1.5 rounded-2xl" style={{ background: 'rgba(8,14,28,0.6)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)' }}>
          {[
            { id: 'predict', label: '🎯 Pronostic' },
            ...(isFinished ? [{ id: 'friends', label: `👥 Prieteni (${allPredictions.length})` }] : []),
            { id: 'lineup', label: '👕 Echipe', onClick: loadLineup },
            { id: 'stats', label: '📊 Statistici' },
          ].map(t => (
            <button key={t.id} onClick={() => { setActiveTab(t.id); t.onClick?.(); }}
              className="transition-all"
              style={{
                padding: '9px 22px',
                fontSize: '13px',
                fontWeight: 800,
                letterSpacing: '0.08em',
                borderRadius: '12px',
                background: activeTab === t.id ? 'linear-gradient(135deg, #f59e0b, #ef4444)' : 'transparent',
                color: activeTab === t.id ? '#000' : 'rgba(148,163,184,0.7)',
                boxShadow: activeTab === t.id ? '0 4px 16px rgba(245,158,11,0.25)' : 'none',
                whiteSpace: 'nowrap',
              }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab: Predict */}
      {activeTab === 'predict' && (
        <div style={{ maxWidth: '420px', margin: '0 auto' }}>
          {locked ? (
            <div className="rounded-2xl border p-6 text-center" style={{ ...glass, border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="text-4xl mb-3">🔒</div>
              <p className="text-slate-300 font-bold">Pronosticurile sunt închise</p>
              <p className="text-slate-500 text-sm mt-1">{isLive ? 'Meciul este în desfășurare' : 'Meciul a început sau s-a terminat'}</p>
              {myPrediction && (
                <div className="mt-5 pt-5 border-t border-white/5">
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-3">Pronosticul tău</p>
                  {myPrediction.predictedHomeScore !== null ? (
                    <p className="text-4xl font-black text-slate-100">
                      {myPrediction.predictedHomeScore} - {myPrediction.predictedAwayScore}
                    </p>
                  ) : (
                    <p className="text-slate-200 font-semibold text-lg">
                      {myPrediction.predictedWinner === 'HOME' ? match.homeTeam :
                       myPrediction.predictedWinner === 'AWAY' ? match.awayTeam : 'Egal'}
                    </p>
                  )}
                  {isFinished && myPrediction.points !== null && (
                    <div className={`mt-3 text-2xl font-black ${
                      myPrediction.points === 3 ? 'text-amber-400' :
                      myPrediction.points === 1 ? 'text-blue-400' : 'text-slate-500'
                    }`}>
                      {myPrediction.points} puncte
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Winner */}
              <div className="rounded-2xl border" style={{ ...glass, border: '1px solid rgba(255,255,255,0.08)', padding: '28px 24px' }}>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest text-center" style={{ marginBottom: '32px' }}>
                  Câștigătoarea meciului <span className="text-amber-500/70 ml-1">1 punct</span>
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'HOME', label: match.homeTeam, code: match.homeTeamCode },
                    { value: 'DRAW', label: 'Egal', code: null },
                    { value: 'AWAY', label: match.awayTeam, code: match.awayTeamCode },
                  ].map(opt => (
                    <button type="button" key={opt.value}
                      onClick={() => setPredWinner(predWinner === opt.value ? '' : opt.value)}
                      className="transition-all"
                      style={{
                        padding: '20px 8px',
                        borderRadius: '14px',
                        border: predWinner === opt.value
                          ? '2px solid rgba(245,158,11,0.8)'
                          : '1px solid rgba(255,255,255,0.07)',
                        background: predWinner === opt.value
                          ? 'rgba(245,158,11,0.15)'
                          : 'rgba(255,255,255,0.03)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: predWinner === opt.value
                          ? '0 0 20px rgba(245,158,11,0.15)' : 'none',
                      }}>
                      {opt.code && <FlagEmoji code={opt.code} size="32" />}
                      {opt.value === 'DRAW' && <span className="text-3xl">🤝</span>}
                      <span className="text-xs font-semibold text-slate-300 text-center leading-tight">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3" style={{ margin: '12px 0' }}>
                <div className="flex-1" style={{ height: '4px', background: 'rgba(255,255,255,0.6)', borderRadius: '2px', boxShadow: '0 0 8px rgba(0,0,0,0.8), 0 0 3px rgba(0,0,0,0.9)' }} />
                <span className="text-sm font-black tracking-widest" style={{ color: '#ffffff', textShadow: '0 0 6px rgba(0,0,0,0.9), 0 0 12px rgba(0,0,0,0.6)' }}>ȘI</span>
                <div className="flex-1" style={{ height: '4px', background: 'rgba(255,255,255,0.6)', borderRadius: '2px', boxShadow: '0 0 8px rgba(0,0,0,0.8), 0 0 3px rgba(0,0,0,0.9)' }} />
              </div>

              {/* Exact score */}
              <div className="rounded-2xl border" style={{ ...glass, border: '1px solid rgba(255,255,255,0.08)', padding: '28px 24px' }}>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest text-center mb-5">
                  Scor exact <span className="text-amber-500/70 ml-1">3 puncte</span>
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 text-center">
                    <div className="flex flex-col items-center gap-1 mb-3">
                      <FlagEmoji code={match.homeTeamCode} size="32" />
                      <p className="text-xs text-slate-500 font-medium">{match.homeTeam}</p>
                    </div>
                    <input type="number" min="0" max="20"
                      value={predHome}
                      onChange={e => { setPredHome(e.target.value); setUseExactScore(true); }}
                      className="w-full text-center text-3xl font-black py-3 rounded-xl text-slate-100 focus:outline-none"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '2px solid rgba(245,158,11,0.3)' }}
                      placeholder="0" />
                  </div>
                  <span className="text-3xl font-black text-slate-600" style={{ marginTop: '36px' }}>-</span>
                  <div className="flex-1 text-center">
                    <div className="flex flex-col items-center gap-1 mb-3">
                      <FlagEmoji code={match.awayTeamCode} size="32" />
                      <p className="text-xs text-slate-500 font-medium">{match.awayTeam}</p>
                    </div>
                    <input type="number" min="0" max="20"
                      value={predAway}
                      onChange={e => { setPredAway(e.target.value); setUseExactScore(true); }}
                      className="w-full text-center text-3xl font-black py-3 rounded-xl text-slate-100 focus:outline-none"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '2px solid rgba(245,158,11,0.3)' }}
                      placeholder="0" />
                  </div>
                </div>
              </div>

              {error && <div className="rounded-xl px-4 py-3 text-red-400 text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>{error}</div>}
              {success && (
                <div className="flex items-center justify-center gap-2 font-black text-base" style={{ color: '#4ade80', textShadow: '0 0 8px rgba(0,0,0,0.9), 0 0 16px rgba(0,0,0,0.6)' }}>
                  <span style={{ fontSize: '20px' }}>✓</span> {success}
                </div>
              )}

              <button type="submit" disabled={saving}
                className="w-full rounded-xl font-black text-black tracking-wider transition-all disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)', boxShadow: '0 4px 20px rgba(245,158,11,0.3)', padding: '16px', fontSize: '16px' }}>
                {saving ? 'Se salvează...' : myPrediction ? '✏️ Actualizează pronosticul' : '🎯 Salvează pronosticul'}
              </button>

              <p className="text-center text-xs font-semibold" style={{ color: '#b91c1c' }}>
                !! Pronosticurile se închid cu 10 minute înainte de meci !!
              </p>
            </form>
          )}
        </div>
      )}

      {/* Tab: Friends */}
      {activeTab === 'friends' && (
        <div className="space-y-2">
          {allPredictions.length === 0 ? (
            <div className="text-center py-8 text-slate-500">Nimeni nu a pus pronostic încă</div>
          ) : (
            allPredictions.map(p => (
              <div key={p.id} className="flex items-center justify-between rounded-xl px-4 py-3"
                style={{ ...glass, border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm"
                    style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' }}>
                    {p.user.username[0].toUpperCase()}
                  </div>
                  <span className={`font-semibold text-sm ${p.userId === user.id ? 'text-amber-400' : 'text-slate-200'}`}>
                    {p.user.username} {p.userId === user.id && <span className="text-xs text-amber-500/60">(tu)</span>}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {p.predictedWinner !== null ? (
                    <div className="text-right">
                      {p.predictedHomeScore !== null ? (
                        <span className="font-black text-slate-200 text-lg">
                          {p.predictedHomeScore} - {p.predictedAwayScore}
                        </span>
                      ) : (
                        <span className="text-sm text-slate-400 font-semibold">
                          {p.predictedWinner === 'HOME' ? match.homeTeam :
                           p.predictedWinner === 'AWAY' ? match.awayTeam : 'Egal'}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-600 italic">ascuns până la start</span>
                  )}
                  {isFinished && p.points !== null && (
                    <span className={`text-sm font-black px-2 py-0.5 rounded-lg ${
                      p.points === 3 ? 'text-amber-400 bg-amber-500/10' :
                      p.points === 1 ? 'text-blue-400 bg-blue-500/10' :
                      'text-slate-600 bg-slate-800/50'
                    }`}>
                      {p.points}pt
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab: Lineup */}
      {activeTab === 'lineup' && (
        <div className="flex justify-center">
          {lineupLoading ? (
            <div className="text-center py-10 text-slate-500">
              <div className="text-3xl mb-3 animate-bounce">⚽</div>
              <p className="text-sm">Se încarcă formația...</p>
            </div>
          ) : !lineup || !lineup.available ? (
            <div className="text-center py-10 text-slate-500">
              <div className="text-3xl mb-3">👕</div>
              <p className="font-medium text-slate-400">Formația nu este disponibilă încă</p>
              <p className="text-xs mt-1 text-slate-600">Va apărea în ziua meciului</p>
            </div>
          ) : (
            <LineupView home={lineup.home} away={lineup.away} />
          )}
        </div>
      )}

      {/* Tab: Stats */}
      {activeTab === 'stats' && (
        <div>
          {statistics.length < 2 ? (
            <div className="text-center py-10 text-slate-500">
              <div className="text-3xl mb-3">📊</div>
              <p className="font-medium">Statisticile nu sunt disponibile încă</p>
            </div>
          ) : (
            <div className="space-y-3">
              {statistics[0]?.statistics?.map((stat, i) => {
                const homeStat = stat.value ?? 0;
                const awayStat = statistics[1]?.statistics?.[i]?.value ?? 0;
                const homeNum = parseInt(homeStat) || 0;
                const awayNum = parseInt(awayStat) || 0;
                const total = homeNum + awayNum;
                return (
                  <div key={i} className="rounded-xl border p-4"
                    style={{ ...glass, border: '1px solid rgba(255,255,255,0.07)' }}>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="font-black text-slate-200">{homeStat}</span>
                      <span className="text-xs text-slate-500 font-semibold tracking-wider uppercase">{stat.type}</span>
                      <span className="font-black text-slate-200">{awayStat}</span>
                    </div>
                    {total > 0 && (
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <div className="h-full rounded-l-full" style={{ width: `${(homeNum / total) * 100}%`, background: 'linear-gradient(90deg, #f59e0b, #ef4444)' }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
