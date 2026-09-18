import type { GameState, NarrativeBlock, NarrativeEvent, PendingResult, Clue, NpcId } from '../types'
import { chapter2ActionMaterials, chapter2Case1MaterialIds, chapter2InquiryReviews } from '../data/chapter2'

export const SAVE_VERSION = 3
export const SAVE_KEY = 'ming_jinyiwei.save.v3'

interface SaveEnvelope { version: number; savedAt: string; state: GameState }

export type SaveLoadResult =
  | { status: 'missing' }
  | { status: 'invalid' }
  | { status: 'ok'; state: GameState }

function storage(): Storage | null {
  return typeof localStorage === 'undefined' ? null : localStorage
}

export function saveGame(state: GameState): void {
  try {
    storage()?.setItem(SAVE_KEY, JSON.stringify({ version: SAVE_VERSION, savedAt: new Date().toISOString(), state } satisfies SaveEnvelope))
  } catch {
    // Persistence failure never blocks the desktop game loop.
  }
}

export function loadSave(): SaveLoadResult {
  try {
    const store = storage()
    const raw = store?.getItem(SAVE_KEY)
    if (!raw) return { status: 'missing' }
    const envelope = JSON.parse(raw) as Partial<SaveEnvelope>
    if (envelope.version !== SAVE_VERSION || typeof envelope.savedAt !== 'string' || !isGameState(envelope.state)) return { status: 'invalid' }
    return { status: 'ok', state: withChapter1InvestigationDefaults(envelope.state) }
  } catch {
    return { status: 'invalid' }
  }
}

export function clearSave(): void {
  try { storage()?.removeItem(SAVE_KEY) } catch { /* Ignore inaccessible storage. */ }
}

const npcIds: NpcId[] = ['zhou_hanchuan', 'feng_tianshun', 'tan_baokun', 'wei_chengen', 'sun_yutang', 'li_muchen', 'fang_zhengyan', 'du_wenzhao', 'shen_jingting', 'prince_jing', 'liao_chengzhi']

function isGameState(value: unknown): value is GameState {
  if (!isRecord(value)) return false
  const state = value as Partial<GameState>
  return (state.chapter === 'prologue' || state.chapter === 'chapter1' || state.chapter === 'chapter2' || state.chapter === 'chapter3' || state.chapter === 'chapter4' || state.chapter === 'chapter5') &&
    typeof state.mainlineNode === 'string' &&
    ['prologue', 'mainline', 'result', 'complete'].includes(String(state.phase)) &&
    ['title', 'game', 'complete'].includes(String(state.screen)) &&
    isFiniteNumber(state.prologueScene) && Number.isInteger(state.prologueScene) && state.prologueScene >= 0 && state.prologueScene <= 5 &&
    isAttributes(state.attributes) && isFiniteNumber(state.wealth) && state.wealth >= 0 &&
    isFiniteNumber(state.health) && state.health >= 0 && state.health <= 100 &&
    Array.isArray(state.clues) && state.clues.every(isClue) && isRelations(state.npcRelations) &&
    isRecord(state.flags) && Object.values(state.flags).every((flag) => typeof flag === 'boolean') &&
    isPendingResult(state.pendingResult) &&
    isNarrativeBlock(state.currentNarrative) && Array.isArray(state.recentEvents) && state.recentEvents.length <= 20 && state.recentEvents.every(isNarrativeEvent) &&
    (state.chapter1Investigation === undefined || isChapter1Investigation(state.chapter1Investigation)) &&
    (state.chapter2Investigation === undefined || isChapter2Investigation(state.chapter2Investigation)) &&
    (state.lastCommandError === null || ['invalid_phase', 'not_found', 'invalid_choice'].includes(String(state.lastCommandError)))
}

function isChapter2Investigation(value: unknown): boolean {
  if (!isRecord(value)) return false
  const caseIds = ['rain-night-transfer', 'empty-dowry-house', 'before-the-watch-drum']
  const branchIds = ['c2_01_responsibility_chain', 'c2_01_route_chain', 'c2_02_witness_deed', 'c2_02_receipt_chain', 'c2_03_death_chain', 'c2_03_record_chain']
  return Array.isArray(value.completedCaseIds) && value.completedCaseIds.every((id) => caseIds.includes(String(id))) &&
    (value.activeCaseId === null || caseIds.includes(String(value.activeCaseId))) &&
    Array.isArray(value.completedActionIds) && value.completedActionIds.every((id) => typeof id === 'string') &&
    Array.isArray(value.caseMaterialIds) && value.caseMaterialIds.every((id) => typeof id === 'string') &&
    Array.isArray(value.branchIds) && value.branchIds.every((id) => branchIds.includes(String(id))) &&
    Array.isArray(value.materialIds) && value.materialIds.every((id) => typeof id === 'string') &&
    Array.isArray(value.fixedFactIds) && value.fixedFactIds.every((id) => typeof id === 'string') &&
    typeof value.registerVerified === 'boolean'
}

function isChapter1Investigation(value: unknown): boolean {
  if (!isRecord(value)) return false
  return (value.activeRouteId === undefined || value.activeRouteId === null || ['sample-route', 'fire-scene', 'client-counterfoil'].includes(String(value.activeRouteId))) &&
    (value.completedActionIds === undefined || (Array.isArray(value.completedActionIds) && value.completedActionIds.every((id) => typeof id === 'string'))) &&
    Array.isArray(value.completedRouteIds) && value.completedRouteIds.every((id) => ['sample-route', 'fire-scene', 'client-counterfoil'].includes(String(id))) &&
    Array.isArray(value.materialIds) && value.materialIds.every((id) => typeof id === 'string') &&
    Array.isArray(value.fixedFactIds) && value.fixedFactIds.every((id) => typeof id === 'string') &&
    Array.isArray(value.openQuestionIds) && value.openQuestionIds.every((id) => typeof id === 'string') &&
    (value.nightChoiceId === null || ['organize-evidence', 'visit-wusheng', 'guard-remains'].includes(String(value.nightChoiceId))) &&
    Array.isArray(value.verificationIds) && value.verificationIds.every((id) => typeof id === 'string') &&
    (value.petitionResultIds === undefined || (Array.isArray(value.petitionResultIds) && value.petitionResultIds.every((id) => typeof id === 'string'))) &&
    (value.confrontationMode === null || ['public-review', 'hold-and-question'].includes(String(value.confrontationMode))) &&
    typeof value.closureSubmitted === 'boolean'
}

function withChapter1InvestigationDefaults(state: GameState): GameState {
  const chapter1Investigation = state.chapter1Investigation ? {
        completedRouteIds: state.chapter1Investigation.completedRouteIds ?? [],
        activeRouteId: state.chapter1Investigation.activeRouteId ?? null,
        completedActionIds: state.chapter1Investigation.completedActionIds ?? [],
        materialIds: state.chapter1Investigation.materialIds ?? [],
        fixedFactIds: state.chapter1Investigation.fixedFactIds ?? [],
        openQuestionIds: state.chapter1Investigation.openQuestionIds ?? ['wusheng-bag', 'fire-target', 'paper-fate'],
        nightChoiceId: state.chapter1Investigation.nightChoiceId ?? null,
        verificationIds: state.chapter1Investigation.verificationIds ?? [],
        petitionResultIds: state.chapter1Investigation.petitionResultIds ?? [],
        confrontationMode: state.chapter1Investigation.confrontationMode ?? null,
        closureSubmitted: state.chapter1Investigation.closureSubmitted ?? false,
      } : {
      completedRouteIds: [],
      activeRouteId: null,
      completedActionIds: [],
      materialIds: [],
      fixedFactIds: [],
      openQuestionIds: ['wusheng-bag', 'fire-target', 'paper-fate'],
      nightChoiceId: null,
      verificationIds: [],
      petitionResultIds: [],
      confrontationMode: null,
      closureSubmitted: false,
    }
  const chapter2Investigation = state.chapter2Investigation ? {
    activeCaseId: state.chapter2Investigation.activeCaseId ?? null,
    completedActionIds: state.chapter2Investigation.completedActionIds ?? [],
    caseMaterialIds: state.chapter2Investigation.caseMaterialIds ?? [],
    completedCaseIds: state.chapter2Investigation.completedCaseIds ?? [],
    branchIds: state.chapter2Investigation.branchIds ?? [],
    materialIds: state.chapter2Investigation.materialIds ?? [],
    fixedFactIds: state.chapter2Investigation.fixedFactIds ?? [],
    registerVerified: state.chapter2Investigation.registerVerified ?? false,
  } : {
    activeCaseId: null,
    completedActionIds: [],
    caseMaterialIds: [],
    completedCaseIds: [],
    branchIds: [],
    materialIds: [],
    fixedFactIds: [],
    registerVerified: false,
  }
  const signedOriginals = Object.values(chapter2InquiryReviews)
    .filter((review) => review.completionId && review.materialId && chapter2Investigation.completedActionIds.includes(review.completionId))
    .map((review) => review.materialId!)
  const investigationMaterials = chapter2Investigation.completedActionIds.flatMap((id) => chapter2ActionMaterials[id] ?? [])
  const comparisonPrerequisites = [
    ...(chapter2Investigation.caseMaterialIds.includes('separate-guard-statements') ? ['zhou-liu-signed-statement', 'zhao-qi-signed-statement'] : []),
    ...(chapter2Investigation.caseMaterialIds.includes('river-route-testimony') ? ['chen-laojiang-signed-testimony', 'ashun-signed-testimony'] : []),
  ]
  const reachedCaseOneVerification = state.chapter === 'chapter2' && [
    'chapter2.case1-close-review',
    'chapter2.case1-authority-review',
    'chapter2.case1-closed',
  ].includes(state.mainlineNode)
  const restoredMaterials = reachedCaseOneVerification
    ? chapter2Case1MaterialIds
    : [...investigationMaterials, ...signedOriginals, ...comparisonPrerequisites]
  chapter2Investigation.caseMaterialIds = [...new Set([...chapter2Investigation.caseMaterialIds, ...restoredMaterials])]
  chapter2Investigation.materialIds = [...new Set([...chapter2Investigation.materialIds, ...restoredMaterials])]
  return { ...state, chapter1Investigation, chapter2Investigation }
}

function isAttributes(value: unknown): boolean {
  if (!isRecord(value)) return false
  return ['strength', 'insight', 'eloquence', 'reputation'].every((key) => isFiniteNumber(value[key]))
}

function isRelations(value: unknown): boolean {
  if (!isRecord(value)) return false
  return npcIds.every((id) => isFiniteNumber(value[id]))
}

function isPendingResult(value: unknown): value is PendingResult | null {
  if (value === null) return true
  if (!isRecord(value)) return false
  return value.kind === 'mainline_choice' && typeof value.nextNode === 'string'
}

function isNarrativeBlock(value: unknown): value is NarrativeBlock {
  if (!isRecord(value) || typeof value.title !== 'string' || !Array.isArray(value.paragraphs)) return false
  return value.paragraphs.every((paragraph) => isRecord(paragraph) && ['prose', 'dialogue', 'monologue', 'system'].includes(String(paragraph.kind)) && typeof paragraph.text === 'string')
}

function isNarrativeEvent(value: unknown): value is NarrativeEvent {
  return isRecord(value) && typeof value.id === 'string' && ['prologue', 'chapter1', 'chapter2', 'chapter3', 'chapter4', 'chapter5'].includes(String(value.chapter)) && typeof value.title === 'string' && typeof value.summary === 'string' && Array.isArray(value.effects) && value.effects.every((effect) => typeof effect === 'string')
}

function isClue(value: unknown): value is Clue {
  return isRecord(value) && typeof value.id === 'string' && typeof value.label === 'string' && ['模糊', '清晰', '确凿'].includes(String(value.clarity)) && typeof value.description === 'string'
}

function isFiniteNumber(value: unknown): value is number { return typeof value === 'number' && Number.isFinite(value) }
function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === 'object' && value !== null && !Array.isArray(value) }
