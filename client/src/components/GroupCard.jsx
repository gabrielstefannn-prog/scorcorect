import FlagEmoji from './FlagEmoji';

export default function GroupCard({ group, table, selected, onSelect }) {
  const groupName = group ? group.replace('GROUP_', 'GROUP ') : '';

  return (
    <div
      onClick={onSelect}
      className="rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-xl hover:shadow-black/40"
      style={{ background: '#111827', border: selected ? '1px solid rgba(245,158,11,0.5)' : '1px solid rgba(255,255,255,0.08)', boxShadow: selected ? '0 0 20px rgba(245,158,11,0.1)' : 'none' }}
    >
      {/* Header */}
      <div className="px-4 py-2.5 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #1a2540, #111827)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <span className="text-xs font-black text-amber-400 tracking-[0.15em] uppercase">{groupName}</span>
        <div className="flex gap-2.5 text-[10px] font-bold text-slate-600 tracking-wider uppercase">
          <span>W</span><span>D</span><span>L</span><span className="w-5 text-right text-amber-500/70">Pts</span>
        </div>
      </div>

      {/* Team rows */}
      {(table || []).map((row, idx) => {
        const isTop = idx < 2;
        const isLast = idx === (table.length - 1);
        return (
          <div
            key={row.team.tla + idx}
            className={`flex items-center px-3 py-2 gap-2 ${!isLast ? 'border-b border-white/[0.05]' : ''}`}
            style={{ background: isTop ? 'rgba(245,158,11,0.06)' : 'transparent' }}
          >
            <span className={`text-[10px] font-black w-3 shrink-0 ${isTop ? 'text-amber-500' : 'text-slate-700'}`}>
              {row.position}
            </span>
            <div className="shrink-0">
              <FlagEmoji code={row.team.tla} size="18" />
            </div>
            <span className={`flex-1 text-xs font-semibold truncate ${isTop ? 'text-slate-100' : 'text-slate-500'}`}>
              {row.team.shortName || row.team.name}
            </span>
            <div className="flex gap-2.5 text-[11px] shrink-0 text-slate-600">
              <span className="w-3 text-center">{row.won}</span>
              <span className="w-3 text-center">{row.draw}</span>
              <span className="w-3 text-center">{row.lost}</span>
              <span className={`w-5 text-right font-black text-xs ${isTop ? 'text-amber-400' : 'text-slate-500'}`}>
                {row.points}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
