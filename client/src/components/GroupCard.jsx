import FlagEmoji from './FlagEmoji';

export default function GroupCard({ group, table, selected, onSelect }) {
  const groupName = group ? group.replace('GROUP_', 'GROUP ') : '';

  return (
    <div
      onClick={onSelect}
      className="rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:scale-[1.01] hover:shadow-xl hover:shadow-black/40"
      style={{
        background: '#111827',
        border: selected ? '1px solid rgba(245,158,11,0.5)' : '1px solid rgba(255,255,255,0.08)',
        boxShadow: selected ? '0 0 24px rgba(245,158,11,0.12)' : 'none',
      }}
    >
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1a2540, #111827)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '12px 24px' }}
        className="flex items-center justify-between">
        <span className="text-sm font-black text-amber-400 tracking-[0.2em] uppercase">{groupName}</span>
        <div className="flex gap-3 text-xs font-bold text-slate-500 tracking-wider uppercase">
          <span className="w-4 text-center">W</span>
          <span className="w-4 text-center">D</span>
          <span className="w-4 text-center">L</span>
          <span className="w-6 text-right text-amber-500/60">Pts</span>
        </div>
      </div>

      {/* Team rows */}
      {(table || []).map((row, idx) => {
        const isTop = idx < 2;
        const isLast = idx === (table.length - 1);
        return (
          <div
            key={row.team.tla + idx}
            className={`flex items-center gap-3 ${!isLast ? 'border-b border-white/[0.05]' : ''}`}
            style={{
              background: isTop ? 'rgba(245,158,11,0.06)' : 'transparent',
              padding: '11px 24px',
            }}
          >
            <span className={`text-xs font-black w-4 shrink-0 ${isTop ? 'text-amber-500' : 'text-slate-700'}`}>
              {row.position}
            </span>
            <div className="shrink-0">
              <FlagEmoji code={row.team.tla} size="24" />
            </div>
            <span className={`flex-1 text-sm font-semibold truncate ${isTop ? 'text-slate-100' : 'text-slate-500'}`}>
              {row.team.shortName || row.team.name}
            </span>
            <div className="flex gap-3 text-sm shrink-0 text-slate-500">
              <span className="w-4 text-center">{row.won}</span>
              <span className="w-4 text-center">{row.draw}</span>
              <span className="w-4 text-center">{row.lost}</span>
              <span className={`w-6 text-right font-black ${isTop ? 'text-amber-400' : 'text-slate-500'}`}>
                {row.points}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
