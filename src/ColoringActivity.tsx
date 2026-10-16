import { useCallback, useEffect, useRef, useState } from 'react'
import type { PointerEvent } from 'react'

type Color = { name: string; hex: string }
type Stroke = { color: string; eraser: boolean; size: number; points: { x: number; y: number }[] }
type Picture = { id: string; name: string }

const WIDTH = 320
const HEIGHT = 270
const SCALE = 2
const colors: Color[] = [
  { name: 'Merah', hex: '#F4515B' },
  { name: 'Kuning', hex: '#FFC83C' },
  { name: 'Biru', hex: '#328CFA' },
  { name: 'Hijau', hex: '#25BD78' },
  { name: 'Ungu', hex: '#9559DF' },
  { name: 'Jingga', hex: '#FF903F' },
  { name: 'Pink', hex: '#F36AAC' },
  { name: 'Cokelat', hex: '#AC7049' },
  { name: 'Toska', hex: '#19B5BF' },
]

// First play starts with the simplest outlines; replays can vary the order.
const pictures: Picture[] = [
  { id: 'balloon', name: 'Balon' },
  { id: 'sun', name: 'Matahari' },
  { id: 'fish', name: 'Ikan' },
  { id: 'flower', name: 'Bunga' },
  { id: 'house', name: 'Rumah' },
  { id: 'car', name: 'Mobil' },
]

function shuffle<T>(values: readonly T[]): T[] {
  const array = [...values]
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

export function ColoringActivity() {
  const [order, setOrder] = useState(() => [...pictures])
  const [index, setIndex] = useState(0)
  const [selectedColor, setSelectedColor] = useState(colors[0].hex)
  const [width, setWidth] = useState(15)
  const [erasing, setErasing] = useState(false)
  const [strokeCount, setStrokeCount] = useState(0)
  const [finished, setFinished] = useState(false)
  const canvas = useRef<HTMLCanvasElement>(null)
  const strokes = useRef<Stroke[]>([])
  const active = useRef<Stroke | null>(null)
  const pointer = useRef<number | null>(null)
  const picture = order[index]

  const context = useCallback(() => {
    const ctx = canvas.current?.getContext('2d')
    if (!ctx) return null
    ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0)
    return ctx
  }, [])

  const drawStroke = useCallback((stroke: Stroke) => {
    const ctx = context()
    if (!ctx || stroke.points.length === 0) return
    ctx.save()
    ctx.globalCompositeOperation = stroke.eraser ? 'destination-out' : 'source-over'
    ctx.strokeStyle = stroke.color
    ctx.fillStyle = stroke.color
    ctx.lineWidth = stroke.size
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
    const first = stroke.points[0]
    // A tap produces a dot; swipes create a continuous line.
    ctx.beginPath()
    ctx.arc(first.x, first.y, stroke.size / 2, 0, Math.PI * 2)
    ctx.fill()
    if (stroke.points.length > 1) {
      ctx.beginPath()
      ctx.moveTo(first.x, first.y)
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y)
      }
      ctx.stroke()
    }
    ctx.restore()
  }, [context])

  const redraw = useCallback(() => {
    const ctx = context()
    if (!ctx) return
    ctx.clearRect(0, 0, WIDTH, HEIGHT)
    strokes.current.forEach(drawStroke)
  }, [context, drawStroke])

  useEffect(() => { redraw() }, [redraw, picture.id])

  const localPoint = (event: PointerEvent<HTMLCanvasElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    if (!bounds.width || !bounds.height) return null
    return {
      x: (event.clientX - bounds.left) * WIDTH / bounds.width,
      y: (event.clientY - bounds.top) * HEIGHT / bounds.height,
    }
  }

  const start = (event: PointerEvent<HTMLCanvasElement>) => {
    if (pointer.current !== null || (event.pointerType === 'mouse' && event.button !== 0)) return
    event.preventDefault()
    const at = localPoint(event)
    if (!at) return
    pointer.current = event.pointerId
    event.currentTarget.setPointerCapture(event.pointerId)
    const stroke: Stroke = { color: selectedColor, eraser: erasing, size: erasing ? width * 1.8 : width, points: [at] }
    active.current = stroke
    drawStroke(stroke)
  }

  const move = (event: PointerEvent<HTMLCanvasElement>) => {
    if (pointer.current !== event.pointerId || !active.current) return
    event.preventDefault()
    const at = localPoint(event)
    if (!at) return
    const stroke = active.current
    const previous = stroke.points[stroke.points.length - 1]
    const ctx = context()
    if (!ctx) return
    ctx.save()
    ctx.globalCompositeOperation = stroke.eraser ? 'destination-out' : 'source-over'
    ctx.strokeStyle = stroke.color
    ctx.lineWidth = stroke.size
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    ctx.moveTo(previous.x, previous.y)
    ctx.lineTo(at.x, at.y)
    ctx.stroke()
    ctx.restore()
    stroke.points.push(at)
  }

  const end = (event: PointerEvent<HTMLCanvasElement>) => {
    if (pointer.current !== event.pointerId) return
    if (active.current) {
      strokes.current.push(active.current)
      setStrokeCount(strokes.current.length)
    }
    active.current = null
    pointer.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
  }

  const clear = () => {
    active.current = null
    pointer.current = null
    strokes.current = []
    setStrokeCount(0)
    redraw()
  }

  const undo = () => {
    if (!strokes.current.length) return
    strokes.current.pop()
    setStrokeCount(strokes.current.length)
    redraw()
  }

  const next = () => {
    clear()
    setErasing(false)
    if (index + 1 === order.length) { setFinished(true); return }
    setIndex(current => current + 1)
  }

  const replay = () => {
    clear()
    setIndex(0)
    setOrder(shuffle(pictures))
    setFinished(false)
  }

  if (finished) return (
    <div className="activity-inner coloring-activity coloring-finish">
      <h2>Sudah mencoba semua gambar.</h2>
      <p>Ingin mewarnai lagi?</p>
      <button className="primary-action" type="button" onClick={replay}>Mewarnai lagi</button>
    </div>
  )

  return (
    <div className="activity-inner coloring-activity">
      <div className="trace-title">
        <h2>{picture.name}</h2>
        <span>{index + 1} dari {order.length}</span>
      </div>
      <p className="activity-instruction">Pilih warna, lalu usapkan jari pada gambar.</p>
      <div className="coloring-sheet">
        <canvas
          ref={canvas}
          width={WIDTH * SCALE}
          height={HEIGHT * SCALE}
          className="coloring-canvas"
          aria-label={'Kanvas mewarnai ' + picture.name}
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerCancel={end}
          onContextMenu={event => event.preventDefault()}
          onDragStart={event => event.preventDefault()}
        />
        <img
          src={import.meta.env.BASE_URL + 'coloring/' + picture.id + '.svg'}
          className="coloring-lineart"
          alt=""
          draggable={false}
        />
      </div>
      <div className="coloring-palette" role="group" aria-label="Pilih warna">
        {colors.map(color => (
          <button
            type="button"
            key={color.name}
            className={'coloring-swatch' + (!erasing && selectedColor === color.hex ? ' selected' : '')}
            style={{ background: color.hex }}
            aria-pressed={!erasing && selectedColor === color.hex}
            aria-label={'Krayon ' + color.name}
            onClick={() => { setSelectedColor(color.hex); setErasing(false) }}
          ><span>{color.name}</span></button>
        ))}
      </div>
      <div className="coloring-toolbar">
        <div className="brush-sizes" role="group" aria-label="Ukuran krayon">
          {[8, 15, 25].map(size => (
            <button
              type="button"
              key={size}
              className={'brush-size' + (width === size ? ' selected' : '')}
              aria-label={'Krayon ' + (size === 8 ? 'kecil' : size === 15 ? 'sedang' : 'besar')}
              aria-pressed={width === size}
              onClick={() => setWidth(size)}
            ><span style={{ width: size, height: size }} /></button>
          ))}
        </div>
        <button type="button" className={'quiet-button eraser-toggle' + (erasing ? ' selected' : '')}
          onClick={() => setErasing(old => !old)} aria-pressed={erasing}>
          {erasing ? 'Pakai krayon' : 'Penghapus'}
        </button>
        <button type="button" className="quiet-button" disabled={strokeCount === 0} onClick={undo}>Urungkan</button>
      </div>
      <p className="activity-help" aria-live="polite">
        {strokeCount > 0 ? 'Bagus! Bebas mewarnai sesukamu.' : 'Goreskan jari di atas gambar.'}
      </p>
      <div className="activity-actions">
        <button type="button" className="quiet-button" disabled={strokeCount === 0} onClick={clear}>Hapus semua</button>
        <button type="button" className="primary-action" onClick={next}>
          {index === order.length - 1 ? 'Selesai' : 'Gambar berikutnya →'}
        </button>
      </div>
    </div>
  )
}
