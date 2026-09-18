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

const fixedFactLabels: Record<string, string> = {
  'self-escape': '马骁并非自行脱逃，翻车现场经过人为伪造',
  'guard-duty': '押役在押送与交接中存在失职',
  'illegal-transfer': '押送途中发生未经批准的转移',
}

export function Chapter2CaseProgress({ node, investigation }: { node: string; investigation: Chapter2InvestigationState }) {
  const current = node.includes('case1') || node.includes('rain-night-transfer') ? 0 : node.includes('case2') || node.includes('empty-dowry-house') ? 1 : node.includes('case3') || node.includes('before-the-watch-drum') ? 2 : cases.findIndex(([id]) => node.includes(id))
  return <section className="case-progress" aria-label="第二章案件进度"><div className="workbench-heading"><ClipboardList size={16} /><span>失号凭照工作板</span><small>第 {Math.max(1, current + 1)} 案</small></div><ol>{cases.map(([id, label], i) => { const complete = investigation.completedCaseIds.includes(id); const active = i === current; const revealed = complete || active; return <li key={id} className={complete ? 'is-complete' : active ? 'is-current' : ''} aria-current={active ? 'step' : undefined}><span>{complete ? <Check size={13} /> : i + 1}</span><b>{revealed ? label : '待查案卷'}</b></li> })}</ol></section>
}

export function Chapter2CaseContext({ node }: { node: string }) {
  const step = chapter2MainlineSteps[node]
  if (!step) return null
  const isCaseOneClosed = node === 'chapter2.case1-closed'
  const isAuthorityReview = node === 'chapter2.case1-authority-review'
  const task = isCaseOneClosed
    ? '第一案已经封卷，带着封存凭照转入下一桩差事。'
    : isAuthorityReview
      ? '把已经核清的责任和处置建议呈到覃保坤案前。'
      : node.includes('rain-night') || node.includes('case1-')
        ? '先完成三条调查线，再将四名相关人分开问完、各自签押。'
        : node.includes('empty-dowry') ? '把卢小绫的自愿躲藏、胁迫取契与凭照冒用分开核清。' : node.includes('watch-drum') ? '拆开殴打、致伤与改簿的先后，不用一个结果覆盖全部责任。' : node === 'chapter2.register-review' ? '只从三案材料中挑出能够证明凭照流转的原件。' : '把已结案件的材料留在可复核的次序里。'
  const facts = isCaseOneClosed
    ? ['失押责任已经入卷。', '马骁的去向另列续查。']
    : isAuthorityReview
      ? ['锁扣、车辕和拖痕已排除自行脱逃的说法。', '押送中的违规交接与押役责任已分别记下。']
      : ['三案均须区分事实、推断与待查去向。', '凭照编号、交接和核销记录是本章共同线索。']
  const authority = isCaseOneClosed
    ? '本案批示已经落下；下一案的查访另起案卷。'
    : isAuthorityReview
      ? '你可以呈报事实和建议；封卷、追缉与后续处置须由覃保坤落签。'
      : '你可查访、勘验、分开记录；封存总簿、调取原件与正式处置须凭覃保坤授权。'
  return <section className="case-context" aria-label="当前办案信息"><div className="case-task"><span>当前差事</span><strong>{task}</strong></div><div className="case-facts"><span>{isCaseOneClosed ? '案卷落款' : '已确认'}</span><ul>{facts.map((fact) => <li key={fact}><Check size={15} aria-hidden="true" />{fact}</li>)}</ul></div><div className="authority-note"><ShieldCheck size={18} aria-hidden="true" /><div><span>{isCaseOneClosed ? '案后手续' : '校尉权限'}</span><p>{authority}</p></div></div></section>
}

export function Chapter2InvestigationChoices({ node, choices, onChoose }: { node: string; choices: Array<{ id: string; label: string }>; onChoose: (id: string) => void }) {
  const targets: Record<string, string> = { 'preserve-guard-responsibility': '押役口供与换押存根', 'follow-river-transfer': '河埠篷车与交接痕迹', 'protect-witness-and-deed': '卢小绫与继承副契', 'trace-credential-handover': '封验凭照交割次序', 'preserve-death-timeline': '尸体、门闩与更鼓时序', 'preserve-altered-record-chain': '值夜簿与货封放行记录' }
  const isInquiryTransition = node.endsWith('.signed')
  const isInquiryQuestion = node.includes('case1-inquiry.') && !isInquiryTransition
  const isInquirySelect = node === 'chapter2.case1-inquiry-select'
  const isRouteAction = node.includes('case1-route')
  const isCaseOneInvestigation = node === 'chapter2.rain-night-transfer' || isRouteAction || node === 'chapter2.case1-investigation'
  const heading = isInquiryTransition ? '继续分开闻讯' : isInquiryQuestion ? '选择下一句问话' : isInquirySelect ? '选择闻讯对象' : isRouteAction ? '继续当前调查' : isCaseOneInvestigation ? '选择调查路线' : '选择查案重点'
  const note = isInquiryTransition ? '上一份口供已经封存' : isInquiryQuestion ? '问完、复述并签押后才形成口供' : isInquirySelect ? '调查已结束，四人分开记录' : isRouteAction ? '完成这条线后返回调查案桌' : isCaseOneInvestigation ? '三条路线均须完成' : '按当前案情推进'
  const kind = isInquiryTransition ? '闻讯进度' : isInquiryQuestion ? '闻讯问话' : isInquirySelect ? '闻讯对象' : isRouteAction ? '调查动作' : isCaseOneInvestigation ? '调查路线' : '办案动作'
  return <section className="investigation-board" aria-label="第二章调查选择"><div className="workbench-heading"><Search size={16} /><span>{heading}</span><small>{note}</small></div><div className="investigation-list">{choices.map((choice, i) => <button key={choice.id} className="investigation-card" data-index={String(i + 1).padStart(2, '0')} onClick={() => onChoose(choice.id)}><span className="investigation-card-icon"><FileText size={17} /></span><span className="investigation-card-copy"><small className="investigation-card-kind">{kind}</small><strong>{choice.label}</strong><small>{targets[choice.id] ?? (isInquiryTransition ? '下一人仍须独立记录' : isInquiryQuestion ? '继续核清这份口供' : isInquirySelect ? '完成后单独签押入卷' : '完成当前路线后返回案桌')}</small></span><span className="investigation-card-arrow">›</span></button>)}</div></section>
}

export function Chapter2CaseRecord({ node, investigation }: { node: string; investigation: Chapter2InvestigationState }) {
  const completed = new Set(investigation.completedActionIds ?? [])
  const statements = [['c2-01-guard-a-statement', '周六口供'], ['c2-01-guard-b-statement', '赵七口供'], ['c2-01-river-boat-statement', '船夫陈老桨证言'], ['c2-01-river-tea-statement', '茶棚伙计阿顺证言']] as const
  const isCaseOne = node.includes('rain-night-transfer') || node.includes('case1')
  if (isCaseOne) {
    const routes = [
      ['囚车与锁具', ['c2-01-inspect-lock', 'c2-01-inspect-shaft']],
      ['拖痕与麻绳', ['c2-01-trace-drag-marks', 'c2-01-examine-rope-fibers']],
      ['换押文书', ['c2-01-preserve-wet-stub', 'c2-01-compare-escort-order']],
    ] as const
    const inquiryVisible = node.includes('inquiry') || node.includes('close-review') || node.includes('authority-review') || node.includes('case1-closed') || statements.some(([id]) => completed.has(id))
    const materials = investigation.caseMaterialIds ?? []
    const fixedFacts = investigation.fixedFactIds.filter((id) => fixedFactLabels[id])
    return <aside className="case-record" aria-label="雨夜失押案情记录">
      <h2><FileText size={18} />雨夜失押</h2>
      <p>这里只记录本案已经完成的调查、签押口供与核验事实。</p>
      <section className="case-record-facts"><h3>调查进度</h3><ul>{routes.map(([label, actionIds]) => { const count = actionIds.filter((id) => completed.has(id)).length; return <li key={label}>{count === actionIds.length ? <Check size={13} /> : null}{label} · {count === 0 ? '尚未开始' : count === actionIds.length ? '已完成' : `${count}/${actionIds.length}`}</li> })}</ul></section>
      {inquiryVisible && <section className="case-record-facts"><h3>闻讯记录</h3><ul>{statements.map(([id, label]) => <li key={id}>{completed.has(id) ? <Check size={13} /> : null}{label} · {completed.has(id) ? '已复述签押' : '闻讯未完'}</li>)}</ul></section>}
      <section className="case-record-facts"><h3>本案材料</h3>{materials.length ? <ul>{materials.map((id) => <li key={id}><Check size={13} />{chapter2MaterialLabels[id] ?? id}</li>)}</ul> : <p>尚未取得可入卷材料。</p>}</section>
      {fixedFacts.length > 0 && <section className="case-record-facts"><h3>已固定事实</h3><ul>{fixedFacts.map((id) => <li key={id}><Check size={13} />{fixedFactLabels[id]}</li>)}</ul></section>}
      {investigation.branchIds.some((id) => id.startsWith('c2_01_')) && <section className="case-record-facts"><h3>结案记录</h3><ul>{investigation.branchIds.filter((id) => id.startsWith('c2_01_')).map((id) => <li key={id}><Check size={13} />{branchLabels[id] ?? id}</li>)}</ul></section>}
    </aside>
  }

  const currentIndex = node.includes('empty-dowry') || node.includes('case2') ? 1 : node.includes('before-the-watch') || node.includes('case3') ? 2 : 3
  const currentTitle = currentIndex === 1 ? cases[1][1] : currentIndex === 2 ? cases[2][1] : '失号凭照 · 章末核验'
  const revealedCases = cases.filter(([id], index) => investigation.completedCaseIds.includes(id) || index === currentIndex)
  return <aside className="case-record" aria-label="失号凭照案情记录"><h2><FileText size={18} />{currentTitle}</h2><p>{currentIndex < 3 ? '只显示已经办理或当前正在办理的案卷。' : '三案已经封卷，现核对凭照流转记录。'}</p><section className="case-record-facts"><h3>案件进度</h3><ul>{revealedCases.map(([id, label]) => { const isComplete = investigation.completedCaseIds.includes(id); return <li key={id}>{isComplete ? <Check size={13} /> : null}{label} · {isComplete ? '已封卷' : '办理中'}</li> })}</ul></section><section className="case-record-facts"><h3>已入卷材料</h3>{investigation.materialIds.length ? <ul>{investigation.materialIds.map((id) => <li key={id}><Check size={13} />{chapter2MaterialLabels[id] ?? id}</li>)}</ul> : <p>尚未取得材料。</p>}</section>{investigation.branchIds.length > 0 && <section className="case-record-facts"><h3>已形成记录</h3><ul>{investigation.branchIds.map((id) => <li key={id}><Check size={13} />{branchLabels[id] ?? id}</li>)}</ul></section>}</aside>
}
