import { Check, ClipboardList, FileSearch, MapPin, MessageCircleQuestion, PackageSearch, ReceiptText, Search, ShieldCheck } from 'lucide-react'
import { chapter1Stages, getChapter1StageIndex } from './caseStages'

const investigationMeta: Record<string, { place: string; object: string; purpose: string }> = {
  'trace-sample-route': { place: '城南邻铺', object: '送样凭条', purpose: '核对吴生离铺的理由' },
  'sample-read-slip': { place: '纸铺案桌', object: '送样凭条', purpose: '先看地址、时刻和经手笔迹' },
  'sample-question-porter': { place: '城南邻铺与后巷', object: '脚夫和邻铺说法', purpose: '核对凭条是否真的送过' },
  'inspect-fire-scene': { place: '纸铺后库', object: '起火处与断绳', purpose: '判断火先毁掉了什么' },
  'fire-map-origin': { place: '纸铺后库', object: '灰线与登记架', purpose: '确认最先起火的位置' },
  'fire-check-remains': { place: '纸铺后库门槛', object: '烧账与包装残片', purpose: '检查火前是否有人动过纸包' },
  'check-client-counterfoil': { place: '客户留存处', object: '预付款副联', purpose: '确认银子是否确已进铺' },
  'client-find-counterfoil': { place: '客户留存处', object: '客户副联', purpose: '确认印纸和预付款确实进过纸铺' },
  'client-reconcile-quantity': { place: '纸铺案桌', object: '副联、差牌与内部数量', purpose: '找出少掉的印纸批次' },
  'organize-evidence': { place: '纸铺案桌', object: '证物与笔录', purpose: '固定第二日复核次序' },
  'visit-wusheng': { place: '看押处', object: '吴生口供', purpose: '核对折返时见闻' },
  'guard-remains': { place: '后库坍塌处', object: '火场残料', purpose: '防止证物被清走' },
  'public-review': { place: '纸铺前堂', object: '三处矛盾', purpose: '让材料可被旁人复核' },
  'hold-and-question': { place: '纸铺后门', object: '贺兴说法', purpose: '按矛盾次序追问' },
  'supplement-sample-route': { place: '城南邻铺', object: '缺失的送样记录', purpose: '补齐吴生离铺时间线' },
  'supplement-fire-scene': { place: '纸铺后库', object: '起火处与残料', purpose: '补齐毁证手段' },
  'supplement-client-counterfoil': { place: '客户与官署留档处', object: '副联与差牌', purpose: '补齐印纸数量缺口' },
  'submit-complete-case': { place: '正式案桌', object: '完整责任判断', purpose: '提交可由旁人重走的证据链' },
  'submit-provisional-case': { place: '正式案桌', object: '事实与证据缺口', purpose: '分开呈报已证事实与待补材料' },
  'submit-wusheng-case': { place: '正式案桌', object: '吴生携银事实', purpose: '检验单项事实能否支持定罪' },
  'continue-verification': { place: '纸铺案桌', object: '尚未咬合的材料', purpose: '继续补齐另一组核心证据' },
}

const investigationHealthCosts: Record<string, number> = {
  'trace-sample-route': 3,
  'inspect-fire-scene': 3,
  'check-client-counterfoil': 3,
  'sample-read-slip': 3,
  'sample-question-porter': 3,
  'fire-map-origin': 3,
  'fire-check-remains': 3,
  'client-find-counterfoil': 3,
  'client-reconcile-quantity': 3,
  'supplement-sample-route': 3,
  'supplement-fire-scene': 3,
  'supplement-client-counterfoil': 3,
  'organize-evidence': 3,
  'visit-wusheng': 3,
}

const investigationWealthCosts: Record<string, number> = {
  'guard-remains': 5,
}

const materialKinds: Record<string, { label: string; icon: typeof MapPin }> = {
  'trace-sample-route': { label: '送样核验', icon: FileSearch },
  'sample-read-slip': { label: '凭条查验', icon: ReceiptText },
  'sample-question-porter': { label: '口供核对', icon: MessageCircleQuestion },
  'inspect-fire-scene': { label: '现场勘验', icon: PackageSearch },
  'fire-map-origin': { label: '起火复勘', icon: PackageSearch },
  'fire-check-remains': { label: '残料检查', icon: PackageSearch },
  'check-client-counterfoil': { label: '账目核验', icon: ReceiptText },
  'client-find-counterfoil': { label: '副联查验', icon: ReceiptText },
  'client-reconcile-quantity': { label: '数量核对', icon: ReceiptText },
  'organize-evidence': { label: '案卷整理', icon: FileSearch },
  'visit-wusheng': { label: '口供核对', icon: MessageCircleQuestion },
  'guard-remains': { label: '保全请示', icon: ShieldCheck },
  'public-review': { label: '当众复核', icon: MessageCircleQuestion },
  'hold-and-question': { label: '当面追问', icon: MessageCircleQuestion },
  'supplement-sample-route': { label: '补查材料', icon: FileSearch },
  'supplement-fire-scene': { label: '补查材料', icon: PackageSearch },
  'supplement-client-counterfoil': { label: '补查材料', icon: ReceiptText },
  'submit-complete-case': { label: '责任呈报', icon: ShieldCheck },
  'submit-provisional-case': { label: '事实呈报', icon: ShieldCheck },
  'submit-wusheng-case': { label: '单项呈报', icon: ShieldCheck },
  'continue-verification': { label: '继续核验', icon: FileSearch },
}

export function CaseProgress({ node }: { node: string }) {
  const current = getChapter1StageIndex(node)
  return <section className="case-progress" aria-label="案件进度">
    <div className="workbench-heading"><ClipboardList size={16} aria-hidden="true" /><span>纸铺火案工作板</span><small>第 {current + 1} 阶段</small></div>
    <ol>{chapter1Stages.map(([id, label], index) => <li key={id} className={index < current ? 'is-complete' : index === current ? 'is-current' : ''}><span aria-hidden="true">{index < current ? <Check size={13} /> : index + 1}</span><b>{label}</b></li>)}</ol>
  </section>
}

export function InvestigationChoices({ choices, onChoose }: { choices: Array<{ id: string; label: string }>; onChoose: (id: string) => void }) {
  const isFirstDay = choices.some((choice) => ['trace-sample-route', 'inspect-fire-scene', 'check-client-counterfoil'].includes(choice.id))
  const isFieldAction = choices.some((choice) => ['sample-read-slip', 'sample-question-porter', 'fire-map-origin', 'fire-check-remains', 'client-find-counterfoil', 'client-reconcile-quantity'].includes(choice.id))
  const heading = isFieldAction ? '完成现场查访' : isFirstDay ? '选择调查方向' : '选择下一步核验'
  const subheading = isFirstDay ? '第一日只能优先调查两处' : isFieldAction ? '每完成一步，才会有新的材料进入案卷' : '当前材料将决定下一步核验'
  return <section className="investigation-board" aria-labelledby="investigation-heading">
    <div className="workbench-heading" id="investigation-heading"><Search size={16} aria-hidden="true" /><span>{heading}</span><small>{subheading}</small></div>
    <div className="investigation-list">{choices.map((choice) => {
      const meta = investigationMeta[choice.id]
      const material = materialKinds[choice.id] ?? { label: '待办材料', icon: MapPin }
      const MaterialIcon = material.icon
      return <button key={choice.id} className="investigation-card" data-audio-sfx="choice" onClick={() => onChoose(choice.id)}>
        <span className="investigation-card-icon"><MaterialIcon size={17} aria-hidden="true" /></span>
        <span className="investigation-card-copy"><small className="investigation-card-kind">{material.label}</small><strong>{choice.label}</strong><small>{meta?.place ?? '当前办案地点'} · {meta?.object ?? '相关材料'}</small><em>{meta?.purpose ?? '把事实核清，再决定下一步'}</em>{(investigationWealthCosts[choice.id] || investigationHealthCosts[choice.id]) && <small>预计消耗{investigationWealthCosts[choice.id] ? `银两 ${investigationWealthCosts[choice.id]}` : ''}{investigationWealthCosts[choice.id] && investigationHealthCosts[choice.id] ? '、' : ''}{investigationHealthCosts[choice.id] ? `健康 ${investigationHealthCosts[choice.id]}` : ''}</small>}</span>
        <span className="investigation-card-arrow" aria-hidden="true">›</span>
      </button>
    })}</div>
  </section>
}
