export const AUDIO_SETTINGS_KEY = 'ming_jinyiwei.audio.v1'
export const MUSIC_TRACK_URL = '/assets/audio/moonlit-night.mp3'
export const INQUIRY_MUSIC_TRACK_URL = '/assets/audio/mystery-desert-night.mp3'
export const CHAPTER2_INVESTIGATION_MUSIC_TRACK_URL = '/assets/audio/chapter2-investigation-dark-frame.mp3'

export const DEFAULT_AUDIO_SETTINGS = {
  musicVolume: 0.35,
  sfxVolume: 0.65,
  musicMuted: false,
  sfxMuted: false,
} as const

export type AudioSettings = {
  musicVolume: number
  sfxVolume: number
  musicMuted: boolean
  sfxMuted: boolean
}

export type SfxKind = 'button' | 'choice' | 'confirm' | 'clue'

function clampVolume(value: number): number {
  return Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0))
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function storage(): Storage | null {
  return typeof localStorage === 'undefined' ? null : localStorage
}

export function loadAudioSettings(): AudioSettings {
  try {
    const raw = storage()?.getItem(AUDIO_SETTINGS_KEY)
    if (!raw) return { ...DEFAULT_AUDIO_SETTINGS }
    const value: unknown = JSON.parse(raw)
    if (!isRecord(value)) return { ...DEFAULT_AUDIO_SETTINGS }
    return {
      musicVolume: clampVolume(typeof value.musicVolume === 'number' ? value.musicVolume : DEFAULT_AUDIO_SETTINGS.musicVolume),
      sfxVolume: clampVolume(typeof value.sfxVolume === 'number' ? value.sfxVolume : DEFAULT_AUDIO_SETTINGS.sfxVolume),
      musicMuted: typeof value.musicMuted === 'boolean' ? value.musicMuted : DEFAULT_AUDIO_SETTINGS.musicMuted,
      sfxMuted: typeof value.sfxMuted === 'boolean' ? value.sfxMuted : DEFAULT_AUDIO_SETTINGS.sfxMuted,
    }
  } catch {
    return { ...DEFAULT_AUDIO_SETTINGS }
  }
}

function saveAudioSettings(settings: AudioSettings): void {
  try {
    storage()?.setItem(AUDIO_SETTINGS_KEY, JSON.stringify(settings))
  } catch {
    // Audio remains usable when private browsing blocks settings persistence.
  }
}

type AudioContextConstructor = new () => AudioContext

function getAudioContextConstructor(): AudioContextConstructor | null {
  if (typeof window === 'undefined') return null
  const browserWindow = window as Window & { webkitAudioContext?: AudioContextConstructor }
  return window.AudioContext ?? browserWindow.webkitAudioContext ?? null
}

export class AudioEngine {
  private settings: AudioSettings = loadAudioSettings()
  private context: AudioContext | null = null
  private music: HTMLAudioElement | null = null
  private musicTrackUrl = MUSIC_TRACK_URL
  private listeners = new Set<() => void>()

  getSettings(): AudioSettings {
    return this.settings
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  setSettings(update: Partial<AudioSettings>): void {
    this.settings = {
      musicVolume: clampVolume(update.musicVolume ?? this.settings.musicVolume),
      sfxVolume: clampVolume(update.sfxVolume ?? this.settings.sfxVolume),
      musicMuted: update.musicMuted ?? this.settings.musicMuted,
      sfxMuted: update.sfxMuted ?? this.settings.sfxMuted,
    }
    saveAudioSettings(this.settings)
    this.applyMusicSettings()
    this.listeners.forEach((listener) => listener())
  }

  unlock(): void {
    const context = this.ensureContext()
    if (context?.state === 'suspended') void context.resume()
    if (!this.settings.musicMuted && this.settings.musicVolume > 0) this.playMusic()
  }

  setMusicTrack(url: string): void {
    if (url === this.musicTrackUrl) return
    const wasPlaying = Boolean(this.music && !this.music.paused)
    this.music?.pause()
    this.music = null
    this.musicTrackUrl = url
    if (wasPlaying && !this.settings.musicMuted && this.settings.musicVolume > 0) this.playMusic()
  }

  playSfx(kind: SfxKind): void {
    if (this.settings.sfxMuted || this.settings.sfxVolume <= 0) return
    const context = this.ensureContext()
    if (!context) return
    if (context.state === 'suspended') void context.resume()

    const patterns: Record<SfxKind, number[]> = {
      button: [560],
      choice: [380, 520],
      confirm: [520, 720],
      clue: [440, 660, 880],
    }
    patterns[kind].forEach((frequency, index) => this.playTone(context, frequency, index * 0.055, 0.1))
  }

  resetForTests(): void {
    this.stopMusic()
    this.settings = loadAudioSettings()
    this.listeners.forEach((listener) => listener())
  }

  private ensureMusic(): HTMLAudioElement | null {
    if (this.music) return this.music
    if (typeof Audio === 'undefined') return null
    try {
      this.music = new Audio(this.musicTrackUrl)
      this.music.loop = true
      this.music.preload = 'auto'
      this.music.volume = this.settings.musicVolume
      return this.music
    } catch {
      return null
    }
  }

  private playMusic(): void {
    const music = this.ensureMusic()
    if (!music) return
    music.volume = this.settings.musicVolume
    try {
      const playback = music.play()
      if (playback) {
        void playback.catch(() => {
          // Browsers may still reject playback until a later user gesture.
        })
      }
    } catch {
      // Incomplete media implementations must not interrupt game input.
    }
  }

  private ensureContext(): AudioContext | null {
    if (this.context) return this.context
    const Constructor = getAudioContextConstructor()
    if (!Constructor) return null
    try {
      this.context = new Constructor()
      return this.context
    } catch {
      return null
    }
  }

  private applyMusicSettings(): void {
    if (!this.music) return
    this.music.volume = this.settings.musicVolume
    if (this.settings.musicMuted || this.settings.musicVolume === 0) this.music.pause()
    else this.playMusic()
  }

  private stopMusic(): void {
    this.music?.pause()
    this.music = null
    this.musicTrackUrl = MUSIC_TRACK_URL
  }

  private playTone(context: AudioContext, frequency: number, offset: number, duration: number): void {
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    const start = context.currentTime + offset
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(frequency, start)
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(this.settings.sfxVolume * 0.08, start + 0.012)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
    oscillator.connect(gain)
    gain.connect(context.destination)
    oscillator.start(start)
    oscillator.stop(start + duration + 0.02)
  }
}

export const audioEngine = new AudioEngine()
