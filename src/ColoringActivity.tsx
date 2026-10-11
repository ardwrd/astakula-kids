import { useState } from 'react'

type Color = { name: string; hex: string }
const palette: Color[] = [
  { name: 'Merah', hex: '#e76a62' }, { name: 'Kuning', hex: '#f1bf48' },
  { name: 'Biru', hex: '#629bd0' }, { name: 'Hijau', hex: '#65aa79' },
  { name: 'Ungu', hex: '#a48ac4' }, { name: 'Jingga', hex: '#eda063' },
]

type Region = { id: string; path: string; label: string }
type Picture = { title: string; regions: Region[] }

const pictures: Picture[] = [
  { title: 'Rumah', regions: [
    { id: 'atap', label: 'Atap', path: 'M50 112 L160 26 L270 112 Z' },
    { id: 'dinding', label: 'Dinding', path: 'M73 116 H247 V224 H73 Z' },
    { id: 'pintu', label: 'Pintu', path: 'M140 154 H181 V224 H140 Z' },
  ] },
  { title: 'Bunga', regions: [
    { id: 'kelopak', label: 'Kelopak bunga', path: 'M160 53 C125 12 104 65 132 94 C80 61 67 128 120 133 C72 153 111 204 149 165 C173 215 223 178 194 142 C248 131 235 78 193 91 C217 46 177 30 160 53 Z' },
    { id: 'tengah', label: 'Tengah bunga', path: 'M160 100 A27 27 0 1 1 159.9 100 Z' },
    { id: 'batang', label: 'Batang bunga', path: 'M153 157 H167 V238 H153 Z' },
  ] },
  { title: 'Ikan', regions: [
    { id: 'ekor', label: 'Ekor ikan', path: 'M215 125 L275 75 L275 175 Z' },
    { id: 'badan', label: 'Badan ikan', path: 'M49 125 C95 52 181 52 233 125 C181 198 95 198 49 125 Z' },
    { id: 'sirip', label: 'Sirip ikan', path: 'M132 99 L171 39 L196 109 Z' },
  ] },
  { title: 'Balon', regions: [
    { id: 'balon-kiri', label: 'Balon kiri', path: 'M68 84 A44 50 0 1 1 156 84 Q151 125 115 143 Q79 125 68 84 Z' },
    { id: 'balon-kanan', label: 'Balon kanan', path: 'M169 80 A42 48 0 1 1 253 80 Q247 123 211 142 Q176 123 169 80 Z' },
    { id: 'pita', label: 'Pita balon', path: 'M111 142 L121 142 L160 224 L203 140 L213 143 L161 247 Z' },
  ] },
  { title: 'Mobil', regions: [
    { id: 'bodi', label: 'Badan mobil', path: 'M38 129 L73 124 L104 75 H214 L246 124 H281 V194 H38 Z' },
    { id: 'jendela', label: 'Jendela', path: 'M111 87 H155 V124 H84 Z M168 87 H206 L232 124 H168 Z' },
    { id: 'roda', label: 'Roda', path: 'M81 186 A29 29 0 1 1 80.9 186 Z M235 186 A29 29 0 1 1 234.9 186 Z' },
  ] },
  { title: 'Pohon', regions: [
    { id: 'daun', label: 'Daun pohon', path: 'M160 25 C111 17 97 63 96 87 C40 97 51 163 105 175 H218 C277 161 265 100 220 86 C222 45 193 25 160 25 Z' },
    { id: 'batang', label: 'Batang pohon', path: 'M144 174 H180 V234 H144 Z' },
    { id: 'buah', label: 'Buah', path: 'M105 116 A13 13 0 1 1 104.9 116 Z M214 122 A13 13 0 1 1 213.9 122 Z' },
  ] },
]

function shuffled<T>(values: readonly T[]) {
  const items = [...values]
  for (let index = items.length - 1; index > 0; index--) {
    const other = Math.floor(Math.random() * (index + 1))
    ;[items[index], items[other]] = [items[other], items[index]]
  }
  return items
}

export function ColoringActivity({ narrate }: { narrate: (key: string, queued?: boolean) => void }) {
  const [session, setSession] = useState<Picture[]>(() => shuffled(pictures))
  const [index, setIndex] = useState(0)
  const [color, setColor] = useState<Color>(palette[0])
  const [filled, setFilled] = useState<Record<string, string>>({})
  const [finished, setFinished] = useState(false)
  const picture = session[index]
  const filledCount = picture.regions.filter(r => Boolean(filled[r.id])).length
  const done = filledCount === picture.regions.length
  const paint = (region: Region) => setFilled(previous => ({ ...previous, [region.id]: color.hex }))
  const next = () => {
    if (index === session.length - 1) {
      setFinished(true)
      return
    }
    setIndex(i => i + 1)
    setFilled({})
  }
  const replay = () => { setSession(shuffled(pictures)); setIndex(0); setFilled({}); setFinished(false) }
  return (
    <div className="activity-inner coloring-activity">
      {finished ? <>
        <h2>Sesi mewarnai selesai.</h2>
        <p>Semua gambar sudah dicoba. Mau mewarnai lagi?</p>
        <button className="primary-action" type="button" onClick={replay}>Mewarnai lagi</button>
      </> : <>
        <div className="trace-title"><h2>{picture.title}</h2><span>{index + 1} dari {session.length} gambar</span></div>
        <p className="activity-instruction">Pilih warna, lalu sentuh bagian gambar.</p>
        <svg className="coloring-picture" viewBox="0 0 320 270"
          role="img" aria-label={'Gambar ' + picture.title + ' yang bisa diwarnai'}>
          {picture.regions.map(region => (
            <path key={region.id} d={region.path} fill={filled[region.id] || '#ffffff'}
              stroke="#394d4a" strokeWidth="4" strokeLinejoin="round"
              onClick={() => paint(region)} role="button" tabIndex={0}
              aria-label={'Warnai ' + region.label}
              onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); paint(region) } }} />
          ))}
        </svg>
        <div className="coloring-palette" role="group" aria-label="Pilih warna">
          {shuffled(palette).sort((a,b)=>palette.indexOf(a)-palette.indexOf(b)).map(option => (
            <button key={option.name} type="button" className={'coloring-swatch' + (option.name === color.name ? ' selected' : '')}
              style={{ backgroundColor: option.hex }}
              onClick={() => setColor(option)} aria-pressed={option.name === color.name}
              aria-label={'Warna ' + option.name} title={option.name}>
              <span>{option.name}</span>
            </button>
          ))}
        </div>
        <p className="activity-help" aria-live="polite">{done ? 'Bagus! Kamu boleh lanjut atau mengganti warnanya.' : 'Warnai setiap bagian dengan warna pilihanmu.'}</p>
        <div className="activity-actions">
          <button type="button" className="quiet-button" onClick={() => setFilled({})}>Hapus warna</button>
          <button type="button" className="primary-action" onClick={() => { if (done) narrate('global/correct'); next() }}>
            {index === session.length - 1 ? 'Selesai' : 'Gambar berikutnya →'}
          </button>
        </div>
      </>}
    </div>
  )
}
