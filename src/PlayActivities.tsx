import { useEffect, useRef, useState } from 'react'
import type { PointerEvent } from 'react'
import { AnimalIcon } from './AnimalIcon'
import { ColoringActivity } from './ColoringActivity'

export type ActivityKind = 'color' | 'trace' | 'memory' | 'count' | 'letters'
export type ActivityWorld = 'warna' | 'bentuk' | 'hewan' | 'angka' | 'huruf'

interface ActivityProps {
  world: ActivityWorld
  kind: ActivityKind
  onBack: () => void
  narrate: (key: string, queued?: boolean) => void
}

type TraceModel = { name: string; path: string }
type Point = { x: number; y: number }

const traceModels: Record<'bentuk' | 'hewan' | 'huruf', TraceModel[]> = {
  bentuk: [
    { name: 'Lingkaran', path: 'M 160 40 A 78 78 0 1 1 159.9 40 Z' },
    { name: 'Segitiga', path: 'M 160 40 L 64 206 L 256 206 Z' },
    { name: 'Bintang', path: 'M 160 31 L 193 98 L 269 109 L 214 161 L 227 237 L 160 201 L 93 237 L 106 161 L 51 109 L 127 98 Z' },
    { name: 'Rumah', path: 'M 64 110 L 160 28 L 256 110 L 241 110 L 241 212 L 79 212 L 79 110 Z' },
    { name: 'Persegi', path: 'M 76 40 H 244 V 208 H 76 Z' },
    { name: 'Hati', path: 'M 160 211 C 129 178 70 145 70 96 C 70 54 121 31 160 76 C 199 31 250 54 250 96 C 250 145 191 178 160 211 Z' },
  ],
  hewan: [
    { name: 'Ikan', path: 'M 68 125 C 113 66 182 66 224 125 L 273 86 L 273 164 L 224 125 C 182 184 113 184 68 125 Z' },
    { name: 'Kucing', path: 'M 93 95 L 84 37 L 132 67 Q 160 55 188 67 L 236 37 L 227 95 Q 247 132 222 178 Q 198 214 160 214 Q 122 214 98 178 Q 73 132 93 95 Z' },
    { name: 'Kelinci', path: 'M 120 104 Q 80 18 118 21 Q 149 25 154 92 Q 170 19 202 22 Q 229 47 194 107 Q 241 136 212 195 Q 190 218 160 218 Q 130 218 108 195 Q 79 136 120 104 Z' },
    { name: 'Burung', path: 'M 63 144 Q 44 103 89 72 Q 124 36 183 57 Q 244 55 248 132 Q 241 179 192 188 Q 144 209 102 175 Z M 65 112 L 29 137 L 70 151' },
  ],
  huruf: [
    { name: 'A', path: 'M 78 209 L 160 35 L 242 209 M 108 145 L 212 145' },
    { name: 'B', path: 'M 109 34 L 109 210 M 109 34 L 164 34 C 244 34 244 114 163 118 L 109 118 M 109 118 L 166 118 C 248 118 248 210 165 210 L 109 210' },
    { name: 'C', path: 'M 231 66 Q 186 20 133 47 Q 67 79 77 136 Q 85 203 155 212 Q 201 216 233 182' },
    { name: 'M', path: 'M 72 210 L 72 34 L 160 140 L 248 34 L 248 210' },
    { name: 'P', path: 'M 100 210 L 100 34 L 158 34 C 249 34 249 131 158 131 L 100 131' },
    { name: 'D', path: 'M 93 208 V 36 H 150 C 257 36 260 205 150 208 Z' },
    { name: 'O', path: 'M 160 36 C 53 36 53 208 160 208 C 267 208 267 36 160 36 Z' },
  ],
}

function randomize<T>(items: T[]) {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}


function TraceLines({ world, narrate }: { world: 'bentuk' | 'hewan' | 'huruf'; narrate: ActivityProps['narrate'] }) {
  const [models, setModels] = useState(() => randomize(traceModels[world]))
  const [index, setIndex] = useState(0)
  const [dotsMode, setDotsMode] = useState(false)
  const [dotsReached, setDotsReached] = useState(0)
  const [strokes, setStrokes] = useState<Point[][]>([])
  const [coverage, setCoverage] = useState(0)
  const [sessionFinished, setSessionFinished] = useState(false)
  const trackRef = useRef<SVGPathElement | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)
  const coveredRef = useRef<Set<number>>(new Set())
  const pathSamplesRef = useRef<Point[]>([])
  const drawingRef = useRef(false)
  const lastPointRef = useRef<Point | null>(null)
  const announcedStartRef = useRef(false)
  const resultAnnouncedRef = useRef(false)
  const track = models[index]
  useEffect(() => {
    if (!announcedStartRef.current) {
      announcedStartRef.current = true
      narrate('activities/trace/' + track.name.toLowerCase(), true)
    }
  }, [narrate, track.name])

  useEffect(() => {
    coveredRef.current = new Set()
    resultAnnouncedRef.current = false
    setCoverage(0)
    setStrokes([])
    setDotsReached(0)
    // SVG geometry is cached once per outline to keep touch drawing smooth.
    const path = trackRef.current
    if (path) {
      const length = path.getTotalLength()
      pathSamplesRef.current = Array.from({ length: 240 }, (_, i) => {
        const p = path.getPointAtLength(length * i / 239)
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
  const checkpoints = Array.from({ length: 16 }, (_, i) => pointAt(i / 15))
  // A line only counts as finished after nearly all of its parts were traced.
  // This includes disconnected strokes, such as the crossbar in letter A.
  const complete = dotsMode ? dotsReached >= checkpoints.length : coverage >= .94

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
    const last = lastPointRef.current || point
    const travel = Math.hypot(point.x - last.x, point.y - last.y)
    // Fill gaps caused by fast finger movement rather than losing traced segments.
    const steps = Math.max(1, Math.min(120, Math.ceil(travel / 3)))
    for (let segment = 0; segment <= steps; segment++) {
      const t = segment / steps
      const px = last.x + (point.x - last.x) * t
      const py = last.y + (point.y - last.y) * t
      for (let i = 0; i < samples.length; i++) {
        if (coveredRef.current.has(i)) continue
        if (Math.hypot(samples[i].x - px, samples[i].y - py) <= 12) coveredRef.current.add(i)
      }
    }
    lastPointRef.current = point
    const nextCoverage = coveredRef.current.size / samples.length
    // Guard against a big shape looking finished when only one portion was drawn.
    const sectionCount = 8
    let allSections = true
    for (let section = 0; section < sectionCount; section++) {
      const start = Math.floor(section * samples.length / sectionCount)
      const end = Math.floor((section + 1) * samples.length / sectionCount)
      let marked = 0
      for (let i = start; i < end; i++) if (coveredRef.current.has(i)) marked++
      if (marked / (end - start) < .86) allSections = false
    }
    if (nextCoverage >= .94 && allSections && !resultAnnouncedRef.current) {
      resultAnnouncedRef.current = true
      narrate('activities/results/trace-complete')
    }
    setCoverage(nextCoverage >= .94 && allSections ? nextCoverage : Math.min(nextCoverage, .939))
  }
  const down = (e: PointerEvent<SVGSVGElement>) => {
    if (dotsMode) return
    e.preventDefault()
    if (drawingRef.current) return
    const point = pointFromEvent(e)
    if (!point) return
    e.currentTarget.setPointerCapture(e.pointerId)
    drawingRef.current = true
    lastPointRef.current = point
    setStrokes(previous => [...previous, [point]])
    record(point)
  }
  const move = (e: PointerEvent<SVGSVGElement>) => {
    if (!drawingRef.current || dotsMode) return
    e.preventDefault()
    const point = pointFromEvent(e)
    if (!point) return
    setStrokes(previous => {
      if (!previous.length) return previous
      const last = previous[previous.length - 1]
      return [...previous.slice(0, -1), [...last, point]]
    })
    record(point)
  }
  const up = () => { drawingRef.current = false; lastPointRef.current = null }
  const clear = () => {
    coveredRef.current = new Set()
    resultAnnouncedRef.current = false
    lastPointRef.current = null
    drawingRef.current = false
    setCoverage(0); setStrokes([]); setDotsReached(0)
  }
  const next = () => {
    if (index === models.length - 1) { setSessionFinished(true); return }
    const following = index + 1
    setIndex(following)
    narrate('activities/trace/' + models[following].name.toLowerCase())
  }
  const replay = () => {
    const fresh = randomize(traceModels[world])
    setModels(fresh); setIndex(0); setSessionFinished(false); clear()
    narrate('activities/trace/' + fresh[0].name.toLowerCase())
  }
  return (
    <div className="activity-inner tracing">
      {sessionFinished ? (
        <div className="trace-session-end">
          <h2>Gambar sudah dicoba semua.</h2>
          <p>Mau menebalkan gambar lagi dengan urutan berbeda?</p>
          <button type="button" className="primary-action" onClick={replay}>Main lagi</button>
        </div>
      ) : <>
      <div className="trace-title"><h2>{track.name}</h2><span>{index + 1} dari {models.length}</span></div>
      <p className="activity-instruction">{dotsMode ? 'Sentuh titik yang menyala, satu per satu.' : 'Ikuti garis putus-putus dengan jarimu.'}</p>
      <svg ref={svgRef} viewBox="0 0 320 250" className="trace-paper" role="img"
        aria-label={'Area menebalkan garis ' + track.name}
        onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
        onContextMenu={event => event.preventDefault()}
        onDragStart={event => event.preventDefault()}>
        <path ref={trackRef} d={track.path} className="trace-guide" />
        {!dotsMode && strokes.map((stroke, i) => <polyline key={i} points={stroke.map(p => p.x + ',' + p.y).join(' ')}
          stroke="#24786e" strokeWidth="11" fill="none" strokeLinecap="round" strokeLinejoin="round" />)}
        {dotsMode && checkpoints.map((point, i) => <circle key={i} cx={point.x} cy={point.y} r={i === dotsReached ? 17 : 12}
          className={i < dotsReached ? 'trace-dot-done' : i === dotsReached ? 'trace-dot-next' : 'trace-dot-wait'}
          onClick={() => {
            if (i !== dotsReached) return
            if (i + 1 === checkpoints.length && !resultAnnouncedRef.current) {
              resultAnnouncedRef.current = true
              narrate('activities/results/trace-complete')
            }
            setDotsReached(old => old + 1)
          }} role="button"
          aria-label={'Titik ' + (i + 1)} />)}
      </svg>
      <p className="activity-help" aria-live="polite">{complete ? 'Bagus! Garisnya sudah kamu ikuti.' : dotsMode ? 'Sentuh titik berikutnya.' : 'Tidak harus persis. Ikuti garis pelan-pelan.'}</p>
      <div className="activity-actions">
        <button type="button" className="quiet-button" onClick={clear}>Hapus garis</button>
        <button type="button" className="quiet-button" onClick={() => {
          if (!dotsMode) narrate('activities/instructions/trace-dots')
          setDotsMode(v => !v)
        }}>{dotsMode ? 'Pakai jari' : 'Pakai titik pandu'}</button>
        <button type="button" className="primary-action" onClick={next}>{index === models.length - 1 ? 'Akhiri sesi' : complete ? 'Gambar berikutnya →' : 'Lewati gambar →'}</button>
      </div>
      </>}
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
function AnimalMemory({ narrate }: { narrate: ActivityProps['narrate'] }) {
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
      narrate(matched.length + 1 === animals.length
        ? 'activities/results/memory-complete'
        : 'activities/results/memory-match')
      narrate('activities/animals/' + card.id, true)
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
function Counting({ narrate }: { narrate: ActivityProps['narrate'] }) {
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
            onClick={() => {
              if (tapped.includes(i)) return
              const number = tapped.length + 1
              setTapped(previous => [...previous, i])
              narrate('activities/count/' + number, true)
            }}
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
function WordBuilder({ narrate }: { narrate: ActivityProps['narrate'] }) {
  const [index, setIndex] = useState(0)
  const [chosen, setChosen] = useState<string[]>([])
  const word = words[index]
  const done = chosen.length === word.parts.length
  const add = (part: string) => {
    if (done || chosen.includes(part)) return
    if (part === word.parts[chosen.length]) {
      if (chosen.length + 1 === word.parts.length) {
        narrate('activities/results/word-' + word.word.toLowerCase())
      }
      setChosen(old => [...old, part])
    }
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

export function PlayActivity({ world, kind, onBack, narrate }: ActivityProps) {
  const cue = kind === 'trace' ? 'trace-' + world : kind
  const listen = () => narrate('activities/instructions/' + cue)
  const title: Record<ActivityKind, string> = {
    color: 'Warnai gambar', trace: 'Tebalkan garis', memory: 'Cari pasangan',
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
        {kind === 'color' ? <ColoringActivity narrate={narrate} /> : null}
        {kind === 'trace' && (world === 'bentuk' || world === 'hewan' || world === 'huruf')
          ? <TraceLines world={world} narrate={narrate} /> : null}
        {kind === 'memory' ? <AnimalMemory narrate={narrate} /> : null}
        {kind === 'count' ? <Counting narrate={narrate} /> : null}
        {kind === 'letters' ? <WordBuilder narrate={narrate} /> : null}
      </div>
    </section>
  )
}
