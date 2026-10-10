import { useCallback, useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import rawContent from './data/content.json'
import audioManifest from './data/audioManifest.json'
import audioRevision from './data/audioRevision.json'
import type { LearningContent, World, Question } from './data/types'

const content = rawContent as unknown as LearningContent
const audioKeys = new Set<string>(audioManifest.keys)
const LEGACY_PROGRESS_KEY = 'astakula-kids:progress:v1'
const AUDIO_RATE_STORAGE_KEY = audioRevision.id === 'legacy-v2'
  ? 'astakula-kids:audio-rate:v1'
  : 'astakula-kids:audio-rate:' + audioRevision.id
type Feedback = 'correct' | 'retry' | null

// Content is grouped by introductory/advanced difficulty internally.
// Neither age groups nor completion percentages are shown to children.
function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items]
  for (let index = result.length - 1; index > 0; index--) {
    const other = Math.floor(Math.random() * (index + 1))
    ;[result[index], result[other]] = [result[other], result[index]]
  }
  return result
}

function newPlayRound(world: World): Question[] {
  const questions = [
    ...shuffle(world.levels['3']),
    ...shuffle(world.levels['5']),
  ]
  return questions.map((question) => ({
    ...question,
    options: shuffle(question.options),
  }))
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
  const [round, setRound] = useState<Question[]>([])
  const [feedback, setFeedback] = useState<Feedback>(null)
  const [parentsOpen, setParentsOpen] = useState(false)
  const [legacyCleared, setLegacyCleared] = useState(false)
  const [audioRate, setAudioRate] = useState<number>(readAudioRate)
  const { speak, stop } = useNarration(audioRate)

  useEffect(() => {
    try { localStorage.setItem(AUDIO_RATE_STORAGE_KEY, String(audioRate)) } catch { /* local storage may be disabled */ }
  }, [audioRate])

  const openWorld = (nextWorld: World) => {
    setWorld(nextWorld)
    setRound(newPlayRound(nextWorld))
    setStep(0)
    setFeedback(null)
    speak('worlds/' + nextWorld.id + '/intro', nextWorld.intro)
  }

  const goHome = () => {
    stop()
    setWorld(null)
    setRound([])
    setStep(0)
    setFeedback(null)
  }

  const currentQuestion = round[step] ?? null

  const chooseAnswer = (answer: string) => {
    if (!currentQuestion || !world || feedback === 'correct') return
    if (answer === currentQuestion.answer) {
      setFeedback('correct')
      speak('global/correct', content.correct)
    } else {
      setFeedback('retry')
      speak('global/retry', content.retry)
    }
  }

  const nextQuestion = () => {
    if (!world || feedback !== 'correct') return
    let next: Question
    if (step + 1 >= round.length) {
      // Never finish the world; after each full round, reshuffle and play again.
      const nextRound = newPlayRound(world)
      setRound(nextRound)
      setStep(0)
      next = nextRound[0]
    } else {
      setStep(step + 1)
      next = round[step + 1]
    }
    setFeedback(null)
    speak('questions/' + next.id, next.prompt)
  }

  const clearLegacyHistory = () => {
    if (!window.confirm('Hapus riwayat jawaban yang tersimpan dari versi Astakula Kids sebelumnya?')) return
    try {
      localStorage.removeItem(LEGACY_PROGRESS_KEY)
      setLegacyCleared(true)
    } catch {
      window.alert('Penyimpanan browser tidak dapat diakses saat ini.')
    }
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
              {content.worlds.map((item, index) => (
                <button key={item.id} type="button" className={'world-card world-' + item.tint} onClick={() => openWorld(item)}>
                  <div className="world-card-top">
                    <span className="world-number">0{index + 1}</span>
                    <span className="world-icon" aria-hidden="true">{item.icon}</span>
                  </div>
                  <h2>{item.title}</h2>
                  <p>{item.short}</p>
                  <div className="world-card-bottom">
                    <span className="world-status">Bisa dimainkan kapan saja</span>
                    <span className="arrow-circle" aria-hidden="true">↗</span>
                  </div>
                </button>
              ))}
            </div>
            <p className="small-note">Bermain sesukamu, tanpa batas waktu, nilai, atau status tamat.</p>
          </section>
        ) : (
          <section className="game-screen">
            <nav className="game-nav" aria-label="Navigasi permainan">
              <button className="back-button" type="button" onClick={goHome}>← Semua dunia</button>
              <span className="game-world-name">{world.icon} {world.title}</span>
            </nav>
            {currentQuestion && (
              <div className={'question-panel game-' + world.tint}>
                <div className="question-header">
                  <span className="question-count">AYO COBA!</span>
                  <span className="question-badge">✦ Bermain sesukamu</span>
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
                        Lanjut bermain →
                      </button>
                    </>
                  ) : feedback === 'retry' ? (
                    <span>💛 Belum tepat. Coba pilihan lainnya, yuk!</span>
                  ) : <span>Pelan-pelan saja, tidak perlu buru-buru.</span>}
                </div>
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
            <p>Astakula Kids adalah permainan edukasi prasekolah, bukan alat untuk menilai perkembangan anak. Setiap dunia bisa dimainkan berulang kali tanpa status tamat. Soal dimulai dari pengenalan yang mudah, kemudian tantangan yang lebih sulit. Setelah satu putaran, soal dan posisi jawaban diacak ulang.</p>
            <p>Aplikasi tidak menyimpan skor atau riwayat jawaban baru. Hanya pengaturan kecepatan narasi yang disimpan di perangkat. Narasi memakai MP3 lokal; suara bawaan browser digunakan jika file tidak tersedia. Dampingi anak ketika bermain dan lanjutkan belajar menggunakan benda nyata.</p>
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
              <p className="rate-hint">Standar narator baru: Normal (1x). Pengaturan disimpan di perangkat ini.</p>
            </div>
            <button className="reset-button" type="button" onClick={clearLegacyHistory}>Hapus riwayat versi lama</button>
            {legacyCleared && <p className="legacy-note" role="status">Riwayat dari versi sebelumnya sudah dihapus dari perangkat ini.</p>}
          </section>
        </div>
      )}
    </div>
  )
}
