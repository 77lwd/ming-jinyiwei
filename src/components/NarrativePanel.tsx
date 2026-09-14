import type { ReactNode } from 'react'
import type { NarrativeBlock } from '../types'

export function NarrativePanel({ narrative, children }: { narrative: NarrativeBlock; children?: ReactNode }) {
  return (
    <article className={`narrative-panel narrative-${narrative.tone ?? 'quiet'}`} aria-live="polite">
      {narrative.image && <figure className="scene-visual"><img src={narrative.image.src} alt={narrative.image.alt} loading="eager" /><figcaption><span>当前现场</span><strong>{narrative.title}</strong></figcaption></figure>}
      <div className="dossier-spread">
        <div className="narrative-copy">
          {!narrative.image && <div className="section-label">当前现场</div>}
          {!narrative.image && <h2>{narrative.title}</h2>}
          {narrative.paragraphs.map((paragraph, index) => <p className={`narrative-${paragraph.kind}`} key={`${paragraph.kind}-${index}`}>{paragraph.text}</p>)}
        </div>
        {children && <div className="narrative-workarea">{children}</div>}
      </div>
    </article>
  )
}
