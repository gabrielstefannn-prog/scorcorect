import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import FlagEmoji from './FlagEmoji';

const statusConfig = {
  SCHEDULED: { label: 'Programat', color: 'text-slate-500', dot: 'bg-slate-600' },
  LIVE: { label: 'LIVE', color: 'text-green-400', dot: 'bg-green-400 animate-pulse' },
  FINISHED: { label: 'Final', color: 'text-slate-500', dot: 'bg-slate-600' },
  CANCELLED: { label: 'Anulat', color: 'text-red-400', dot: 'bg-red-500' },
};

export default function MatchCard({ match, prediction }) {
  const status = statusConfig[match.status] || statusConfig.SCHEDULED;
  const matchDate = new Date(match.matchDate);
  const isLive = match.status === 'LIVE';
  const isFinished = match.status === 'FINISHED';
  const isScheduled = match.status === 'SCHEDULED';
  const hasScore = match.homeScore !== null && match.awayScore !== null;

  return (
    <Link to={`/match/${match.id}`} className="block group">
      <div className={`relative rounded-2xl border overflow-hidden transition-all duration-200
        ${isLive
          ? 'border-green-500/50 shadow-lg shadow-green-500/10'
          : 'border-slate-700/50 hover:border-slate-600/70'}`}
        style={{
          background: isScheduled
            ? 'linear-gradient(135deg, #0d1f12 0%, #0f172a 40%, #0d1b2a 100%)'
            : isLive
            ? 'linear-gradient(135deg, #052e16 0%, #0f172a 50%, #0d1b2a 100%)'
            : 'linear-gradient(135deg, #0f172a 0%, #111827 100%)',
        }}>

        {/* Decorative pitch lines */}
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{
          backgroundImage: isScheduled || isLive
            ? 'repeating-linear-gradient(0deg, transparent, transparent 30px, rgba(255,255,255,0.3) 30px, rgba(255,255,255,0.3) 31px)'
            : 'none',
          backgroundSize: '100% 31px',
        }} />

        {/* Center circle decoration */}
        {(isScheduled || isLive) && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border border-white/5 pointer-events-none" />
        )}

        {isLive && <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-green-500 via-emerald-400 to-green-500" />}

        <div className="relative p-5">
          {/* Status */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
              <span className={`text-xs font-semibold ${status.color}`}>{status.label}</span>
            </div>
            {isFinished && hasScore && (
              <span className="text-xs text-slate-600">Terminat</span>
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
            <div className="flex flex-col items-center min-w-[72px]">
              {hasScore ? (
                <div className={`text-3xl font-black tracking-tight ${isLive ? 'text-green-400' : 'text-white'}`}>
                  {match.homeScore}<span className="text-slate-600 mx-1">-</span>{match.awayScore}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-xs font-medium text-slate-400">
                    {format(matchDate, 'EEE d MMM', { locale: ro })}
                  </span>
                  <span className="text-xl font-black text-slate-600">vs</span>
                  <span className="text-base font-bold text-amber-400">
                    {format(matchDate, 'HH:mm')}
                  </span>
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
            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
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
