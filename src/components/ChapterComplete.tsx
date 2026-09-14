import { RotateCcw, ScrollText } from 'lucide-react'
import { useGameStore } from '../store/gameStore'
import { AudioSettingsPanel } from './AudioSettingsPanel'

export function ChapterComplete() {
  const state = useGameStore()
  const isChapterOneSlice = state.chapter === 'chapter1'
  return (
    <main className="complete-screen">
      <AudioSettingsPanel />
      <section className="complete-copy">
        <span className="section-label">{isChapterOneSlice ? '第一章 · 纸灰里的银子' : '第五章 · 终局'}</span>
        <h1>{isChapterOneSlice ? '纸铺失火案已经封结' : '案件告一段落'}</h1>
        <p>{isChapterOneSlice ? '第一章试玩内容到此结束。案件已经正式封结，烧焦木牌单独入档，冯天顺也重新回到你的人脉之中。' : '主线流程已经走到终局。这里保留最终状态与证据摘要，供你回看自己一路留下的选择。'}</p>
        <div className="complete-ledger">
          <div><span>武力</span><strong>{state.attributes.strength}</strong></div>
          <div><span>智谋</span><strong>{state.attributes.insight}</strong></div>
          <div><span>声望</span><strong>{state.attributes.reputation}</strong></div>
        </div>
        <div className="complete-clues"><ScrollText size={18} />{state.clues.length ? state.clues.map((clue) => <span key={clue.id}>{clue.label} · {clue.clarity}</span>) : <span>尚无线索</span>}</div>
        <div className="complete-actions">
          <button className="button button-secondary" onClick={state.returnToTitle}>返回标题</button>
          <button className="button button-primary" onClick={() => { if (window.confirm('确定覆盖当前进度并重新开始吗？')) state.newGame() }}><RotateCcw size={18} /> 重新开始</button>
        </div>
      </section>
    </main>
  )
}
