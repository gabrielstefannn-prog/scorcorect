// Mapare TLA (football-data.org) -> cod ISO 2 litere (pentru flagcdn.com)
const tlaToIso = {
  'MEX': 'mx', 'USA': 'us', 'CAN': 'ca', 'PAN': 'pa', 'HAI': 'ht', 'CUW': 'cw',
  'ARG': 'ar', 'BRA': 'br', 'COL': 'co', 'URU': 'uy', 'ECU': 'ec', 'PAR': 'py',
  'ESP': 'es', 'FRA': 'fr', 'GER': 'de', 'ENG': 'gb-eng', 'POR': 'pt', 'BEL': 'be',
  'NED': 'nl', 'CRO': 'hr', 'SUI': 'ch', 'AUT': 'at', 'NOR': 'no', 'CZE': 'cz',
  'TUR': 'tr', 'SCO': 'gb-sct', 'SWE': 'se', 'BIH': 'ba', 'ALG': 'dz',
  'JPN': 'jp', 'KOR': 'kr', 'KSA': 'sa', 'IRN': 'ir', 'AUS': 'au',
  'IRQ': 'iq', 'JOR': 'jo', 'UZB': 'uz', 'QAT': 'qa', 'NZL': 'nz',
  'MAR': 'ma', 'SEN': 'sn', 'EGY': 'eg', 'GHA': 'gh', 'RSA': 'za',
  'CIV': 'ci', 'TUN': 'tn', 'COD': 'cd', 'CPV': 'cv',
};

export default function FlagEmoji({ code, size = '32', className = '' }) {
  const iso = tlaToIso[code];
  if (!iso) return <span className={`text-2xl ${className}`}>🏳️</span>;

  const px = typeof size === 'string' && size.includes('text') ? '32' : size;

  return (
    <img
      src={`https://flagcdn.com/w${px}/${iso}.png`}
      srcSet={`https://flagcdn.com/w${parseInt(px) * 2}/${iso}.png 2x`}
      alt={code}
      className={`inline-block rounded-sm ${className}`}
      style={{ width: `${px}px`, height: `${Math.round(parseInt(px) * 0.67)}px`, objectFit: 'cover' }}
    />
  );
}
