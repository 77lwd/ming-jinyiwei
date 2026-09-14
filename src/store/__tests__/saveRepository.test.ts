import { beforeEach, describe, expect, it } from 'vitest'
import { createInitialState } from '../../engine/gameEngine'
import { loadSave, saveGame, SAVE_KEY, SAVE_VERSION } from '../saveRepository'

describe('versioned desktop save repository', () => {
  beforeEach(() => localStorage.clear())

  it('round-trips the chapter state with the new schema version', () => {
    const state = createInitialState()
    state.chapter = 'chapter1'
    saveGame(state)
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) throw new Error('Expected save envelope to exist')
    expect(JSON.parse(raw).version).toBe(SAVE_VERSION)
    expect(loadSave()).toMatchObject({ status: 'ok', state: { chapter: 'chapter1' } })
  })

  it('restores a current save made before chapter-one investigation state existed', () => {
    const state = createInitialState()
    const { chapter1Investigation: _chapter1Investigation, ...olderState } = state
    localStorage.setItem(SAVE_KEY, JSON.stringify({ version: SAVE_VERSION, savedAt: new Date().toISOString(), state: olderState }))

    const loaded = loadSave()
    expect(loaded.status).toBe('ok')
    if (loaded.status !== 'ok') return
    expect(loaded.state.chapter1Investigation.completedRouteIds).toEqual([])
    expect(loaded.state.chapter1Investigation.openQuestionIds).toEqual(['wusheng-bag', 'fire-target', 'paper-fate'])
    expect(loaded.state.chapter1Investigation.petitionResultIds).toEqual([])
  })

  it('rejects a malformed new save without overwriting the raw value', () => {
    localStorage.setItem(SAVE_KEY, '{bad')
    expect(loadSave()).toEqual({ status: 'invalid' })
    expect(localStorage.getItem(SAVE_KEY)).toBe('{bad')
  })
})
