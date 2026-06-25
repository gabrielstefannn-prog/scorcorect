import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import FlagEmoji from './FlagEmoji';

const statusConfig = {
  SCHEDULED: { label: 'Programat', dot: 'bg-slate-500' },
  LIVE: { label: 'LIVE', dot: 'bg-green-400 animate-pulse' },
  FINISHED: { label: 'Final', dot: 'bg-slate-600' },
  CANCELLED: { label: 'Anulat', dot: 'bg-red-500' },
};

export default function MatchCard({ match, prediction }) {
  const status = statusConfig[match.status] || statusConfig.SCHEDULED;
  const matchDate = new Date(match.matchDate);
  const isLive = match.status === 'LIVE';
  const isFinished = match.status === 'FINISHED';
  const hasScore = match.homeScore !== null && match.awayScore !== null;

  return (
    <Link to={`/match/${match.id}`} className="block group">
      <div className={`rounded-2xl border transition-all duration-200 overflow-hidden
        ${isLive
          ? 'border-green-500/40 shadow-lg shadow-green-500/10 bg-slate-900'
          : 'border-slate-800/60 bg-slate-900/60 hover:bg-slate-800/60 hover:border-slate-700'}`}>

        {isLive && <div className="h-0.5 bg-gradient-to-r from-green-500 via-emerald-400 to-green-500" />}

        <div className="p-5">
          {/* Status + date */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
              <span className={`text-xs font-semibold ${isLive ? 'text-green-400' : 'text-slate-500'}`}>
                {status.label}
              </span>
            </div>
            {!isLive && !isFinished && (
              <span className="text-xs text-slate-500">
                {format(matchDate, 'EEE d MMM · HH:mm', { locale: ro })}
              </span>
            )}
          </div>

          {/* Teams + Score */}
          <div className="flex items-center gap-3">
            {/* Home */}
            <div className="flex-1 flex flex-col items-center gap-2">
              <FlagEmoji code={match.homeTeamCode} size="48" />
              <span className="text-sm font-semibold text-slate-200 text-center leading-tight">
                {match.homeTeam}
              </span>
            </div>

            {/* Score / VS */}
            <div className="flex flex-col items-center min-w-[64px]">
              {hasScore ? (
                <div className={`text-3xl font-black tracking-tight ${isLive ? 'text-green-400' : 'text-slate-100'}`}>
                  {match.homeScore}<span className="text-slate-600 mx-1">-</span>{match.awayScore}
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-2xl font-black text-slate-600">vs</div>
                  <div className="text-sm font-bold text-amber-400 mt-1">
                    {format(matchDate, 'HH:mm')}
                  </div>
                </div>
              )}
            </div>

            {/* Away */}
            <div className="flex-1 flex flex-col items-center gap-2">
              <FlagEmoji code={match.awayTeamCode} size="48" />
              <span className="text-sm font-semibold text-slate-200 text-center leading-tight">
                {match.awayTeam}
              </span>
            </div>
          </div>

          {/* Prediction */}
          {prediction?.predictedWinner && (
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-600">Pronosticul tău</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400">
                  {prediction.predictedHomeScore !== null
                    ? `${prediction.predictedHomeScore} - ${prediction.predictedAwayScore}`
                    : prediction.predictedWinner === 'HOME' ? match.homeTeam
                    : prediction.predictedWinner === 'AWAY' ? match.awayTeam
                    : 'Egal'}
                </span>
                {isFinished && prediction.points !== null && (
                  <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                    prediction.points === 3 ? 'bg-amber-500/20 text-amber-400' :
                    prediction.points === 1 ? 'bg-blue-500/20 text-blue-400' :
                    'bg-slate-800 text-slate-600'
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
