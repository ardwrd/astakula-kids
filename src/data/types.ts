export type AgeMode = '3' | '5'

export interface Choice {
  id: string
  label: string
  visual: string
  image?: string // Exact local illustration asset, used when an emoji is misleading.
  color?: string
}

export interface Question {
  id: string
  prompt: string
  options: Choice[]
  answer: string
}

export interface World {
  id: string
  title: string
  icon: string
  short: string
  description: string
  tint: string
  intro: string
  levels: Record<AgeMode, Question[]>
}

export interface LearningContent {
  welcome: string
  correct: string
  retry: string
  worlds: World[]
}
