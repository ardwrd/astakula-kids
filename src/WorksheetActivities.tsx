import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, PointerEvent } from 'react'
import './worksheet.css'

export const WORKSHEET_KINDS = ['vowel-colors', 'dice-match', 'connect-dots', 'number-paint', 'veggie-baskets'] as const
export type WorksheetKind = typeof WORKSHEET_KINDS[number]
type Narrate = (key: string, queued?: boolean) => void

function shuffle<T>(items: readonly T[]): T[] {
  const array = [...items]
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

function Progress({ step, total }: { step: number; total: number }) {
  return <p className="worksheet-progress" aria-label={'Langkah ' + step + ' dari ' + total}>Langkah {step} dari {total}</p>
}

function Finished({ title, onReplay }: { title: string; onReplay: () => void }) {
  return <div className="worksheet-finish">
    <div className="worksheet-finish-art" aria-hidden="true">✓</div>
    <h2>{title}</h2>
    <p>Mau main lagi?</p>
    <button className="primary-action" type="button" onClick={onReplay}>Main lagi</button>
  </div>
}

const vowels = [
  { letter: 'a', name: 'merah', color: '#F86666' },
  { letter: 'i', name: 'biru', color: '#78BDF6' },
  { letter: 'u', name: 'kuning', color: '#FFE06E' },
  { letter: 'e', name: 'hijau', color: '#7AD79B' },
  { letter: 'o', name: 'merah muda', color: '#F7A0B8' },
] as const
type Vowel = typeof vowels[number]['letter']

function VowelColors({ narrate }: { narrate: Narrate }) {
  const [letters, setLetters] = useState<Vowel[]>(() => shuffle(['a', 'a', 'i', 'u', 'e', 'o']))
  const [targetOrder, setTargetOrder] = useState<Vowel[]>(() => shuffle(['a', 'a', 'i', 'u', 'e', 'o']))
  const [painted, setPainted] = useState<number[]>([])
  const [mistake, setMistake] = useState(false)
  const target = targetOrder[painted.length]
  const current = vowels.find(item => item.letter === target)
  const completed = painted.length === letters.length
  const announcedFirst = useRef(false)

  useEffect(() => {
    if (!announcedFirst.current) {
      announcedFirst.current = true
      narrate('activities/vowel/' + targetOrder[0], true)
    }
  }, [narrate, targetOrder])

  function select(index: number) {
    if (painted.includes(index) || completed) return
    if (letters[index] !== target) {
      setMistake(true)
      narrate('global/retry')
      return
    }
    setMistake(false)
    setPainted(old => [...old, index])
    if (painted.length + 1 === letters.length) narrate('global/correct')
    else narrate('activities/vowel/' + targetOrder[painted.length + 1])
  }

  function replay() {
    setLetters(shuffle(['a', 'a', 'i', 'u', 'e', 'o']))
    const fresh = shuffle(['a', 'a', 'i', 'u', 'e', 'o'] as Vowel[])
    setTargetOrder(fresh)
    setPainted([])
    setMistake(false)
    narrate('activities/vowel/' + fresh[0])
  }

  if (completed) return <Finished title="Hore, semua huruf berwarna!" onReplay={replay} />
  return <div className="worksheet-body">
    <Progress step={painted.length + 1} total={letters.length} />
    <h2>Ayo warnai huruf!</h2>
    <p className="worksheet-instruction">Cari huruf <strong>{target.toUpperCase()}</strong>. Sentuh, ya!</p>
    <div className="worksheet-color-hint">
      <span className="worksheet-target-color" style={{ background: current?.color }} aria-hidden="true" />
      <span>Warnai huruf <strong>{target.toUpperCase()}</strong> dengan warna <strong>{current?.name}</strong>.</span>
    </div>
    <div className="worksheet-vowels" role="group" aria-label="Kotak huruf">
      {letters.map((letter, index) => {
        const filled = painted.includes(index)
        const entry = vowels.find(item => item.letter === letter)
        return <button type="button" key={index} className={'worksheet-vowel' + (filled ? ' is-filled' : '')}
          style={{ '--tile-color': entry?.color || '#fff' } as CSSProperties}
          aria-label={'Huruf ' + letter.toUpperCase() + (filled ? ', sudah diwarnai' : '')}
          disabled={filled} onClick={() => select(index)}>{letter}</button>
      })}
    </div>
    <p className="worksheet-feedback" role="status">{mistake ? 'Coba cari huruf ' + target.toUpperCase() + ' yang lain.' : 'Ayo sentuh hurufnya!'}</p>
  </div>
}

const dotCoordinates: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [[25, 25], [75, 75]],
  3: [[25, 25], [50, 50], [75, 75]],
  4: [[25, 25], [75, 25], [25, 75], [75, 75]],
  5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
  6: [[25, 20], [75, 20], [25, 50], [75, 50], [25, 80], [75, 80]],
}
function DiceFace({ count }: { count: number }) {
  return <svg className="worksheet-dice-face" viewBox="0 0 100 100" role="img" aria-label={'Dadu dengan ' + count + ' titik'}>
    <rect x="4" y="4" width="92" height="92" rx="15" fill="#fff" stroke="#2A3443" strokeWidth="4" />
    {dotCoordinates[count].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="7.5" fill="#263953" />)}
  </svg>
}
function DiceMatch({ narrate }: { narrate: Narrate }) {
  const [rounds, setRounds] = useState(() => shuffle([1, 2, 3, 4, 5, 6]))
  const [step, setStep] = useState(0)
  const [correct, setCorrect] = useState(false)
  const [mistake, setMistake] = useState(false)
  const answer = rounds[step]
  const options = useMemo(() => answer === undefined ? [] :
    shuffle([answer, answer % 6 + 1, (answer + 1) % 6 + 1]), [answer])

  function select(number: number) {
    if (correct) return
    if (number !== answer) {
      setMistake(true)
      narrate('global/retry')
    } else {
      setCorrect(true)
      setMistake(false)
      narrate('global/correct')
    }
  }
  function next() { setStep(old => old + 1); setCorrect(false); setMistake(false) }
  function replay() { setRounds(shuffle([1, 2, 3, 4, 5, 6])); setStep(0); setCorrect(false); setMistake(false) }

  if (step === rounds.length) return <Finished title="Hore, dadu selesai dihitung!" onReplay={replay} />
  return <div className="worksheet-body">
    <Progress step={step + 1} total={rounds.length} />
    <h2>Ada berapa titik?</h2>
    <p className="worksheet-instruction">Yuk, hitung titik di dadu!</p>
    <div className="worksheet-dice-stage"><DiceFace count={answer} /></div>
    <div className="worksheet-number-options">
      {options.map(number => <button type="button" key={number} className={'worksheet-number-option' + (correct && number === answer ? ' is-correct' : '')}
        disabled={correct} onClick={() => select(number)}>{number}</button>)}
    </div>
    <p className="worksheet-feedback" role="status">{correct ? 'Benar! Ada ' + answer + ' titik.' : mistake ? 'Hitung lagi titiknya, ya.' : 'Sentuh angka yang benar, ya.'}</p>
    {correct && <button className="primary-action worksheet-next" type="button" onClick={next}>{step === rounds.length - 1 ? 'Selesai' : 'Dadu berikutnya →'}</button>}
  </div>
}

const dots = [
  { value: 1, x: 55, y: 48, color: '#FF7978' },
  { value: 2, x: 160, y: 48, color: '#FFE071' },
  { value: 3, x: 265, y: 48, color: '#8CD86B' },
  { value: 4, x: 55, y: 162, color: '#63C0F8' },
  { value: 5, x: 160, y: 162, color: '#47B8C3' },
  { value: 6, x: 265, y: 162, color: '#C988E9' },
]
const patterns = [
  [1, 2, 3, 4, 5, 6],
  [1, 4, 2, 5, 3, 6],
  [3, 2, 1, 4, 6, 5],
  [2, 5, 4, 1, 3, 6],
]

function ConnectDots({ narrate }: { narrate: Narrate }) {
  const [rounds, setRounds] = useState(() => shuffle(patterns))
  const [step, setStep] = useState(0)
  const [visited, setVisited] = useState<number[]>([])
  const visitedRef = useRef<number[]>([])
  const activePointer = useRef<number | null>(null)
  const [mistake, setMistake] = useState(false)
  const pattern = rounds[step]
  const complete = visited.length === 6
  const announcedFirst = useRef(false)

  useEffect(() => {
    if (!announcedFirst.current) {
      announcedFirst.current = true
      narrate('activities/count/' + pattern[0], true)
    }
  }, [narrate, pattern])

  function visit(value: number) {
    const already = visitedRef.current
    if (already.includes(value) || already.length >= 6) return
    if (pattern[already.length] !== value) {
      setMistake(true)
      return
    }
    const next = [...already, value]
    visitedRef.current = next
    setVisited(next)
    setMistake(false)
    if (next.length === 6) narrate('global/correct')
    else narrate('activities/count/' + pattern[next.length])
  }

  function hitPoint(event: PointerEvent<HTMLDivElement>) {
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - bounds.left) * 320 / bounds.width
    const y = (event.clientY - bounds.top) * 212 / bounds.height
    const near = dots.find(dot => Math.hypot(dot.x - x, dot.y - y) < 32)
    if (near) visit(near.value)
  }
  function startDrag(event: PointerEvent<HTMLDivElement>) {
    if (activePointer.current !== null || complete) return
    event.preventDefault()
    activePointer.current = event.pointerId
    event.currentTarget.setPointerCapture(event.pointerId)
    hitPoint(event)
  }
  function moveDrag(event: PointerEvent<HTMLDivElement>) {
    if (activePointer.current !== event.pointerId) return
    event.preventDefault()
    hitPoint(event)
  }
  function endDrag(event: PointerEvent<HTMLDivElement>) {
    if (activePointer.current !== event.pointerId) return
    activePointer.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
  }
  function resetRoute() { visitedRef.current = []; setVisited([]); setMistake(false) }
  function next() {
    resetRoute()
    narrate('activities/count/' + rounds[step + 1][0])
    setStep(old => old + 1)
  }
  function replay() {
    resetRoute()
    const fresh = shuffle(patterns)
    setRounds(fresh)
    setStep(0)
    narrate('activities/count/' + fresh[0][0])
  }
  if (step === rounds.length) return <Finished title="Hore, semua titik tersambung!" onReplay={replay} />

  return <div className="worksheet-body">
    <Progress step={step + 1} total={rounds.length} />
    <h2>Ayo sambungkan titik!</h2>
    <p className="worksheet-instruction">Sentuh titik sesuai urutan angka. Boleh juga tarik jarimu!</p>
    <div className="worksheet-route-list" aria-label={'Urutan ' + pattern.join(', ')}>
      {pattern.map((number, i) => <span key={i} className={'worksheet-route-number' + (i < visited.length ? ' is-done' : '')}>
        {number}{i < pattern.length - 1 && <span className="worksheet-route-arrow" aria-hidden="true">→</span>}
      </span>)}
    </div>
    <div className="worksheet-dot-stage" onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag}>
      <svg viewBox="0 0 320 212" preserveAspectRatio="none" className="worksheet-lines" aria-hidden="true">
        {visited.slice(1).map((value, i) => {
          const p1 = dots.find(dot => dot.value === visited[i])!
          const p2 = dots.find(dot => dot.value === value)!
          return <line key={i} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#2A698D" strokeWidth="7" strokeLinecap="round" />
        })}
      </svg>
      {dots.map(dot => <button type="button" key={dot.value}
        className={'worksheet-dot' + (visited.includes(dot.value) ? ' is-done' : '')}
        style={{ left: dot.x / 320 * 100 + '%', top: dot.y / 212 * 100 + '%', background: dot.color }}
        aria-label={'Titik nomor ' + dot.value} onClick={() => visit(dot.value)}>{dot.value}</button>)}
    </div>
    <p className="worksheet-feedback" role="status">{complete ? 'Hore, sudah tersambung!' : mistake ? 'Cari angka ' + pattern[visited.length] + ' dulu, ya.' : 'Cari titik nomor ' + pattern[visited.length] + '.'}</p>
    <div className="worksheet-actions">
      <button className="quiet-button" type="button" onClick={resetRoute}>Hapus garis</button>
      {complete && <button className="primary-action" type="button" onClick={next}>{step === rounds.length - 1 ? 'Selesai' : 'Jalur berikutnya →'}</button>}
    </div>
  </div>
}

const numberPalette = [
  { value: 1, name: 'Merah', color: '#FF827C' },
  { value: 2, name: 'Jingga', color: '#FFC467' },
  { value: 3, name: 'Hijau', color: '#63D2A2' },
  { value: 4, name: 'Biru', color: '#80C6FA' },
  { value: 5, name: 'Ungu', color: '#A9A2F2' },
]
const numberBoards = [[1, 2, 3, 4], [5, 2, 1, 3], [4, 1, 5, 2], [3, 2, 4, 5]]

function NumberPaint({ narrate }: { narrate: Narrate }) {
  const [boards, setBoards] = useState(() => shuffle(numberBoards))
  const [step, setStep] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [filled, setFilled] = useState<number[]>([])
  const [mistake, setMistake] = useState(false)
  const current = boards[step]
  const complete = filled.length === 4

  function colorCell(index: number) {
    if (filled.includes(index)) return
    if (selected === null) { setMistake(true); return }
    if (selected !== current[index]) { setMistake(true); narrate('global/retry'); return }
    setFilled(old => [...old, index])
    setMistake(false)
    if (filled.length + 1 === 4) narrate('global/correct')
  }
  function resetBoard() { setFilled([]); setSelected(null); setMistake(false) }
  function next() { resetBoard(); setStep(old => old + 1) }
  function replay() { resetBoard(); setBoards(shuffle(numberBoards)); setStep(0) }
  if (step === boards.length) return <Finished title="Hore, semua kotak berwarna!" onReplay={replay} />

  return <div className="worksheet-body">
    <Progress step={step + 1} total={boards.length} />
    <h2>Ayo warnai kotak!</h2>
    <p className="worksheet-instruction">Pilih warna, lalu cari angka yang sama.</p>
    <div className="worksheet-paint-palette" role="group" aria-label="Pilih warna berdasarkan angka">
      {numberPalette.map(entry => <button type="button" key={entry.value} className={'worksheet-paint-swatch' + (selected === entry.value ? ' is-selected' : '')}
        style={{ background: entry.color }} aria-label={'Nomor ' + entry.value + ', warna ' + entry.name}
        aria-pressed={selected === entry.value} onClick={() => { setSelected(entry.value); setMistake(false); narrate('activities/count/' + entry.value) }}>{entry.value}</button>)}
    </div>
    <div className="worksheet-number-board" role="group" aria-label="Empat kotak angka">
      {current.map((number, index) => {
        const isFilled = filled.includes(index)
        const entry = numberPalette.find(color => color.value === number)
        return <button type="button" key={index} className={'worksheet-paint-cell' + (isFilled ? ' is-filled' : '')}
          disabled={isFilled} style={{ background: isFilled ? entry?.color : '#fff' }}
          aria-label={'Kotak angka ' + number + (isFilled ? ', sudah diwarnai' : '')} onClick={() => colorCell(index)}>{number}</button>
      })}
    </div>
    <p className="worksheet-feedback" role="status">{complete ? 'Semua kotak sudah cocok!' : mistake ? selected === null ? 'Pilih warna dulu, ya.' : 'Cari kotak dengan angka yang sama.' : selected === null ? 'Pilih satu warna dulu, ya.' : 'Ayo cari kotak angka ' + selected + '.'}</p>
    <div className="worksheet-actions">
      <button className="quiet-button" type="button" onClick={resetBoard}>Hapus warna</button>
      {complete && <button className="primary-action" type="button" onClick={next}>{step === boards.length - 1 ? 'Selesai' : 'Kotak berikutnya →'}</button>}
    </div>
  </div>
}

type Vegetable = 'wortel' | 'tomat' | 'terong'
const vegetables: { id: Vegetable; name: string; value: number }[] = [
  { id: 'wortel', name: 'Wortel', value: 1 },
  { id: 'tomat', name: 'Tomat', value: 2 },
  { id: 'terong', name: 'Terong', value: 3 },
]
function VegetableIcon({ id }: { id: Vegetable }) {
  return <svg viewBox="0 0 82 92" className="worksheet-vegetable" role="img" aria-label={id}>
    {id === 'wortel' && <>
      <path d="M32 27 L24 12 L36 17 L41 7 L45 20 L58 12 L50 29" fill="#64BB70" stroke="#397F4A" strokeWidth="3" strokeLinejoin="round" />
      <path d="M21 30 Q41 19 59 31 Q57 55 39 81 Q27 64 21 30 Z" fill="#FF9A45" stroke="#A8542E" strokeWidth="3" strokeLinejoin="round" />
      <path d="M28 42 L35 46 M45 56 L53 51" stroke="#C66B31" strokeWidth="3" strokeLinecap="round" />
    </>}
    {id === 'tomat' && <>
      <circle cx="41" cy="51" r="28" fill="#F76564" stroke="#B73E3D" strokeWidth="3" />
      <path d="M41 28 L30 20 L34 33 L21 35 L37 38 L41 47 L45 38 L60 35 L48 32 L52 20 Z" fill="#60B96D" stroke="#387D45" strokeWidth="2" strokeLinejoin="round" />
    </>}
    {id === 'terong' && <>
      <path d="M36 28 Q12 38 18 62 Q23 84 47 78 Q64 73 66 54 Q65 39 52 30 Z" fill="#9865BD" stroke="#68418A" strokeWidth="3" />
      <path d="M29 24 L39 13 L45 28 L58 21 L53 33 L37 39 Z" fill="#6BB96D" stroke="#387D45" strokeWidth="3" strokeLinejoin="round" />
      <path d="M39 18 Q33 10 35 5" fill="none" stroke="#387D45" strokeWidth="4" strokeLinecap="round" />
    </>}
  </svg>
}
const basketRounds: Vegetable[][] = [
  ['wortel', 'tomat'], ['wortel', 'wortel'], ['tomat', 'tomat'],
  ['terong', 'wortel'], ['terong', 'tomat'],
]
function VeggieBaskets({ narrate }: { narrate: Narrate }) {
  const [rounds, setRounds] = useState(() => shuffle(basketRounds))
  const [step, setStep] = useState(0)
  const [correct, setCorrect] = useState(false)
  const [mistake, setMistake] = useState(false)
  const basket = rounds[step]
  const answer = basket?.reduce((sum, vegetable) => sum + (vegetables.find(item => item.id === vegetable)?.value || 0), 0) || 0
  const options = useMemo(() => answer === 0 ? [] : shuffle([answer, answer === 5 ? 3 : answer + 1, answer === 2 ? 5 : answer - 1]), [answer])
  function select(number: number) {
    if (correct) return
    if (number !== answer) { setMistake(true); narrate('global/retry') }
    else { setCorrect(true); setMistake(false); narrate('global/correct') }
  }
  function next() { setStep(old => old + 1); setCorrect(false); setMistake(false) }
  function replay() { setRounds(shuffle(basketRounds)); setStep(0); setCorrect(false); setMistake(false) }
  if (step === rounds.length) return <Finished title="Hore, keranjangnya selesai!" onReplay={replay} />
  return <div className="worksheet-body">
    <Progress step={step + 1} total={rounds.length} />
    <h2>Yuk, hitung sayurnya!</h2>
    <p className="worksheet-instruction">Setiap sayur punya angka. Berapa semuanya?</p>
    <div className="worksheet-veggie-key" aria-label="Nilai setiap sayur">
      {vegetables.map(item => <div className="worksheet-veggie-key-item" key={item.id}>
        <VegetableIcon id={item.id} /><strong>{item.value}</strong><span>{item.name}</span>
      </div>)}
    </div>
    <div className="worksheet-basket-area">
      <div className="worksheet-basket-items">{basket.map((id, i) => <VegetableIcon key={i} id={id} />)}</div>
      <div className="worksheet-basket-bottom" aria-hidden="true" />
    </div>
    <div className="worksheet-veggie-equation" aria-label={'Berapa hasil ' + basket.map(id => vegetables.find(v => v.id === id)?.value).join(' tambah ') + '?'}>
      {basket.map((id, i) => <span key={i}>{i > 0 && <b>+</b>}{vegetables.find(v => v.id === id)?.value}</span>)}
      <span>= ?</span>
    </div>
    <div className="worksheet-number-options">
      {options.map(number => <button type="button" key={number} className={'worksheet-number-option' + (correct && number === answer ? ' is-correct' : '')}
        disabled={correct} onClick={() => select(number)}>{number}</button>)}
    </div>
    <p className="worksheet-feedback" role="status">{correct ? 'Benar, hasilnya ' + answer + '!' : mistake ? 'Ayo, hitung lagi!' : 'Berapa semuanya, ya?'}</p>
    {correct && <button className="primary-action worksheet-next" type="button" onClick={next}>{step === rounds.length - 1 ? 'Selesai' : 'Keranjang berikutnya →'}</button>}
  </div>
}

export function WorksheetGame({ kind, narrate }: { kind: WorksheetKind; narrate: Narrate }) {
  if (kind === 'vowel-colors') return <VowelColors narrate={narrate} />
  if (kind === 'dice-match') return <DiceMatch narrate={narrate} />
  if (kind === 'connect-dots') return <ConnectDots narrate={narrate} />
  if (kind === 'number-paint') return <NumberPaint narrate={narrate} />
  return <VeggieBaskets narrate={narrate} />
}
