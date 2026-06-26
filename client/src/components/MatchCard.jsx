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
          background: 'rgba(8, 14, 28, 0.88)',
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)',
        }}>

        {/* Decorative pitch lines - doar LIVE */}
        {isLive && (
          <div className="absolute inset-0 opacity-5 pointer-events-none" style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 30px, rgba(255,255,255,0.3) 30px, rgba(255,255,255,0.3) 31px)',
            backgroundSize: '100% 31px',
          }} />
        )}
        {isLive && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border border-white/5 pointer-events-none" />
        )}

        {isLive && <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-green-500 via-emerald-400 to-green-500" />}

        {/* Corner glow effect */}
        {isFinished && (
          <div className="absolute inset-0 pointer-events-none rounded-2xl" style={{
            background: `
              radial-gradient(ellipse 90% 80% at 100% 0%, rgba(239,68,68,0.35) 0%, rgba(239,68,68,0.08) 50%, transparent 75%),
              radial-gradient(ellipse 90% 80% at 0% 100%, rgba(239,68,68,0.35) 0%, rgba(239,68,68,0.08) 50%, transparent 75%)
            `,
          }} />
        )}
        {isScheduled && (
          <div className="absolute inset-0 pointer-events-none rounded-2xl" style={{
            background: `
              radial-gradient(ellipse 90% 80% at 100% 0%, rgba(74,222,128,0.30) 0%, rgba(74,222,128,0.07) 50%, transparent 75%),
              radial-gradient(ellipse 90% 80% at 0% 100%, rgba(74,222,128,0.30) 0%, rgba(74,222,128,0.07) 50%, transparent 75%)
            `,
          }} />
        )}

        <div className="relative" style={{ padding: '10px 36px 16px' }}>
          {/* Status - doar LIVE */}
          {isLive && (
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs font-semibold text-green-400">LIVE</span>
            </div>
          )}

          {/* Teams + Score */}
          <div className="flex items-center gap-3">
            {/* Home */}
            <div className="flex-1 flex flex-col items-center gap-2" style={{ paddingLeft: '12px', minWidth: 0 }}>
              <FlagEmoji code={match.homeTeamCode} size="48" />
              <span className="text-base font-semibold text-slate-200 text-center leading-tight"
                style={{ maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {match.homeTeam}
              </span>
            </div>

            {/* Score / VS */}
            <div className="flex flex-col items-center min-w-[72px]" style={{ alignSelf: 'flex-start', paddingTop: '0px' }}>
              {hasScore ? (
                <div className="flex flex-col items-center">
                  {isFinished && (
                    <span className="text-xs font-bold text-red-500 uppercase tracking-widest mb-1">Final</span>
                  )}
                  <div className={`text-4xl font-black tracking-tight ${isLive ? 'text-green-400' : 'text-white'}`}>
                    {match.homeScore}<span className="text-slate-600 mx-1">-</span>{match.awayScore}
                  </div>
                  {isFinished && (
                    <span className="text-sm text-slate-500 mt-1">
                      {format(matchDate, 'd MMM · HH:mm', { locale: ro })}
                    </span>
                  )}
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
            <div className="flex-1 flex flex-col items-center gap-2" style={{ paddingRight: '12px', minWidth: 0 }}>
              <FlagEmoji code={match.awayTeamCode} size="48" />
              <span className="text-base font-semibold text-slate-200 text-center leading-tight"
                style={{ maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {match.awayTeam}
              </span>
            </div>
          </div>

          {/* Prediction */}
          {prediction?.predictedWinner && (
            <div className="border-t border-white/5 flex flex-col items-center gap-0.5" style={{ marginTop: '14px', paddingTop: '14px' }}>
              <span className="text-[10px] text-slate-600 uppercase tracking-wider font-semibold">Pronosticul tău</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-slate-300">
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
