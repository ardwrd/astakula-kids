import { useCallback, useEffect, useRef, useState } from 'react'
import type { PointerEvent } from 'react'

type Color = { name: string; hex: string }
const palette: Color[] = [
  { name: 'Merah', hex: '#e76a62' }, { name: 'Kuning', hex: '#f1bf48' },
  { name: 'Biru', hex: '#629bd0' }, { name: 'Hijau', hex: '#65aa79' },
  { name: 'Ungu', hex: '#a48ac4' }, { name: 'Jingga', hex: '#eda063' },
]

type Picture = { title: string; asset: string }

// CC0 coloring line art curated from Openclipart. Source/license details:
// docs/COLORING_ASSET_SOURCES.md. One consistent large drawing per sheet.
const pictures: Picture[] = [
  { title: 'Kucing', asset: 'cat' },
  { title: 'Kelinci', asset: 'rabbit' },
  { title: 'Anjing', asset: 'dog' },
  { title: 'Burung hantu', asset: 'owl' },
  { title: 'Pohon', asset: 'tree' },
  { title: 'Matahari', asset: 'sun' },
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
    // Children paint freely like on a coloring sheet. The clear line-art
    // image sits above the strokes to keep each illustration recognizable.
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
  }, [getContext])

  const repaint = useCallback(() => {
    const context = getContext()
    if (!context) return
    context.clearRect(0, 0, 320, 270)
    for (const stroke of strokesRef.current) draw(stroke)
  }, [draw, getContext])

  useEffect(() => { repaint() }, [repaint, index])

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
    if (strokeCount > 0) narrate('global/correct')
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
          <p className="activity-instruction">Pilih krayon, lalu warnai gambar dengan jari.</p>
          <div className="coloring-sheet">
            <div className="coloring-page-base" aria-hidden="true" />
            <canvas ref={canvasRef} width={640} height={540} className="coloring-canvas"
              aria-label={'Mewarnai ' + picture.title + ' dengan jari'}
              onPointerDown={pointerDown} onPointerMove={pointerMove}
              onPointerUp={pointerEnd} onPointerCancel={pointerEnd}
              onContextMenu={event => event.preventDefault()}
              onDragStart={event => event.preventDefault()}/>
            <img className="coloring-lineart" src={import.meta.env.BASE_URL + 'coloring/cc0-' + picture.asset + '.svg'}
              alt="" draggable={false} aria-hidden="true" />

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
