import FlagEmoji from './FlagEmoji';

const X_MAP = {
  1: [0.5],
  2: [0.28, 0.72],
  3: [0.18, 0.5, 0.82],
  4: [0.14, 0.38, 0.62, 0.86],
  5: [0.1, 0.3, 0.5, 0.7, 0.9],
  6: [0.1, 0.26, 0.42, 0.58, 0.74, 0.9],
};

function buildPositions(formation, side) {
  const lines = formation ? formation.split('-').map(Number) : [4, 3, 3];
  const nLines = lines.length;
  const isHome = side === 'home';

  const gkY = isHome ? 0.91 : 0.09;
  const firstLineY = isHome ? 0.78 : 0.22;
  const lastLineY = isHome ? 0.56 : 0.44;
  const step = nLines > 1 ? (lastLineY - firstLineY) / (nLines - 1) : 0;

  const positions = [{ x: 0.5, y: gkY }];

  lines.forEach((count, i) => {
    const y = nLines === 1 ? firstLineY : firstLineY + i * step;
    const xs = X_MAP[Math.min(count, 6)] || X_MAP[4];
    xs.forEach(x => positions.push({ x, y }));
  });

  return positions;
}

function PlayerDot({ player, color, pos, nameAbove }) {
  const lastName = player.name ? player.name.split(' ').pop() : '';

  return (
    <div style={{
      position: 'absolute',
      left: `${pos.x * 100}%`,
      top: `${pos.y * 100}%`,
      transform: 'translate(-50%, -50%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      zIndex: 10,
      width: '48px',
    }}>
      {nameAbove && (
        <div style={{
          fontSize: '15px', color: 'white', fontWeight: 800,
          textShadow: '0 1px 4px rgba(0,0,0,1)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          maxWidth: '54px', textAlign: 'center', marginBottom: '3px',
        }}>{lastName}</div>
      )}

      <div style={{
        width: '30px', height: '30px', borderRadius: '50%',
        background: color,
        border: '2.5px solid rgba(255,255,255,0.9)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '10px', fontWeight: 900, color: 'white',
        boxShadow: '0 2px 8px rgba(0,0,0,0.6)',
        flexShrink: 0,
      }}>
        {player.shirtNumber}
      </div>

      {!nameAbove && (
        <div style={{
          fontSize: '15px', color: 'white', fontWeight: 800,
          textShadow: '0 1px 4px rgba(0,0,0,1)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          maxWidth: '48px', textAlign: 'center', marginTop: '3px',
        }}>{lastName}</div>
      )}
    </div>
  );
}

export default function LineupView({ home, away }) {
  const homePositions = buildPositions(home.formation, 'home');
  const awayPositions = buildPositions(away.formation, 'away');

  return (
    <div style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}>
      {/* Formation header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', padding: '0 4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <FlagEmoji code={home.code} size="20" />
          <span style={{ fontSize: '13px', fontWeight: 800, color: '#e2e8f0' }}>{home.name}</span>
          <span style={{ fontSize: '11px', color: '#dc2626', fontWeight: 700 }}>{home.formation}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '11px', color: '#2563eb', fontWeight: 700 }}>{away.formation}</span>
          <span style={{ fontSize: '13px', fontWeight: 800, color: '#e2e8f0' }}>{away.name}</span>
          <FlagEmoji code={away.code} size="20" />
        </div>
      </div>

      {/* Pitch */}
      <div style={{
        position: 'relative', width: '100%', paddingBottom: '155%',
        borderRadius: '12px', overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.7)',
      }}>
        <svg viewBox="0 0 320 496" preserveAspectRatio="none"
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
          {Array.from({ length: 13 }).map((_, i) => (
            <rect key={i} x={0} y={i * 40} width={320} height={40}
              fill={i % 2 === 0 ? '#2d7a2d' : '#268827'} />
          ))}
          <rect x={12} y={12} width={296} height={472} fill="none"
            stroke="rgba(255,255,255,0.65)" strokeWidth={1.5} />
          <line x1={12} y1={248} x2={308} y2={248}
            stroke="rgba(255,255,255,0.65)" strokeWidth={1.5} />
          <circle cx={160} cy={248} r={50} fill="none"
            stroke="rgba(255,255,255,0.65)" strokeWidth={1.5} />
          <circle cx={160} cy={248} r={3} fill="rgba(255,255,255,0.85)" />
          {/* Top (away) */}
          <rect x={78} y={12} width={164} height={78} fill="none"
            stroke="rgba(255,255,255,0.65)" strokeWidth={1.5} />
          <rect x={116} y={12} width={88} height={30} fill="none"
            stroke="rgba(255,255,255,0.65)" strokeWidth={1.5} />
          <rect x={132} y={5} width={56} height={9} fill="rgba(0,0,0,0.25)"
            stroke="rgba(255,255,255,0.5)" strokeWidth={1} />
          <circle cx={160} cy={66} r={2.5} fill="rgba(255,255,255,0.85)" />
          <path d="M 92 90 A 46 46 0 0 1 228 90" fill="none"
            stroke="rgba(255,255,255,0.65)" strokeWidth={1.5} />
          {/* Bottom (home) */}
          <rect x={78} y={406} width={164} height={78} fill="none"
            stroke="rgba(255,255,255,0.65)" strokeWidth={1.5} />
          <rect x={116} y={454} width={88} height={30} fill="none"
            stroke="rgba(255,255,255,0.65)" strokeWidth={1.5} />
          <rect x={132} y={482} width={56} height={9} fill="rgba(0,0,0,0.25)"
            stroke="rgba(255,255,255,0.5)" strokeWidth={1} />
          <circle cx={160} cy={430} r={2.5} fill="rgba(255,255,255,0.85)" />
          <path d="M 92 406 A 46 46 0 0 0 228 406" fill="none"
            stroke="rgba(255,255,255,0.65)" strokeWidth={1.5} />
          {/* Corner arcs */}
          <path d="M 12 28 A 16 16 0 0 1 28 12" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth={1.5} />
          <path d="M 292 12 A 16 16 0 0 1 308 28" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth={1.5} />
          <path d="M 12 468 A 16 16 0 0 0 28 484" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth={1.5} />
          <path d="M 308 468 A 16 16 0 0 1 292 484" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth={1.5} />
        </svg>

        {/* Players overlay */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
          {away.players.map((player, i) => {
            const pos = awayPositions[i];
            if (!pos) return null;
            return <PlayerDot key={`away-${i}`} player={player} color="#1d4ed8" pos={pos} nameAbove={true} />;
          })}
          {home.players.map((player, i) => {
            const pos = homePositions[i];
            if (!pos) return null;
            return <PlayerDot key={`home-${i}`} player={player} color="#b91c1c" pos={pos} nameAbove={false} />;
          })}
        </div>

        {/* Team labels */}
        <div style={{
          position: 'absolute', top: '7px', left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(29,78,216,0.85)', color: 'white',
          fontSize: '8px', fontWeight: 900, padding: '2px 10px',
          borderRadius: '4px', letterSpacing: '0.1em', zIndex: 20, whiteSpace: 'nowrap',
        }}>{away.name.toUpperCase()}</div>
        <div style={{
          position: 'absolute', bottom: '7px', left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(185,28,28,0.85)', color: 'white',
          fontSize: '8px', fontWeight: 900, padding: '2px 10px',
          borderRadius: '4px', letterSpacing: '0.1em', zIndex: 20, whiteSpace: 'nowrap',
        }}>{home.name.toUpperCase()}</div>
      </div>

      {/* Bench */}
      {(home.bench?.length > 0 || away.bench?.length > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px' }}>
          {[
            { team: home, color: '#b91c1c' },
            { team: away, color: '#1d4ed8' },
          ].map(({ team, color }) => (
            <div key={team.name}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, flexShrink: 0 }} />
                <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Rezerve
                </span>
              </div>
              {team.bench.slice(0, 7).map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ fontSize: '10px', color: '#475569', width: '16px', textAlign: 'center', fontWeight: 700 }}>{p.shirtNumber}</span>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>{p.name}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
