import { useCallback, useEffect, useRef, useState } from 'react'
import type { PointerEvent } from 'react'

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


type DrawPoint = { x: number; y: number }
type Stroke = { points: DrawPoint[]; color: string; size: number; eraser: boolean }

export function ColoringActivity({ narrate }: { narrate: (key: string, queued?: boolean) => void }) {
  const [session, setSession] = useState<Picture[]>(() => shuffled(pictures))
  const [index, setIndex] = useState(0)
  const [color, setColor] = useState<Color>(palette[0])
  const [brushSize, setBrushSize] = useState(13)
  const [eraser, setEraser] = useState(false)
  const [strokeCount, setStrokeCount] = useState(0)
  const [finished, setFinished] = useState(false)
  const picture = session[index]
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const strokesRef = useRef<Stroke[]>([])
  const workingRef = useRef<Stroke | null>(null)
  const pointerRef = useRef<number | null>(null)

  // Artwork has a fixed 320×270 coordinate system. The canvas paints at 2x resolution
  // and scales to the available phone width, without relying on click-to-fill.
  const getContext = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const context = canvas.getContext('2d')
    if (!context) return null
    context.setTransform(2, 0, 0, 2, 0, 0)
    return context
  }, [])

  const draw = useCallback((stroke: Stroke) => {
    const context = getContext()
    if (!context || !stroke.points.length) return
    context.save()
    // The brush is clipped to the drawing: moving outside the picture
    // never spills color onto the surrounding sheet.
    const silhouette = new Path2D()
    for (const region of picture.regions) silhouette.addPath(new Path2D(region.path))
    context.clip(silhouette)
    context.globalCompositeOperation = stroke.eraser ? 'destination-out' : 'source-over'
    context.lineWidth = stroke.size
    context.lineCap = 'round'
    context.lineJoin = 'round'
    context.strokeStyle = stroke.color
    context.fillStyle = stroke.color
    const [first] = stroke.points
    context.beginPath()
    context.arc(first.x, first.y, stroke.size / 2, 0, Math.PI * 2)
    context.fill()
    if (stroke.points.length > 1) {
      context.beginPath()
      context.moveTo(first.x, first.y)
      for (let i = 1; i < stroke.points.length; i++) {
        context.lineTo(stroke.points[i].x, stroke.points[i].y)
      }
      context.stroke()
    }
    context.restore()
  }, [getContext, picture])

  const repaint = useCallback(() => {
    const context = getContext()
    if (!context) return
    context.clearRect(0, 0, 320, 270)
    for (const stroke of strokesRef.current) draw(stroke)
  }, [draw, getContext])

  useEffect(() => { repaint() }, [repaint])

  const pointFrom = (event: PointerEvent<HTMLCanvasElement>): DrawPoint | null => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    if (!rect.width || !rect.height) return null
    return {
      x: (event.clientX - rect.left) * 320 / rect.width,
      y: (event.clientY - rect.top) * 270 / rect.height,
    }
  }

  const pointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    if (pointerRef.current !== null || (event.pointerType === 'mouse' && event.button !== 0)) return
    event.preventDefault()
    const point = pointFrom(event)
    if (!point) return
    pointerRef.current = event.pointerId
    event.currentTarget.setPointerCapture(event.pointerId)
    const stroke: Stroke = {
      points: [point], color: color.hex, size: eraser ? brushSize * 1.7 : brushSize, eraser,
    }
    workingRef.current = stroke
    draw(stroke)
  }

  const pointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
    if (pointerRef.current !== event.pointerId || !workingRef.current) return
    event.preventDefault()
    const point = pointFrom(event)
    if (!point) return
    const stroke = workingRef.current
    const previous = stroke.points[stroke.points.length - 1]
    // Incremental painting gives immediate feedback even on older Android devices.
    const context = getContext()
    if (!context) return
    context.save()
    const silhouette = new Path2D()
    for (const region of picture.regions) silhouette.addPath(new Path2D(region.path))
    context.clip(silhouette)
    context.globalCompositeOperation = stroke.eraser ? 'destination-out' : 'source-over'
    context.lineWidth = stroke.size
    context.lineCap = 'round'
    context.lineJoin = 'round'
    context.strokeStyle = stroke.color
    context.beginPath()
    context.moveTo(previous.x, previous.y)
    context.lineTo(point.x, point.y)
    context.stroke()
    context.restore()
    stroke.points.push(point)
  }

  const pointerEnd = (event: PointerEvent<HTMLCanvasElement>) => {
    if (pointerRef.current !== event.pointerId) return
    const stroke = workingRef.current
    if (stroke) {
      strokesRef.current.push(stroke)
      setStrokeCount(strokesRef.current.length)
    }
    pointerRef.current = null
    workingRef.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId)
  }

  const clear = () => {
    workingRef.current = null
    pointerRef.current = null
    strokesRef.current = []
    setStrokeCount(0)
    repaint()
  }

  const undo = () => {
    if (!strokesRef.current.length) return
    strokesRef.current.pop()
    setStrokeCount(strokesRef.current.length)
    repaint()
  }

  const next = () => {
    if (index === session.length - 1) {
      setFinished(true)
      return
    }
    strokesRef.current = []
    workingRef.current = null
    pointerRef.current = null
    setStrokeCount(0)
    setIndex(previous => previous + 1)
    setEraser(false)
  }

  const replay = () => {
    strokesRef.current = []
    workingRef.current = null
    pointerRef.current = null
    setStrokeCount(0)
    setIndex(0)
    setSession(shuffled(pictures))
    setEraser(false)
    setFinished(false)
  }

  return (
    <div className="activity-inner coloring-activity">
      {finished ? (
        <div className="coloring-done">
          <h2>Semua gambar sudah dicoba.</h2>
          <p>Mau mewarnai lagi?</p>
          <button className="primary-action" type="button" onClick={replay}>Mewarnai lagi</button>
        </div>
      ) : (
        <>
          <div className="trace-title">
            <h2>{picture.title}</h2>
            <span>{index + 1} dari {session.length}</span>
          </div>
          <p className="activity-instruction">Pilih krayon, lalu geser jari di gambar.</p>
          <div className="coloring-sheet">
            <svg className="coloring-picture coloring-outline" viewBox="0 0 320 270" role="img"
              aria-label={'Gambar garis ' + picture.title} aria-hidden="true">
              {picture.regions.map(region => (
                <path key={region.id} d={region.path} fill="#fff"
                  stroke="#354d49" strokeWidth="3.5" strokeLinejoin="round"/>
              ))}
            </svg>
            <canvas ref={canvasRef} width={640} height={540} className="coloring-canvas"
              aria-label={'Mewarnai ' + picture.title + ' dengan jari'}
              onPointerDown={pointerDown} onPointerMove={pointerMove}
              onPointerUp={pointerEnd} onPointerCancel={pointerEnd}
              onContextMenu={event => event.preventDefault()}
              onDragStart={event => event.preventDefault()}/>
            <svg className="coloring-picture coloring-lines" viewBox="0 0 320 270" aria-hidden="true">
              {picture.regions.map(region => (
                <path key={region.id} d={region.path} fill="none"
                  stroke="#354d49" strokeWidth="3.5" strokeLinejoin="round"/>
              ))}
            </svg>
          </div>
          <div className="coloring-palette" role="group" aria-label="Pilih warna krayon">
            {palette.map(option => (
              <button key={option.name} type="button"
                className={'coloring-swatch' + (!eraser && option.name === color.name ? ' selected' : '')}
                style={{ backgroundColor: option.hex }}
                onClick={() => { setColor(option); setEraser(false) }}
                aria-pressed={!eraser && option.name === color.name}
                aria-label={'Krayon ' + option.name}><span>{option.name}</span></button>
            ))}
          </div>
          <div className="coloring-toolbar">
            <div className="brush-sizes" role="group" aria-label="Ukuran kuas">
              {[8, 13, 22].map(size => (
                <button key={size} className={'brush-size' + (brushSize === size ? ' selected' : '')}
                  type="button" aria-label={'Kuas ' + (size === 8 ? 'kecil' : size === 13 ? 'sedang' : 'besar')}
                  aria-pressed={brushSize === size} onClick={() => setBrushSize(size)}>
                  <span style={{ width: size, height: size }}/>
                </button>
              ))}
            </div>
            <button className={'quiet-button eraser-toggle' + (eraser ? ' selected' : '')}
              type="button" aria-pressed={eraser} onClick={() => setEraser(value => !value)}>
              {eraser ? 'Pakai krayon' : 'Penghapus'}
            </button>
            <button className="quiet-button" type="button" disabled={strokeCount === 0} onClick={undo}>Urungkan</button>
          </div>
          <p className="activity-help" aria-live="polite">
            {strokeCount ? 'Bagus! Kamu bisa menambah warna atau mencoba gambar berikutnya.' : 'Warna akan mengikuti gerakan jarimu.'}
          </p>
          <div className="activity-actions">
            <button className="quiet-button" type="button" disabled={strokeCount === 0} onClick={clear}>Hapus semua</button>
            <button className="primary-action" type="button" onClick={next}>
              {index === session.length - 1 ? 'Selesai' : 'Gambar berikutnya →'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
