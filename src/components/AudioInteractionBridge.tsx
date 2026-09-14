import { useEffect } from 'react'
import { audioEngine, type SfxKind } from '../audio/audioEngine'

const sfxKinds: SfxKind[] = ['button', 'choice', 'confirm', 'clue']

function isSfxKind(value: string | undefined): value is SfxKind {
  return value !== undefined && sfxKinds.includes(value as SfxKind)
}

export function AudioInteractionBridge() {
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return
      const button = event.target.closest('button')
      if (!button || button.disabled) return
      audioEngine.unlock()
      const requestedKind = button.dataset.audioSfx
      audioEngine.playSfx(isSfxKind(requestedKind) ? requestedKind : 'button')
    }
    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [])

  return null
}
