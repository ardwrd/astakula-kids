import { useCallback, useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import rawContent from './data/content.json'
import audioManifest from './data/audioManifest.json'
import audioRevision from './data/audioRevision.json'
import type { LearningContent, World } from './data/types'

const content = rawContent as unknown as LearningContent
const audioKeys = new Set<string>(audioManifest.keys)
const STORAGE_KEY = 'astakula-kids:progress:v1'
const AUDIO_RATE_STORAGE_KEY = audioRevision.id === 'legacy-v2'
  ? 'astakula-kids:audio-rate:v1'
  : 'astakula-kids:audio-rate:' + audioRevision.id
type Progress = Record<string, string[]>
type Feedback = 'correct' | 'retry' | null

// Keep age-bucketed content internally as a gentle difficulty progression,
// but never ask children to select an age or display ages in the interface.
function questionsForWorld(world: World) {
  return [...world.levels['3'], ...world.levels['5']]
}

function readProgress(): Progress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return {}
    const stored: Progress = Object.fromEntries(
      Object.entries(parsed)
        .filter(([, value]) => Array.isArray(value))
        .map(([key, value]) => [key, (value as unknown[]).filter((v): v is string => typeof v === 'string')]),
    )
    // Migrate existing 3:warna / 5:warna records without losing progress.
    for (const world of content.worlds) {
      const oldKeys = ['3:' + world.id, '5:' + world.id]
      const validIds = new Set(questionsForWorld(world).map((question) => question.id))
      const completed = Array.from(new Set([
        ...(stored[world.id] || []),
        ...oldKeys.flatMap((key) => stored[key] || []),
      ])).filter((id) => validIds.has(id))
      if (completed.length > 0) stored[world.id] = completed
      for (const key of oldKeys) delete stored[key]
    }
    return stored
  } catch {
    return {}
  }
}

function readAudioRate(): number {
  try {
    const value = Number(localStorage.getItem(AUDIO_RATE_STORAGE_KEY))
    return [0.75, 0.85, 1].includes(value) ? value : audioRevision.defaultPlaybackRate
  } catch {
    return audioRevision.defaultPlaybackRate
  }
}

function useNarration(speed: number) {
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
    utterance.rate = speed
    utterance.pitch = 1.05
    const voices = window.speechSynthesis.getVoices()
    const indonesian = voices.find((voice) => voice.lang.toLowerCase().startsWith('id'))
    if (indonesian) utterance.voice = indonesian
    window.speechSynthesis.speak(utterance)
  }, [speed])

  const speak = useCallback((key: string, text: string) => {
    stop()
    if (!audioKeys.has(key)) {
      fallback(text)
      return
    }
    const player = new Audio(import.meta.env.BASE_URL + audioRevision.basePath + key + '.mp3')
    // Slow down pre-generated MP3 clips without consuming ElevenLabs credits.
    // Modern browsers preserve speech pitch when changing playbackRate.
    player.playbackRate = speed
    activeAudio.current = player
    player.addEventListener('error', () => fallback(text), { once: true })
    void player.play().catch(() => fallback(text))
  }, [fallback, stop, speed])

  useEffect(() => stop, [stop])
  return { speak, stop }
}

export default function App() {
  const [world, setWorld] = useState<World | null>(null)
  const [step, setStep] = useState(0)
  const [feedback, setFeedback] = useState<Feedback>(null)
  const [finished, setFinished] = useState(false)
  const [progress, setProgress] = useState<Progress>(readProgress)
  const [parentsOpen, setParentsOpen] = useState(false)
  const [audioRate, setAudioRate] = useState<number>(readAudioRate)
  const { speak, stop } = useNarration(audioRate)

  useEffect(() => {
    try { localStorage.setItem(AUDIO_RATE_STORAGE_KEY, String(audioRate)) } catch { /* local storage may be disabled */ }
  }, [audioRate])

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)) } catch { /* storage may be disabled */ }
  }, [progress])

  const openWorld = (nextWorld: World) => {
    setWorld(nextWorld)
    setStep(0)
    setFeedback(null)
    setFinished(false)
    speak('worlds/' + nextWorld.id + '/intro', nextWorld.intro)
  }

  const goHome = () => {
    stop()
    setWorld(null)
    setFeedback(null)
    setFinished(false)
  }

  const questions = world ? questionsForWorld(world) : []
  const currentQuestion = questions[step] ?? null
  const gameKey = world?.id ?? ''
  const completedCount = world ? (progress[gameKey] || []).filter(
    (id) => questions.some((question) => question.id === id),
  ).length : 0

  const chooseAnswer = (answer: string) => {
    if (!currentQuestion || !world || feedback === 'correct') return
    if (answer === currentQuestion.answer) {
      setFeedback('correct')
      setProgress((previous) => {
        const known = previous[gameKey] || []
        if (known.includes(currentQuestion.id)) return previous
        return { ...previous, [gameKey]: [...known, currentQuestion.id] }
      })
      speak('global/correct', content.correct)
    } else {
      setFeedback('retry')
      speak('global/retry', content.retry)
    }
  }

  const nextQuestion = () => {
    if (!world) return
    if (step + 1 >= questions.length) {
      setFinished(true)
      setFeedback(null)
    } else {
      setStep(step + 1)
      setFeedback(null)
      const next = questions[step + 1]
      speak('questions/' + next.id, next.prompt)
    }
  }

  const resetProgress = () => {
    if (!window.confirm('Hapus semua progres yang tersimpan di perangkat ini?')) return
    setProgress({})
    setParentsOpen(false)
    goHome()
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <button className="brand" type="button" onClick={goHome} aria-label="Astakula Kids — semua dunia">
          <span className="brand-mark">a<span>✳</span></span>
          <span className="brand-name">astakula<span>kids</span></span>
        </button>
        <div className="header-actions">
          <button className="parent-button" type="button" onClick={() => setParentsOpen(true)} aria-label="Informasi untuk orang tua">Untuk orang tua</button>
        </div>
      </header>

      <main className="container">
        {!world ? (
          <section className="worlds-screen">
            <div className="section-heading">
              <div>
                <p className="eyebrow">HALO, PETUALANG KECIL!</p>
                <h1>Hari ini kita <em>belajar apa?</em></h1>
                <p className="lead">Pilih dunia yang kamu suka, lalu bermain dan belajar bersama. Yuk, mulai petualangannya!</p>
              </div>
              <div className="heading-doodle" aria-hidden="true">✦</div>
            </div>
            <div className="world-grid">
              {content.worlds.map((item, index) => {
                const itemQuestions = questionsForWorld(item)
                const questionIds = new Set(itemQuestions.map((question) => question.id))
                const count = (progress[item.id] || []).filter((id) => questionIds.has(id)).length
                return (
                  <button key={item.id} type="button" className={'world-card world-' + item.tint} onClick={() => openWorld(item)}>
                    <div className="world-card-top">
                      <span className="world-number">0{index + 1}</span>
                      <span className="world-icon" aria-hidden="true">{item.icon}</span>
                    </div>
                    <h2>{item.title}</h2>
                    <p>{item.short}</p>
                    <div className="world-card-bottom">
                      <span className="world-status">{count}/{itemQuestions.length} kegiatan</span>
                      <span className="arrow-circle" aria-hidden="true">↗</span>
                    </div>
                    <div className="progress-track"><span style={{ width: (count / itemQuestions.length) * 100 + '%' }} /></div>
                  </button>
                )
              })}
            </div>
            <p className="small-note">Progres tersimpan di browser perangkat ini, bukan di server.</p>
          </section>
        ) : (
          <section className="game-screen">
            <nav className="game-nav" aria-label="Navigasi permainan">
              <button className="back-button" type="button" onClick={goHome}>← Semua dunia</button>
              <span className="game-world-name">{world.icon} {world.title}</span>
            </nav>
            {!finished && currentQuestion ? (
              <div className={'question-panel game-' + world.tint}>
                <div className="question-header">
                  <span className="question-count">TANTANGAN {step + 1} DARI {questions.length}</span>
                  <span className="question-badge">✦ {completedCount} selesai</span>
                </div>
                <div className="question-progress" aria-hidden="true">
                  {questions.map((q, index) => <span key={q.id} className={index <= step ? 'active' : ''} />)}
                </div>
                <div className="question-center">
                  <span className="question-mascot" aria-hidden="true">{world.icon}</span>
                  <h1>{currentQuestion.prompt}</h1>
                  <button className="listen-button" type="button" onClick={() => speak('questions/' + currentQuestion.id, currentQuestion.prompt)}>
                    <span aria-hidden="true">♪</span> Dengarkan pertanyaan
                  </button>
                  <p className="tap-helper">Sentuh satu jawaban di bawah ini</p>
                </div>
                <div className="answer-grid" aria-label="Pilihan jawaban">
                  {currentQuestion.options.map((answer) => (
                    <button
                      key={answer.id}
                      className={'answer-card' + (feedback === 'correct' && answer.id === currentQuestion.answer ? ' chosen' : '')}
                      style={{ '--option-color': answer.color || '#f4eee5' } as CSSProperties}
                      type="button"
                      disabled={feedback === 'correct'}
                      onClick={() => chooseAnswer(answer.id)}
                    >
                      <span className="answer-visual" aria-hidden="true">{answer.visual}</span>
                      <span className="answer-label">{answer.label}</span>
                    </button>
                  ))}
                </div>
                <div className={'feedback-row' + (feedback ? ' visible' : '')} aria-live="polite">
                  {feedback === 'correct' ? (
                    <>
                      <span>🌟 Hebat! Jawabanmu tepat!</span>
                      <button type="button" className="continue-button" onClick={nextQuestion}>
                        {step + 1 === questions.length ? 'Selesai!' : 'Lanjut'} →
                      </button>
                    </>
                  ) : feedback === 'retry' ? (
                    <span>💛 Belum tepat. Coba pilihan lainnya, yuk!</span>
                  ) : <span>Pelan-pelan saja, tidak perlu buru-buru.</span>}
                </div>
              </div>
            ) : (
              <div className="finish-panel">
                <div className="finish-sparkle" aria-hidden="true">🌈</div>
                <p className="eyebrow">KAMU HEBAT!</p>
                <h1>Satu petualangan <em>selesai!</em></h1>
                <p>Terima kasih sudah mencoba semua kegiatan di {world.title}. Mau ke dunia lainnya?</p>
                <button className="primary-button" type="button" onClick={goHome}>Pilih dunia lainnya →</button>
                <button className="plain-button" type="button" onClick={() => openWorld(world)}>Main lagi</button>
              </div>
            )}
          </section>
        )}
      </main>

      <footer className="site-footer">
        <span>Made with care by Astakula · Family Alpha 0.1.0</span>
        <span>Tanpa iklan · Tanpa akun · Narasi: <a href="https://elevenlabs.io/" target="_blank" rel="noopener noreferrer">elevenlabs.io</a></span>
      </footer>

      {parentsOpen && (
        <div className="modal-backdrop" role="presentation" onClick={() => setParentsOpen(false)}>
          <section role="dialog" aria-modal="true" aria-labelledby="parents-title" className="parent-modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h2 id="parents-title">Catatan untuk orang tua</h2>
              <button type="button" className="modal-close" onClick={() => setParentsOpen(false)} aria-label="Tutup">✕</button>
            </div>
            <p>Astakula Kids adalah permainan edukasi prasekolah, bukan alat untuk menilai perkembangan anak. Setiap dunia dimulai dari kegiatan yang sederhana dan berlanjut ke tantangan berikutnya tanpa perlu memilih usia. Dampingi saat bermain, ajak berdiskusi, dan lanjutkan belajar menggunakan benda nyata.</p>
            <p>Progres disimpan hanya di browser ini. Narasi memakai file audio lokal jika tersedia; jika belum, browser akan mencoba suara bawaan perangkat. Tidak semua perangkat mendukung suara bahasa Indonesia secara offline.</p>
            <div className="voice-rate-settings">
              <p className="voice-rate-title">Kecepatan narasi</p>
              <div className="voice-rate-options" role="group" aria-label="Kecepatan narasi">
                {([
                  { value: 0.75, label: 'Pelan' },
                  { value: 0.85, label: 'Santai' },
                  { value: 1, label: 'Normal' },
                ] as const).map(({ value, label }) => (
                  <button
                    type="button"
                    key={value}
                    className={audioRate === value ? 'rate-selected' : ''}
                    aria-pressed={audioRate === value}
                    onClick={() => setAudioRate(value)}
                  >
                    {label} <span>{value.toFixed(2).replace(/0$/, '')}x</span>
                  </button>
                ))}
              </div>
              <p className="rate-hint">Standar: Santai (0,85x). Pengaturan disimpan di perangkat ini.</p>
            </div>
            <button className="reset-button" type="button" onClick={resetProgress}>Hapus progres lokal</button>
          </section>
        </div>
      )}
    </div>
  )
}
