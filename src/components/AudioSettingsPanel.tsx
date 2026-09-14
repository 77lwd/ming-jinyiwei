import { Volume2, VolumeX, X } from 'lucide-react'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { audioEngine } from '../audio/audioEngine'

const subscribeAudio = (listener: () => void) => audioEngine.subscribe(listener)
const getAudioSnapshot = () => audioEngine.getSettings()

export function AudioSettingsPanel() {
  const settings = useSyncExternalStore(subscribeAudio, getAudioSnapshot, getAudioSnapshot)
  const [open, setOpen] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setOpen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    dialogRef.current?.querySelector<HTMLElement>('input')?.focus()
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open])

  return (
    <div className="audio-settings">
      <button className="icon-button audio-settings-toggle" aria-label="声音设置" title="声音设置" onClick={() => { audioEngine.unlock(); setOpen((value) => !value) }}>
        {settings.musicMuted && settings.sfxMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </button>
      {open && <div ref={dialogRef} className="audio-settings-dialog" role="dialog" aria-label="声音设置">
        <div className="audio-settings-heading"><strong>声音设置</strong><button className="icon-button" aria-label="关闭声音设置" onClick={() => setOpen(false)}><X size={16} /></button></div>
        <label className="audio-setting-toggle"><input type="checkbox" checked={!settings.musicMuted} onChange={(event) => audioEngine.setSettings({ musicMuted: !event.target.checked })} />开启背景音乐</label>
        <label className="audio-setting-range"><span>背景音乐音量 <output>{Math.round(settings.musicVolume * 100)}%</output></span><input aria-label="背景音乐音量" type="range" min="0" max="1" step="0.05" value={settings.musicVolume} onChange={(event) => audioEngine.setSettings({ musicVolume: Number(event.target.value) })} /></label>
        <label className="audio-setting-toggle"><input type="checkbox" checked={!settings.sfxMuted} onChange={(event) => audioEngine.setSettings({ sfxMuted: !event.target.checked })} />开启音效</label>
        <label className="audio-setting-range"><span>音效音量 <output>{Math.round(settings.sfxVolume * 100)}%</output></span><input aria-label="音效音量" type="range" min="0" max="1" step="0.05" value={settings.sfxVolume} onChange={(event) => audioEngine.setSettings({ sfxVolume: Number(event.target.value) })} /></label>
      </div>}
    </div>
  )
}
