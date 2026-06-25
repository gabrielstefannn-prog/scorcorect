const flagMap = {
  // TLA codes (football-data.org)
  'MEX': '🇲🇽', 'USA': '🇺🇸', 'CAN': '🇨🇦', 'PAN': '🇵🇦', 'HAI': '🇭🇹', 'CUW': '🇨🇼',
  'ARG': '🇦🇷', 'BRA': '🇧🇷', 'COL': '🇨🇴', 'URU': '🇺🇾', 'ECU': '🇪🇨', 'PAR': '🇵🇾',
  'ESP': '🇪🇸', 'FRA': '🇫🇷', 'GER': '🇩🇪', 'ENG': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'POR': '🇵🇹', 'BEL': '🇧🇪',
  'NED': '🇳🇱', 'CRO': '🇭🇷', 'SUI': '🇨🇭', 'AUT': '🇦🇹', 'NOR': '🇳🇴', 'CZE': '🇨🇿',
  'TUR': '🇹🇷', 'SCO': '🏴󠁧󠁢󠁳󠁣󠁴󠁿', 'SWE': '🇸🇪', 'BIH': '🇧🇦', 'ALG': '🇩🇿',
  'JPN': '🇯🇵', 'KOR': '🇰🇷', 'KSA': '🇸🇦', 'IRN': '🇮🇷', 'AUS': '🇦🇺',
  'IRQ': '🇮🇶', 'JOR': '🇯🇴', 'UZB': '🇺🇿', 'QAT': '🇶🇦', 'NZL': '🇳🇿',
  'MAR': '🇲🇦', 'SEN': '🇸🇳', 'EGY': '🇪🇬', 'GHA': '🇬🇭', 'RSA': '🇿🇦',
  'CIV': '🇨🇮', 'TUN': '🇹🇳', 'COD': '🇨🇩', 'CPV': '🇨🇻',
};

export default function FlagEmoji({ code, size = 'text-2xl', className = '' }) {
  const flag = flagMap[code] || '🏳️';
  return <span className={`${size} ${className}`}>{flag}</span>;
}
