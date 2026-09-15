import { Check, ClipboardList, FileText, Search, ShieldCheck } from 'lucide-react'
import type { Chapter2InvestigationState } from '../types'
import { chapter2MaterialLabels, chapter2MainlineSteps } from '../data/chapter2'

const cases = [
  ['rain-night-transfer', '雨夜失押'],
  ['empty-dowry-house', '空屋里的嫁妆'],
  ['before-the-watch-drum', '倒在更鼓前的人'],
] as const

const branchLabels: Record<string, string> = {
  c2_01_responsibility_chain: '押役责任链', c2_01_route_chain: '河埠转运链',
  c2_02_witness_deed: '证人与副契', c2_02_receipt_chain: '凭照交割链',
  c2_03_death_chain: '死亡时序链', c2_03_record_chain: '改簿记录链',
}

export function Chapter2CaseProgress({ node, investigation }: { node: string; investigation: Chapter2InvestigationState }) {
  const current = cases.findIndex(([id]) => node.includes(id))
  return <section className="case-progress" aria-label="第二章案件进度"><div className="workbench-heading"><ClipboardList size={16} /><span>失号凭照工作板</span><small>第 {Math.max(1, current + 1)} 案</small></div><ol>{cases.map(([id, label], i) => { const complete = investigation.completedCaseIds.includes(id); const active = i === current; const revealed = complete || active; return <li key={id} className={complete ? 'is-complete' : active ? 'is-current' : ''} aria-current={active ? 'step' : undefined}><span>{complete ? <Check size={13} /> : i + 1}</span><b>{revealed ? label : '待查案卷'}</b></li> })}</ol></section>
}

export function Chapter2CaseContext({ node }: { node: string }) {
  const step = chapter2MainlineSteps[node]
  if (!step) return null
  const task = node.includes('rain-night') ? '先固定换押凭照的流转，再判断马骁去了哪里。' : node.includes('empty-dowry') ? '把卢小绫的自愿躲藏、胁迫取契与凭照冒用分开核清。' : node.includes('watch-drum') ? '拆开殴打、致伤与改簿的先后，不用一个结果覆盖全部责任。' : node === 'chapter2.register-review' ? '只从三案材料中挑出能够证明凭照流转的原件。' : '把已结案件的材料留在可复核的次序里。'
  return <section className="case-context" aria-label="当前办案信息"><div className="case-task"><span>当前差事</span><strong>{task}</strong></div><div className="case-facts"><span>已确认</span><ul><li><Check size={15} />三案均须区分事实、推断与待查去向。</li><li><Check size={15} />凭照编号、交接和核销记录是本章共同线索。</li></ul></div><div className="authority-note"><ShieldCheck size={18} /><div><span>校尉权限</span><p>你可查访、勘验、分开记录；封存总簿、调取原件与正式处置须凭覃保坤授权。</p></div></div></section>
}

export function Chapter2InvestigationChoices({ choices, onChoose }: { choices: Array<{ id: string; label: string }>; onChoose: (id: string) => void }) {
  const targets: Record<string, string> = { 'preserve-guard-responsibility': '押役口供与换押存根', 'follow-river-transfer': '河埠篷车与交接痕迹', 'protect-witness-and-deed': '卢小绫与继承副契', 'trace-credential-handover': '封验凭照交割次序', 'preserve-death-timeline': '尸体、门闩与更鼓时序', 'preserve-altered-record-chain': '值夜簿与货封放行记录' }
  return <section className="investigation-board" aria-label="第二章调查选择"><div className="workbench-heading"><Search size={16} /><span>选择查案重点</span><small>每案只能保住一条主证据链</small></div><div className="investigation-list">{choices.map((choice, i) => <button key={choice.id} className="investigation-card" data-index={String(i + 1).padStart(2, '0')} onClick={() => onChoose(choice.id)}><span className="investigation-card-icon"><FileText size={17} /></span><span className="investigation-card-copy"><small className="investigation-card-kind">办案动作</small><strong>{choice.label}</strong><small>{targets[choice.id] ?? '当前案卷材料'}</small><em>先保住证据，再追问责任</em></span><span className="investigation-card-arrow">›</span></button>)}</div></section>
}

export function Chapter2CaseRecord({ investigation }: { investigation: Chapter2InvestigationState }) {
  return <aside className="case-record" aria-label="失号凭照案情记录"><h2><FileText size={18} />失号凭照</h2><p>三案材料分卷保存，章末只核验凭照流转。</p><section className="case-record-facts"><h3>已结案件</h3><ul>{cases.map(([id, label]) => <li key={id}><Check size={13} />{label}{investigation.completedCaseIds.includes(id) ? ' · 已封卷' : ' · 待办理'}</li>)}</ul></section><section className="case-record-facts"><h3>已取得材料</h3>{investigation.materialIds.length ? <ul>{investigation.materialIds.map(id => <li key={id}><Check size={13} />{chapter2MaterialLabels[id] ?? id}</li>)}</ul> : <p>尚未取得材料。</p>}</section><section className="case-record-facts"><h3>选择的证据链</h3>{investigation.branchIds.length ? <ul>{investigation.branchIds.map(id => <li key={id}><Check size={13} />{branchLabels[id] ?? id}</li>)}</ul> : <p>尚未形成分支记录。</p>}</section><section className="case-record-facts"><h3>章末总簿要求</h3><p>湿透的换押存根、未剪角的封验凭照、夜放牌副券，必须精确三件齐备。</p></section></aside>
}
