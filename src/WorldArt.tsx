import { AnimalIcon } from './AnimalIcon'

export function WorldArt({ id }: { id: string }) {
  if (id === 'hewan') return <span className="world-art"><AnimalIcon id="kucing" size={62} /></span>
  return <span className="world-art" aria-hidden="true">
    {id === 'warna' && <svg viewBox="0 0 100 70" role="presentation">
      <circle cx="27" cy="28" r="20" fill="#eb605c"/>
      <circle cx="67" cy="28" r="20" fill="#5598dd"/>
      <circle cx="47" cy="51" r="20" fill="#f5cb4c" stroke="#faf8f4" strokeWidth="3"/>
    </svg>}
    {id === 'bentuk' && <svg viewBox="0 0 100 70" role="presentation">
      <circle cx="26" cy="34" r="18" fill="#acd3c8" stroke="#49786c" strokeWidth="2.5"/>
      <path d="M 73 13 L 96 55 L 50 55 Z" fill="#f4c66d" stroke="#ad8040" strokeWidth="2.5" strokeLinejoin="round"/>
    </svg>}
    {id === 'angka' && <svg viewBox="0 0 100 70" role="presentation">
      <text x="10" y="53" fontSize="40" fontWeight="800" fill="#286f65">1</text>
      <text x="37" y="44" fontSize="34" fontWeight="800" fill="#bd8b4b">2</text>
      <text x="67" y="58" fontSize="38" fontWeight="800" fill="#6384ab">3</text>
    </svg>}
    {id === 'huruf' && <svg viewBox="0 0 100 70" role="presentation">
      <text x="8" y="54" fontSize="45" fontWeight="800" fill="#6b779c">A</text>
      <text x="47" y="51" fontSize="36" fontWeight="800" fill="#9267a5">B</text>
    </svg>}
  </span>
}
