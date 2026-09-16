import { create } from 'zustand'
import { advanceMainline, chooseMainline, confirmResult, createDeveloperCheckpointState, createInitialState, enterChapterTwo, startGame, startMainline, submitChapter1Verification, submitChapter2Case1Verification, submitChapter2InquiryReview, submitChapter2RegisterVerification } from '../engine/gameEngine'
import type { DeveloperCheckpointId } from '../engine/gameEngine'
import type { Chapter1QuestionId, GameState } from '../types'
import { clearSave, loadSave, saveGame } from './saveRepository'

interface GameCommands {
  hasSave: boolean
  saveError: string | null
  developerMode: boolean
  newGame: () => void
  continueGame: () => void
  restart: () => void
  returnToTitle: () => void
  enterChapterTwo: () => void
  nextPrologue: () => void
  skipPrologue: () => void
  advanceMainline: () => void
  chooseMainline: (choiceId: string) => void
  submitChapter1Verification: (questionId: Chapter1QuestionId, materialIds: string[]) => void
  submitChapter2RegisterVerification: (materialIds: string[]) => void
  submitChapter2Case1Verification: (questionId: string, materialIds: string[]) => void
  submitChapter2InquiryReview: (selections: string[]) => void
  confirmResult: () => void
  startDeveloperCheckpoint: (checkpoint: DeveloperCheckpointId) => void
}

export type GameStore = GameState & GameCommands

function toGameState(state: GameStore): GameState {
  const { hasSave: _hasSave, saveError: _saveError, developerMode: _developerMode, newGame: _newGame, continueGame: _continueGame, restart: _restart, returnToTitle: _returnToTitle, enterChapterTwo: _enterChapterTwo, nextPrologue: _nextPrologue, skipPrologue: _skipPrologue, advanceMainline: _advanceMainline, chooseMainline: _chooseMainline, submitChapter1Verification: _submitChapter1Verification, submitChapter2Case1Verification: _submitChapter2Case1Verification, submitChapter2InquiryReview: _submitChapter2InquiryReview, submitChapter2RegisterVerification: _submitChapter2RegisterVerification, confirmResult: _confirmResult, startDeveloperCheckpoint: _startDeveloperCheckpoint, ...gameState } = state
  return gameState
}

function persistAndSet(set: (state: Partial<GameStore>) => void, state: GameState, developerMode: boolean): void {
  if (!developerMode) saveGame(state)
  set({ ...state, hasSave: developerMode ? loadSave().status === 'ok' : true, saveError: null })
}

const initialSave = loadSave()

export const useGameStore = create<GameStore>((set, get) => ({
  ...createInitialState(),
  hasSave: initialSave.status === 'ok',
  saveError: initialSave.status === 'invalid' ? '存档无法读取，请开始新游戏' : null,
  developerMode: false,

  newGame: () => {
    const state = startGame(createInitialState())
    saveGame(state)
    set({ ...state, hasSave: true, saveError: null, developerMode: false })
  },

  continueGame: () => {
    const saved = loadSave()
    if (saved.status === 'ok') set({ ...saved.state, hasSave: true, saveError: null, developerMode: false })
    else set({ ...createInitialState(), hasSave: false, saveError: saved.status === 'invalid' ? '存档无法读取，请开始新游戏' : null, developerMode: false })
  },

  restart: () => {
    clearSave()
    set({ ...createInitialState(), hasSave: false, saveError: null, developerMode: false })
  },

  returnToTitle: () => set({ screen: 'title' }),

  enterChapterTwo: () => {
    const result = enterChapterTwo(toGameState(get()))
    if (result.ok) persistAndSet(set, result.state, get().developerMode)
    else set({ lastCommandError: result.reason })
  },

  nextPrologue: () => {
    const state = toGameState(get())
    const next = state.prologueScene >= 4 ? startMainline({ ...state, prologueScene: 5 }) : { ...state, prologueScene: state.prologueScene + 1 }
    persistAndSet(set, next, get().developerMode)
  },

  skipPrologue: () => persistAndSet(set, startMainline({ ...toGameState(get()), prologueScene: 5 }), get().developerMode),

  advanceMainline: () => {
    const result = advanceMainline(toGameState(get()))
    if (result.ok) persistAndSet(set, result.state, get().developerMode)
    else set({ lastCommandError: result.reason })
  },

  chooseMainline: (choiceId) => {
    const result = chooseMainline(toGameState(get()), choiceId)
    if (result.ok) persistAndSet(set, result.state, get().developerMode)
    else set({ lastCommandError: result.reason })
  },

  submitChapter1Verification: (questionId, materialIds) => {
    const result = submitChapter1Verification(toGameState(get()), questionId, materialIds)
    if (result.ok) persistAndSet(set, result.state, get().developerMode)
    else set({ lastCommandError: result.reason })
  },

  submitChapter2RegisterVerification: (materialIds) => {
    const result = submitChapter2RegisterVerification(toGameState(get()), materialIds)
    if (result.ok) persistAndSet(set, result.state, get().developerMode)
    else set({ lastCommandError: result.reason })
  },
  submitChapter2Case1Verification: (questionId, materialIds) => {
    const result = submitChapter2Case1Verification(toGameState(get()), questionId, materialIds)
    if (result.ok) persistAndSet(set, result.state, get().developerMode)
    else set({ lastCommandError: result.reason })
  },
  submitChapter2InquiryReview: (selections) => {
    const result = submitChapter2InquiryReview(toGameState(get()), selections)
    if (result.ok) persistAndSet(set, result.state, get().developerMode)
    else set({ lastCommandError: result.reason })
  },

  confirmResult: () => {
    const result = confirmResult(toGameState(get()))
    if (result.ok) persistAndSet(set, result.state, get().developerMode)
    else set({ lastCommandError: result.reason })
  },
  startDeveloperCheckpoint: (checkpoint) => set({ ...createDeveloperCheckpointState(checkpoint), developerMode: true, saveError: null }),
}))
