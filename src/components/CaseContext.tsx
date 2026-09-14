import { Check, ShieldCheck } from 'lucide-react'

const chapter1Context: Record<string, { task: string; facts: string[]; authority: string }> = {
  'chapter1.entry': {
    task: '随覃保坤前往城南，接手入署后的第一桩差事。',
    facts: ['查访、勘验与笔录必须分清事实来源。'],
    authority: '你负责一线查访与核验，不能抢先定罪。',
  },
  'chapter1.paper-shop-fire': {
    task: '核清纸铺失银、印纸缺失与后库起火是否属于同一件事。',
    facts: ['吴生被指偷银纵火。', '贺掌柜的判断主要来自侄子贺兴的说法。'],
    authority: '你可查访、勘验、核验口供；暂扣、封存与移交须由覃保坤决定。',
  },
  'chapter1.route-investigation': {
    task: '完成当前调查路线中的具体查访动作，不把地点本身当成结论。',
    facts: ['每完成一个动作，才会有对应材料进入案情记录。', '尚未取得的材料不能提前用于核验。'],
    authority: '你负责询问、勘验和记录；需要封存、调人或暂扣时，先向覃保坤请示。',
  },
  'chapter1.day1-evidence': {
    task: '整理第一日完成的两处调查，并明确尚未补齐的缺口。',
    facts: ['案情记录只显示已经取得的材料。', '目前只能确认原指控存在解释不通之处。'],
    authority: '你可以提出怀疑，但不能把尚未核验的材料写成事实。',
  },
  'chapter1.night-preservation': {
    task: '在纸铺复工前，保住最容易在夜里发生变化的办案条件。',
    facts: ['吴生仍被看押。', '现场残料、证物次序与证人口供都可能变化。'],
    authority: '你只能选择一项优先保全，并对遗漏承担办差后果。',
  },
  'chapter1.day2-verify': {
    task: '把已取得材料组成可以复核的证据命题。',
    facts: ['单项材料只能证明局部事实。', '证据必须回到现场和时间线，才能支持处置。'],
    authority: '你提出核验命题；正式复核和后续处置由覃保坤主持。',
  },
  'chapter1.closure-judgment': {
    task: '写下责任判断，并选择能够支撑它的证据链。',
    facts: ['携带赃物不等于已经证明纵火。', '事实、怀疑和程序建议必须分开写。'],
    authority: '判断证据不足时，覃保坤会退回补正；你不能直接定罪。',
  },
  'chapter1.case-closed': {
    task: '在当众复核与暂不点破之间提出程序建议。',
    facts: ['责任判断已经通过证据核验。', '两种处置都会依法结案，但人物压力和追问方式不同。'],
    authority: '你提出处置建议；正式复核、暂扣与移交由覃保坤主持。',
  },
  'chapter1.charred-token': {
    task: '判断火场旧料中的漆木牌是否值得单独保留。',
    facts: ['木牌有悬挂钉孔、朱漆边和两层焦痕。', '旧焦裂被后来的刨削面截断。'],
    authority: '你可以呈报异常；是否单独入档由覃保坤批准。',
  },
  'chapter1.feng-reunion': {
    task: '纸铺案已结，离开城南前与旧友叙话。',
    facts: ['第一宗差事已经完成。', '烧焦木牌已被单独保留。'],
    authority: '当前没有新的办案处置。',
  },
}

export function CaseContext({ node }: { node: string }) {
  const context = chapter1Context[node]
  if (!context) return null

  return (
    <section className="case-context" aria-label="当前办案信息">
      <div className="case-task"><span>当前差事</span><strong>{context.task}</strong></div>
      <div className="case-facts"><span>已确认</span><ul>{context.facts.map((fact) => <li key={fact}><Check size={15} aria-hidden="true" />{fact}</li>)}</ul></div>
      <div className="authority-note"><ShieldCheck size={18} aria-hidden="true" /><div><span>校尉权限</span><p>{context.authority}</p></div></div>
    </section>
  )
}
