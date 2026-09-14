import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AUDIO_SETTINGS_KEY, DEFAULT_AUDIO_SETTINGS, MUSIC_TRACK_URL, audioEngine, loadAudioSettings } from '../audioEngine'

class FakeAudio {
  static instances: FakeAudio[] = []
  readonly play = vi.fn().mockResolvedValue(undefined)
  readonly pause = vi.fn()
  loop = false
  preload = ''
  volume = 1

  constructor(readonly src: string) {
    FakeAudio.instances.push(this)
  }
}

describe('audio engine', () => {
  beforeEach(() => {
    localStorage.clear()
    FakeAudio.instances = []
    vi.stubGlobal('Audio', FakeAudio)
    audioEngine.resetForTests()
  })

  it('loads safe defaults when no audio settings exist', () => {
    expect(loadAudioSettings()).toEqual(DEFAULT_AUDIO_SETTINGS)
  })

  it('persists independent music and sound settings with clamped volumes', () => {
    audioEngine.setSettings({ musicVolume: 1.4, sfxVolume: -0.2, musicMuted: true, sfxMuted: false })

    expect(audioEngine.getSettings()).toEqual({ musicVolume: 1, sfxVolume: 0, musicMuted: true, sfxMuted: false })
    expect(JSON.parse(localStorage.getItem(AUDIO_SETTINGS_KEY) ?? '{}')).toEqual(audioEngine.getSettings())
  })

  it('ignores corrupt settings and remains safe without AudioContext', () => {
    localStorage.setItem(AUDIO_SETTINGS_KEY, '{broken')
    expect(loadAudioSettings()).toEqual(DEFAULT_AUDIO_SETTINGS)
    expect(() => audioEngine.unlock()).not.toThrow()
    expect(() => audioEngine.playSfx('button')).not.toThrow()
  })

  it('loops the bundled traditional music and applies music controls', () => {
    audioEngine.unlock()

    const music = FakeAudio.instances[0]
    expect(music.src).toBe(MUSIC_TRACK_URL)
    expect(music.loop).toBe(true)
    expect(music.preload).toBe('auto')
    expect(music.volume).toBe(DEFAULT_AUDIO_SETTINGS.musicVolume)
    expect(music.play).toHaveBeenCalledOnce()

    audioEngine.setSettings({ musicVolume: 0.8 })
    expect(music.volume).toBe(0.8)

    audioEngine.setSettings({ musicMuted: true })
    expect(music.pause).toHaveBeenCalledOnce()
  })

  it('remains safe when the media play API does not return a promise', () => {
    class UnsupportedAudio extends FakeAudio {
      override readonly play = vi.fn(() => undefined as never)
    }
    vi.stubGlobal('Audio', UnsupportedAudio)
    audioEngine.resetForTests()

    expect(() => audioEngine.unlock()).not.toThrow()
  })
})
