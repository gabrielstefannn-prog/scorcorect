import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import FlagEmoji from './FlagEmoji';

const statusConfig = {
  SCHEDULED: { label: 'Programat', color: 'text-slate-400', bg: 'bg-slate-800' },
  LIVE: { label: '● LIVE', color: 'text-green-400', bg: 'bg-green-900/30' },
  FINISHED: { label: 'Final', color: 'text-slate-500', bg: 'bg-slate-900' },
  CANCELLED: { label: 'Anulat', color: 'text-red-400', bg: 'bg-red-900/20' },
};

export default function MatchCard({ match, prediction }) {
  const status = statusConfig[match.status] || statusConfig.SCHEDULED;
  const matchDate = new Date(match.matchDate);
  const isLive = match.status === 'LIVE';
  const isFinished = match.status === 'FINISHED';

  const hasPrediction = prediction?.predictedWinner;
  const predCorrect = isFinished && prediction?.points > 0;

  return (
    <Link to={`/match/${match.id}`} className="block group">
      <div className={`relative rounded-xl border transition-all duration-200 overflow-hidden
        ${isLive ? 'border-green-500/50 shadow-lg shadow-green-500/10' : 'border-slate-800 hover:border-slate-600'}
        bg-slate-900/80 hover:bg-slate-800/80`}>

        {isLive && (
          <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-green-500 via-emerald-400 to-green-500 animate-pulse" />
        )}

        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-amber-400/80">{match.group || match.round}</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${status.bg} ${status.color}`}>
              {status.label}
            </span>
          </div>

          {/* Teams + Score */}
          <div className="flex items-center gap-3">
            {/* Home team */}
            <div className="flex-1 flex items-center gap-2 justify-end">
              <span className="text-sm font-semibold text-slate-200 text-right leading-tight">{match.homeTeam}</span>
              <FlagEmoji code={match.homeTeamCode} size="40" />
            </div>

            {/* Score / Time */}
            <div className="flex flex-col items-center min-w-[70px]">
              {(isLive || isFinished) && match.homeScore !== null ? (
                <div className={`text-2xl font-bold ${isLive ? 'text-green-400' : 'text-slate-100'}`}>
                  {match.homeScore} - {match.awayScore}
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-lg font-bold text-slate-300">vs</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {format(matchDate, 'HH:mm', { locale: ro })}
                  </div>
                </div>
              )}
              <div className="text-xs text-slate-600 mt-1">
                {format(matchDate, 'd MMM', { locale: ro })}
              </div>
            </div>

            {/* Away team */}
            <div className="flex-1 flex items-center gap-2">
              <FlagEmoji code={match.awayTeamCode} size="40" />
              <span className="text-sm font-semibold text-slate-200 leading-tight">{match.awayTeam}</span>
            </div>
          </div>

          {/* Prediction badge */}
          {hasPrediction && (
            <div className={`mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs`}>
              <span className="text-slate-500">Pronosticul tău:</span>
              <div className="flex items-center gap-2">
                {prediction.predictedHomeScore !== null ? (
                  <span className="font-mono font-bold text-slate-300">
                    {prediction.predictedHomeScore} - {prediction.predictedAwayScore}
                  </span>
                ) : (
                  <span className="text-slate-400">
                    {prediction.predictedWinner === 'HOME' ? match.homeTeam :
                     prediction.predictedWinner === 'AWAY' ? match.awayTeam : 'Egal'}
                  </span>
                )}
                {isFinished && (
                  <span className={`font-bold px-1.5 py-0.5 rounded ${
                    prediction.points === 3 ? 'bg-amber-500/20 text-amber-400' :
                    prediction.points === 1 ? 'bg-blue-500/20 text-blue-400' :
                    'bg-red-500/10 text-red-400'
                  }`}>
                    {prediction.points}pt
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
