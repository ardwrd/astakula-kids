import { useEffect, useRef, useState } from 'react'
import type { PointerEvent } from 'react'
import { AnimalIcon } from './AnimalIcon'

export type ActivityKind = 'mix' | 'trace' | 'memory' | 'count' | 'letters'
export type ActivityWorld = 'warna' | 'bentuk' | 'hewan' | 'angka' | 'huruf'

interface ActivityProps {
  world: ActivityWorld
  kind: ActivityKind
  onBack: () => void
}

type TraceModel = { name: string; path: string }
type Point = { x: number; y: number }

const traceModels: Record<'bentuk' | 'hewan' | 'huruf', TraceModel[]> = {
  bentuk: [
    { name: 'Lingkaran', path: 'M 160 40 A 78 78 0 1 1 159.9 40 Z' },
    { name: 'Segitiga', path: 'M 160 40 L 64 206 L 256 206 Z' },
    { name: 'Bintang', path: 'M 160 31 L 193 98 L 269 109 L 214 161 L 227 237 L 160 201 L 93 237 L 106 161 L 51 109 L 127 98 Z' },
    { name: 'Rumah', path: 'M 64 110 L 160 28 L 256 110 L 241 110 L 241 212 L 79 212 L 79 110 Z' },
  ],
  hewan: [
    { name: 'Ikan', path: 'M 68 125 C 113 66 182 66 224 125 L 273 86 L 273 164 L 224 125 C 182 184 113 184 68 125 Z' },
    { name: 'Kucing', path: 'M 93 95 L 84 37 L 132 67 Q 160 55 188 67 L 236 37 L 227 95 Q 247 132 222 178 Q 198 214 160 214 Q 122 214 98 178 Q 73 132 93 95 Z' },
    { name: 'Kelinci', path: 'M 120 104 Q 80 18 118 21 Q 149 25 154 92 Q 170 19 202 22 Q 229 47 194 107 Q 241 136 212 195 Q 190 218 160 218 Q 130 218 108 195 Q 79 136 120 104 Z' },
  ],
  huruf: [
    { name: 'A', path: 'M 78 209 L 160 35 L 242 209 M 108 145 L 212 145' },
    { name: 'B', path: 'M 109 34 L 109 210 M 109 34 L 164 34 C 244 34 244 114 163 118 L 109 118 M 109 118 L 166 118 C 248 118 248 210 165 210 L 109 210' },
    { name: 'C', path: 'M 231 66 Q 186 20 133 47 Q 67 79 77 136 Q 85 203 155 212 Q 201 216 233 182' },
    { name: 'M', path: 'M 72 210 L 72 34 L 160 140 L 248 34 L 248 210' },
    { name: 'P', path: 'M 100 210 L 100 34 L 158 34 C 249 34 249 131 158 131 L 100 131' },
  ],
}

const mixOptions = [
  { id: 'merah', label: 'Merah', color: '#eb605c' },
  { id: 'kuning', label: 'Kuning', color: '#f5cb4c' },
  { id: 'biru', label: 'Biru', color: '#5598dd' },
]
const mixes: Record<string, { name: string; color: string }> = {
  'kuning+merah': { name: 'Jingga', color: '#f09a49' },
  'biru+kuning': { name: 'Hijau', color: '#61af79' },
  'biru+merah': { name: 'Ungu', color: '#a385ce' },
}
function mixKey(a: string, b: string) { return [a, b].sort().join('+') }
function randomize<T>(items: T[]) {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function MixColors() {
  const [selection, setSelection] = useState<string[]>([])
  const pick = (id: string) => setSelection(old => old.length === 2 ? [id] : old.includes(id) ? old : [...old, id].slice(0, 2))
  const result = selection.length === 2 ? mixes[mixKey(selection[0], selection[1])] : null
  return (
    <div className="activity-inner">
      <p className="activity-instruction">Pilih dua warna.</p>
      <div className="paint-preview" aria-live="polite">
        <div className="paint-slot" style={{ background: mixOptions.find(c => c.id === selection[0])?.color || '#f1eee8' }}>{selection[0] || '1'}</div>
        <span className="paint-operation">+</span>
        <div className="paint-slot" style={{ background: mixOptions.find(c => c.id === selection[1])?.color || '#f1eee8' }}>{selection[1] || '2'}</div>
        <span className="paint-operation">=</span>
        <div className="paint-slot paint-result" style={{ background: result?.color || '#f1eee8' }}>{result?.name || '?'}</div>
      </div>
      <div className="paint-choices">
        {mixOptions.map(c => <button key={c.id} type="button" className="paint-choice" onClick={() => pick(c.id)}
          style={{ background: c.color }} aria-label={'Pilih ' + c.label}><span>{c.label}</span></button>)}
      </div>
      <p className="activity-help" aria-live="polite">{result ? 'Jadi warna ' + result.name.toLowerCase() + '. Mau campur lagi?' : selection.length === 1 ? 'Pilih warna berbeda.' : 'Sentuh warna yang kamu suka.'}</p>
      <button type="button" className="quiet-button" onClick={() => setSelection([])}>Ulangi campuran</button>
    </div>
  )
}

function TraceLines({ world }: { world: 'bentuk' | 'hewan' | 'huruf' }) {
  const models = traceModels[world]
  const [index, setIndex] = useState(0)
  const [dotsMode, setDotsMode] = useState(false)
  const [dotsReached, setDotsReached] = useState(0)
  const [strokes, setStrokes] = useState<Point[][]>([])
  const [coverage, setCoverage] = useState(0)
  const trackRef = useRef<SVGPathElement | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)
  const coveredRef = useRef<Set<number>>(new Set())
  const pathSamplesRef = useRef<Point[]>([])
  const drawingRef = useRef(false)
  const track = models[index]

  useEffect(() => {
    coveredRef.current = new Set()
    setCoverage(0)
    setStrokes([])
    setDotsReached(0)
    // SVG geometry is cached once per outline to keep touch drawing smooth.
    const path = trackRef.current
    if (path) {
      const length = path.getTotalLength()
      pathSamplesRef.current = Array.from({ length: 110 }, (_, i) => {
        const p = path.getPointAtLength(length * i / 109)
        return { x: p.x, y: p.y }
      })
    }
  }, [index, dotsMode])

  const pointAt = (ratio: number): Point => {
    const p = trackRef.current
    if (!p) return { x: 160, y: 120 }
    const pt = p.getPointAtLength(p.getTotalLength() * ratio)
    return { x: pt.x, y: pt.y }
  }
  const checkpoints = Array.from({ length: 9 }, (_, i) => pointAt(i / 9))
  const complete = dotsMode ? dotsReached >= checkpoints.length : coverage >= .66

  const pointFromEvent = (e: PointerEvent<SVGSVGElement>): Point | null => {
    const svg = svgRef.current
    if (!svg) return null
    const ctm = svg.getScreenCTM()
    if (!ctm) return null
    const p = svg.createSVGPoint()
    p.x = e.clientX
    p.y = e.clientY
    const local = p.matrixTransform(ctm.inverse())
    return { x: local.x, y: local.y }
  }
  const record = (point: Point) => {
    const samples = pathSamplesRef.current
    if (!samples.length) return
    for (let i = 0; i < samples.length; i++) {
      if (coveredRef.current.has(i)) continue
      const sample = samples[i]
      if (Math.hypot(sample.x - point.x, sample.y - point.y) < 22) coveredRef.current.add(i)
    }
    setCoverage(coveredRef.current.size / samples.length)
  }
  const down = (e: PointerEvent<SVGSVGElement>) => {
    if (dotsMode || complete) return
    const point = pointFromEvent(e)
    if (!point) return
    e.currentTarget.setPointerCapture(e.pointerId)
    drawingRef.current = true
    setStrokes(previous => [...previous, [point]])
    record(point)
  }
  const move = (e: PointerEvent<SVGSVGElement>) => {
    if (!drawingRef.current || dotsMode) return
    const point = pointFromEvent(e)
    if (!point) return
    setStrokes(previous => {
      if (!previous.length) return previous
      const last = previous[previous.length - 1]
      return [...previous.slice(0, -1), [...last, point]]
    })
    record(point)
  }
  const up = () => { drawingRef.current = false }
  const clear = () => { coveredRef.current = new Set(); setCoverage(0); setStrokes([]); setDotsReached(0) }
  const next = () => { setIndex(old => (old + 1) % models.length) }
  return (
    <div className="activity-inner tracing">
      <div className="trace-title"><h2>{track.name}</h2><span>{index + 1} dari {models.length}</span></div>
      <p className="activity-instruction">{dotsMode ? 'Sentuh titik yang menyala, satu per satu.' : 'Ikuti garis putus-putus dengan jarimu.'}</p>
      <svg ref={svgRef} viewBox="0 0 320 250" className="trace-paper" role="img"
        aria-label={'Area menebalkan garis ' + track.name}
        onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
        <path ref={trackRef} d={track.path} className="trace-guide" />
        {!dotsMode && strokes.map((stroke, i) => <polyline key={i} points={stroke.map(p => p.x + ',' + p.y).join(' ')}
          stroke="#24786e" strokeWidth="11" fill="none" strokeLinecap="round" strokeLinejoin="round" />)}
        {dotsMode && checkpoints.map((point, i) => <circle key={i} cx={point.x} cy={point.y} r={i === dotsReached ? 17 : 12}
          className={i < dotsReached ? 'trace-dot-done' : i === dotsReached ? 'trace-dot-next' : 'trace-dot-wait'}
          onClick={() => { if (i === dotsReached) setDotsReached(old => old + 1) }} role="button"
          aria-label={'Titik ' + (i + 1)} />)}
      </svg>
      <p className="activity-help" aria-live="polite">{complete ? 'Bagus! Garisnya sudah kamu ikuti.' : dotsMode ? 'Sentuh titik berikutnya.' : 'Tidak harus persis. Ikuti garis pelan-pelan.'}</p>
      <div className="activity-actions">
        <button type="button" className="quiet-button" onClick={clear}>Hapus garis</button>
        <button type="button" className="quiet-button" onClick={() => setDotsMode(v => !v)}>{dotsMode ? 'Pakai jari' : 'Pakai titik pandu'}</button>
        {complete && <button type="button" className="primary-action" onClick={next}>Gambar berikutnya →</button>}
      </div>
    </div>
  )
}

const animals = [
  { id: 'kucing', label: 'Kucing', visual: '🐱' },
  { id: 'sapi', label: 'Sapi', visual: '🐮' },
  { id: 'ayam', label: 'Ayam', visual: '🐔' },
]
type MemoryCard = { key: string; id: string; visual: string }
function newDeck(): MemoryCard[] {
  return randomize(animals.flatMap(animal => [
    { key: animal.id + '-a', id: animal.id, visual: animal.visual },
    { key: animal.id + '-b', id: animal.id, visual: animal.visual },
  ]))
}
function AnimalMemory() {
  const [deck, setDeck] = useState<MemoryCard[]>(newDeck)
  const [revealed, setRevealed] = useState<string[]>([])
  const [matched, setMatched] = useState<string[]>([])
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(timer.current), [])
  const turn = (card: MemoryCard) => {
    if (revealed.length === 2 || matched.includes(card.id) || revealed.includes(card.key)) return
    const next = [...revealed, card.key]
    setRevealed(next)
    if (next.length !== 2) return
    const first = deck.find(c => c.key === next[0])
    if (first?.id === card.id) {
      setMatched(old => [...old, card.id])
      timer.current = window.setTimeout(() => setRevealed([]), 450)
    } else {
      timer.current = window.setTimeout(() => setRevealed([]), 1050)
    }
  }
  const reset = () => { window.clearTimeout(timer.current); setRevealed([]); setMatched([]); setDeck(newDeck()) }
  return (
    <div className="activity-inner">
      <p className="activity-instruction">Cari dua gambar hewan yang sama.</p>
      <div className="memory-grid">
        {deck.map(card => {
          const visible = revealed.includes(card.key) || matched.includes(card.id)
          return <button key={card.key} type="button" className={'memory-card' + (visible ? ' is-open' : '') + (matched.includes(card.id) ? ' is-matched' : '')}
            onClick={() => turn(card)} aria-label={visible ? 'Gambar ' + card.id : 'Buka kartu hewan'}
            aria-pressed={visible}>{visible ? <AnimalIcon id={card.id} size={80} /> : <span aria-hidden="true">?</span>}</button>
        })}
      </div>
      <p className="activity-help" aria-live="polite">{matched.length === animals.length ? 'Semua pasangan ketemu!' : 'Balik dua kartu, lalu lihat gambarnya.'}</p>
      <button className="primary-action" type="button" onClick={reset}>{matched.length === animals.length ? 'Main lagi' : 'Acak kartu'}</button>
    </div>
  )
}

const countingItems = [3, 4, 5, 6]
function Counting() {
  const [round, setRound] = useState(0)
  const [tapped, setTapped] = useState<number[]>([])
  const count = countingItems[round]
  const done = tapped.length === count
  const next = () => { setRound(i => (i + 1) % countingItems.length); setTapped([]) }
  return (
    <div className="activity-inner">
      <p className="activity-instruction">Sentuh setiap lingkaran. Kita hitung bersama.</p>
      <div className="count-stage">
        {Array.from({ length: count }, (_, i) => (
          <button key={i} type="button" className={'count-object' + (tapped.includes(i) ? ' counted' : '')}
            onClick={() => { if (!tapped.includes(i)) setTapped(t => [...t, i]) }}
            aria-label={'Lingkaran ' + (i + 1)} aria-pressed={tapped.includes(i)}>
            {tapped.includes(i) ? tapped.indexOf(i) + 1 : ''}
          </button>
        ))}
      </div>
      <div className="count-display" aria-live="polite">{tapped.length} <span>lingkaran dihitung</span></div>
      <p className="activity-help">{done ? 'Semuanya sudah dihitung.' : 'Ada yang belum disentuh?'}</p>
      <div className="activity-actions">
        <button className="quiet-button" type="button" onClick={() => setTapped([])}>Ulangi</button>
        {done && <button className="primary-action" type="button" onClick={next}>Hitung lagi →</button>}
      </div>
    </div>
  )
}
const words = [
  { word: 'PAGI', parts: ['PA', 'GI'] },
  { word: 'BOLA', parts: ['BO', 'LA'] },
  { word: 'MATA', parts: ['MA', 'TA'] },
]
function WordBuilder() {
  const [index, setIndex] = useState(0)
  const [chosen, setChosen] = useState<string[]>([])
  const word = words[index]
  const done = chosen.length === word.parts.length
  const add = (part: string) => {
    if (done || chosen.includes(part)) return
    if (part === word.parts[chosen.length]) setChosen(old => [...old, part])
  }
  const next = () => { setIndex(old => (old + 1) % words.length); setChosen([]) }
  return (
    <div className="activity-inner">
      <p className="activity-instruction">Susun suku kata supaya menjadi kata.</p>
      <div className="word-slots" aria-label="Susunan suku kata">
        {word.parts.map((part, i) => <div className={'word-slot' + (chosen[i] ? ' filled' : '')} key={part}>{chosen[i] || '· ·'}</div>)}
      </div>
      <div className="word-tiles">
        {[...word.parts].reverse().map(part => <button key={part} type="button" onClick={() => add(part)}
          className="word-tile" disabled={chosen.includes(part)}>{part}</button>)}
      </div>
      <p className="activity-help" aria-live="polite">{done ? 'Jadi kata ' + word.word + '!' : 'Mulai dari suku kata pertama.'}</p>
      <div className="activity-actions">
        <button type="button" className="quiet-button" onClick={() => setChosen([])}>Ulangi</button>
        {done && <button type="button" className="primary-action" onClick={next}>Kata berikutnya →</button>}
      </div>
    </div>
  )
}

export function PlayActivity({ world, kind, onBack }: ActivityProps) {
  useEffect(() => () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel()
  }, [])
  const instructions: Record<ActivityKind, string> = {
    mix: 'Pilih dua warna. Lihat warna yang muncul setelah dicampur.',
    trace: 'Ikuti garis putus-putus dengan jarimu. Kalau sulit, pilih titik pandu.',
    memory: 'Balik dua kartu, lalu cari gambar hewan yang sama.',
    count: 'Sentuh satu per satu lingkaran sambil menghitung.',
    letters: 'Sentuh dua suku kata yang benar untuk membentuk sebuah kata.',
  }
  const listen = () => {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const speech = new SpeechSynthesisUtterance(instructions[kind])
    speech.lang = 'id-ID'
    speech.rate = 0.9
    const voice = window.speechSynthesis.getVoices().find(v => v.lang.toLowerCase().startsWith('id'))
    if (voice) speech.voice = voice
    window.speechSynthesis.speak(speech)
  }
  const title: Record<ActivityKind, string> = {
    mix: 'Campur warna', trace: 'Tebalkan garis', memory: 'Cari pasangan',
    count: 'Hitung benda', letters: 'Susun kata',
  }
  return (
    <section className="activity-screen" aria-label={title[kind]}>
      <div className="activity-nav">
        <button type="button" className="back-button" onClick={onBack}>← Pilih permainan</button>
        <span>{title[kind]}</span>
      </div>
      <div className="activity-panel">
        <button className="listen-button activity-listen" type="button" onClick={listen}>Dengarkan cara bermain</button>
        {kind === 'mix' ? <MixColors /> : null}
        {kind === 'trace' && (world === 'bentuk' || world === 'hewan' || world === 'huruf')
          ? <TraceLines world={world} /> : null}
        {kind === 'memory' ? <AnimalMemory /> : null}
        {kind === 'count' ? <Counting /> : null}
        {kind === 'letters' ? <WordBuilder /> : null}
      </div>
    </section>
  )
}
