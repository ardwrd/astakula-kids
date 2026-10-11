export type IconKind = 'color' | 'trace' | 'memory' | 'count' | 'letters' | 'quiz'

export function ActivityArt({ kind }: { kind: IconKind }) {
  const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 3.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  return <span className={'activity-art art-' + kind} aria-hidden="true">
    <svg viewBox="0 0 80 80" width="76" height="76" focusable="false">
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
