import { useCallback, useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import rawContent from './data/content.json'
import audioManifest from './data/audioManifest.json'
import audioRevision from './data/audioRevision.json'
import { PlayActivity } from './PlayActivities'
import { AnimalIcon } from './AnimalIcon'
import { WorldArt } from './WorldArt'
import type { ActivityKind, ActivityWorld } from './PlayActivities'
import type { LearningContent, World, Question } from './data/types'

const content = rawContent as unknown as LearningContent
const audioKeys = new Set<string>(audioManifest.keys)
type Feedback = 'correct' | 'retry' | null
type Mode = ActivityKind | 'quiz' | null

const activityChoices: Record<string, { kind: Exclude<Mode, null>; title: string; detail: string }[]> = {
  warna: [
    { kind: 'mix', title: 'Campur warna', detail: 'Pilih dua warna, lalu lihat hasilnya.' },
    { kind: 'quiz', title: 'Tebak warna', detail: 'Cari warna yang disebutkan.' },
  ],
  bentuk: [
    { kind: 'trace', title: 'Tebalkan bentuk', detail: 'Ikuti garis dengan jari.' },
    { kind: 'quiz', title: 'Tebak bentuk', detail: 'Pilih bentuk yang tepat.' },
  ],
  hewan: [
    { kind: 'memory', title: 'Cari pasangan', detail: 'Balik kartu dan temukan gambar yang sama.' },
    { kind: 'trace', title: 'Tebalkan hewan', detail: 'Ikuti garis gambar hewan.' },
    { kind: 'quiz', title: 'Tebak hewan', detail: 'Kenali gambar hewan.' },
  ],
  angka: [
    { kind: 'count', title: 'Hitung benda', detail: 'Sentuh bendanya satu per satu.' },
    { kind: 'quiz', title: 'Tebak angka', detail: 'Pilih angka yang cocok.' },
  ],
  huruf: [
    { kind: 'trace', title: 'Tebalkan huruf', detail: 'Tulis huruf mengikuti garis.' },
    { kind: 'letters', title: 'Susun kata', detail: 'Gabungkan dua suku kata.' },
    { kind: 'quiz', title: 'Tebak huruf', detail: 'Kenali huruf dan kata.' },
  ],
}

function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items]
  for (let index = result.length - 1; index > 0; index--) {
    const other = Math.floor(Math.random() * (index + 1))
    ;[result[index], result[other]] = [result[other], result[index]]
  }
  return result
}
function newPlayRound(world: World): Question[] {
  return [...shuffle(world.levels['3']), ...shuffle(world.levels['5'])].map(q => ({
    ...q, options: shuffle(q.options),
  }))
}

function useNarration() {
  const activeAudio = useRef<HTMLAudioElement | null>(null)
  const stop = useCallback(() => {
    activeAudio.current?.pause()
    activeAudio.current = null
    if ('speechSynthesis' in window) window.speechSynthesis.cancel()
  }, [])
  const fallback = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) return
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'id-ID'
    utterance.rate = audioRevision.defaultPlaybackRate
    utterance.pitch = 1
    const idVoice = window.speechSynthesis.getVoices().find(v => v.lang.toLowerCase().startsWith('id'))
    if (idVoice) utterance.voice = idVoice
    window.speechSynthesis.speak(utterance)
  }, [])
  const speak = useCallback((key: string, text: string) => {
    stop()
    if (!audioKeys.has(key)) { fallback(text); return }
    const audio = new Audio(import.meta.env.BASE_URL + audioRevision.basePath + key + '.mp3')
    audio.playbackRate = audioRevision.defaultPlaybackRate
    activeAudio.current = audio
    audio.addEventListener('error', () => fallback(text), { once: true })
    void audio.play().catch(() => fallback(text))
  }, [fallback, stop])
  useEffect(() => stop, [stop])
  return { speak, stop }
}

export default function App() {
  const [world, setWorld] = useState<World | null>(null)
  const [mode, setMode] = useState<Mode>(null)
  const [step, setStep] = useState(0)
  const [round, setRound] = useState<Question[]>([])
  const [feedback, setFeedback] = useState<Feedback>(null)
  const [wrongChoice, setWrongChoice] = useState<string | null>(null)
  const [roundFinished, setRoundFinished] = useState(false)
  const { speak, stop } = useNarration()

  const openWorld = (next: World) => {
    setWorld(next)
    setMode(null)
    setRound([])
    setStep(0)
    setFeedback(null)
    setWrongChoice(null)
    setRoundFinished(false)
    speak('worlds/' + next.id + '/intro', next.intro)
  }
  const goHome = () => {
    stop()
    setWorld(null)
    setMode(null)
    setRound([])
    setFeedback(null)
    setRoundFinished(false)
    setWrongChoice(null)
  }
  const backToWorld = () => {
    stop()
    setMode(null)
    setFeedback(null)
    setWrongChoice(null)
    setRoundFinished(false)
  }
  const startMode = (next: Exclude<Mode, null>) => {
    if (!world) return
    setMode(next)
    setFeedback(null)
    setWrongChoice(null)
    setRoundFinished(false)
    if (next === 'quiz') {
      const questions = newPlayRound(world)
      setRound(questions)
      setStep(0)
      speak('questions/' + questions[0].id, questions[0].prompt)
    } else stop()
  }
  const currentQuestion = round[step] ?? null
  const chooseAnswer = (answer: string) => {
    if (!currentQuestion || !world || roundFinished || feedback === 'correct') return
    if (answer === currentQuestion.answer) {
      setFeedback('correct')
      setWrongChoice(null)
      speak('global/correct', content.correct)
    } else {
      setWrongChoice(answer)
      setFeedback('retry')
      speak('global/retry', content.retry)
    }
  }
  const nextQuestion = () => {
    if (!world || roundFinished || feedback !== 'correct') return
    if (step + 1 >= round.length) {
      stop()
      setRoundFinished(true)
      setFeedback(null)
      return
    }
    const next = round[step + 1]
    setStep(step + 1)
    setFeedback(null)
    setWrongChoice(null)
    speak('questions/' + next.id, next.prompt)
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <button className="brand" type="button" onClick={goHome} aria-label="Astakula Kids — halaman utama">
          <span className="brand-name">Astakula Kids</span>
        </button>
      </header>
      <main className="container">
        {!world ? (
          <section className="worlds-screen">
            <div className="section-heading">
              <div>
                <p className="eyebrow">ASTAKULA KIDS</p>
                <h1>Mau main apa hari ini?</h1>
                <p className="lead">Pilih satu dunia. Ada beberapa cara untuk bermain dan belajar.</p>
              </div>
            </div>
            <div className="world-grid">
              {content.worlds.map((item, index) => (
                <button key={item.id} type="button" className={'world-card world-' + item.tint} onClick={() => openWorld(item)}>
                  <div className="world-card-top">
                    <span className="world-number">{String(index + 1).padStart(2, '0')}</span>
                    <WorldArt id={item.id} />
                  </div>
                  <h2>{item.title}</h2>
                  <p>{item.id === 'warna' ? 'Kenali dan campur warna.' : item.id === 'bentuk' ? 'Kenali dan tebalkan bentuk.' :
                    item.id === 'hewan' ? 'Lihat, pasangkan, dan gambar hewan.' : item.id === 'angka' ?
                      'Hitung benda di layar.' : 'Tebalkan huruf dan susun kata.'}</p>
                  <span className="world-card-cta">Pilih permainan →</span>
                </button>
              ))}
            </div>
          </section>
        ) : mode === null ? (
          <section className="mode-screen">
            <nav className="game-nav"><button className="back-button" type="button" onClick={goHome}>← Semua dunia</button></nav>
            <h1>{world.title}</h1>
            <p className="mode-intro">Pilih cara bermain.</p>
            <div className="mode-grid">
              {(activityChoices[world.id] || []).map((activity, index) => (
                <button type="button" className="mode-card" key={activity.kind} onClick={() => startMode(activity.kind)}>
                  <span className="mode-index">{String(index + 1).padStart(2, '0')}</span>
                  <strong>{activity.title}</strong>
                  <span>{activity.detail}</span>
                  <span className="mode-arrow" aria-hidden="true">Mulai →</span>
                </button>
              ))}
            </div>
          </section>
        ) : mode !== 'quiz' ? (
          <PlayActivity key={world.id + '-' + mode} world={world.id as ActivityWorld} kind={mode} onBack={backToWorld} />
        ) : (
          <section className="game-screen">
            <nav className="game-nav" aria-label="Navigasi permainan">
              <button className="back-button" type="button" onClick={backToWorld}>← Pilih permainan</button>
              <span className="game-world-name">{world.title}</span>
            </nav>
            {roundFinished ? (
              <div className="session-finish-panel">
                <h1>Sudah selesai satu sesi.</h1>
                <p>Mau main lagi atau mencoba permainan lain?</p>
                <div className="session-actions">
                  <button className="continue-button" type="button" onClick={() => startMode('quiz')}>Main lagi</button>
                  <button className="secondary-button" type="button" onClick={backToWorld}>Pilih permainan lain</button>
                </div>
              </div>
            ) : currentQuestion ? (
              <div className={'question-panel game-' + world.tint}>
                <div className="question-header">
                  <span className="question-count">Pilih jawaban</span>
                </div>
                <div className="question-center">
                  <h1>{currentQuestion.prompt}</h1>
                  <button className="listen-button" type="button"
                    onClick={() => speak('questions/' + currentQuestion.id, currentQuestion.prompt)}>
                    <span aria-hidden="true">♪</span> Dengarkan lagi
                  </button>
                </div>
                <div className="answer-grid" aria-label="Pilihan jawaban">
                  {currentQuestion.options.map(answer => (
                    <button key={answer.id} type="button" disabled={feedback === 'correct'}
                      className={'answer-card' + (world.id === 'warna' ? ' color-answer-card' : '') +
                        (feedback === 'correct' && answer.id === currentQuestion.answer ? ' chosen' : '') +
                        (feedback === 'retry' && answer.id === wrongChoice ? ' is-wrong' : '')}
                      style={{ '--option-color': answer.color || '#f4eee5' } as CSSProperties}
                      onClick={() => chooseAnswer(answer.id)}>
                      {world.id !== 'warna' && <span className="answer-visual" aria-hidden="true">
                        {world.id === 'hewan'
                          ? <AnimalIcon id={answer.id} size={84} />
                          : answer.image
                            ? <img className="answer-image" src={import.meta.env.BASE_URL + answer.image} alt="" />
                            : answer.visual}
                      </span>}
                      <span className="answer-label">{answer.label}</span>
                    </button>
                  ))}
                </div>
                <div className={'feedback-row' + (feedback ? ' visible' : '')} aria-live="polite">
                  {feedback === 'correct' ? (
                    <>
                      <span>Benar!</span>
                      <button type="button" className="continue-button" onClick={nextQuestion}>
                        {step + 1 === round.length ? 'Selesai →' : 'Lanjut →'}
                      </button>
                    </>
                  ) : feedback === 'retry' ? <span>Coba lagi. Pilih yang lain.</span> : <span>Sentuh salah satu jawaban.</span>}
                </div>
              </div>
            ) : null}
          </section>
        )}
      </main>
      <footer className="site-footer">
        <span>Astakula Kids</span>
        <span>Tanpa iklan · Tanpa akun · Narasi: <a href="https://elevenlabs.io/" target="_blank" rel="noopener noreferrer">ElevenLabs</a></span>
      </footer>
    </div>
  )
}
