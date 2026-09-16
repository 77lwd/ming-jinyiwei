import { beforeEach, describe, expect, it } from 'vitest'
import { createInitialState } from '../engine/gameEngine'
import { useGameStore } from './gameStore'
import { SAVE_KEY, saveGame } from './saveRepository'

describe('developer checkpoint store', () => {
  beforeEach(() => {
    localStorage.clear()
    useGameStore.setState({ ...createInitialState(), hasSave: false, saveError: null, developerMode: false })
  })

  it('does not overwrite the regular save while playing from a developer checkpoint', () => {
    saveGame(createInitialState())
    const regularSave = localStorage.getItem(SAVE_KEY)

    useGameStore.getState().startDeveloperCheckpoint('chapter2-case1-investigation')
    useGameStore.getState().chooseMainline('c2-01-inspect-lock')

    expect(useGameStore.getState().developerMode).toBe(true)
    expect(localStorage.getItem(SAVE_KEY)).toBe(regularSave)
  })
})
