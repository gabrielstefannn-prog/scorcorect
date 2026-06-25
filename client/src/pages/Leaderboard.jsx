import { useState, useEffect } from 'react';
import { leaderboardApi, predictionsApi, matchesApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const medals = ['🥇', '🥈', '🥉'];

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userPredictions, setUserPredictions] = useState([]);
  const [matches, setMatches] = useState({});
  const { user } = useAuth();

  useEffect(() => {
    Promise.all([leaderboardApi.get(), matchesApi.getAll()])
      .then(([lbRes, matchRes]) => {
        setLeaderboard(lbRes.data);
        const matchMap = {};
        matchRes.data.forEach(m => { matchMap[m.id] = m; });
        setMatches(matchMap);
      })
      .finally(() => setLoading(false));
  }, []);

  const loadUserPredictions = async (userId) => {
    if (selectedUser === userId) { setSelectedUser(null); return; }
    setSelectedUser(userId);
    try {
      const res = await predictionsApi.getByUser(userId);
      setUserPredictions(res.data);
    } catch (e) { console.error(e); }
  };

  const myRank = leaderboard.findIndex(u => u.id === user?.id) + 1;

  if (loading) return (
    <div className="flex items-center justify-center min-h-96">
      <div className="text-4xl animate-bounce">🏆</div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-100">🏆 Clasament</h1>
        {myRank > 0 && (
          <p className="text-slate-500 text-sm mt-1">
            Tu ești pe locul <span className="text-amber-400 font-bold">#{myRank}</span>
          </p>
        )}
      </div>

      {/* Podium top 3 */}
      {leaderboard.length >= 3 && (
        <div className="flex items-end justify-center gap-3 mb-8">
          {[leaderboard[1], leaderboard[0], leaderboard[2]].map((entry, idx) => {
            const actualPos = idx === 0 ? 1 : idx === 1 ? 0 : 2;
            const heights = ['h-24', 'h-32', 'h-20'];
            return (
              <div key={entry.id} className="flex-1 flex flex-col items-center">
                <div className="text-2xl mb-1">{medals[actualPos]}</div>
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg mb-2"
                  style={{ background: actualPos === 0 ? 'linear-gradient(135deg, #f59e0b, #ef4444)' : 'rgba(100,116,139,0.3)', color: actualPos === 0 ? 'black' : '#94a3b8' }}>
                  {entry.username[0].toUpperCase()}
                </div>
                <div className="text-xs font-medium text-slate-300 mb-1 truncate max-w-[80px] text-center">{entry.username}</div>
                <div className={`w-full ${heights[idx]} rounded-t-xl flex items-end justify-center pb-2`}
                  style={{ background: actualPos === 0 ? 'linear-gradient(to top, #92400e, #78350f)' : 'rgba(30,41,59,0.8)' }}>
                  <span className="font-black text-xl text-amber-400">{entry.totalPoints}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full leaderboard */}
      <div className="space-y-2">
        {leaderboard.map((entry, idx) => (
          <div key={entry.id}>
            <button
              onClick={() => loadUserPredictions(entry.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl border transition-all text-left
                ${entry.id === user?.id ? 'border-amber-500/30 bg-amber-500/5' : 'border-slate-800 bg-slate-900/50 hover:bg-slate-800/50'}
                ${selectedUser === entry.id ? 'rounded-b-none border-b-0' : ''}`}
            >
              <div className="w-8 text-center">
                {idx < 3 ? (
                  <span className="text-xl">{medals[idx]}</span>
                ) : (
                  <span className="text-slate-500 font-bold text-sm">#{idx + 1}</span>
                )}
              </div>

              <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold shrink-0"
                style={{ background: entry.id === user?.id ? 'linear-gradient(135deg, #f59e0b, #ef4444)' : 'rgba(100,116,139,0.2)', color: entry.id === user?.id ? 'black' : '#94a3b8' }}>
                {entry.username[0].toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <p className={`font-semibold truncate ${entry.id === user?.id ? 'text-amber-400' : 'text-slate-200'}`}>
                  {entry.username} {entry.id === user?.id && '(tu)'}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {entry.exactScores}x scor exact • {entry.correctWinners}x câștigătoare
                </p>
              </div>

              <div className="text-right shrink-0">
                <div className="text-xl font-black text-amber-400">{entry.totalPoints}</div>
                <div className="text-xs text-slate-600">puncte</div>
              </div>

              <span className="text-slate-600 text-xs">{selectedUser === entry.id ? '▲' : '▼'}</span>
            </button>

            {/* User predictions dropdown */}
            {selectedUser === entry.id && (
              <div className="border border-t-0 border-slate-800 rounded-b-xl bg-slate-900/30 divide-y divide-slate-800/50">
                {userPredictions.length === 0 ? (
                  <p className="text-center text-slate-600 text-sm py-4">Niciun pronostic</p>
                ) : userPredictions.filter(p => matches[p.matchId]?.status === 'FINISHED').map(p => {
                  const m = matches[p.matchId];
                  if (!m) return null;
                  return (
                    <div key={p.id} className="flex items-center gap-3 px-4 py-2 text-sm">
                      <span className="text-xs text-slate-600 w-20 shrink-0 truncate">{m.homeTeam.split(' ')[0]}</span>
                      <span className="font-mono text-slate-400 text-xs">{m.homeScore}-{m.awayScore}</span>
                      <span className="text-xs text-slate-600 w-20 shrink-0">{m.awayTeam.split(' ')[0]}</span>
                      <div className="ml-auto flex items-center gap-2">
                        <span className="text-xs text-slate-500">
                          {p.predictedHomeScore !== null ? `${p.predictedHomeScore}-${p.predictedAwayScore}` :
                           p.predictedWinner === 'HOME' ? m.homeTeam.split(' ')[0] :
                           p.predictedWinner === 'AWAY' ? m.awayTeam.split(' ')[0] : 'Egal'}
                        </span>
                        <span className={`text-xs font-black w-8 text-right ${
                          p.points === 3 ? 'text-amber-400' :
                          p.points === 1 ? 'text-blue-400' : 'text-slate-600'
                        }`}>{p.points}pt</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {leaderboard.length === 0 && (
        <div className="text-center py-16 text-slate-500">
          <div className="text-4xl mb-3">🏆</div>
          <p>Niciun jucător în clasament încă</p>
        </div>
      )}
    </div>
  );
}
