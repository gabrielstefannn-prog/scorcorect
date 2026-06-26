import FlagEmoji from './FlagEmoji';

export default function GroupCard({ group, table, selected, onSelect }) {
  const groupName = group ? group.replace('GROUP_', 'GROUP ') : '';

  return (
    <div
      onClick={onSelect}
      className="rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:scale-[1.01]"
      style={{
        background: 'rgba(8, 14, 28, 0.88)',
        backdropFilter: 'blur(2px)',
        WebkitBackdropFilter: 'blur(2px)',
        border: selected ? '2px solid rgba(245,158,11,0.8)' : '1px solid rgba(255,255,255,0.1)',
        boxShadow: selected ? '0 0 30px rgba(245,158,11,0.15)' : '0 4px 24px rgba(0,0,0,0.4)',
      }}
    >
      {/* Header */}
      <div style={{ background: 'rgba(245,158,11,0.1)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '14px 20px' }}
        className="flex items-center">
        <span className="flex-1 text-sm font-black text-amber-400 tracking-[0.2em] uppercase">{groupName}</span>
        <div className="flex text-[11px] font-bold text-slate-400 tracking-wider uppercase shrink-0" style={{ gap: '16px' }}>
          <span style={{ width: '16px', textAlign: 'center' }}>W</span>
          <span style={{ width: '16px', textAlign: 'center' }}>D</span>
          <span style={{ width: '16px', textAlign: 'center' }}>L</span>
          <span style={{ minWidth: '28px', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>Pts</span>
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
              padding: '12px 20px',
            }}
          >
            <span className={`text-xs font-black w-3 shrink-0 ${isTop ? 'text-amber-500' : 'text-slate-500'}`}>
              {row.position}
            </span>
            <div className="shrink-0">
              <FlagEmoji code={row.team.tla} size="24" />
            </div>
            <span className={`flex-1 text-xs sm:text-sm font-semibold truncate ${isTop ? 'text-slate-100' : 'text-slate-400'}`}>
              {row.team.shortName || row.team.name}
            </span>
            <div className="flex text-sm shrink-0 font-bold" style={{ gap: '16px' }}>
              <span className="w-4 text-center" style={{ color: row.won > 0 ? '#4ade80' : '#94a3b8' }}>{row.won}</span>
              <span className="w-4 text-center" style={{ color: row.draw > 0 ? '#facc15' : '#94a3b8' }}>{row.draw}</span>
              <span className="w-4 text-center" style={{ color: row.lost > 0 ? '#f87171' : '#94a3b8' }}>{row.lost}</span>
              <span style={{
                minWidth: '28px',
                textAlign: 'center',
                fontSize: '15px',
                fontWeight: 900,
                color: '#ffffff',
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '6px',
                padding: '1px 6px',
              }}>
                {row.points}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
