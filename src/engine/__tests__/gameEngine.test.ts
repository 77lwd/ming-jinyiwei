import { describe, expect, it } from 'vitest'
import { advanceMainline, chooseMainline, confirmResult, createInitialState, getMainlineChoices, startMainline, submitChapter1Petition, submitChapter1Verification } from '../gameEngine'
import type { GameState } from '../../types'

function completeRoute(state: GameState, routeChoice: string, actionIds: string[]): GameState {
  let current = (chooseMainline(state, routeChoice) as { ok: true; state: GameState }).state
  current = (confirmResult(current) as { ok: true; state: GameState }).state
  for (const actionId of actionIds) {
    current = (chooseMainline(current, actionId) as { ok: true; state: GameState }).state
    current = (confirmResult(current) as { ok: true; state: GameState }).state
  }
  return current
}

function confirmMainlineChoice(state: GameState, choiceId: string): GameState {
  const chosen = chooseMainline(state, choiceId)
  if (!chosen.ok) throw new Error(`mainline choice failed: ${choiceId}`)
  const confirmed = confirmResult(chosen.state)
  if (!confirmed.ok) throw new Error(`mainline result failed: ${choiceId}`)
  return confirmed.state
}

function confirmVerification(state: GameState, questionId: 'wusheng-bag' | 'fire-target' | 'paper-fate', materialIds: string[]): GameState {
  const verified = submitChapter1Verification(state, questionId, materialIds)
  if (!verified.ok) throw new Error(`verification failed: ${questionId}`)
  const confirmed = confirmResult(verified.state)
  if (!confirmed.ok) throw new Error(`verification result failed: ${questionId}`)
  return confirmed.state
}

function confirmPetition(state: GameState, petitionId: 'request-supplement' | 'preserve-evidence' | 'detain-he-xing'): GameState {
  const petition = submitChapter1Petition(state, petitionId)
  if (!petition.ok) throw new Error(`petition failed: ${petitionId}`)
  const confirmed = confirmResult(petition.state)
  if (!confirmed.ok) throw new Error(`petition result failed: ${petitionId}`)
  return confirmed.state
}

function completeFirstChapter(): GameState {
  let state = startMainline(createInitialState())
  state = (advanceMainline(state) as { ok: true; state: GameState }).state
  state = completeRoute(state, 'trace-sample-route', ['sample-question-porter'])
  state = completeRoute(state, 'inspect-fire-scene', ['fire-check-remains'])
  state = (advanceMainline(state) as { ok: true; state: GameState }).state
  state = confirmMainlineChoice(state, 'organize-evidence')
  state = confirmVerification(state, 'fire-target', ['fire-origin', 'dragged-pages'])
  state = confirmPetition(state, 'request-supplement')
  state = confirmMainlineChoice(state, 'supplement-client-counterfoil')
  state = confirmMainlineChoice(state, 'client-reconcile-quantity')
  state = confirmVerification(state, 'paper-fate', ['client-counterfoil', 'quantity-gap'])
  state = confirmPetition(state, 'detain-he-xing')
  state = confirmMainlineChoice(state, 'submit-complete-case')
  state = confirmMainlineChoice(state, 'public-review')
  state = (advanceMainline(state) as { ok: true; state: GameState }).state
  state = (advanceMainline(state) as { ok: true; state: GameState }).state
  return state
}

describe('desktop-first game engine', () => {
  it('keeps placeholder chapters on the mainline without retired free-action state', () => {
    const chapterTwo: GameState = {
      ...createInitialState(),
      screen: 'game',
      chapter: 'chapter2',
      phase: 'mainline',
      mainlineNode: 'chapter2.case1',
    }

    const advanced = advanceMainline(chapterTwo)

    expect(advanced).toMatchObject({ ok: true, state: { phase: 'mainline', mainlineNode: 'chapter2.case2' } })
    if (advanced.ok) expect('freeActionWindowIndex' in advanced.state).toBe(false)
  })

  it('starts with chapter state and no month or risk loop', () => {
    const state = createInitialState()
    expect(state.chapter).toBe('prologue')
    expect('month' in state).toBe(false)
    expect('riskLevel' in state).toBe(false)
    expect('freeActionWindowIndex' in state).toBe(false)
    expect('completedFreeActionWindows' in state).toBe(false)
    expect('freeActionChoices' in state).toBe(false)
  })

  it('starts the first chapter on its mainline rather than opening every free window at once', () => {
    const state = startMainline(createInitialState())
    expect(state.phase).toBe('mainline')
    expect(state.chapter).toBe('chapter1')
    expect(state.mainlineNode).toBe('chapter1.entry')
  })

  it('ends the playable slice after the first case instead of entering the retired action menu', () => {
    const state = completeFirstChapter()
    expect(state.chapter).toBe('chapter1')
    expect(state.mainlineNode).toBe('chapter1.feng-reunion')
    expect(state.phase).toBe('complete')
    expect(state.screen).toBe('complete')
    expect(state.flags).toMatchObject({
      prologue_survivor: true,
      first_case_closed: true,
      charred_token_preserved: true,
      tianshun_reconnected: true,
    })
  })

  it('lets the player choose a first-day investigation priority and resumes the first-case mainline', () => {
    const enteredCase = advanceMainline(startMainline(createInitialState()))
    expect(enteredCase.ok).toBe(true)
    if (!enteredCase.ok) return

    expect(getMainlineChoices(enteredCase.state).map((choice) => choice.id)).toEqual([
      'trace-sample-route',
      'inspect-fire-scene',
      'check-client-counterfoil',
    ])

    const chosen = chooseMainline(enteredCase.state, 'trace-sample-route')
    expect(chosen.ok).toBe(true)
    if (!chosen.ok) return
    expect(chosen.state.phase).toBe('result')
    expect(chosen.state.currentNarrative.title).toBe('凭条上的空白')
    expect(chosen.state.recentEvents[0].acquiredMaterialIds).toEqual(['sample-slip'])

    const confirmed = confirmResult(chosen.state)
    expect(confirmed.ok).toBe(true)
    if (!confirmed.ok) return
    expect(confirmed.state.phase).toBe('mainline')
    expect(confirmed.state.mainlineNode).toBe('chapter1.route-investigation')
    expect(confirmed.state.chapter1Investigation.completedRouteIds).toEqual([])
    expect(confirmed.state.chapter1Investigation.materialIds).toEqual(['sample-slip'])
    expect(getMainlineChoices(confirmed.state).map((choice) => choice.id)).toEqual(['sample-question-porter'])

    const second = chooseMainline(confirmed.state, 'sample-question-porter')
    expect(second.ok).toBe(true)
    if (!second.ok) return
    const secondConfirmed = confirmResult(second.state)
    expect(secondConfirmed.ok).toBe(true)
    if (!secondConfirmed.ok) return
    expect(secondConfirmed.state.mainlineNode).toBe('chapter1.paper-shop-fire')
    expect(secondConfirmed.state.chapter1Investigation.completedRouteIds).toEqual(['sample-route'])
    expect(secondConfirmed.state.chapter1Investigation.materialIds).toEqual(['sample-slip', 'neighbor-testimony', 'porter-testimony'])
  })

  it('charges health for each investigation action but not for confirming its result', () => {
    const enteredCase = advanceMainline(startMainline(createInitialState()))
    if (!enteredCase.ok) throw new Error('failed to enter chapter one case')

    const chosen = chooseMainline(enteredCase.state, 'trace-sample-route')
    if (!chosen.ok) throw new Error('failed to choose investigation route')
    expect(chosen.state.health).toBe(97)

    const confirmed = confirmResult(chosen.state)
    if (!confirmed.ok) throw new Error('failed to confirm investigation result')
    expect(confirmed.state.health).toBe(97)

    const second = chooseMainline(confirmed.state, 'sample-question-porter')
    if (!second.ok) throw new Error('failed to complete investigation action')
    expect(second.state.health).toBe(94)
  })

  it('charges five silver and no health for hiring night preservation guards', () => {
    let state = startMainline(createInitialState())
    state = (advanceMainline(state) as { ok: true; state: GameState }).state
    state = completeRoute(state, 'trace-sample-route', ['sample-question-porter'])
    state = completeRoute(state, 'inspect-fire-scene', ['fire-check-remains'])
    state = (advanceMainline(state) as { ok: true; state: GameState }).state

    const guarded = chooseMainline(state, 'guard-remains')
    if (!guarded.ok) throw new Error('failed to choose night preservation')
    expect(guarded.state.health).toBe(state.health)
    expect(guarded.state.wealth).toBe(state.wealth - 5)
  })

  it('applies distinct night consequences and keeps every route able to reach closure', () => {
    let state = startMainline(createInitialState())
    state = (advanceMainline(state) as { ok: true; state: GameState }).state
    state = completeRoute(state, 'trace-sample-route', ['sample-question-porter'])
    state = completeRoute(state, 'inspect-fire-scene', ['fire-check-remains'])
    state = (advanceMainline(state) as { ok: true; state: GameState }).state
    expect(state.mainlineNode).toBe('chapter1.night-preservation')

    const organized = chooseMainline(state, 'organize-evidence')
    expect(organized.ok).toBe(true)
    if (!organized.ok) return
    expect(organized.state.wealth).toBe(30)
    expect(organized.state.chapter1Investigation.materialIds).toContain('record-order')

    const visited = chooseMainline(state, 'visit-wusheng')
    expect(visited.ok).toBe(true)
    if (!visited.ok) return
    expect(visited.state.wealth).toBe(30)
    expect(visited.state.chapter1Investigation.materialIds).toContain('wusheng-testimony')

    const guarded = chooseMainline(state, 'guard-remains')
    expect(guarded.ok).toBe(true)
    if (!guarded.ok) return
    expect(guarded.state.wealth).toBe(25)
    expect(guarded.state.chapter1Investigation.nightChoiceId).toBe('guard-remains')
    expect(guarded.state.chapter1Investigation.materialIds).toContain('package-remains')
  })

  it('requires evidence verification, judgment, and disposition before closing the first case', () => {
    let state = startMainline(createInitialState())
    state = (advanceMainline(state) as { ok: true; state: GameState }).state
    state = completeRoute(state, 'trace-sample-route', ['sample-question-porter'])
    state = completeRoute(state, 'inspect-fire-scene', ['fire-check-remains'])
    state = (advanceMainline(state) as { ok: true; state: GameState }).state
    const night = chooseMainline(state, 'visit-wusheng')
    if (!night.ok) throw new Error('night choice failed')
    state = (confirmResult(night.state) as { ok: true; state: GameState }).state

    state = confirmVerification(state, 'fire-target', ['fire-origin', 'dragged-pages'])
    expect(state.mainlineNode).toBe('chapter1.authorization-review')
    state = confirmPetition(state, 'request-supplement')
    state = confirmMainlineChoice(state, 'supplement-client-counterfoil')
    state = confirmMainlineChoice(state, 'client-reconcile-quantity')
    state = confirmVerification(state, 'paper-fate', ['client-counterfoil', 'quantity-gap'])
    state = confirmPetition(state, 'detain-he-xing')
    expect(state.mainlineNode).toBe('chapter1.closure-judgment')

    const judgment = chooseMainline(state, 'submit-complete-case')
    if (!judgment.ok) throw new Error('judgment failed')
    state = (confirmResult(judgment.state) as { ok: true; state: GameState }).state
    expect(state.mainlineNode).toBe('chapter1.case-closed')
    expect(state.flags.first_case_closed).not.toBe(true)

    const disposition = chooseMainline(state, 'public-review')
    if (!disposition.ok) throw new Error('disposition failed')
    expect(disposition.state.flags.first_case_closed).toBe(true)
    expect(disposition.state.chapter1Investigation.confrontationMode).toBe('public-review')
  })

  it('fixes a chapter-one fact only when the selected materials directly support the question', () => {
    let state = startMainline(createInitialState())
    state = (advanceMainline(state) as { ok: true; state: GameState }).state
    state = completeRoute(state, 'trace-sample-route', ['sample-question-porter'])
    state = completeRoute(state, 'inspect-fire-scene', ['fire-check-remains'])
    state = (advanceMainline(state) as { ok: true; state: GameState }).state
    const night = chooseMainline(state, 'organize-evidence')
    if (!night.ok) throw new Error('night choice failed')
    state = (confirmResult(night.state) as { ok: true; state: GameState }).state

    const insufficient = submitChapter1Verification(state, 'fire-target', ['sample-slip', 'neighbor-testimony'])
    expect(insufficient.ok).toBe(true)
    if (!insufficient.ok) return
    expect(insufficient.state.chapter1Investigation.fixedFactIds).not.toContain('fire-target')
    expect(insufficient.state.currentNarrative.title).toBe('材料相关，但还不足')
    expect(insufficient.state.pendingResult).toEqual({ kind: 'mainline_choice', nextNode: 'chapter1.day2-verify' })

    const supported = submitChapter1Verification(state, 'fire-target', ['fire-origin', 'dragged-pages'])
    expect(supported.ok).toBe(true)
    if (!supported.ok) return
    expect(supported.state.chapter1Investigation.fixedFactIds).toContain('fire-target')
    expect(supported.state.chapter1Investigation.openQuestionIds).not.toContain('fire-target')
    expect(supported.state.pendingResult).toEqual({ kind: 'mainline_choice', nextNode: 'chapter1.authorization-review' })

    const overselected = submitChapter1Verification(state, 'fire-target', [
      'fire-origin',
      'dragged-pages',
      'sample-slip',
      'neighbor-testimony',
    ])
    expect(overselected.ok).toBe(true)
    if (!overselected.ok) return
    expect(overselected.state.chapter1Investigation.fixedFactIds).not.toContain('fire-target')
    expect(overselected.state.currentNarrative.title).toBe('材料相关，但还不足')
    expect(overselected.state.pendingResult).toEqual({ kind: 'mainline_choice', nextNode: 'chapter1.day2-verify' })
  })

  it('makes Qian Baokun return an overreaching detention request until two core facts are fixed', () => {
    const state = startMainline(createInitialState())
    state.mainlineNode = 'chapter1.authorization-review'
    state.chapter1Investigation.materialIds = ['fire-origin', 'dragged-pages', 'client-counterfoil', 'quantity-gap']
    state.chapter1Investigation.fixedFactIds = ['fire-target']
    state.chapter1Investigation.verificationIds = ['fire-target']

    const returned = submitChapter1Petition(state, 'detain-he-xing')
    expect(returned.ok).toBe(true)
    if (!returned.ok) return
    expect(returned.state.currentNarrative.title).toBe('请示被退回补证')
    expect(returned.state.chapter1Investigation.petitionResultIds).toContain('detain-he-xing:returned:1')
    expect(returned.state.pendingResult).toEqual({ kind: 'mainline_choice', nextNode: 'chapter1.day2-verify' })

    state.chapter1Investigation.fixedFactIds.push('paper-fate')
    state.chapter1Investigation.verificationIds.push('paper-fate')
    const approved = submitChapter1Petition(state, 'detain-he-xing')
    expect(approved.ok).toBe(true)
    if (!approved.ok) return
    expect(approved.state.currentNarrative.title).toBe('覃保坤准许暂扣')
    expect(approved.state.chapter1Investigation.petitionResultIds).toContain('detain-he-xing:approved')
    expect(approved.state.pendingResult).toEqual({ kind: 'mainline_choice', nextNode: 'chapter1.closure-judgment' })
  })

  it('removes supplemental petitions once both core facts are ready for detention review', () => {
    const state = startMainline(createInitialState())
    state.mainlineNode = 'chapter1.authorization-review'
    state.chapter1Investigation.fixedFactIds = ['fire-target', 'paper-fate']
    state.chapter1Investigation.verificationIds = ['fire-target', 'paper-fate']

    expect(getMainlineChoices(state).map((choice) => choice.id)).toEqual(['detain-he-xing'])
  })

  it('keeps the five-chapter skeleton on a fixed mainline and ends only after chapter five', () => {
    let state: GameState = {
      ...createInitialState(),
      screen: 'game',
      chapter: 'chapter2',
      phase: 'mainline',
      mainlineNode: 'chapter2.case1',
    }
    const observedStages: string[] = []

    while (state.phase !== 'complete') {
      expect(state.phase).toBe('mainline')
      if (state.mainlineNode.includes('review') || state.mainlineNode.includes('sealed') || state.mainlineNode.includes('notice')) {
        observedStages.push(state.mainlineNode)
      }
      const advanced = advanceMainline(state)
      expect(advanced.ok).toBe(true)
      if (!advanced.ok) return
      state = advanced.state
    }
    expect(state.chapter).toBe('chapter5')
    expect(state.screen).toBe('complete')
    expect(observedStages).toEqual([
      'chapter2.paper-note-review',
      'chapter3.case-file-sealed',
      'chapter4.warehouse-resealed',
      'chapter5.clan-materials-notice',
    ])
  })

})
