import { applyEffects } from './effects'
import { chapter1InvestigationBlueprint, chapter1MainlineSteps, createChapter1InvestigationState } from '../data/chapter1'
import { chapter2ActionMaterials, chapter2Case1InvestigationActions, chapter2Case1Questions, chapter2Case1VerificationSets, chapter2ChoiceOutcomes, chapter2InquiryReviews, chapter2MainlineSteps, chapter2RegisterMaterialIds, createChapter2InvestigationState } from '../data/chapter2'
import type { Chapter1PetitionId, Chapter1QuestionId, Chapter1RouteId, Chapter2BranchId, Chapter2CaseId, Effect, GameState, MainlineChoice, NarrativeBlock, CommandResult } from '../types'

const initialNarrative: NarrativeBlock = {
  title: '北镇抚司',
  paragraphs: [{ kind: 'prose', text: '你还没有开始这一段路。' }],
  tone: 'quiet',
}

const initialRelations: GameState['npcRelations'] = {
  zhou_hanchuan: 20,
  feng_tianshun: 0,
  tan_baokun: 1,
  wei_chengen: 0,
  sun_yutang: 0,
  li_muchen: 0,
  fang_zhengyan: 0,
  du_wenzhao: 0,
  shen_jingting: 0,
  prince_jing: 0,
  liao_chengzhi: 0,
}

export type DeveloperCheckpointId =
  | 'chapter2-entry'
  | 'chapter2-case1-investigation'
  | 'chapter2-case1-inquiry'
  | 'chapter2-case1-verification'
  | 'chapter2-case1-end'

interface MainlineStep {
  chapter: GameState['chapter']
  title?: string
  text?: string
  narrative?: NarrativeBlock
  image?: { src: string; alt: string }
  effects?: Effect[]
  choices?: MainlineChoice[]
  nextNode?: string
  completesPlayableChapter?: boolean
  completesGame?: boolean
  stageEvent?: true
}

const mainlineSteps: Record<string, MainlineStep> = {
  ...chapter1MainlineSteps,
  'chapter2.entry': {
    chapter: 'chapter2',
    narrative: {
      title: '第二章 · 失号凭照',
      tone: 'quiet',
      paragraphs: [
        { kind: 'prose', text: '第一案结案后，署里发下五两办案补贴。银子入袋，旧案也随卷封存。' },
        { kind: 'dialogue', text: '覃保坤把三张差牌推到案前：“河埠失押，城南空屋，城门命案。先分开查。”' },
        { kind: 'system', text: '第一案结案补贴：银两 +5。' },
      ],
    },
    nextNode: 'chapter2.rain-night-transfer',
  },
  ...chapter2MainlineSteps,
  'chapter3.entry': { chapter: 'chapter3', title: '第三章 · 调查前夕', text: '第三章主线即将展开。', nextNode: 'chapter3.investigation' },
  'chapter3.investigation': { chapter: 'chapter3', title: '第三章 · 调查推进', text: '已有材料正在按程序核验。', nextNode: 'chapter3.case-file-sealed' },
  'chapter3.case-file-sealed': { chapter: 'chapter3', title: '阶段转折 · 案包暂封', text: '案包先行暂封，等待后续程序接续。', nextNode: 'chapter4.entry', stageEvent: true },
  'chapter4.entry': { chapter: 'chapter4', title: '第四章 · 旧物调查', text: '第四章主线进入旧物的核验与追查。', nextNode: 'chapter4.warehouse-resealed' },
  'chapter4.warehouse-resealed': { chapter: 'chapter4', title: '阶段转折 · 库房接管并重新封存', text: '库房完成接管和重新封存，流程继续向前。', nextNode: 'chapter4.closing', stageEvent: true },
  'chapter4.closing': { chapter: 'chapter4', title: '第四章 · 章末交接', text: '本章的程序性收束已经完成。', nextNode: 'chapter5.entry' },
  'chapter5.entry': { chapter: 'chapter5', title: '第五章 · 最终章开始', text: '最终章主线即将展开。', nextNode: 'chapter5.clan-materials-notice' },
  'chapter5.clan-materials-notice': { chapter: 'chapter5', title: '阶段转折 · 宗藩材料审核通知', text: '材料审核通知已经送达，主线进入最终核验。', nextNode: 'chapter5.investigation', stageEvent: true },
  'chapter5.investigation': { chapter: 'chapter5', title: '第五章 · 最终核验', text: '第五章的固定终局将在完整主线数据接入后呈现。', completesGame: true },
}

const chapter2Case1ChoiceImages: Record<string, { src: string; alt: string }> = {
  'c2-01-lock': { src: '/assets/chapter2/case1/cage-lock-detail.png', alt: '囚车锁扣近景' },
  'c2-01-stub': { src: '/assets/chapter2/case1/wet-transfer-stub.png', alt: '湿透的换押存根' },
  'c2-01-inspect-shaft': { src: '/assets/chapter2/case1/shaft-break.png', alt: '囚车车辕断口' },
  'c2-01-trace-drag-marks': { src: '/assets/chapter2/case1/cart-drag-trace.png', alt: '车底拖痕' },
  'c2-01-examine-rope-fibers': { src: '/assets/chapter2/case1/empty-hook-rope-fibers.png', alt: '空车钩与残留麻纤维' },
  'c2-01-preserve-wet-stub': { src: '/assets/chapter2/case1/wet-transfer-stub.png', alt: '湿透的换押存根' },
  'c2-01-compare-escort-order': { src: '/assets/chapter2/case1/original-escort-token.png', alt: '原押送差牌' },
  'c2-01-open-verification': { src: '/assets/chapter2/case1/case1-evidence-table.png', alt: '第一案证物同桌摆放' },
  'preserve-guard-responsibility': { src: '/assets/chapter2/case1/qian-sealing-receipt.png', alt: '覃保坤封存凭照' },
  'follow-river-transfer': { src: '/assets/chapter2/case1/qian-sealing-receipt.png', alt: '覃保坤封存凭照' },
}

function enterMainlineNode(state: GameState, nodeId: string): GameState {
  const step = mainlineSteps[nodeId]
  if (!step) return state
  const next = step.effects ? applyEffects(state, step.effects) : state
  if (nodeId === 'chapter2.rain-night-transfer' && !next.chapter2Investigation.completedCaseIds.includes('rain-night-transfer')) {
    next.chapter2Investigation = createChapter2InvestigationState()
  }
  return {
    ...next,
    chapter: step.chapter,
    mainlineNode: nodeId,
    phase: 'mainline',
    screen: 'game',
    pendingResult: null,
    currentNarrative: step.narrative ? { ...step.narrative, image: step.image ?? step.narrative.image } : {
      title: step.title ?? '主线推进',
      paragraphs: [
        { kind: 'prose', text: step.text ?? '' },
        ...(step.stageEvent ? [{ kind: 'system' as const, text: '这是固定阶段转折，主线继续向前。' }] : []),
      ],
      tone: step.stageEvent ? 'tense' : 'quiet',
    },
    lastCommandError: null,
  }
}

function chapter1RouteIdFromChoice(choiceId: string): Chapter1RouteId | null {
  if (choiceId === 'trace-sample-route') return 'sample-route'
  if (choiceId === 'inspect-fire-scene') return 'fire-scene'
  if (choiceId === 'check-client-counterfoil') return 'client-counterfoil'
  return null
}

function chapter1RouteActions(state: GameState): MainlineChoice[] {
  const routeId = state.chapter1Investigation.activeRouteId
  const route = chapter1InvestigationBlueprint.routes.find((item) => item.id === routeId)
  if (!route) return []
  return route.actions
    .filter((action) => !state.chapter1Investigation.completedActionIds.includes(action.id))
    .map((action) => ({ id: action.id, label: action.label, nextNode: 'chapter1.route-investigation', outcomeNarrative: action.narrative }))
}

function applyChapter1Route(state: GameState, routeId: Chapter1RouteId): GameState {
  const route = chapter1InvestigationBlueprint.routes.find((item) => item.id === routeId)
  if (!route || state.chapter1Investigation.completedRouteIds.includes(routeId)) return state
  return {
    ...state,
    chapter1Investigation: {
      ...state.chapter1Investigation,
      activeRouteId: routeId,
    },
  }
}

function beginChapter1Route(state: GameState, routeId: Chapter1RouteId): GameState {
  const selected = applyChapter1Route(state, routeId)
  const route = chapter1InvestigationBlueprint.routes.find((item) => item.id === routeId)
  return route?.actions[0] ? completeChapter1Route(selected, route.actions[0].id) : selected
}

function completeChapter1Route(state: GameState, actionId: string): GameState {
  const route = chapter1InvestigationBlueprint.routes.find((item) => item.actions.some((action) => action.id === actionId))
  const action = route?.actions.find((item) => item.id === actionId)
  if (!route || !action || state.chapter1Investigation.completedActionIds.includes(actionId)) return state
  const completedActionIds = [...state.chapter1Investigation.completedActionIds, actionId]
  const routeComplete = route.actions.every((item) => completedActionIds.includes(item.id))
  return {
    ...state,
    chapter1Investigation: {
      ...state.chapter1Investigation,
      completedActionIds,
      completedRouteIds: routeComplete && !state.chapter1Investigation.completedRouteIds.includes(route.id as Chapter1RouteId)
        ? [...state.chapter1Investigation.completedRouteIds, route.id as Chapter1RouteId]
        : state.chapter1Investigation.completedRouteIds,
      materialIds: [...new Set([...state.chapter1Investigation.materialIds, ...action.materialIds])],
      activeRouteId: routeComplete ? null : route.id as Chapter1RouteId,
    },
  }
}

function chapter1JudgmentChoices(state: GameState): MainlineChoice[] {
  const materials = new Set(state.chapter1Investigation.materialIds)
  const hasRoute = (id: string) => state.chapter1Investigation.completedRouteIds.includes(id as Chapter1RouteId)
  const fixedFacts = new Set(state.chapter1Investigation.fixedFactIds)
  const detentionApproved = state.chapter1Investigation.petitionResultIds.includes('detain-he-xing:approved')
  const evidenceReady = fixedFacts.has('fire-target') && fixedFacts.has('paper-fate') && detentionApproved && materials.has('fire-origin') && materials.has('client-counterfoil') && (materials.has('quantity-gap') || materials.has('package-remains'))
  const options: MainlineChoice[] = []
  if (evidenceReady) {
    options.push({
      id: 'submit-complete-case',
      label: '提交：贺兴侵吞并纵火栽赃',
      nextNode: 'chapter1.case-closed',
      outcomeNarrative: { title: '结案判断成立', tone: 'hopeful', paragraphs: [{ kind: 'prose', text: '你把假送样、起火位置和数量缺口逐项放上案桌。覃保坤没有替你补最后一句，只点头：“这份判断，旁人可以照着重走。”' }] },
    })
  }
  if (!evidenceReady) {
    options.push({
      id: 'continue-verification',
      label: '继续补证，完成另一组核心核验',
      nextNode: 'chapter1.day2-verify',
      outcomeNarrative: { title: '继续补证', tone: 'quiet', paragraphs: [{ kind: 'prose', text: '你暂不提交结案判断，把尚未咬合的材料重新列成待核命题。覃保坤准许继续补查，但提醒纸铺停业和吴生受押都在耗时间。' }] },
    })
  }
  if (!evidenceReady && (hasRoute('sample-route') || hasRoute('fire-scene'))) {
    options.push({
      id: 'submit-provisional-case',
      label: '提交：先按矛盾链移交，缺口列入复核',
      nextNode: 'chapter1.case-closed',
      outcomeNarrative: { title: '带缺口结案', tone: 'tense', paragraphs: [{ kind: 'prose', text: '你把已经固定的矛盾和仍未补齐的缺口分开呈报。覃保坤准许依法移交，同时在卷尾留下补核标记。' }] },
    })
  }
  options.push({
    id: 'submit-wusheng-case',
    label: '判断：吴生携银离铺，应按纵火移交',
    nextNode: 'chapter1.closure-judgment',
    effects: [{ type: 'relation_change', npcId: 'tan_baokun', delta: -1 }],
    outcomeNarrative: { title: '判断被退回', tone: 'tense', paragraphs: [{ kind: 'dialogue', text: '覃保坤把案卷推回来：“包里有银，只能证明银在包里。假地址、起火处和印纸缺口，你这一句解释不了。重写。”' }, { kind: 'system', text: '责任判断证据不足。吴生暂时继续受押，纸铺复核也被迫延后一轮。' }] },
  })
  return options
}

function chapter1DispositionChoices(): MainlineChoice[] {
  return [
    {
      id: 'public-review',
      label: '呈请当众复核证据链',
      nextNode: 'chapter1.charred-token',
      effects: [{ type: 'set_flag', flag: 'first_case_closed', value: true }],
      outcomeNarrative: { title: '当众复核', tone: 'hopeful', paragraphs: [{ kind: 'prose', text: '覃保坤准许逐项公开复核。吴生洗脱嫌疑，贺兴无法解释经手凭条、起火位置与印纸缺口，被依程序暂扣移交。' }, { kind: 'dialogue', text: '覃保坤收起案卷：“让人看见你怎么得出结论，比只让人听见结论更难。”' }] },
    },
    {
      id: 'hold-and-question',
      label: '呈请暂不点破，按矛盾追问',
      nextNode: 'chapter1.charred-token',
      effects: [{ type: 'set_flag', flag: 'first_case_closed', value: true }],
      outcomeNarrative: { title: '按矛盾追问', tone: 'tense', paragraphs: [{ kind: 'prose', text: '覃保坤让差役守住后门，按凭条、火场和数量缺口的次序追问。贺兴越想补全说法，越暴露自己经手过不该经手的东西。吴生随后洗脱嫌疑，案件依法移交。' }, { kind: 'dialogue', text: '覃保坤道：“会藏材料是手段，知道何时摊开，才算办差。”' }] },
    },
  ]
}

function chapter1SupplementRouteId(choiceId: string): Chapter1RouteId | null {
  if (choiceId === 'supplement-sample-route') return 'sample-route'
  if (choiceId === 'supplement-fire-scene') return 'fire-scene'
  if (choiceId === 'supplement-client-counterfoil') return 'client-counterfoil'
  return null
}

function chapter1VerificationChoices(state: GameState): MainlineChoice[] {
  const choices: MainlineChoice[] = []
  for (const route of chapter1InvestigationBlueprint.routes) {
    if (state.chapter1Investigation.completedRouteIds.includes(route.id as Chapter1RouteId)) continue
    choices.push({
      id: `supplement-${route.id}`,
      label: `补查：${route.label}`,
      nextNode: 'chapter1.day2-verify',
      outcomeNarrative: { title: `第二日补查 · ${route.label}`, tone: 'quiet', paragraphs: [{ kind: 'prose', text: '你沿着第一日留下的缺口补查。覃保坤没有催你下结论，只让新材料与已经固定的现场记录逐项对照。' }] },
    })
  }
  return choices
}

function chapter1PetitionChoices(state: GameState): MainlineChoice[] {
  const fixedFacts = new Set(state.chapter1Investigation.fixedFactIds)
  if (fixedFacts.has('fire-target') && fixedFacts.has('paper-fate')) {
    return [
      { id: 'detain-he-xing', label: '请示：暂扣贺兴，进入责任判断', nextNode: 'chapter1.closure-judgment', outcomeNarrative: { title: '请示暂扣', paragraphs: [] } },
    ]
  }
  return [
    { id: 'request-supplement', label: '请示：继续补查一项待证问题', nextNode: 'chapter1.day2-verify', outcomeNarrative: { title: '请示补查', paragraphs: [] } },
    { id: 'preserve-evidence', label: '请示：封存现有证物并继续复核', nextNode: 'chapter1.day2-verify', outcomeNarrative: { title: '请示封存', paragraphs: [] } },
    { id: 'detain-he-xing', label: '请示：暂扣贺兴，进入责任判断', nextNode: 'chapter1.closure-judgment', outcomeNarrative: { title: '请示暂扣', paragraphs: [] } },
  ]
}

export function submitChapter1Verification(state: GameState, questionId: Chapter1QuestionId, selectedMaterialIds: string[]): CommandResult {
  if (state.screen !== 'game' || state.phase !== 'mainline' || state.chapter !== 'chapter1' || state.mainlineNode !== 'chapter1.day2-verify') return withFailure(state, 'invalid_phase')
  const question = chapter1InvestigationBlueprint.openQuestions.find((item) => item.id === questionId)
  if (!question || state.chapter1Investigation.fixedFactIds.includes(questionId)) return withFailure(state, 'invalid_choice')
  const selected = [...new Set(selectedMaterialIds)]
  if (selected.length < 2 || selected.some((id) => !state.chapter1Investigation.materialIds.includes(id))) return withFailure(state, 'invalid_choice')

  const supported = question.requiredMaterialSets.some((required) => (
    required.length === selected.length && required.every((id) => selected.includes(id))
  ))
  const narrative = supported ? question.supportedNarrative : {
    title: '材料相关，但还不足',
    tone: 'tense' as const,
    paragraphs: [
      { kind: 'prose' as const, text: '你把两项材料并在一处，它们能说明案情有疑点，却还不能直接回答这条待证问题。' },
      { kind: 'dialogue' as const, text: '覃保坤道：“别拿两件真的东西，拼出一句证明不了的话。回去找能直接咬住命题的材料。”' },
    ],
  }
  const investigation = supported ? {
    ...state.chapter1Investigation,
    fixedFactIds: [...new Set([...state.chapter1Investigation.fixedFactIds, questionId])],
    verificationIds: [...new Set([...state.chapter1Investigation.verificationIds, questionId])],
    openQuestionIds: state.chapter1Investigation.openQuestionIds.filter((id) => id !== questionId),
  } : state.chapter1Investigation
  return {
    ok: true,
    state: {
      ...state,
      phase: 'result',
      chapter1Investigation: investigation,
      currentNarrative: narrative,
      pendingResult: { kind: 'mainline_choice', nextNode: supported ? 'chapter1.authorization-review' : 'chapter1.day2-verify' },
      recentEvents: [{ id: `verify-${questionId}-${state.recentEvents.length}`, chapter: 'chapter1' as const, title: question.shortLabel, summary: narrative.paragraphs.map((paragraph) => paragraph.text).join(' '), effects: supported ? [narrative.title] : ['未固定事实'] }, ...state.recentEvents].slice(0, 20),
      lastCommandError: null,
    },
  }
}

export function submitChapter1Petition(state: GameState, petitionId: Chapter1PetitionId): CommandResult {
  if (state.screen !== 'game' || state.phase !== 'mainline' || state.chapter !== 'chapter1' || state.mainlineNode !== 'chapter1.authorization-review') return withFailure(state, 'invalid_phase')
  const fixedFacts = new Set(state.chapter1Investigation.fixedFactIds)
  const fixedCount = fixedFacts.size
  let approved = false
  let nextNode = 'chapter1.day2-verify'
  let narrative: NarrativeBlock

  if (petitionId === 'request-supplement') {
    approved = true
    narrative = { title: '覃保坤准许补查', tone: 'quiet', paragraphs: [{ kind: 'dialogue', text: '覃保坤道：“把尚未回答的命题写清，再去取材料。别把补查当成重走一遍。”' }] }
  } else if (petitionId === 'preserve-evidence' && fixedCount >= 1) {
    approved = true
    narrative = { title: '覃保坤准许封存', tone: 'quiet', paragraphs: [{ kind: 'prose', text: '你报明已固定的事实和仍有缺口的部分。覃保坤签下封存，命差役守住证物，你则回案桌继续复核。' }] }
  } else if (petitionId === 'detain-he-xing' && fixedFacts.has('fire-target') && fixedFacts.has('paper-fate')) {
    approved = true
    nextNode = 'chapter1.closure-judgment'
    narrative = { title: '覃保坤准许暂扣', tone: 'tense', paragraphs: [{ kind: 'prose', text: '你先报起火目标，再报印纸数量缺口，两项事实都能让旁人重走。覃保坤这才命人暂扣贺兴，等待你提交完整责任判断。' }, { kind: 'dialogue', text: '覃保坤道：“这一步是我批的。案卷里写清你的依据，别写成你自己拿的人。”' }] }
  } else {
    narrative = { title: '请示被退回补证', tone: 'tense', paragraphs: [{ kind: 'dialogue', text: '覃保坤道：“你现在有疑点，没有足够的暂扣依据。先把毁证目标和印纸去向各自固定，再来请示。”' }, { kind: 'system', text: '廖威达无权绕过请示直接暂扣。你回到案桌继续补证。' }] }
  }

  const resultId = `${petitionId}:${approved ? 'approved' : `returned:${fixedCount}`}`
  return {
    ok: true,
    state: {
      ...state,
      phase: 'result',
      chapter1Investigation: { ...state.chapter1Investigation, petitionResultIds: [...new Set([...state.chapter1Investigation.petitionResultIds, resultId])] },
      currentNarrative: narrative,
      pendingResult: { kind: 'mainline_choice', nextNode },
      recentEvents: [{ id: `petition-${petitionId}-${state.recentEvents.length}`, chapter: 'chapter1' as const, title: narrative.title, summary: narrative.paragraphs.map((paragraph) => paragraph.text).join(' '), effects: [approved ? '覃保坤批准请示' : '覃保坤要求补证'] }, ...state.recentEvents].slice(0, 20),
      lastCommandError: null,
    },
  }
}

export function createInitialState(): GameState {
  return {
    chapter: 'prologue',
    mainlineNode: 'prologue.0',
    phase: 'prologue',
    screen: 'title',
    prologueScene: 0,
    attributes: { strength: 7, insight: 7, eloquence: 2, reputation: 4 },
    wealth: 30,
    health: 100,
    clues: [],
    npcRelations: initialRelations,
    flags: {},
    pendingResult: null,
    currentNarrative: initialNarrative,
    recentEvents: [],
    chapter1Investigation: createChapter1InvestigationState(),
    chapter2Investigation: createChapter2InvestigationState(),
    lastCommandError: null,
  }
}

export function createDeveloperCheckpointState(checkpoint: DeveloperCheckpointId): GameState {
  const base: GameState = {
    ...createInitialState(),
    screen: 'game',
    phase: 'mainline',
    chapter: 'chapter2',
    wealth: 35,
    flags: {
      prologue_survivor: true,
      first_case_closed: true,
      charred_token_preserved: true,
      tianshun_reconnected: true,
    },
    npcRelations: { ...initialRelations, feng_tianshun: 1 },
    recentEvents: [{
      id: 'chapter2-first-case-closure-payment',
      chapter: 'chapter2',
      title: '第一案结案补贴',
      summary: '第一案依法封结后，署里发下五两办案补贴。',
      effects: ['银两 +5'],
    }],
  }

  if (checkpoint === 'chapter2-entry') return enterMainlineNode(base, 'chapter2.entry')
  if (checkpoint === 'chapter2-case1-investigation') return enterMainlineNode(base, 'chapter2.rain-night-transfer')

  const investigationActions = chapter2Case1InvestigationActions.map((action) => action.id)
  const investigationMaterials = ['unforced-lock', 'shaft-break-record', 'cart-drag-trace', 'cut-rope-fibers', 'wet-transfer-stub', 'original-escort-order']
  const investigation = {
    ...createChapter2InvestigationState(),
    activeCaseId: 'rain-night-transfer' as const,
    completedActionIds: investigationActions,
    caseMaterialIds: investigationMaterials,
    materialIds: investigationMaterials,
  }

  if (checkpoint === 'chapter2-case1-inquiry') {
    return enterMainlineNode({ ...base, chapter2Investigation: investigation }, 'chapter2.case1-inquiry-select')
  }

  const testimonyActions = [
    'c2-01-guard-a-statement',
    'c2-01-guard-b-statement',
    'c2-01-river-boat-statement',
    'c2-01-river-tea-statement',
  ]
  const allMaterials = [
    ...investigationMaterials,
    'zhou-liu-signed-statement', 'zhao-qi-signed-statement', 'separate-guard-statements',
    'chen-laojiang-signed-testimony', 'ashun-signed-testimony', 'river-route-testimony',
  ]
  if (checkpoint === 'chapter2-case1-end') {
    return enterMainlineNode({
      ...base,
      chapter2Investigation: {
        ...investigation,
        completedActionIds: [...investigationActions, ...testimonyActions],
        caseMaterialIds: allMaterials,
        materialIds: allMaterials,
        fixedFactIds: ['self-escape', 'guard-duty'],
      },
      recentEvents: [
        { id: 'chapter2-case1-verify-guard-duty', chapter: 'chapter2', title: '两名押役各有一笔', summary: '周六与赵七的失职责任分别入卷。', effects: ['周六与赵七的失职责任分别入卷'] },
        { id: 'chapter2-case1-verify-self-escape', chapter: 'chapter2', title: '锁扣上的说法站不住', summary: '马骁并非自行脱逃，翻车现场存在人为布置。', effects: ['马骁并非自行脱逃', '翻车现场存在人为布置'] },
        ...base.recentEvents,
      ],
    }, 'chapter2.case1-authority-review')
  }
  return enterMainlineNode({
    ...base,
    chapter2Investigation: {
      ...investigation,
      completedActionIds: [...investigationActions, ...testimonyActions],
      caseMaterialIds: allMaterials,
      materialIds: allMaterials,
    },
  }, 'chapter2.case1-close-review')
}

export function startGame(state: GameState): GameState {
  return { ...state, screen: 'game', phase: 'prologue', chapter: 'prologue', mainlineNode: 'prologue.0', lastCommandError: null }
}

export function startMainline(state: GameState): GameState {
  return enterMainlineNode(applyEffects({ ...state, screen: 'game' }, [{ type: 'set_flag', flag: 'prologue_survivor', value: true }]), 'chapter1.entry')
}

export function enterChapterTwo(state: GameState): CommandResult {
  if (state.chapter !== 'chapter1' || state.screen !== 'complete' || state.phase !== 'complete' || state.mainlineNode !== 'chapter1.feng-reunion' || state.flags.first_case_closed !== true) {
    return withFailure(state, 'invalid_phase')
  }

  const rewarded = applyEffects(state, [{ type: 'wealth_change', delta: 5 }])
  const entered = enterMainlineNode(rewarded, 'chapter2.entry')
  return {
    ok: true,
    state: {
      ...entered,
      recentEvents: [
        {
          id: 'chapter2-first-case-closure-payment',
          chapter: 'chapter2' as const,
          title: '第一案结案补贴',
          summary: '第一案依法封结后，署里发下五两办案补贴。',
          effects: ['银两 +5'],
        },
        ...state.recentEvents,
      ].slice(0, 20),
    },
  }
}

export function advanceMainline(state: GameState): CommandResult {
  if (state.screen !== 'game' || state.phase !== 'mainline') return withFailure(state, 'invalid_phase')
  const step = mainlineSteps[state.mainlineNode]
  if (!step) return withFailure(state, 'not_found')
  if (getMainlineChoices(state).length) return withFailure(state, 'invalid_choice')

  if (step.completesPlayableChapter) {
    return {
      ok: true,
      state: {
        ...state,
        phase: 'complete',
        screen: 'complete',
        currentNarrative: {
          title: '第一章完成',
          paragraphs: [{ kind: 'prose', text: '纸铺失火案已经封结，烧焦木牌单独入档，你也重新见到了冯天顺。' }],
          tone: 'quiet',
        },
        lastCommandError: null,
      },
    }
  }

  if (step.completesGame) {
    return {
      ok: true,
      state: {
        ...state,
        phase: 'complete',
        screen: 'complete',
        currentNarrative: { title: '终局', paragraphs: [{ kind: 'prose', text: '第五章的固定终局已经抵达。' }], tone: 'somber' },
        lastCommandError: null,
      },
    }
  }

  if (!step.nextNode) return withFailure(state, 'not_found')
  return { ok: true, state: enterMainlineNode(state, step.nextNode) }
}

export function getMainlineChoices(state: GameState): MainlineChoice[] {
  if (state.screen !== 'game' || state.phase !== 'mainline') return []
  if (state.chapter === 'chapter1' && state.mainlineNode === 'chapter1.closure-judgment') return chapter1JudgmentChoices(state)
  if (state.chapter === 'chapter1' && state.mainlineNode === 'chapter1.case-closed') return chapter1DispositionChoices()
  if (state.chapter === 'chapter1' && state.mainlineNode === 'chapter1.authorization-review') return chapter1PetitionChoices(state)
  if (state.chapter === 'chapter1' && state.mainlineNode === 'chapter1.paper-shop-fire') {
    const completed = new Set(state.chapter1Investigation.completedRouteIds)
    return (mainlineSteps[state.mainlineNode]?.choices ?? []).filter((choice) => {
      const routeId = chapter1RouteIdFromChoice(choice.id)
      return routeId ? !completed.has(routeId) : true
    })
  }
  if (state.chapter === 'chapter1' && state.mainlineNode === 'chapter1.route-investigation') return chapter1RouteActions(state)
  if (state.chapter === 'chapter1' && state.mainlineNode === 'chapter1.day2-verify') return chapter1VerificationChoices(state)
  if (state.chapter === 'chapter2' && ['chapter2.rain-night-transfer', 'chapter2.case1-investigation'].includes(state.mainlineNode)) {
    const completed = new Set(state.chapter2Investigation.completedActionIds ?? [])
    const routeStarters = [
      ['c2-01-inspect-lock', 'c2-01-inspect-shaft'],
      ['c2-01-trace-drag-marks', 'c2-01-examine-rope-fibers'],
      ['c2-01-preserve-wet-stub', 'c2-01-compare-escort-order'],
    ]
    const choices = routeStarters.filter((ids) => ids.some((id) => !completed.has(id))).map((ids) => chapter2Case1InvestigationActions.find((choice) => choice.id === ids.find((id) => !completed.has(id)))!).filter(Boolean)
    if (choices.length) return choices.filter((choice) => ['c2-01-inspect-lock', 'c2-01-trace-drag-marks', 'c2-01-preserve-wet-stub'].includes(choice.id))
    return [{ id: 'c2-01-finish-investigation', label: '结束现场与文书调查，开始分开闻讯', nextNode: 'chapter2.case1-inquiry-select', effects: [], outcomeNarrative: { title: '调查材料封入案夹', tone: 'quiet', paragraphs: [{ kind: 'prose', text: '六项现场与文书材料分别编号入袋。书记官收起勘验工具，换上四份空白口供纸，调查与闻讯从这里分开。' }] } }]
  }
  if (state.chapter === 'chapter2' && state.mainlineNode === 'chapter2.case1-route-cart') return chapter2Case1InvestigationActions.filter((choice) => choice.id === 'c2-01-inspect-shaft' && !(state.chapter2Investigation.completedActionIds ?? []).includes(choice.id))
  if (state.chapter === 'chapter2' && state.mainlineNode === 'chapter2.case1-route-traces') return chapter2Case1InvestigationActions.filter((choice) => choice.id === 'c2-01-examine-rope-fibers' && !(state.chapter2Investigation.completedActionIds ?? []).includes(choice.id))
  if (state.chapter === 'chapter2' && state.mainlineNode === 'chapter2.case1-route-documents') return chapter2Case1InvestigationActions.filter((choice) => choice.id === 'c2-01-compare-escort-order' && !(state.chapter2Investigation.completedActionIds ?? []).includes(choice.id))
  if (state.chapter === 'chapter2' && state.mainlineNode === 'chapter2.case1-inquiry-select') {
    const completed = new Set(state.chapter2Investigation.completedActionIds ?? [])
    const choices: MainlineChoice[] = []
    if (!completed.has('c2-01-guard-b-statement')) choices.push({ id: 'c2-01-begin-guard-inquiry', label: '分开闻讯周六与赵七', nextNode: completed.has('c2-01-guard-a-statement') ? 'chapter2.case1-inquiry.guard-b.1' : 'chapter2.case1-inquiry.guard-a.1', effects: [], outcomeNarrative: { title: '押役分室候问', tone: 'tense', paragraphs: [{ kind: 'prose', text: '两名押役分别候在东西厢。每人问完后单独复述、签押，不准互相补话。' }] } })
    if (!completed.has('c2-01-river-tea-statement')) choices.push({ id: 'c2-01-begin-river-inquiry', label: '分开询问船夫与茶棚伙计', nextNode: completed.has('c2-01-river-boat-statement') ? 'chapter2.case1-inquiry.river-tea.1' : 'chapter2.case1-inquiry.river-boat.1', effects: [], outcomeNarrative: { title: '河埠证人分开候问', tone: 'quiet', paragraphs: [{ kind: 'prose', text: '船夫先在东屋候问，茶棚伙计留在外间。两人的时辰和去向各自落纸后再作对照。' }] } })
    if (!choices.length) choices.push({ id: 'c2-01-open-verification', label: '四份口供均已签押，进入证据命题核验', nextNode: 'chapter2.case1-close-review', effects: [], outcomeNarrative: { title: '十二项材料齐备', tone: 'quiet', paragraphs: [{ kind: 'prose', text: '六项现场与文书材料、四份个人签押口供、两张口供对照页依形成次序封好。十二项材料分别保留原始来源，不再把四人的话缩成两个标题。' }] } })
    return choices
  }
  if (state.chapter === 'chapter2' && state.mainlineNode === 'chapter2.case1-inquiry.guard-a.signed') return [{ id: 'c2-01-continue-guard-b', label: '封存周六口供，单独提讯赵七', nextNode: 'chapter2.case1-inquiry.guard-b.1', effects: [], outcomeNarrative: { title: '换一间屋子', tone: 'tense', paragraphs: [{ kind: 'prose', text: '周六的口供封进案夹。赵七从西厢带来时，看不见前一份记录，也不知道周六已经说到哪里。' }] } }]
  if (state.chapter === 'chapter2' && state.mainlineNode === 'chapter2.case1-inquiry.river-boat.signed') return [{ id: 'c2-01-continue-river-tea', label: '封存船夫证言，单独询问阿顺', nextNode: 'chapter2.case1-inquiry.river-tea.1', effects: [], outcomeNarrative: { title: '茶棚伙计进屋', tone: 'quiet', paragraphs: [{ kind: 'prose', text: '陈老桨的证言先行封存。阿顺被带进来时，桌上只留车辙图，没有船夫刚刚按过指印的那一页。' }] } }]
  if (state.chapter === 'chapter2' && state.mainlineNode === 'chapter2.case1-authority-review') {
    const guardDuty = state.chapter2Investigation.fixedFactIds.includes('guard-duty')
    return [{
      id: guardDuty ? 'preserve-guard-responsibility' : 'follow-river-transfer',
      label: guardDuty ? '呈请追究押役失职，另案追查马骁去向' : '呈请确认违规转移，沿河埠路线继续追查',
      nextNode: 'chapter2.case1-closed',
      effects: [],
      outcomeNarrative: guardDuty ? {
        title: '覃保坤落签封卷',
        tone: 'quiet',
        paragraphs: [
          { kind: 'prose', text: '覃保坤逐页看过锁扣、车辕和拖痕记录，又把赵七承认开锁交人的口供压在原差牌旁。马骁并非自行脱逃，桥头的翻车现场是事后摆出来的；这两句写进结案页，不再留作猜测。' },
          { kind: 'prose', text: '周六与赵七的失职责任分别入卷：一个擅离看守位置并隐瞒所见，一个未经回署核验便开锁交人。湿存根随卷封存，凭照上的空白领取人与空白终点另抄一页。' },
          { kind: 'dialogue', text: '覃保坤落下签押：“失押责任到这里结。马骁去向仍列待查，谁安排转移，也别替空栏填名字。”' },
        ],
      } : {
        title: '覃保坤落签封卷',
        tone: 'quiet',
        paragraphs: [
          { kind: 'prose', text: '覃保坤逐页看过锁扣、车辕和拖痕记录，又把赵七承认开锁交人的口供压在原差牌旁。马骁并非自行脱逃，桥头的翻车现场是事后摆出来的；这两句写进结案页，不再留作猜测。' },
          { kind: 'prose', text: '未经批准的转移已经坐实。湿存根、河埠目击和城南篷车去向一并封存；两名押役尚未完全拆开的责任另列待核，不借路线材料替他们定罪。' },
          { kind: 'dialogue', text: '覃保坤落下签押：“违规交接到这里结。马骁去向仍列待查，谁安排转移，也别替空栏填名字。”' },
        ],
      },
    }]
  }
  if (state.chapter === 'chapter2' && state.mainlineNode === 'chapter2.case1-close-review') {
    return chapter2Case1Questions.filter((q) => !state.chapter2Investigation.fixedFactIds.includes(q.id)).map((q) => ({ id: q.id, label: q.shortLabel, nextNode: 'chapter2.case1-close-review', effects: [], outcomeNarrative: { title: q.shortLabel, tone: 'quiet', paragraphs: [{ kind: 'prose', text: q.prompt }] } }))
  }
  return mainlineSteps[state.mainlineNode]?.choices ?? []
}

export function chooseMainline(state: GameState, choiceId: string): CommandResult {
  if (state.screen !== 'game' || state.phase !== 'mainline') return withFailure(state, 'invalid_phase')
  if (state.chapter === 'chapter2' && state.mainlineNode === 'chapter2.case1-close-review' && ['preserve-guard-responsibility', 'follow-river-transfer'].includes(choiceId)) {
    const q = choiceId === 'preserve-guard-responsibility' ? 'guard-duty' : 'illegal-transfer'
    const held = state.chapter2Investigation.caseMaterialIds ?? []
    const selected = [...(chapter2Case1VerificationSets[q] ?? [])].filter((id) => held.includes(id))
    const result = submitChapter2Case1Verification(state, q, selected)
    if (!result.ok) return result
    return { ok: true, state: { ...result.state, pendingResult: { kind: 'mainline_choice', nextNode: 'chapter2.case1-closed' }, flags: { ...result.state.flags, slip_chain_1: true, [q === 'guard-duty' ? 'c2_01_responsibility_chain' : 'c2_01_route_chain']: true }, chapter2Investigation: { ...result.state.chapter2Investigation, completedCaseIds: [...new Set([...result.state.chapter2Investigation.completedCaseIds, 'rain-night-transfer' as Chapter2CaseId])], branchIds: [...new Set([...result.state.chapter2Investigation.branchIds, (q === 'guard-duty' ? 'c2_01_responsibility_chain' : 'c2_01_route_chain') as Chapter2BranchId])] } } }
  }
  const legacyChapter2Aliases: Record<string, string> = { 'c2-01-lock': 'c2-01-inspect-lock', 'c2-01-stub': 'c2-01-preserve-wet-stub' }
  if (state.chapter === 'chapter2' && legacyChapter2Aliases[choiceId]) choiceId = legacyChapter2Aliases[choiceId]
  if (state.chapter === 'chapter1' && state.mainlineNode === 'chapter1.authorization-review') {
    if (!['request-supplement', 'preserve-evidence', 'detain-he-xing'].includes(choiceId)) return withFailure(state, 'invalid_choice')
    return submitChapter1Petition(state, choiceId as Chapter1PetitionId)
  }
  const choice = getMainlineChoices(state).find((item) => item.id === choiceId)
  if (!choice) return withFailure(state, 'invalid_choice')

  if (state.chapter === 'chapter2' && state.mainlineNode === 'chapter2.case1-inquiry-select' && ['c2-01-begin-guard-inquiry', 'c2-01-begin-river-inquiry'].includes(choiceId)) {
    return { ok: true, state: enterMainlineNode(state, choice.nextNode) }
  }

  const chapter2Outcome = state.chapter === 'chapter2' ? chapter2ChoiceOutcomes[choiceId] : undefined
  const firstDayRouteId = state.chapter === 'chapter1' && state.mainlineNode === 'chapter1.paper-shop-fire' ? chapter1RouteIdFromChoice(choiceId) : null
  const routeActionId = state.chapter === 'chapter1' && state.mainlineNode === 'chapter1.route-investigation' ? choiceId : null
  const supplementRouteId = state.chapter === 'chapter1' && state.mainlineNode === 'chapter1.day2-verify' ? chapter1SupplementRouteId(choiceId) : null
  const routeId = firstDayRouteId ?? supplementRouteId
  const routeState = routeId ? beginChapter1Route(state, routeId) : routeActionId ? completeChapter1Route(state, routeActionId) : state
  const nightChoice = state.chapter === 'chapter1' && state.mainlineNode === 'chapter1.night-preservation' ? choiceId : null
  const nightState = nightChoice ? {
    ...routeState,
    chapter1Investigation: {
      ...routeState.chapter1Investigation,
      nightChoiceId: nightChoice as GameState['chapter1Investigation']['nightChoiceId'],
      materialIds: nightChoice === 'organize-evidence' && !routeState.chapter1Investigation.materialIds.includes('record-order')
        ? [...routeState.chapter1Investigation.materialIds, 'record-order']
        : nightChoice === 'visit-wusheng' && !routeState.chapter1Investigation.materialIds.includes('wusheng-testimony')
        ? [...routeState.chapter1Investigation.materialIds, 'wusheng-testimony']
        : nightChoice === 'guard-remains' && !routeState.chapter1Investigation.materialIds.includes('package-remains')
          ? [...routeState.chapter1Investigation.materialIds, 'package-remains']
          : routeState.chapter1Investigation.materialIds,
    },
  } : routeState
  const healthCost = nightChoice === 'guard-remains'
    ? 0
    : nightChoice || routeId || routeActionId
      ? -3
      : 0
  const baseEffects = nightChoice === 'guard-remains' ? [{ type: 'wealth_change' as const, delta: -5 }, ...(choice.effects ?? [])] : choice.effects ?? []
  const chapter2Effects: Effect[] = chapter2Outcome ? [
    { type: 'set_flag', flag: chapter2Outcome.completionFlag, value: true },
    { type: 'set_flag', flag: chapter2Outcome.branchId, value: true },
  ] : []
  const next = applyEffects(nightState, healthCost ? [{ type: 'health_change', delta: healthCost }, ...baseEffects, ...chapter2Effects] : [...baseEffects, ...chapter2Effects])
  if (chapter2Outcome) {
    next.chapter2Investigation = {
      ...next.chapter2Investigation,
      completedCaseIds: [...new Set([...next.chapter2Investigation.completedCaseIds, chapter2Outcome.caseId])],
      branchIds: [...new Set([...next.chapter2Investigation.branchIds, chapter2Outcome.branchId])],
      materialIds: [...new Set([...next.chapter2Investigation.materialIds, ...chapter2Outcome.materialIds])],
    }
  }
  const actionMaterials = chapter2ActionMaterials[choiceId] ?? []
  if (actionMaterials.length) {
    next.chapter2Investigation = {
      ...next.chapter2Investigation,
      completedActionIds: [...new Set([...(next.chapter2Investigation.completedActionIds ?? []), choiceId])],
      caseMaterialIds: [...new Set([...(next.chapter2Investigation.caseMaterialIds ?? []), ...actionMaterials])],
      materialIds: [...new Set([...next.chapter2Investigation.materialIds, ...actionMaterials])],
    }
  }
  if (state.chapter === 'chapter2' && choiceId === 'c2-01-open-verification') {
    next.mainlineNode = 'chapter2.case1-close-review'
  }
  if (routeId) {
    const route = chapter1InvestigationBlueprint.routes.find((item) => item.id === routeId)
    next.currentNarrative = route?.actions[0]?.narrative ?? choice.outcomeNarrative
  }
  if (state.chapter === 'chapter1' && state.mainlineNode === 'chapter1.closure-judgment' && ['submit-complete-case', 'submit-provisional-case'].includes(choiceId)) next.chapter1Investigation.closureSubmitted = true
  if (state.chapter === 'chapter1' && state.mainlineNode === 'chapter1.case-closed') {
    next.chapter1Investigation.confrontationMode = choiceId as GameState['chapter1Investigation']['confrontationMode']
  }
  next.phase = 'result'
  const routeActionNext = routeActionId
    ? next.chapter1Investigation.activeRouteId
      ? 'chapter1.route-investigation'
      : state.chapter1Investigation.completedRouteIds.length >= 2
        ? 'chapter1.day2-verify'
        : next.chapter1Investigation.completedRouteIds.length < 2 ? 'chapter1.paper-shop-fire' : 'chapter1.day1-evidence'
    : null
  const supplementNext = supplementRouteId ? 'chapter1.route-investigation' : null
  next.pendingResult = { kind: 'mainline_choice', nextNode: firstDayRouteId ? 'chapter1.route-investigation' : routeActionNext ?? supplementNext ?? choice.nextNode }
  if (!routeId) {
    const image = state.chapter === 'chapter2' ? chapter2Case1ChoiceImages[choiceId] : undefined
    next.currentNarrative = image ? { ...choice.outcomeNarrative, image } : choice.outcomeNarrative
  }
  next.lastCommandError = null
  next.recentEvents = [
    { id: `${state.mainlineNode}-${choice.id}`, chapter: state.chapter, title: choice.label, summary: choice.outcomeNarrative.paragraphs.map((paragraph) => paragraph.text).join(' '), effects: [...(healthCost ? [`健康 ${healthCost}`] : []), ...(choice.effects ?? []).map(formatEffect)], acquiredMaterialIds: chapter2Outcome?.materialIds ?? (actionMaterials.length ? actionMaterials : routeActionId ? chapter1InvestigationBlueprint.routes.find((route) => route.actions.some((action) => action.id === routeActionId))?.actions.find((action) => action.id === routeActionId)?.materialIds : firstDayRouteId ? chapter1InvestigationBlueprint.routes.find((route) => route.id === firstDayRouteId)?.actions[0]?.materialIds : undefined) },
    ...state.recentEvents,
  ].slice(0, 20)
  return { ok: true, state: next }
}

export function submitChapter2InquiryReview(state: GameState, selections: string[]): CommandResult {
  if (state.screen !== 'game' || state.phase !== 'mainline' || state.chapter !== 'chapter2') return withFailure(state, 'invalid_phase')
  const review = chapter2InquiryReviews[state.mainlineNode]
  if (!review) return withFailure(state, 'invalid_choice')
  const exact = selections.length === review.expected.length && review.expected.every((item) => selections.includes(item))
  const attempts = { ...(state.chapter2Investigation.inquiryReviewAttempts ?? {}), [state.mainlineNode]: (state.chapter2Investigation.inquiryReviewAttempts?.[state.mainlineNode] ?? 0) + 1 }
  if (!exact) return { ok: true, state: { ...state, chapter2Investigation: { ...state.chapter2Investigation, inquiryReviewAttempts: attempts }, currentNarrative: { title: '这份记录还不能签押', tone: 'tense', paragraphs: [{ kind: 'prose', text: '亲眼所见、听来的判断和与物证冲突的说法仍混在一起。书记官把纸推回案前，等你重新分栏。' }] } } }
  const completedActionIds = review.completionId ? [...new Set([...(state.chapter2Investigation.completedActionIds ?? []), review.completionId])] : state.chapter2Investigation.completedActionIds ?? []
  const caseMaterialIds = review.materialId ? [...new Set([...(state.chapter2Investigation.caseMaterialIds ?? []), review.materialId])] : state.chapter2Investigation.caseMaterialIds ?? []
  const materialIds = review.materialId ? [...new Set([...state.chapter2Investigation.materialIds, review.materialId])] : state.chapter2Investigation.materialIds
  const next = enterMainlineNode({ ...state, chapter2Investigation: { ...state.chapter2Investigation, completedActionIds, caseMaterialIds, materialIds, inquiryReviewAttempts: attempts } }, review.nextNode)
  next.currentNarrative = { title: review.successTitle, tone: 'quiet', paragraphs: [{ kind: 'prose', text: review.successText }] }
  return { ok: true, state: next }
}

export function submitChapter2RegisterVerification(state: GameState, selectedMaterialIds: string[]): CommandResult {
  if (state.screen !== 'game' || state.phase !== 'mainline' || state.chapter !== 'chapter2' || state.mainlineNode !== 'chapter2.register-review') return withFailure(state, 'invalid_phase')
  if (state.chapter2Investigation.completedCaseIds.length !== 3 || !['slip_chain_1', 'slip_chain_2', 'slip_chain_3'].every((flag) => state.flags[flag] === true)) return withFailure(state, 'invalid_choice')

  const selected = [...new Set(selectedMaterialIds)]
  if (selected.some((id) => !state.chapter2Investigation.materialIds.includes(id))) return withFailure(state, 'invalid_choice')
  const supported = selected.length === chapter2RegisterMaterialIds.length && chapter2RegisterMaterialIds.every((id) => selected.includes(id))
  const narrative: NarrativeBlock = supported ? {
    title: '三张凭照落在同一栏',
    tone: 'tense',
    paragraphs: [
      { kind: 'prose', text: '湿换押存根、封验凭照和夜放牌副券分别对上发放总簿。三种纸、三段日期，却都被写作“误印、待回收”，且都没有剪角。' },
      { kind: 'prose', text: '库吏循编号向后追，三张凭照最终都落在同一间内部转收房；对应收件簿已有缺页，封蜡也被后来破开。' },
    ],
  } : {
    title: '材料混入，暂不能封存',
    tone: 'quiet',
    paragraphs: [{ kind: 'prose', text: '各案责任材料能够证明失职、胁迫或致伤，却不能直接证明凭照经过哪一间房。覃保坤让你把它们放回原卷，只留下三份凭照原件重新核对。' }],
  }
  const flags: Record<string, boolean> = supported ? { c2_transfer_room_identified: true, c2_register_copy_preserved: true, c2_register_tampered: true } : {}
  return {
    ok: true,
    state: {
      ...state,
      phase: 'result',
      flags: { ...state.flags, ...flags },
      chapter2Investigation: supported ? {
        ...state.chapter2Investigation,
        registerVerified: true,
        fixedFactIds: ['c2_transfer_room_identified', 'c2_register_copy_preserved', 'c2_register_tampered'],
      } : state.chapter2Investigation,
      currentNarrative: narrative,
      pendingResult: { kind: 'mainline_choice', nextNode: supported ? 'chapter2.register-sealed' : 'chapter2.register-review' },
      recentEvents: [{
        id: `chapter2-register-review-${state.recentEvents.length}`,
        chapter: 'chapter2' as const,
        title: narrative.title,
        summary: narrative.paragraphs.map((paragraph) => paragraph.text).join(' '),
        effects: supported ? ['确认同一转收房', '保留盖印副本', '确认总簿被改动'] : [],
      }, ...state.recentEvents].slice(0, 20),
      lastCommandError: null,
    },
  }
}

export function submitChapter2Case1Verification(state: GameState, questionId: string, selectedMaterialIds: string[]): CommandResult {
  if (state.screen !== 'game' || state.phase !== 'mainline' || state.chapter !== 'chapter2' || state.mainlineNode !== 'chapter2.case1-close-review') return withFailure(state, 'invalid_phase')
  const selected = [...new Set(selectedMaterialIds)]
  const held = state.chapter2Investigation.caseMaterialIds ?? []
  const expected = [...(chapter2Case1VerificationSets[questionId] ?? [])]
  const valid = expected.length > 0 && selected.length === expected.length && selected.every((id) => held.includes(id)) && [...selected].sort().join('|') === [...expected].sort().join('|')
  if (!valid) {
    const narrative: NarrativeBlock = { title: '材料还没有咬合', tone: 'tense', paragraphs: [{ kind: 'prose', text: '你把选出的材料平码在案桌上。它们各自为真，却不能一起回答这条命题。覃保坤没有替你挑，只让书记官把这次呈报退回待核栏。' }] }
    return { ok: true, state: { ...state, phase: 'result', currentNarrative: narrative, pendingResult: { kind: 'mainline_choice', nextNode: 'chapter2.case1-close-review' }, lastCommandError: null } }
  }
  const fixedFactIds = [...new Set([...state.chapter2Investigation.fixedFactIds, questionId])]
  const closed = fixedFactIds.includes('self-escape') && (fixedFactIds.includes('guard-duty') || fixedFactIds.includes('illegal-transfer'))
  const finding = questionId === 'self-escape'
    ? {
      title: '锁扣上的说法站不住',
      text: '锁扣没有遭到破坏，赵七又承认亲手开锁交人；车辕是在停车后折断，囚车也曾被拖离原位再摆回官道。马骁并非自行破锁脱逃，翻车现场经过人为布置。你把“撞门逃走”从案卷里划掉，改记为“有人开锁，并动过车”。',
      effects: ['马骁并非自行脱逃', '翻车现场存在人为布置'],
      openEnding: '押送责任还要把两名押役的口供分开核。',
    }
    : questionId === 'guard-duty'
      ? {
        title: '两名押役各有一笔',
        text: '原差牌不准中途换押，湿存根的交接栏又不完整；周六承认离开看守位置，赵七承认未经回署核验便开锁交人。两名押役在看守与交接中均有失职。你让书记官把两份口供分别夹回差牌后，不把两个人写成同一笔。',
        effects: ['周六与赵七的失职责任分别入卷'],
        openEnding: '河埠那边的交接是否另有安排，还要再看去向一线。',
      }
      : {
        title: '河埠的交接不能算数',
        text: '原差牌没有换押授权，湿存根也缺少完整交接；赵七承认开锁交人，囚车拖痕与阿顺所见又把人车动向接到河埠。押送途中确实发生了未经批准的转移。你把河埠留下的痕迹另纸封好，暂不替它补出一个尚未查明的幕后人。',
        effects: ['押送途中发生未经批准的转移'],
        openEnding: '押役责任仍按各自口供另列待核。',
      }
  const text = closed
    ? `${finding.text}两份口供、差牌和现场记录已经能互相对上。你把它们按顺序夹进案卷，呈到覃保坤案前，请他落签封卷。`
    : `${finding.text}${finding.openEnding}`
  const narrative: NarrativeBlock = { title: finding.title, tone: 'quiet', paragraphs: [{ kind: 'prose', text }] }
  return { ok: true, state: { ...state, phase: 'result', chapter2Investigation: { ...state.chapter2Investigation, fixedFactIds }, currentNarrative: narrative, pendingResult: { kind: 'mainline_choice', nextNode: closed ? 'chapter2.case1-authority-review' : 'chapter2.case1-close-review' }, recentEvents: [{ id: `chapter2-case1-verify-${state.recentEvents.length}`, chapter: 'chapter2' as const, title: narrative.title, summary: narrative.paragraphs[0].text, effects: finding.effects }, ...state.recentEvents].slice(0, 20), lastCommandError: null } }
}

function withFailure(state: GameState, reason: NonNullable<GameState['lastCommandError']>): CommandResult {
  return { ok: false, reason }
}

function formatEffect(effect: Effect): string {
  const labels = { strength: '武力', insight: '智谋', eloquence: '口才', reputation: '声望' }
  switch (effect.type) {
    case 'attribute_change': return `${labels[effect.attribute]} ${effect.delta >= 0 ? '+' : ''}${effect.delta}`
    case 'health_change': return `健康 ${effect.delta >= 0 ? '+' : ''}${effect.delta}`
    case 'wealth_change': return `银两 ${effect.delta >= 0 ? '+' : ''}${effect.delta}`
    case 'relation_change': return `人物关系 ${effect.delta >= 0 ? '+' : ''}${effect.delta}`
    case 'set_flag': return '留下阶段记录'
    case 'add_clue': return `获得线索：${effect.clue.label}`
    case 'upgrade_clue': return `线索清晰度：${effect.clarity}`
  }
}

export function confirmResult(state: GameState): CommandResult {
  if (state.screen !== 'game' || state.phase !== 'result' || !state.pendingResult) return withFailure(state, 'invalid_phase')
  return { ok: true, state: enterMainlineNode({ ...state, pendingResult: null }, state.pendingResult.nextNode) }
}
