import type { ReactNode } from 'react'

interface AnimalIconProps { id: string; size?: number }
const ink = '#354947'
const line = { stroke: ink, strokeWidth: 3.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

export function AnimalIcon({ id, size = 90 }: AnimalIconProps) {
  const shapes: Record<string, ReactNode> = {
    kucing: <>
      <path d="M19 41 L17 17 L36 27 Q50 20 64 27 L83 17 L81 41 Q89 53 83 68 Q75 85 50 85 Q25 85 17 68 Q11 53 19 41 Z" fill="#efc993" {...line}/>
      <path d="M23 26 L31 31 L22 36 Z M77 26 L69 31 L78 36 Z" fill="#e4a4a2"/>
      <circle cx="36" cy="54" r="3.5" fill={ink}/><circle cx="64" cy="54" r="3.5" fill={ink}/>
      <path d="M46 65 L54 65 L50 70 Z M50 70 Q45 75 41 71 M50 70 Q55 75 59 71 M25 65 H37 M63 65 H75" fill="none" {...line}/>
    </>,
    sapi: <>
      <path d="M22 22 L15 14 L22 11 L34 22 M78 22 L85 14 L78 11 L66 22" fill="#ceb79d" {...line}/>
      <path d="M23 39 L9 30 L12 47 L23 51 M77 39 L91 30 L88 47 L77 51" fill="#ead6c2" {...line}/>
      <path d="M24 26 Q50 16 76 26 Q87 42 78 71 Q68 87 50 87 Q32 87 22 71 Q13 42 24 26 Z" fill="#f7f6ef" {...line}/>
      <path d="M26 33 Q40 21 49 33 L40 49 L25 48 Z M71 26 Q82 32 80 51 L63 47 L61 36 Z" fill="#88949a"/>
      <circle cx="37" cy="55" r="3" fill={ink}/><circle cx="63" cy="55" r="3" fill={ink}/>
      <ellipse cx="50" cy="72" rx="21" ry="13" fill="#e6b9b3" {...line}/>
      <ellipse cx="43" cy="71" rx="2.5" ry="3" fill="#98675d"/><ellipse cx="57" cy="71" rx="2.5" ry="3" fill="#98675d"/>
    </>,
    ayam: <>
      <path d="M40 26 Q32 13 40 11 Q50 8 51 20 Q60 9 69 15 Q75 25 62 32" fill="#d87062" {...line}/>
      <path d="M26 48 Q19 23 43 26 Q68 19 78 42 Q92 58 77 76 Q60 90 36 82 Q16 76 26 48 Z" fill="#efd7a0" {...line}/>
      <path d="M26 51 L13 57 L26 64" fill="#df9962" {...line}/>
      <circle cx="52" cy="49" r="4" fill={ink}/>
      <path d="M37 65 Q52 77 68 66" fill="none" {...line}/>
    </>,
    ikan: <>
      <path d="M68 45 L91 26 L91 74 Z" fill="#7eadd1" {...line}/>
      <path d="M15 50 Q34 19 66 31 Q78 39 78 50 Q78 61 66 69 Q34 81 15 50 Z" fill="#8ec2d8" {...line}/>
      <path d="M34 31 L46 19 L56 34 M38 67 L47 81 L57 66" fill="#8ec2d8" {...line}/>
      <circle cx="33" cy="45" r="4" fill={ink}/>
      <path d="M19 55 Q24 60 29 58" fill="none" {...line}/>
    </>,
    burung: <>
      <path d="M23 58 Q17 37 34 29 Q55 14 70 30 Q85 48 73 68 Q59 83 37 73 Z" fill="#a7c7e5" {...line}/>
      <path d="M42 48 Q55 43 65 54 Q55 67 43 64 Z" fill="#76a7cf" {...line}/>
      <path d="M22 42 L9 49 L24 55" fill="#e0ab65" {...line}/>
      <circle cx="35" cy="38" r="3.6" fill={ink}/>
      <path d="M46 76 L43 85 M58 73 L58 85" fill="none" {...line}/>
    </>,
    kelinci: <>
      <path d="M28 40 Q14 7 28 6 Q43 6 44 35 M54 35 Q58 6 72 8 Q85 16 67 45" fill="#f3ebe4" {...line}/>
      <path d="M30 13 L35 34 M69 15 L61 35" stroke="#e5b4b9" strokeWidth="5" strokeLinecap="round"/>
      <path d="M21 53 Q24 35 47 34 Q72 32 78 55 Q87 80 50 87 Q14 82 21 53 Z" fill="#f3ebe4" {...line}/>
      <circle cx="36" cy="58" r="3.3" fill={ink}/><circle cx="63" cy="58" r="3.3" fill={ink}/>
      <path d="M46 69 H54 L50 74 Z M50 74 Q45 79 41 75 M50 74 Q55 79 59 75" fill="#e2a1a3" {...line}/>
    </>,
  }
  return <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true" focusable="false">
    {shapes[id] || <circle cx="50" cy="50" r="30" fill="#dbe7e2" {...line}/>}
  </svg>
}
