import { useState } from 'react'
import { ChevronRight, PenLine, UserRound } from 'lucide-react'
import type { NarrativeBlock } from '../types'

const speakerByNode: Array<[string, string]> = [
  ['guard-a', '押役周六'],
  ['guard-b', '押役赵七'],
  ['river-boat', '船夫陈老桨'],
  ['river-tea', '茶棚伙计阿顺'],
]

export function Chapter2InquiryDialogue({ node, question, narrative, onConfirm }: {
  node: string
  question: string
  narrative: NarrativeBlock
  onConfirm: () => void
}) {
  const [visibleCount, setVisibleCount] = useState(0)
  const speaker = speakerByNode.find(([key]) => node.includes(key))?.[1] ?? '证人'
  const isCompleteStatement = /签押|证言落纸/.test(narrative.title)
  const allVisible = visibleCount >= narrative.paragraphs.length
  const buttonLabel = visibleCount === 0
    ? '听他回答'
    : allVisible
      ? isCompleteStatement ? '完成签押' : '继续闻讯'
      : '继续听'

  const advance = () => {
    if (allVisible) onConfirm()
    else setVisibleCount((count) => count + 1)
  }

  return <section className="inquiry-dialogue" aria-labelledby="inquiry-dialogue-heading">
    <header className="inquiry-dialogue-heading">
      <span>分开闻讯</span>
      <h2 id="inquiry-dialogue-heading">{speaker}</h2>
      <small>第 {Math.min(visibleCount + 1, narrative.paragraphs.length + 1)} 轮记录</small>
    </header>

    <div className="inquiry-stage">
      <aside className="inquiry-portrait inquiry-portrait-witness" aria-label={`${speaker}肖像待补`}>
        <span><UserRound size={36} aria-hidden="true" /></span>
        <strong>{speaker}</strong>
      </aside>

      <div className="inquiry-transcript" aria-live="polite">
        <article className="inquiry-line inquiry-question">
          <strong>廖威达：</strong>
          <p>{question}</p>
        </article>
        {narrative.paragraphs.slice(0, visibleCount).map((paragraph, index) => (
          <article className={`inquiry-line ${paragraph.kind === 'dialogue' ? 'inquiry-answer' : 'inquiry-action'}`} key={`${paragraph.kind}-${index}`}>
            {paragraph.kind === 'dialogue' ? <strong>{speaker}：</strong> : <span><PenLine size={14} />闻讯记录</span>}
            <p>{paragraph.text}</p>
          </article>
        ))}
      </div>

      <aside className="inquiry-portrait inquiry-portrait-player">
        <img src="/assets/chapter1/characters/liao-weida-portrait-v1.png" alt="廖威达肖像" />
        <strong>廖威达</strong>
      </aside>
    </div>

    <footer className="inquiry-dialogue-actions">
      {allVisible && isCompleteStatement && <p>书记官将按复述内容誊清，待本人签押后才作为口供入卷。</p>}
      <button className="button button-primary" onClick={advance}>{buttonLabel}<ChevronRight size={18} /></button>
    </footer>
  </section>
}
