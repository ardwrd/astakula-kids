export type IconKind = 'color' | 'trace' | 'memory' | 'count' | 'letters' | 'quiz' | 'vowel-colors' | 'dice-match' | 'connect-dots' | 'number-paint' | 'veggie-baskets'

export function ActivityArt({ kind }: { kind: IconKind }) {
  const base = { stroke: 'currentColor', strokeWidth: 3.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  return <span className={'activity-art art-' + kind} aria-hidden="true">
    <svg viewBox="0 0 80 80" width="76" height="76" fill="none" focusable="false">
      {kind === 'color' && <>
        <path d="M21 20 L48 20 L53 38 L31 60 L16 45 Z" {...base}/>
        <path d="M27 29 L43 29 M24 37 L39 37" {...base}/>
        <circle cx="57" cy="56" r="9" fill="#FFC23E" stroke="currentColor" strokeWidth="3"/>
        <circle cx="61" cy="26" r="5" fill="#FF6D73"/>
      </>}
      {kind === 'trace' && <>
        <path d="M17 60 L17 24 L32 24" strokeDasharray="3 8" {...base} />
        <path d="M46 62 L57 16 L65 20 L54 66 Z" fill="#FFDE89" {...base}/>
        <path d="M53 24 L63 28" {...base}/>
        <path d="M22 61 H37" {...base}/>
      </>}
      {kind === 'memory' && <>
        <rect x="10" y="14" width="27" height="36" rx="6" fill="#D3EEFD" {...base}/>
        <rect x="44" y="30" width="27" height="36" rx="6" fill="#FFE6B5" {...base}/>
        <path d="M23 29 L27 35 L20 40 L16 33 Z" fill="#6FD1A0" />
        <path d="M57 43 L61 49 L54 54 L50 47 Z" fill="#6FD1A0" />
      </>}
      {kind === 'count' && <>
        <circle cx="23" cy="27" r="11" fill="#FFDA65" {...base}/>
        <circle cx="54" cy="28" r="11" fill="#FF8F89" {...base}/>
        <circle cx="23" cy="58" r="11" fill="#7AC8EC" {...base}/>
        <circle cx="54" cy="57" r="11" fill="#7FD4AD" {...base}/>
      </>}
      {kind === 'letters' && <>
        <rect x="8" y="18" width="30" height="41" rx="5" fill="#D4ECFF" {...base}/>
        <rect x="43" y="18" width="30" height="41" rx="5" fill="#FDE4A6" {...base}/>
        <text x="23" y="47" fontSize="22" fontWeight="900" fill="#305468" textAnchor="middle" stroke="none">A</text>
        <text x="58" y="47" fontSize="22" fontWeight="900" fill="#705535" textAnchor="middle" stroke="none">B</text>
      </>}
      {kind === 'vowel-colors' && <>
        <rect x="9" y="16" width="29" height="45" rx="6" fill="#FF9F9F" {...base}/>
        <rect x="44" y="16" width="29" height="45" rx="6" fill="#91CAF5" {...base}/>
        <text x="23" y="48" fontSize="27" textAnchor="middle" fontWeight="900" fill="#253448" stroke="none">a</text>
        <text x="58" y="48" fontSize="27" textAnchor="middle" fontWeight="900" fill="#253448" stroke="none">i</text>
      </>}
      {kind === 'dice-match' && <>
        <rect x="15" y="8" width="50" height="50" rx="11" fill="#FFF" {...base}/>
        <circle cx="28" cy="22" r="5" fill="#253448"/><circle cx="52" cy="22" r="5" fill="#253448"/>
        <circle cx="28" cy="45" r="5" fill="#253448"/><circle cx="52" cy="45" r="5" fill="#253448"/>
        <text x="40" y="76" fontSize="16" textAnchor="middle" fontWeight="900" fill="#253448" stroke="none">4</text>
      </>}
      {kind === 'connect-dots' && <>
        <path d="M19 21 L58 23 L28 58 L62 62" {...base}/>
        <circle cx="19" cy="21" r="9" fill="#FF8A88" {...base}/>
        <circle cx="58" cy="23" r="9" fill="#FFE175" {...base}/>
        <circle cx="28" cy="58" r="9" fill="#75CF9F" {...base}/>
        <circle cx="62" cy="62" r="9" fill="#83BBF3" {...base}/>
      </>}
      {kind === 'number-paint' && <>
        <rect x="11" y="10" width="27" height="27" rx="4" fill="#FF9A8F" {...base}/>
        <rect x="42" y="10" width="27" height="27" rx="4" fill="#FFC66F" {...base}/>
        <rect x="11" y="41" width="27" height="27" rx="4" fill="#8BD9B4" {...base}/>
        <rect x="42" y="41" width="27" height="27" rx="4" fill="#83C9F7" {...base}/>
      </>}
      {kind === 'veggie-baskets' && <>
        <path d="M14 39 L66 39 L59 67 H21 Z" fill="#F5C685" {...base}/>
        <path d="M29 38 L22 20 M40 38 L49 11 M53 38 L61 19" {...base}/>
        <circle cx="23" cy="19" r="9" fill="#F98479" {...base}/>
        <circle cx="49" cy="13" r="9" fill="#A48DDD" {...base}/>
        <path d="M58 20 L68 11" stroke="#4EB883" strokeWidth="7" strokeLinecap="round"/>
      </>}
      {kind === 'quiz' && <>
        <rect x="13" y="11" width="54" height="58" rx="11" fill="#E5F2FF" {...base}/>
        <path d="M31 30 H53 M31 43 H48 M31 56 H44" {...base}/>
        <circle cx="23" cy="30" r="3" fill="#FF7F75"/>
        <circle cx="23" cy="43" r="3" fill="#FFC94F"/>
        <circle cx="23" cy="56" r="3" fill="#65BE98"/>
      </>}
    </svg>
  </span>
}
