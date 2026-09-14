import { ChevronRight, SkipForward } from 'lucide-react'
import { prologueScenes } from '../data/prologue'
import { AudioSettingsPanel } from './AudioSettingsPanel'

interface PrologueViewProps {
  sceneIndex: number
  onNext: () => void
  onSkip: () => void
}

export function PrologueView({ sceneIndex, onNext, onSkip }: PrologueViewProps) {
  const scene = prologueScenes[Math.min(sceneIndex, prologueScenes.length - 1)]
  const finalScene = sceneIndex >= prologueScenes.length - 1

  return (
    <main className={`prologue prologue-${scene.tone ?? 'quiet'}`}>
      <div className="prologue-visual">
        {scene.image && <img src={scene.image.src} alt={scene.image.alt} />}
      </div>
      <AudioSettingsPanel />
      <article className="prologue-text">
        <div className="scene-index">{String(sceneIndex + 1).padStart(2, '0')} / {String(prologueScenes.length).padStart(2, '0')}</div>
        <h1>{scene.title}</h1>
        {scene.paragraphs.map((paragraph, index) => <p className={`narrative-${paragraph.kind}`} key={`${paragraph.kind}-${index}`}>{paragraph.text}</p>)}
        <div className="prologue-actions">
          <button className="button button-primary" onClick={onNext}>
            {finalScene ? '进入北镇抚司' : '继续'} <ChevronRight size={18} />
          </button>
          <button className="icon-text-button" onClick={onSkip}><SkipForward size={17} /> 跳过序章</button>
        </div>
      </article>
    </main>
  )
}
