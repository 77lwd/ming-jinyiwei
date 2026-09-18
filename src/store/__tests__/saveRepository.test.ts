import { beforeEach, describe, expect, it } from 'vitest'
import { createInitialState } from '../../engine/gameEngine'
import { loadSave, saveGame, SAVE_KEY, SAVE_VERSION } from '../saveRepository'

describe('versioned desktop save repository', () => {
  beforeEach(() => localStorage.clear())

  it('round-trips the chapter state with the new schema version', () => {
    const state = createInitialState()
    state.chapter = 'chapter2'
    state.chapter2Investigation.completedCaseIds = ['rain-night-transfer']
    state.chapter2Investigation.branchIds = ['c2_01_responsibility_chain']
    state.chapter2Investigation.materialIds = ['wet-transfer-stub']
    saveGame(state)
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) throw new Error('Expected save envelope to exist')
    expect(JSON.parse(raw).version).toBe(SAVE_VERSION)
    expect(loadSave()).toMatchObject({
      status: 'ok',
      state: {
        chapter: 'chapter2',
        chapter2Investigation: {
          completedCaseIds: ['rain-night-transfer'],
          branchIds: ['c2_01_responsibility_chain'],
          materialIds: ['wet-transfer-stub'],
        },
      },
    })
  })

  it('restores a current save made before chapter-one investigation state existed', () => {
    const state = createInitialState()
    const { chapter1Investigation: _chapter1Investigation, chapter2Investigation: _chapter2Investigation, ...olderState } = state
    localStorage.setItem(SAVE_KEY, JSON.stringify({ version: SAVE_VERSION, savedAt: new Date().toISOString(), state: olderState }))

    const loaded = loadSave()
    expect(loaded.status).toBe('ok')
    if (loaded.status !== 'ok') return
    expect(loaded.state.chapter1Investigation.completedRouteIds).toEqual([])
    expect(loaded.state.chapter1Investigation.openQuestionIds).toEqual(['wusheng-bag', 'fire-target', 'paper-fate'])
    expect(loaded.state.chapter1Investigation.petitionResultIds).toEqual([])
    expect(loaded.state.chapter2Investigation).toEqual({
      activeCaseId: null,
      completedActionIds: [],
      caseMaterialIds: [],
      completedCaseIds: [],
      branchIds: [],
      materialIds: [],
      fixedFactIds: [],
      registerVerified: false,
    })
  })

  it('rejects a malformed new save without overwriting the raw value', () => {
    localStorage.setItem(SAVE_KEY, '{bad')
    expect(loadSave()).toEqual({ status: 'invalid' })
    expect(localStorage.getItem(SAVE_KEY)).toBe('{bad')
  })

  it('restores signed originals from existing testimony completion records only', () => {
    const state = createInitialState()
    state.chapter2Investigation.completedActionIds = ['c2-01-guard-a-statement']
    saveGame(state)
    const loaded = loadSave()
    expect(loaded.status).toBe('ok')
    if (loaded.status !== 'ok') return
    expect(loaded.state.chapter2Investigation.caseMaterialIds).toEqual(['zhou-liu-signed-statement'])
    expect(loaded.state.chapter2Investigation.materialIds).toEqual(['zhou-liu-signed-statement'])
    expect(loaded.state.chapter2Investigation.caseMaterialIds).not.toContain('zhao-qi-signed-statement')
  })

  it('restores every earned case-one material in an older verification save', () => {
    const state = createInitialState()
    state.chapter = 'chapter2'
    state.mainlineNode = 'chapter2.case1-close-review'
    state.chapter2Investigation.completedActionIds = [
      'c2-01-inspect-lock',
      'c2-01-inspect-shaft',
      'c2-01-trace-drag-marks',
      'c2-01-examine-rope-fibers',
      'c2-01-preserve-wet-stub',
      'c2-01-compare-escort-order',
    ]
    state.chapter2Investigation.caseMaterialIds = [
      'wet-transfer-stub',
      'zhao-qi-signed-statement',
      'chen-laojiang-signed-testimony',
      'ashun-signed-testimony',
      'separate-guard-statements',
      'river-route-testimony',
    ]
    state.chapter2Investigation.materialIds = [...state.chapter2Investigation.caseMaterialIds]
    saveGame(state)

    const loaded = loadSave()
    expect(loaded.status).toBe('ok')
    if (loaded.status !== 'ok') return
    expect(loaded.state.chapter2Investigation.caseMaterialIds).toEqual(expect.arrayContaining([
      'unforced-lock', 'shaft-break-record', 'cart-drag-trace', 'cut-rope-fibers', 'wet-transfer-stub', 'original-escort-order',
      'zhou-liu-signed-statement', 'zhao-qi-signed-statement', 'separate-guard-statements',
      'chen-laojiang-signed-testimony', 'ashun-signed-testimony', 'river-route-testimony',
    ]))
    expect(loaded.state.chapter2Investigation.caseMaterialIds).toHaveLength(12)
  })
})
