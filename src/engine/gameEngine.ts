import { applyEffects } from './effects'
import { chapter1InvestigationBlueprint, chapter1MainlineSteps, createChapter1InvestigationState } from '../data/chapter1'
import type { Chapter1PetitionId, Chapter1QuestionId, Chapter1RouteId, Effect, GameState, MainlineChoice, NarrativeBlock, CommandResult } from '../types'

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
  'chapter2.case1': { chapter: 'chapter2', title: '第二章 · 第一案间隙', text: '第一案已告一段落，下一张差牌尚未送到。', nextNode: 'chapter2.case2' },
  'chapter2.case2': { chapter: 'chapter2', title: '第二章 · 第二案间隙', text: '第二案已告一段落，卷宗正在交接。', nextNode: 'chapter2.case3' },
  'chapter2.case3': { chapter: 'chapter2', title: '第二章 · 第三案之后', text: '三案材料已齐，等待程序上的下一步。', nextNode: 'chapter2.paper-note-review' },
  'chapter2.paper-note-review': { chapter: 'chapter2', title: '阶段转折 · 纸条线索纳入复核', text: '这项材料被依法纳入复核，主线继续推进。', nextNode: 'chapter3.entry', stageEvent: true },
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

function enterMainlineNode(state: GameState, nodeId: string): GameState {
  const step = mainlineSteps[nodeId]
  if (!step) return state
  const next = step.effects ? applyEffects(state, step.effects) : state
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

  const supported = question.requiredMaterialSets.some((required) => required.every((id) => selected.includes(id)))
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
    lastCommandError: null,
  }
}

export function startGame(state: GameState): GameState {
  return { ...state, screen: 'game', phase: 'prologue', chapter: 'prologue', mainlineNode: 'prologue.0', lastCommandError: null }
}

export function startMainline(state: GameState): GameState {
  return enterMainlineNode(applyEffects({ ...state, screen: 'game' }, [{ type: 'set_flag', flag: 'prologue_survivor', value: true }]), 'chapter1.entry')
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
  return mainlineSteps[state.mainlineNode]?.choices ?? []
}

export function chooseMainline(state: GameState, choiceId: string): CommandResult {
  if (state.screen !== 'game' || state.phase !== 'mainline') return withFailure(state, 'invalid_phase')
  if (state.chapter === 'chapter1' && state.mainlineNode === 'chapter1.authorization-review') {
    if (!['request-supplement', 'preserve-evidence', 'detain-he-xing'].includes(choiceId)) return withFailure(state, 'invalid_choice')
    return submitChapter1Petition(state, choiceId as Chapter1PetitionId)
  }
  const choice = getMainlineChoices(state).find((item) => item.id === choiceId)
  if (!choice) return withFailure(state, 'invalid_choice')

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
  const next = applyEffects(nightState, healthCost ? [{ type: 'health_change', delta: healthCost }, ...baseEffects] : baseEffects)
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
  if (!routeId) next.currentNarrative = choice.outcomeNarrative
  next.lastCommandError = null
  next.recentEvents = [
    { id: `${state.mainlineNode}-${choice.id}`, chapter: state.chapter, title: choice.label, summary: choice.outcomeNarrative.paragraphs.map((paragraph) => paragraph.text).join(' '), effects: [...(healthCost ? [`健康 ${healthCost}`] : []), ...(choice.effects ?? []).map(formatEffect)], acquiredMaterialIds: routeActionId ? chapter1InvestigationBlueprint.routes.find((route) => route.actions.some((action) => action.id === routeActionId))?.actions.find((action) => action.id === routeActionId)?.materialIds : firstDayRouteId ? chapter1InvestigationBlueprint.routes.find((route) => route.id === firstDayRouteId)?.actions[0]?.materialIds : undefined },
    ...state.recentEvents,
  ].slice(0, 20)
  return { ok: true, state: next }
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
