import { useState } from 'react'
import { Bug, X } from 'lucide-react'
import type { DeveloperCheckpointId } from '../engine/gameEngine'

const checkpoints: Array<{ id: DeveloperCheckpointId; label: string; note: string }> = [
  { id: 'chapter2-entry', label: '第二章 · 章节开篇', note: '检查五两补贴与第一案交接。' },
  { id: 'chapter2-case1-investigation', label: '第一案 · 开始调查', note: '从三条调查路线的起点开始。' },
  { id: 'chapter2-case1-inquiry', label: '第一案 · 开始闻讯', note: '六项调查材料已入卷，四人均未问讯。' },
  { id: 'chapter2-case1-verification', label: '第一案 · 提交核验', note: '十二件材料已取得，核验命题尚未固定。' },
  { id: 'chapter2-case1-end', label: '第一案 · 结案处置', note: '两条核验命题已固定，直接测试覃保坤封结。' },
]

export function DeveloperMenu({ onStart }: { onStart: (checkpoint: DeveloperCheckpointId) => void }) {
  const [open, setOpen] = useState(false)

  return <div className="developer-menu">
    <button className="developer-trigger" onClick={() => setOpen(true)}><Bug size={16} />开发者模式</button>
    {open && <div className="developer-backdrop" role="presentation" onClick={() => setOpen(false)}>
      <section className="developer-dialog" role="dialog" aria-modal="true" aria-labelledby="developer-heading" onClick={(event) => event.stopPropagation()}>
        <header><div><span>本地开发工具</span><h2 id="developer-heading">选择试玩检查点</h2></div><button className="icon-button" aria-label="关闭开发者模式" onClick={() => setOpen(false)}><X size={18} /></button></header>
        <p>从检查点进入的进度只在本次页面会话中生效，不会覆盖正式存档。</p>
        <div className="developer-checkpoints">{checkpoints.map((checkpoint) => <button key={checkpoint.id} aria-label={checkpoint.label} onClick={() => onStart(checkpoint.id)}><strong>{checkpoint.label}</strong><small>{checkpoint.note}</small></button>)}</div>
      </section>
    </div>}
  </div>
}
