export type ChapterId = 'prologue' | 'chapter1' | 'chapter2' | 'chapter3' | 'chapter4' | 'chapter5'

export type Phase = 'prologue' | 'mainline' | 'result' | 'complete'
export type Screen = 'title' | 'game' | 'complete'
export type ClueClarity = '模糊' | '清晰' | '确凿'
export type NpcId = 'zhou_hanchuan' | 'feng_tianshun' | 'tan_baokun' | 'wei_chengen' | 'sun_yutang' | 'li_muchen' | 'fang_zhengyan' | 'du_wenzhao' | 'shen_jingting' | 'prince_jing' | 'liao_chengzhi'
export type Attribute = 'strength' | 'insight' | 'eloquence' | 'reputation'
export type RelationStage = '陌生' | '熟悉' | '信任' | '亲近' | '疏远' | '反感' | '敌对'
export type Chapter1RouteId = 'sample-route' | 'fire-scene' | 'client-counterfoil'
export type Chapter1NightChoiceId = 'organize-evidence' | 'visit-wusheng' | 'guard-remains'
export type Chapter1QuestionId = 'wusheng-bag' | 'fire-target' | 'paper-fate'
export type Chapter1PetitionId = 'request-supplement' | 'preserve-evidence' | 'detain-he-xing'

export interface Attributes {
  strength: number
  insight: number
  eloquence: number
  reputation: number
}

export interface Clue {
  id: string
  label: string
  clarity: ClueClarity
  description: string
}

export interface Chapter1InvestigationState {
  completedRouteIds: Chapter1RouteId[]
  activeRouteId: Chapter1RouteId | null
  completedActionIds: string[]
  materialIds: string[]
  fixedFactIds: string[]
  openQuestionIds: string[]
  nightChoiceId: Chapter1NightChoiceId | null
  verificationIds: string[]
  petitionResultIds: string[]
  confrontationMode: 'public-review' | 'hold-and-question' | null
  closureSubmitted: boolean
}

export type NarrativeParagraphKind = 'prose' | 'dialogue' | 'monologue' | 'system'

export interface NarrativeParagraph {
  kind: NarrativeParagraphKind
  text: string
}

export interface NarrativeBlock {
  title: string
  paragraphs: NarrativeParagraph[]
  tone?: 'warm' | 'tense' | 'hopeful' | 'quiet' | 'somber'
  image?: { src: string; alt: string }
}

export interface NarrativeEvent {
  id: string
  chapter: ChapterId
  title: string
  summary: string
  effects: string[]
  acquiredMaterialIds?: string[]
}

export interface PrologueScene {
  id: string
  title: string
  image?: { src: string; alt: string }
  paragraphs: NarrativeParagraph[]
  tone?: NarrativeBlock['tone']
}

export type Effect =
  | { type: 'attribute_change'; attribute: Attribute; delta: number }
  | { type: 'health_change'; delta: number }
  | { type: 'wealth_change'; delta: number }
  | { type: 'relation_change'; npcId: NpcId; delta: number }
  | { type: 'set_flag'; flag: string; value: boolean }
  | { type: 'add_clue'; clue: Clue }
  | { type: 'upgrade_clue'; clueId: string; clarity: ClueClarity }

export interface MainlineChoice {
  id: string
  label: string
  outcomeNarrative: NarrativeBlock
  nextNode: string
  effects?: Effect[]
}

export interface PendingResult {
  kind: 'mainline_choice'
  nextNode: string
}

export interface GameState {
  chapter: ChapterId
  mainlineNode: string
  phase: Phase
  screen: Screen
  prologueScene: number
  attributes: Attributes
  wealth: number
  health: number
  clues: Clue[]
  npcRelations: Record<NpcId, number>
  flags: Record<string, boolean>
  pendingResult: PendingResult | null
  currentNarrative: NarrativeBlock
  recentEvents: NarrativeEvent[]
  chapter1Investigation: Chapter1InvestigationState
  lastCommandError: CommandError | null
}

export type CommandError = 'invalid_phase' | 'not_found' | 'invalid_choice'

export type CommandResult =
  | { ok: true; state: GameState }
  | { ok: false; reason: CommandError }
