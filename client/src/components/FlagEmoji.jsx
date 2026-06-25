// Convertește codul de țară în emoji de steag
const flagMap = {
  'MX': '🇲🇽', 'MA': '🇲🇦', 'US': '🇺🇸', 'CA': '🇨🇦',
  'AR': '🇦🇷', 'AL': '🇦🇱', 'UA': '🇺🇦', 'PE': '🇵🇪',
  'ES': '🇪🇸', 'CO': '🇨🇴', 'RS': '🇷🇸', 'HU': '🇭🇺',
  'FR': '🇫🇷', 'KE': '🇰🇪', 'PA': '🇵🇦', 'MR': '🇲🇷',
  'DE': '🇩🇪', 'SA': '🇸🇦', 'JP': '🇯🇵', 'BE': '🇧🇪',
  'PT': '🇵🇹', 'IQ': '🇮🇶', 'HR': '🇭🇷', 'CH': '🇨🇭',
  'BR': '🇧🇷', 'EC': '🇪🇨', 'AU': '🇦🇺', 'CM': '🇨🇲',
  'NL': '🇳🇱', 'SN': '🇸🇳', 'UY': '🇺🇾', 'AO': '🇦🇴',
  'GB-ENG': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'TN': '🇹🇳', 'CD': '🇨🇩',
  'ZA': '🇿🇦', 'IS': '🇮🇸', 'IR': '🇮🇷', 'CZ': '🇨🇿',
  'IT': '🇮🇹', 'NO': '🇳🇴', 'CI': '🇨🇮',
  'KR': '🇰🇷', 'GH': '🇬🇭', 'ZM': '🇿🇲',
};

export default function FlagEmoji({ code, size = 'text-2xl', className = '' }) {
  const flag = flagMap[code] || '🏳️';
  return <span className={`${size} ${className}`}>{flag}</span>;
}
