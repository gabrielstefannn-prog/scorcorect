import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import { matchesApi, predictionsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import FlagEmoji from '../components/FlagEmoji';

const MINUTES_BEFORE_LOCK = 10;

function canPredict(matchDate) {
  const lock = new Date(new Date(matchDate).getTime() - MINUTES_BEFORE_LOCK * 60000);
  return new Date() < lock;
}

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

  // Form state
  const [predWinner, setPredWinner] = useState('');
  const [predHome, setPredHome] = useState('');
  const [predAway, setPredAway] = useState('');
  const [useExactScore, setUseExactScore] = useState(false);

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

      if (!payload.predictedWinner && !useExactScore) {
        setError('Selectează o opțiune sau introdu un scor');
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
  const liveData = match.liveData;
  const events = liveData?.events || [];
  const lineups = liveData?.lineups || [];
  const statistics = liveData?.statistics || [];

  const goals = events.filter(e => e.type === 'Goal');
  const cards = events.filter(e => e.type === 'Card');

  return (
    <div className="w-full max-w-4xl px-4 py-6">
      {/* Back */}
      <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm mb-6 transition-colors">
        ← Înapoi la meciuri
      </button>

      {/* Match header */}
      <div className={`rounded-2xl border p-6 mb-6 relative overflow-hidden
        ${isLive ? 'border-green-500/40' : 'border-slate-800'} bg-slate-900`}>

        {isLive && <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-green-500 to-emerald-400 animate-pulse" />}

        <div className="text-center mb-2">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">{match.group || match.round}</span>
          {match.venue && <p className="text-xs text-slate-600 mt-0.5">📍 {match.venue}</p>}
        </div>

        <div className="flex items-center gap-4 mt-4">
          {/* Home */}
          <div className="flex-1 text-center">
            <FlagEmoji code={match.homeTeamCode} size="64" className="mb-2 block" />
            <p className="font-bold text-slate-100 text-sm sm:text-base">{match.homeTeam}</p>
          </div>

          {/* Score/Time */}
          <div className="text-center min-w-[100px]">
            {(isLive || isFinished) && match.homeScore !== null ? (
              <>
                <div className={`text-4xl font-black ${isLive ? 'text-green-400' : 'text-slate-100'}`}>
                  {match.homeScore} - {match.awayScore}
                </div>
                {isLive && (
                  <div className="mt-1 text-xs font-bold text-green-400 flex items-center justify-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
                    LIVE
                  </div>
                )}
                {isFinished && <div className="text-xs text-slate-500 mt-1">Final</div>}
              </>
            ) : (
              <>
                <div className="text-2xl font-bold text-slate-400">vs</div>
                <div className="text-sm font-bold text-amber-400 mt-1">
                  {format(new Date(match.matchDate), 'HH:mm')}
                </div>
                <div className="text-xs text-slate-600 mt-0.5">
                  {format(new Date(match.matchDate), 'EEE, d MMM', { locale: ro })}
                </div>
              </>
            )}
          </div>

          {/* Away */}
          <div className="flex-1 text-center">
            <FlagEmoji code={match.awayTeamCode} size="64" className="mb-2 block" />
            <p className="font-bold text-slate-100 text-sm sm:text-base">{match.awayTeam}</p>
          </div>
        </div>

        {/* Goal events */}
        {goals.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-2 gap-x-4 text-xs">
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

      {/* Tabs */}
      <div className="flex border-b border-slate-800 mb-6 gap-1">
        {[
          { id: 'predict', label: '🎯 Pronostic' },
          { id: 'friends', label: `👥 Prieteni (${allPredictions.length})` },
          { id: 'lineup', label: '👕 Echipe' },
          { id: 'stats', label: '📊 Statistici' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px ${
              activeTab === t.id
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'predict' && (
        <div className="max-w-md mx-auto">
          {locked ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">🔒</div>
              <p className="text-slate-400 font-medium">Pronosticurile sunt închise</p>
              <p className="text-slate-600 text-sm mt-1">Meciul {isLive ? 'este în desfășurare' : 'a început sau s-a terminat'}</p>
              {myPrediction && (
                <div className="mt-6 bg-slate-800/50 rounded-xl p-4 text-left">
                  <p className="text-xs text-slate-500 uppercase font-bold mb-2">Pronosticul tău</p>
                  {myPrediction.predictedHomeScore !== null ? (
                    <p className="text-2xl font-black text-slate-100 text-center">
                      {myPrediction.predictedHomeScore} - {myPrediction.predictedAwayScore}
                    </p>
                  ) : (
                    <p className="text-slate-300 text-center font-semibold">
                      {myPrediction.predictedWinner === 'HOME' ? match.homeTeam :
                       myPrediction.predictedWinner === 'AWAY' ? match.awayTeam : 'Egal'}
                    </p>
                  )}
                  {isFinished && myPrediction.points !== null && (
                    <div className={`mt-3 text-center text-lg font-black ${
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
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Câștigătoarea meciului (1 punct)
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'HOME', label: match.homeTeam, code: match.homeTeamCode },
                    { value: 'DRAW', label: 'Egal', code: null },
                    { value: 'AWAY', label: match.awayTeam, code: match.awayTeamCode },
                  ].map(opt => (
                    <button
                      type="button"
                      key={opt.value}
                      onClick={() => {
                        setPredWinner(opt.value);
                        if (useExactScore) setUseExactScore(false);
                      }}
                      className={`py-3 px-2 rounded-xl border-2 transition-all text-center ${
                        predWinner === opt.value && !useExactScore
                          ? 'border-amber-500 bg-amber-500/20 text-amber-300'
                          : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-500'
                      }`}
                    >
                      {opt.code && <FlagEmoji code={opt.code} size="28" className="block mb-1" />}
                      {opt.value === 'DRAW' && <span className="text-2xl block mb-1">🤝</span>}
                      <span className="text-xs font-medium leading-tight">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-800" />
                <span className="text-xs text-slate-600 font-medium">SAU</span>
                <div className="flex-1 h-px bg-slate-800" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Scor exact (3 puncte)
                  </p>
                  <button
                    type="button"
                    onClick={() => { setUseExactScore(!useExactScore); setPredWinner(''); }}
                    className={`relative w-11 h-6 rounded-full transition-all ${useExactScore ? 'bg-amber-500' : 'bg-slate-700'}`}
                  >
                    <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${useExactScore ? 'translate-x-5' : ''}`} />
                  </button>
                </div>

                {useExactScore && (
                  <div className="flex items-center gap-3">
                    <div className="flex-1 text-center">
                      <p className="text-xs text-slate-500 mb-1">{match.homeTeam}</p>
                      <input
                        type="number" min="0" max="20"
                        value={predHome}
                        onChange={e => setPredHome(e.target.value)}
                        className="w-full text-center text-2xl font-bold py-3 bg-slate-800 border-2 border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-amber-500"
                        placeholder="0"
                      />
                    </div>
                    <span className="text-2xl font-bold text-slate-500">-</span>
                    <div className="flex-1 text-center">
                      <p className="text-xs text-slate-500 mb-1">{match.awayTeam}</p>
                      <input
                        type="number" min="0" max="20"
                        value={predAway}
                        onChange={e => setPredAway(e.target.value)}
                        className="w-full text-center text-2xl font-bold py-3 bg-slate-800 border-2 border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-amber-500"
                        placeholder="0"
                      />
                    </div>
                  </div>
                )}
              </div>

              {error && <div className="bg-red-900/30 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">{error}</div>}
              {success && <div className="bg-green-900/30 border border-green-500/30 rounded-lg px-4 py-3 text-green-400 text-sm">{success}</div>}

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 rounded-xl font-bold text-black transition-all disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}
              >
                {saving ? 'Se salvează...' : myPrediction ? '✏️ Actualizează pronosticul' : '🎯 Salvează pronosticul'}
              </button>

              <p className="text-center text-xs text-slate-600">
                Pronosticurile se închid cu 10 minute înainte de meci
              </p>
            </form>
          )}
        </div>
      )}

      {activeTab === 'friends' && (
        <div className="space-y-2">
          {allPredictions.length === 0 ? (
            <div className="text-center py-8 text-slate-500">Nimeni nu a pus pronostic încă</div>
          ) : (
            allPredictions.map(p => (
              <div key={p.id} className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-xl px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-sm">
                    {p.user.username[0].toUpperCase()}
                  </div>
                  <span className={`font-medium text-sm ${p.userId === user.id ? 'text-amber-400' : 'text-slate-200'}`}>
                    {p.user.username} {p.userId === user.id && '(tu)'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {p.predictedWinner !== null ? (
                    <div className="text-right">
                      {p.predictedHomeScore !== null ? (
                        <span className="font-mono font-bold text-slate-200">
                          {p.predictedHomeScore} - {p.predictedAwayScore}
                        </span>
                      ) : (
                        <span className="text-sm text-slate-400">
                          {p.predictedWinner === 'HOME' ? match.homeTeam :
                           p.predictedWinner === 'AWAY' ? match.awayTeam : 'Egal'}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-600 italic">ascuns până la start</span>
                  )}
                  {isFinished && p.points !== null && (
                    <span className={`text-sm font-black w-10 text-right ${
                      p.points === 3 ? 'text-amber-400' :
                      p.points === 1 ? 'text-blue-400' : 'text-slate-600'
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

      {activeTab === 'lineup' && (
        <div>
          {lineups.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <div className="text-3xl mb-2">👕</div>
              <p>Echipele de start nu sunt disponibile încă</p>
              <p className="text-xs mt-1">Vor apărea cu ~1 oră înainte de meci</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-6">
              {lineups.map(team => (
                <div key={team.team.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <FlagEmoji code={match.homeTeam === team.team.name ? match.homeTeamCode : match.awayTeamCode} size="24" />
                    <h3 className="font-bold text-slate-200">{team.team.name}</h3>
                    <span className="text-xs text-slate-500 ml-auto">{team.formation}</span>
                  </div>
                  <div className="space-y-1.5">
                    {team.startXI?.map((p, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <span className="w-6 text-center text-xs font-bold text-slate-500">{p.player.number}</span>
                        <span className={`${i === 0 ? 'font-bold text-amber-400' : 'text-slate-300'}`}>{p.player.name}</span>
                        <span className="ml-auto text-xs text-slate-600">{p.player.pos}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'stats' && (
        <div>
          {statistics.length < 2 ? (
            <div className="text-center py-8 text-slate-500">
              <div className="text-3xl mb-2">📊</div>
              <p>Statisticile nu sunt disponibile încă</p>
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
                  <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="font-semibold text-slate-200">{homeStat}</span>
                      <span className="text-xs text-slate-500 font-medium">{stat.type}</span>
                      <span className="font-semibold text-slate-200">{awayStat}</span>
                    </div>
                    {total > 0 && (
                      <div className="h-1.5 rounded-full bg-slate-800 flex overflow-hidden">
                        <div className="bg-amber-500 rounded-l-full" style={{ width: `${(homeNum / total) * 100}%` }} />
                        <div className="bg-blue-500 rounded-r-full" style={{ width: `${(awayNum / total) * 100}%` }} />
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
