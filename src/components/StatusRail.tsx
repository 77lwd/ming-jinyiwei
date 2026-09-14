import { Coins, Eye, HeartPulse, ScrollText, ShieldAlert, Swords } from 'lucide-react'
import { useGameStore } from '../store/gameStore'
import type { GameState } from '../types'

const attributeLabels = [
  ['strength', '武力', Swords],
  ['insight', '智谋', Eye],
  ['eloquence', '口才', ScrollText],
  ['reputation', '声望', ShieldAlert],
] as const

const statDescriptions = {
  strength: '近身控制、追捕和危险现场中的身体能力。',
  insight: '观察细节、拆解证词和分析线索的能力。',
  eloquence: '询问、交涉和让对方把事实说完整的能力。',
  reputation: '别人公开如何评价你办差的方式。',
  wealth: '可支配的银两，用于合规差事、诊治和准备。',
  health: '身体状态；过低时只影响高强度做法，不会吞掉自由窗口。',
}

function chapterLabel(chapter: GameState['chapter']): string {
  return { prologue: '序章', chapter1: '第一章 · 纸灰里的银子', chapter2: '第二章', chapter3: '第三章', chapter4: '第四章', chapter5: '第五章' }[chapter]
}

export function StatusRail() {
  const { chapter, attributes, wealth, health, clues } = useGameStore()
  return (
    <aside className="status-rail" aria-label="人物状态">
      <section>
        <h2>廖威达</h2>
        <p className="role-line">锦衣卫校尉</p>
        <p className="status-note">{chapterLabel(chapter)}</p>
      </section>
      <section>
        <h3>属性与资源</h3>
        <dl className="stat-list">
          {attributeLabels.map(([key, label, Icon]) => <div className="stat-row" key={key}><dt className="stat-term" tabIndex={0} aria-describedby={`stat-help-${key}`}><Icon size={16} />{label}</dt><dd>{attributes[key]}</dd><span className="stat-tooltip" id={`stat-help-${key}`} role="tooltip">{statDescriptions[key]}</span></div>)}
          <div className="stat-row"><dt className="stat-term" tabIndex={0} aria-describedby="stat-help-wealth"><Coins size={16} />银两</dt><dd>{wealth}</dd><span className="stat-tooltip" id="stat-help-wealth" role="tooltip">{statDescriptions.wealth}</span></div>
          <div className="stat-row"><dt className="stat-term" tabIndex={0} aria-describedby="stat-help-health"><HeartPulse size={16} />健康</dt><dd>{health}</dd><span className="stat-tooltip" id="stat-help-health" role="tooltip">{statDescriptions.health}</span></div>
        </dl>
      </section>
      <section>
        <h3>线索</h3>
        {clues.length ? clues.map((clue) => <div className="clue-row" key={clue.id}><span>{clue.label}</span><small>{clue.clarity}</small></div>) : <p className="empty-copy">尚无线索</p>}
      </section>
    </aside>
  )
}
