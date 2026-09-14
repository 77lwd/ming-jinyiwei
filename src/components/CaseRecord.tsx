import { Check, Circle, Clock3, FileCheck2 } from 'lucide-react'
import type { NarrativeEvent } from '../types'
import type { Chapter1InvestigationState } from '../types'
import { chapter1MaterialLabels } from '../data/chapter1'
import { chapter1Stages, getChapter1StageIndex } from './caseStages'

const questionLabels: Record<string, string> = {
  'wusheng-bag': '吴生为什么拿着装有散银的工作包从后门出来？',
  'fire-target': '火为什么先烧向内部记录和印纸存放处？',
  'paper-fate': '失窃印纸是否真的全部毁于火中？',
}

export function CaseRecord({ node, events, investigation }: { node: string; events: NarrativeEvent[]; investigation: Chapter1InvestigationState }) {
  const current = getChapter1StageIndex(node)
  return <aside className="case-record" aria-label="纸铺火案记录">
    <h2><FileCheck2 size={18} aria-hidden="true" />纸铺火案</h2>
    <p>材料只按核验状态排列，不代替定罪。</p>
    <section className="case-record-facts" aria-label="待证问题">
      <h3>待证问题</h3>
      <ul>{investigation.openQuestionIds.map((id) => <li key={id}>{questionLabels[id] ?? id}</li>)}</ul>
    </section>
    <section className="case-record-facts" aria-label="已取得材料">
      <h3>已取得材料</h3>
      {investigation.materialIds.length ? <ul>{investigation.materialIds.map((id) => <li key={id}><Check size={13} aria-hidden="true" />{chapter1MaterialLabels[id] ?? id}</li>)}</ul> : <p>尚未取得材料。</p>}
    </section>
    {investigation.activeRouteId && <section className="case-record-facts" aria-label="当前调查路线">
      <h3>当前调查路线</h3>
      <p>{investigation.activeRouteId === 'sample-route' ? '核验送样路线' : investigation.activeRouteId === 'fire-scene' ? '勘验火场与后库' : '核对客户副联与数量'}</p>
      <small>已完成本路线动作：{investigation.completedActionIds.filter((id) => id.startsWith(investigation.activeRouteId === 'sample-route' ? 'sample-' : investigation.activeRouteId === 'fire-scene' ? 'fire-' : 'client-')).length} / 2</small>
    </section>}
    <section className="case-record-facts" aria-label="已固定事实">
      <h3>已固定事实</h3>
      {investigation.fixedFactIds.length ? <ul>{investigation.fixedFactIds.map((id) => <li key={id}><Check size={13} aria-hidden="true" />{id === 'wusheng-bag' ? '吴生被异常凭条支开，包中散银不能单独定罪' : id === 'fire-target' ? '火先指向登记架和印纸包，存在毁证目标' : id === 'paper-fate' ? '印纸没有全部毁于火中，数量存在转移缺口' : id}</li>)}</ul> : <p>尚未固定事实。</p>}
    </section>
    <ol className="case-record-stages">{chapter1Stages.map(([id, label], index) => {
      const status = index < current ? 'is-complete' : index === current ? 'is-current' : 'is-pending'
      return <li key={id} className={status}>{index < current ? <Check size={15} aria-hidden="true" /> : <Circle size={15} aria-hidden="true" />}<span><strong>{label}</strong><small>{index < current ? '已核验' : index === current ? '正在办理' : '待核验'}</small></span></li>
    })}</ol>
    <section className="case-record-events" aria-label="最近核验回执">
      <h3><Clock3 size={16} aria-hidden="true" />最近核验回执</h3>
      {events.length ? <ol>{events.slice(0, 4).map((event) => <li key={event.id}><strong>{event.title}</strong><p>{event.summary}</p></li>)}</ol> : <p>尚未形成可提交的核验回执。</p>}
    </section>
  </aside>
}
