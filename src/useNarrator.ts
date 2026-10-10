import { useCallback, useEffect, useRef } from 'react'
import approvedAudio from './data/audioManifest.json'
import audioRevision from './data/audioRevision.json'
import activityCatalog from './data/activityNarrationV4.json'

const quizKeys = new Set(approvedAudio.keys)
const activityKeys = new Set(Object.keys(activityCatalog.clips))

function clipPath(key: string): string | null {
  if (key.startsWith('activities/')) {
    const activityKey = key.slice('activities/'.length)
    return activityKeys.has(activityKey)
      ? import.meta.env.BASE_URL + 'audio/activities/indo-v4-v1/' + activityKey + '.mp3'
      : null
  }
  return quizKeys.has(key)
    ? import.meta.env.BASE_URL + audioRevision.basePath + key + '.mp3'
    : null
}

/**
 * One MP3 narrator for all worlds. No browser speechSynthesis voices or
 * API requests from the child's device. Missing assets fail silently;
 * the written instruction remains available.
 */
export function useNarrator() {
  const activeRef = useRef<HTMLAudioElement | null>(null)
  const queueRef = useRef<string[]>([])
  const sequenceRef = useRef(0)
  const pumpRef = useRef<() => void>(() => {})

  const stop = useCallback(() => {
    sequenceRef.current += 1
    queueRef.current = []
    if (activeRef.current) {
      activeRef.current.pause()
      activeRef.current.onended = null
      activeRef.current.onerror = null
      activeRef.current = null
    }
  }, [])

  pumpRef.current = () => {
    if (activeRef.current) return
    const nextKey = queueRef.current.shift()
    if (!nextKey) return
    const path = clipPath(nextKey)
    if (!path) { pumpRef.current(); return }
    const audio = new Audio(path)
    const sequence = sequenceRef.current
    audio.playbackRate = audioRevision.defaultPlaybackRate
    audio.preload = 'auto'
    activeRef.current = audio
    const finish = () => {
      if (sequence !== sequenceRef.current || activeRef.current !== audio) return
      audio.onended = null
      audio.onerror = null
      activeRef.current = null
      pumpRef.current()
    }
    audio.onended = finish
    audio.onerror = finish
    void audio.play().catch(finish)
  }

  const play = useCallback((key: string, queued = false) => {
    if (!queued) stop()
    if (!clipPath(key)) return
    queueRef.current.push(key)
    pumpRef.current()
  }, [stop])

  useEffect(() => stop, [stop])
  return { play, stop }
}
