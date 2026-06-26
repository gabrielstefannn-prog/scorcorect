import FlagEmoji from '../components/FlagEmoji';

const glass = {
  background: 'rgba(8, 14, 28, 0.88)',
  backdropFilter: 'blur(2px)',
  WebkitBackdropFilter: 'blur(2px)',
};

const NORWAY = {
  name: 'Norway',
  code: 'NOR',
  color: '#CC0033',
  formation: '4-3-3',
  players: [
    { name: 'Ø. Nyland', number: 1 },
    { name: 'K. Ajer', number: 2 },
    { name: 'A. Hanche-Olsen', number: 4 },
    { name: 'L. Ostigard', number: 5 },
    { name: 'F. Bjørkan', number: 3 },
    { name: 'S. Berge', number: 6 },
    { name: 'M. Thorsby', number: 8 },
    { name: 'M. Ødegaard', number: 10, captain: true },
    { name: 'A. Nusa', number: 7 },
    { name: 'E. Haaland', number: 9, star: true },
    { name: 'A. Sørloth', number: 11 },
  ],
};

const FRANCE = {
  name: 'France',
  code: 'FRA',
  color: '#003189',
  formation: '4-3-3',
  players: [
    { name: 'M. Maignan', number: 1 },
    { name: 'J. Koundé', number: 5 },
    { name: 'W. Saliba', number: 17 },
    { name: 'D. Upamecano', number: 4 },
    { name: 'T. Hernandez', number: 22 },
    { name: 'A. Tchouaméni', number: 8 },
    { name: 'A. Rabiot', number: 14 },
    { name: 'A. Griezmann', number: 7 },
    { name: 'O. Dembélé', number: 11 },
    { name: 'K. Mbappé', number: 10, captain: true, star: true },
    { name: 'M. Thuram', number: 9 },
  ],
};

const HOME_433 = [
  { x: 0.50, y: 0.91 },
  { x: 0.82, y: 0.78 },
  { x: 0.62, y: 0.78 },
  { x: 0.38, y: 0.78 },
  { x: 0.18, y: 0.78 },
  { x: 0.75, y: 0.67 },
  { x: 0.50, y: 0.67 },
  { x: 0.25, y: 0.67 },
  { x: 0.82, y: 0.56 },
  { x: 0.50, y: 0.56 },
  { x: 0.18, y: 0.56 },
];

const AWAY_433 = HOME_433.map(p => ({ x: p.x, y: 1 - p.y }));

function PlayerDot({ player, color, pos, nameBelow = true }) {
  const photoUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=${color.slice(1)}&color=fff&size=80&bold=true&font-size=0.38&length=2`;

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
      gap: '3px',
    }}>
      {!nameBelow && (
        <div style={{
          fontSize: '10px',
          color: 'white',
          fontWeight: 800,
          textShadow: '0 1px 4px rgba(0,0,0,1), 0 0 8px rgba(0,0,0,0.9)',
          whiteSpace: 'nowrap',
          maxWidth: '62px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          textAlign: 'center',
        }}>
          {player.name}
        </div>
      )}

      <div style={{ position: 'relative' }}>
        {player.star && (
          <div style={{
            position: 'absolute', inset: '-3px', borderRadius: '50%',
            border: '2px solid #FFD700',
            boxShadow: '0 0 8px rgba(255,215,0,0.6)',
            zIndex: 1,
          }} />
        )}
        <img
          src={photoUrl}
          alt={player.name}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            border: `2px solid ${player.star ? '#FFD700' : 'rgba(255,255,255,0.9)'}`,
            display: 'block',
            position: 'relative',
            zIndex: 2,
          }}
        />
        {player.captain && (
          <div style={{
            position: 'absolute', top: '-4px', right: '-4px', zIndex: 3,
            background: '#FFD700',
            color: '#000',
            fontSize: '7px',
            fontWeight: 900,
            width: '13px',
            height: '13px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.5)',
          }}>C</div>
        )}
        <div style={{
          position: 'absolute', bottom: '-4px', left: '50%',
          transform: 'translateX(-50%)',
          background: color,
          color: 'white',
          fontSize: '7px',
          fontWeight: 900,
          minWidth: '14px',
          height: '14px',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 2px',
          border: '1px solid rgba(255,255,255,0.5)',
          zIndex: 3,
        }}>
          {player.number}
        </div>
      </div>

      {nameBelow && (
        <div style={{
          fontSize: '10px',
          color: 'white',
          fontWeight: 800,
          textShadow: '0 1px 4px rgba(0,0,0,1), 0 0 8px rgba(0,0,0,0.9)',
          whiteSpace: 'nowrap',
          maxWidth: '62px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          textAlign: 'center',
          marginTop: '4px',
        }}>
          {player.name}
        </div>
      )}
    </div>
  );
}

export default function LineupSimulation() {
  return (
    <div className="w-full max-w-sm mx-auto px-3 py-6">
      {/* Header */}
      <div className="text-center mb-5" style={{ ...glass, border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '16px 20px' }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '13px', letterSpacing: '0.2em', color: 'rgba(148,163,184,0.7)', marginBottom: '10px' }}>
          SIMULARE FORMAŢIE
        </div>
        <div className="flex items-center justify-center gap-4">
          <div className="flex flex-col items-center gap-1">
            <FlagEmoji code="NOR" size="36" />
            <span style={{ fontSize: '13px', fontWeight: 900, color: '#fff' }}>Norway</span>
            <span style={{ fontSize: '10px', color: NORWAY.color, fontWeight: 700 }}>{NORWAY.formation}</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span style={{ fontSize: '28px', fontWeight: 900, color: 'rgba(100,116,139,0.5)' }}>vs</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <FlagEmoji code="FRA" size="36" />
            <span style={{ fontSize: '13px', fontWeight: 900, color: '#fff' }}>France</span>
            <span style={{ fontSize: '10px', color: FRANCE.color, fontWeight: 700 }}>{FRANCE.formation}</span>
          </div>
        </div>
      </div>

      {/* Pitch */}
      <div style={{ position: 'relative', width: '100%', paddingBottom: '156%', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.6)' }}>
        {/* SVG Pitch */}
        <svg
          viewBox="0 0 320 500"
          preserveAspectRatio="none"
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        >
          {/* Grass stripes */}
          {Array.from({ length: 13 }).map((_, i) => (
            <rect key={i} x={0} y={i * 40} width={320} height={40}
              fill={i % 2 === 0 ? '#2d7a2d' : '#278827'} />
          ))}

          {/* Pitch border */}
          <rect x={12} y={12} width={296} height={476} fill="none"
            stroke="rgba(255,255,255,0.65)" strokeWidth={1.5} />

          {/* Center line */}
          <line x1={12} y1={250} x2={308} y2={250}
            stroke="rgba(255,255,255,0.65)" strokeWidth={1.5} />

          {/* Center circle */}
          <circle cx={160} cy={250} r={52} fill="none"
            stroke="rgba(255,255,255,0.65)" strokeWidth={1.5} />
          <circle cx={160} cy={250} r={3} fill="rgba(255,255,255,0.85)" />

          {/* TOP (France) */}
          <rect x={78} y={12} width={164} height={78} fill="none"
            stroke="rgba(255,255,255,0.65)" strokeWidth={1.5} />
          <rect x={116} y={12} width={88} height={30} fill="none"
            stroke="rgba(255,255,255,0.65)" strokeWidth={1.5} />
          <rect x={132} y={5} width={56} height={9} fill="rgba(0,0,0,0.2)"
            stroke="rgba(255,255,255,0.5)" strokeWidth={1} />
          <circle cx={160} cy={68} r={2.5} fill="rgba(255,255,255,0.85)" />
          <path d="M 92 90 A 48 48 0 0 1 228 90" fill="none"
            stroke="rgba(255,255,255,0.65)" strokeWidth={1.5} />

          {/* BOTTOM (Norway) */}
          <rect x={78} y={410} width={164} height={78} fill="none"
            stroke="rgba(255,255,255,0.65)" strokeWidth={1.5} />
          <rect x={116} y={458} width={88} height={30} fill="none"
            stroke="rgba(255,255,255,0.65)" strokeWidth={1.5} />
          <rect x={132} y={486} width={56} height={9} fill="rgba(0,0,0,0.2)"
            stroke="rgba(255,255,255,0.5)" strokeWidth={1} />
          <circle cx={160} cy={432} r={2.5} fill="rgba(255,255,255,0.85)" />
          <path d="M 92 410 A 48 48 0 0 0 228 410" fill="none"
            stroke="rgba(255,255,255,0.65)" strokeWidth={1.5} />

          {/* Corner arcs */}
          <path d="M 12 28 A 16 16 0 0 1 28 12" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth={1.5} />
          <path d="M 292 12 A 16 16 0 0 1 308 28" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth={1.5} />
          <path d="M 12 472 A 16 16 0 0 0 28 488" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth={1.5} />
          <path d="M 308 472 A 16 16 0 0 1 292 488" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth={1.5} />
        </svg>

        {/* Players layer */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
          {/* France (away, top) - name above */}
          {FRANCE.players.map((player, i) => (
            <PlayerDot key={`fra-${i}`} player={player} color={FRANCE.color}
              pos={AWAY_433[i]} nameBelow={false} />
          ))}
          {/* Norway (home, bottom) - name below */}
          {NORWAY.players.map((player, i) => (
            <PlayerDot key={`nor-${i}`} player={player} color={NORWAY.color}
              pos={HOME_433[i]} nameBelow={true} />
          ))}
        </div>

        {/* Team name labels on pitch */}
        <div style={{
          position: 'absolute', top: '6px', left: '50%',
          transform: 'translateX(-50%)',
          background: `${FRANCE.color}dd`, color: 'white',
          fontSize: '8px', fontWeight: 900, padding: '2px 10px',
          borderRadius: '4px', letterSpacing: '0.12em', zIndex: 20,
        }}>FRANCE</div>
        <div style={{
          position: 'absolute', bottom: '6px', left: '50%',
          transform: 'translateX(-50%)',
          background: `${NORWAY.color}dd`, color: 'white',
          fontSize: '8px', fontWeight: 900, padding: '2px 10px',
          borderRadius: '4px', letterSpacing: '0.12em', zIndex: 20,
        }}>NORWAY</div>
      </div>

      {/* Legend */}
      <div className="flex justify-between mt-4 px-1">
        <div className="flex items-center gap-2">
          <div style={{ width: 14, height: 14, borderRadius: '50%', background: FRANCE.color, border: '2px solid white' }} />
          <span className="text-xs text-slate-400">France</span>
          <span className="text-xs text-slate-600">— {FRANCE.formation}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-600">{NORWAY.formation} —</span>
          <span className="text-xs text-slate-400">Norway</span>
          <div style={{ width: 14, height: 14, borderRadius: '50%', background: NORWAY.color, border: '2px solid white' }} />
        </div>
      </div>
      <div className="flex justify-center gap-4 mt-3">
        <div className="flex items-center gap-1.5">
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FFD700', boxShadow: '0 0 6px rgba(255,215,0,0.6)' }} />
          <span className="text-xs text-slate-500">Star player</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FFD700', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '7px', fontWeight: 900, color: '#000' }}>C</div>
          <span className="text-xs text-slate-500">Căpitan</span>
        </div>
      </div>
    </div>
  );
}
