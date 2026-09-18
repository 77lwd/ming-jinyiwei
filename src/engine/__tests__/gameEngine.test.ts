import { describe, expect, it } from 'vitest'
import { advanceMainline, chooseMainline, confirmResult, createDeveloperCheckpointState, createInitialState, enterChapterTwo, getMainlineChoices, startMainline, submitChapter1Petition, submitChapter1Verification, submitChapter2Case1Verification, submitChapter2InquiryReview, submitChapter2RegisterVerification } from '../gameEngine'
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
  if (chosen.state.phase === 'mainline') return chosen.state
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

function confirmInquiryReview(state: GameState, selections: string[]): GameState {
  const reviewed = submitChapter2InquiryReview(state, selections)
  if (!reviewed.ok) throw new Error('inquiry review failed')
  return reviewed.state
}

function completeChapter2CaseOne(state: GameState): GameState {
  for (const choiceId of ['c2-01-inspect-lock', 'c2-01-inspect-shaft', 'c2-01-trace-drag-marks', 'c2-01-examine-rope-fibers', 'c2-01-preserve-wet-stub', 'c2-01-compare-escort-order', 'c2-01-finish-investigation']) state = confirmMainlineChoice(state, choiceId)
  for (const choiceId of ['c2-01-begin-guard-inquiry', 'c2-01-guard-a-key', 'c2-01-guard-a-shaft', 'c2-01-guard-a-finish']) state = confirmMainlineChoice(state, choiceId)
  state = confirmInquiryReview(state, ['zhou-stop:fact', 'zhou-guess:pending', 'zhou-gap:conflict'])
  for (const choiceId of ['c2-01-continue-guard-b', 'c2-01-guard-b-route', 'c2-01-guard-b-order', 'c2-01-guard-b-confront']) state = confirmMainlineChoice(state, choiceId)
  state = confirmInquiryReview(state, ['zhao-open:fact', 'zhao-claim:pending', 'zhao-denial:conflict'])
  state = confirmInquiryReview(state, ['guard-stop:confirmed', 'guard-order:conflict', 'guard-lock:evidence'])
  for (const choiceId of ['c2-01-begin-river-inquiry', 'c2-01-river-boat-time', 'c2-01-river-boat-finish']) state = confirmMainlineChoice(state, choiceId)
  state = confirmInquiryReview(state, ['boat-route:fact', 'boat-name:pending', 'boat-count:conflict'])
  for (const choiceId of ['c2-01-continue-river-tea', 'c2-01-river-tea-cart', 'c2-01-river-tea-finish']) state = confirmMainlineChoice(state, choiceId)
  state = confirmInquiryReview(state, ['tea-sequence:fact', 'tea-name:pending', 'tea-denial:conflict'])
  state = confirmInquiryReview(state, ['river-route:confirmed', 'river-identity:conflict', 'river-trace:evidence'])
  state = confirmMainlineChoice(state, 'c2-01-open-verification')
  const first = submitChapter2Case1Verification(state, 'self-escape', ['unforced-lock', 'shaft-break-record', 'cart-drag-trace', 'zhao-qi-signed-statement']) as { ok: true; state: GameState }
  state = (confirmResult(first.state) as { ok: true; state: GameState }).state
  const second = submitChapter2Case1Verification(state, 'guard-duty', ['original-escort-order', 'wet-transfer-stub', 'zhou-liu-signed-statement', 'zhao-qi-signed-statement']) as { ok: true; state: GameState }
  state = (confirmResult(second.state) as { ok: true; state: GameState }).state
  return confirmMainlineChoice(state, 'preserve-guard-responsibility')
}

describe('desktop-first game engine', () => {
  it('creates chapter two developer checkpoints with the first chapter carry-over intact', () => {
    const state = createDeveloperCheckpointState('chapter2-case1-investigation')

    expect(state).toMatchObject({
      screen: 'game',
      phase: 'mainline',
      chapter: 'chapter2',
      mainlineNode: 'chapter2.rain-night-transfer',
      wealth: 35,
      flags: {
        prologue_survivor: true,
        first_case_closed: true,
        charred_token_preserved: true,
        tianshun_reconnected: true,
      },
    })
    expect(state.npcRelations.feng_tianshun).toBeGreaterThan(0)
  })

  it('prepares only the prerequisites needed by later case one developer checkpoints', () => {
    const inquiry = createDeveloperCheckpointState('chapter2-case1-inquiry')
    expect(inquiry.mainlineNode).toBe('chapter2.case1-inquiry-select')
    expect(inquiry.chapter2Investigation.caseMaterialIds).toEqual(expect.arrayContaining([
      'unforced-lock', 'shaft-break-record', 'cart-drag-trace', 'cut-rope-fibers', 'wet-transfer-stub', 'original-escort-order',
    ]))
    expect(inquiry.chapter2Investigation.caseMaterialIds).not.toContain('separate-guard-statements')

    const verification = createDeveloperCheckpointState('chapter2-case1-verification')
    expect(verification.mainlineNode).toBe('chapter2.case1-close-review')
    expect(verification.chapter2Investigation.caseMaterialIds).toHaveLength(12)
    expect(verification.chapter2Investigation.fixedFactIds).toEqual([])
  })

  it('opens the selected case-one inquiry directly without a verification receipt', () => {
    const state = createDeveloperCheckpointState('chapter2-case1-inquiry')

    const opened = chooseMainline(state, 'c2-01-begin-guard-inquiry')

    expect(opened).toMatchObject({
      ok: true,
      state: {
        phase: 'mainline',
        mainlineNode: 'chapter2.case1-inquiry.guard-a.1',
        pendingResult: null,
      },
    })
  })
  it('separates case-one investigation into routes and keeps inquiry locked until all routes finish', () => {
    let state: GameState = { ...createInitialState(), screen: 'game', phase: 'mainline', chapter: 'chapter2', mainlineNode: 'chapter2.rain-night-transfer' }
    expect(getMainlineChoices(state).map((choice) => choice.id)).toEqual(['c2-01-inspect-lock', 'c2-01-trace-drag-marks', 'c2-01-preserve-wet-stub'])
    state = confirmMainlineChoice(state, 'c2-01-inspect-lock')
    expect(state.mainlineNode).toBe('chapter2.case1-route-cart')
    expect(getMainlineChoices(state).map((choice) => choice.id)).toEqual(['c2-01-inspect-shaft'])
    state = confirmMainlineChoice(state, 'c2-01-inspect-shaft')
    expect(getMainlineChoices(state).map((choice) => choice.id)).toEqual(['c2-01-trace-drag-marks', 'c2-01-preserve-wet-stub'])
    state = confirmMainlineChoice(state, 'c2-01-trace-drag-marks')
    state = confirmMainlineChoice(state, 'c2-01-examine-rope-fibers')
    state = confirmMainlineChoice(state, 'c2-01-preserve-wet-stub')
    state = confirmMainlineChoice(state, 'c2-01-compare-escort-order')
    expect(state.chapter2Investigation.caseMaterialIds).toEqual(expect.arrayContaining([
      'unforced-lock', 'shaft-break-record', 'cart-drag-trace', 'cut-rope-fibers', 'wet-transfer-stub', 'original-escort-order',
    ]))
    expect(getMainlineChoices(state).map((choice) => choice.id)).toEqual(['c2-01-finish-investigation'])
    state = confirmMainlineChoice(state, 'c2-01-finish-investigation')
    expect(state.mainlineNode).toBe('chapter2.case1-inquiry-select')
    expect(getMainlineChoices(state).map((choice) => choice.id)).toEqual(['c2-01-begin-guard-inquiry', 'c2-01-begin-river-inquiry'])
  })

  it('requires testimony sorting and pair comparison before creating the guard material', () => {
    let state: GameState = {
      ...createInitialState(), screen: 'game', phase: 'mainline', chapter: 'chapter2', mainlineNode: 'chapter2.case1-inquiry.guard-a.1',
      chapter2Investigation: { ...createInitialState().chapter2Investigation, caseMaterialIds: ['unforced-lock', 'original-escort-order'], materialIds: ['unforced-lock', 'original-escort-order'] },
    }
    for (const choiceId of ['c2-01-guard-a-key', 'c2-01-guard-a-shaft']) {
      state = confirmMainlineChoice(state, choiceId)
    }
    expect(state.chapter2Investigation.caseMaterialIds).not.toContain('separate-guard-statements')
    state = confirmMainlineChoice(state, 'c2-01-guard-a-finish')
    expect(state.mainlineNode).toBe('chapter2.case1-inquiry.guard-a.review')
    expect(state.chapter2Investigation.completedActionIds).not.toContain('c2-01-guard-a-statement')
    let reviewed = submitChapter2InquiryReview(state, ['zhou-stop:fact', 'zhou-guess:fact', 'zhou-gap:conflict'])
    expect(reviewed.ok).toBe(true)
    if (!reviewed.ok) return
    expect(reviewed.state.mainlineNode).toBe('chapter2.case1-inquiry.guard-a.review')
    reviewed = submitChapter2InquiryReview(state, ['zhou-stop:fact', 'zhou-guess:pending', 'zhou-gap:conflict'])
    expect(reviewed.ok).toBe(true)
    if (!reviewed.ok) return
    state = reviewed.state
    expect(state.chapter2Investigation.completedActionIds).toContain('c2-01-guard-a-statement')
    expect(state.chapter2Investigation.caseMaterialIds).toContain('zhou-liu-signed-statement')
    expect(state.chapter2Investigation.caseMaterialIds).not.toContain('separate-guard-statements')
    state = confirmMainlineChoice(state, 'c2-01-continue-guard-b')
    for (const choiceId of ['c2-01-guard-b-route', 'c2-01-guard-b-order', 'c2-01-guard-b-confront']) state = confirmMainlineChoice(state, choiceId)
    expect(state.mainlineNode).toBe('chapter2.case1-inquiry.guard-b.review')
    reviewed = submitChapter2InquiryReview(state, ['zhao-open:fact', 'zhao-claim:pending', 'zhao-denial:conflict'])
    expect(reviewed.ok).toBe(true)
    if (!reviewed.ok) return
    state = reviewed.state
    expect(state.chapter2Investigation.completedActionIds).toContain('c2-01-guard-b-statement')
    expect(state.chapter2Investigation.caseMaterialIds).toContain('zhao-qi-signed-statement')
    expect(state.mainlineNode).toBe('chapter2.case1-inquiry.guard.compare')
    expect(state.chapter2Investigation.caseMaterialIds).not.toContain('separate-guard-statements')
    reviewed = submitChapter2InquiryReview(state, ['guard-stop:confirmed', 'guard-order:conflict', 'guard-lock:evidence'])
    expect(reviewed.ok).toBe(true)
    if (!reviewed.ok) return
    state = reviewed.state
    expect(state.chapter2Investigation.caseMaterialIds).toContain('separate-guard-statements')
  })

  it('keeps the boatman and tea-stall statements separate until both witnesses finish', () => {
    let state: GameState = {
      ...createInitialState(), screen: 'game', phase: 'mainline', chapter: 'chapter2', mainlineNode: 'chapter2.case1-inquiry.river-boat.1',
      chapter2Investigation: { ...createInitialState().chapter2Investigation, caseMaterialIds: ['cart-drag-trace'], materialIds: ['cart-drag-trace'] },
    }
    state = confirmMainlineChoice(state, 'c2-01-river-boat-time')
    expect(state.chapter2Investigation.caseMaterialIds).not.toContain('river-route-testimony')
    state = confirmMainlineChoice(state, 'c2-01-river-boat-finish')
    state = confirmInquiryReview(state, ['boat-route:fact', 'boat-name:pending', 'boat-count:conflict'])
    expect(state.chapter2Investigation.completedActionIds).toContain('c2-01-river-boat-statement')
    expect(state.chapter2Investigation.caseMaterialIds).toContain('chen-laojiang-signed-testimony')
    expect(state.chapter2Investigation.caseMaterialIds).not.toContain('river-route-testimony')
    state = confirmMainlineChoice(state, 'c2-01-continue-river-tea')
    state = confirmMainlineChoice(state, 'c2-01-river-tea-cart')
    state = confirmMainlineChoice(state, 'c2-01-river-tea-finish')
    state = confirmInquiryReview(state, ['tea-sequence:fact', 'tea-name:pending', 'tea-denial:conflict'])
    expect(state.chapter2Investigation.completedActionIds).toContain('c2-01-river-tea-statement')
    expect(state.chapter2Investigation.caseMaterialIds).toContain('ashun-signed-testimony')
    expect(state.chapter2Investigation.caseMaterialIds).not.toContain('river-route-testimony')
    state = confirmInquiryReview(state, ['river-route:confirmed', 'river-identity:conflict', 'river-trace:evidence'])
    expect(state.chapter2Investigation.caseMaterialIds).toContain('river-route-testimony')
  })

  it('requires exact evidence sets and two sequential findings before case one closure', () => {
    const allMaterials = [
      'unforced-lock', 'shaft-break-record', 'cart-drag-trace', 'cut-rope-fibers', 'wet-transfer-stub', 'original-escort-order',
      'zhou-liu-signed-statement', 'zhao-qi-signed-statement', 'separate-guard-statements',
      'chen-laojiang-signed-testimony', 'ashun-signed-testimony', 'river-route-testimony',
    ]
    let state: GameState = {
      ...createInitialState(), screen: 'game', phase: 'mainline', chapter: 'chapter2', mainlineNode: 'chapter2.case1-close-review',
      chapter2Investigation: { ...createInitialState().chapter2Investigation, activeCaseId: 'rain-night-transfer', caseMaterialIds: allMaterials, materialIds: allMaterials },
    }
    for (const selected of [
      ['unforced-lock', 'cart-drag-trace', 'wet-transfer-stub'],
      ['unforced-lock', 'shaft-break-record', 'cart-drag-trace', 'cut-rope-fibers'],
      allMaterials,
    ]) {
      const rejected = submitChapter2Case1Verification(state, 'self-escape', selected)
      expect(rejected.ok).toBe(true)
      if (rejected.ok) expect(rejected.state.chapter2Investigation.fixedFactIds).toEqual([])
    }
    const first = submitChapter2Case1Verification(state, 'self-escape', ['unforced-lock', 'shaft-break-record', 'cart-drag-trace', 'zhao-qi-signed-statement'])
    expect(first.ok).toBe(true)
    if (!first.ok) return
    expect(first.state.chapter2Investigation.fixedFactIds).toContain('self-escape')
    expect(first.state.currentNarrative.paragraphs[0].text).toContain('赵七又承认亲手开锁交人')
    expect(first.state.currentNarrative.paragraphs[0].text).toContain('翻车现场经过人为布置')
    expect(first.state.currentNarrative.title).toBe('锁扣上的说法站不住')
    expect(first.state.recentEvents[0].effects).toEqual(['马骁并非自行脱逃', '翻车现场存在人为布置'])
    expect(first.state.recentEvents[0].effects).not.toContain('self-escape')
    expect(first.state.pendingResult?.nextNode).toBe('chapter2.case1-close-review')
    state = (confirmResult(first.state) as { ok: true; state: GameState }).state
    const second = submitChapter2Case1Verification(state, 'guard-duty', ['original-escort-order', 'wet-transfer-stub', 'zhou-liu-signed-statement', 'zhao-qi-signed-statement'])
    expect(second.ok).toBe(true)
    if (!second.ok) return
    expect(second.state.chapter2Investigation.fixedFactIds).toEqual(expect.arrayContaining(['self-escape', 'guard-duty']))
    expect(second.state.currentNarrative.paragraphs[0].text).toContain('两名押役在看守与交接中均有失职')
    expect(second.state.currentNarrative.title).toBe('两名押役各有一笔')
    expect(second.state.recentEvents[0].effects).toEqual(['周六与赵七的失职责任分别入卷'])
    expect(second.state.recentEvents[0].effects).not.toContain('guard-duty')
    expect(second.state.pendingResult?.nextNode).toBe('chapter2.case1-authority-review')

    const authorityReview = (confirmResult(second.state) as { ok: true; state: GameState }).state
    const closure = chooseMainline(authorityReview, 'preserve-guard-responsibility')
    expect(closure.ok).toBe(true)
    if (!closure.ok) return
    expect(closure.state.currentNarrative.paragraphs.map((paragraph) => paragraph.text).join(' ')).toContain('马骁并非自行脱逃')
    expect(closure.state.currentNarrative.paragraphs.map((paragraph) => paragraph.text).join(' ')).toContain('周六与赵七的失职责任分别入卷')
    expect(closure.state.currentNarrative.paragraphs.map((paragraph) => paragraph.text).join(' ')).toContain('马骁去向仍列待查')

    state = { ...state, chapter2Investigation: { ...state.chapter2Investigation, fixedFactIds: [] } }
    const route = submitChapter2Case1Verification(state, 'illegal-transfer', [
      'wet-transfer-stub', 'cart-drag-trace', 'zhao-qi-signed-statement',
      'ashun-signed-testimony', 'original-escort-order',
    ])
    expect(route.ok).toBe(true)
    if (route.ok) expect(route.state.chapter2Investigation.fixedFactIds).toContain('illegal-transfer')
  })

  it('starts chapter two with the first independent case and no retired free-action state', () => {
    const chapterTwo: GameState = {
      ...createInitialState(),
      screen: 'game',
      chapter: 'chapter2',
      phase: 'mainline',
      mainlineNode: 'chapter2.entry',
    }

    const advanced = advanceMainline(chapterTwo)

    expect(advanced).toMatchObject({ ok: true, state: { phase: 'mainline', mainlineNode: 'chapter2.rain-night-transfer' } })
    if (advanced.ok) expect('freeActionWindowIndex' in advanced.state).toBe(false)
  })

  it('records exactly one evidence emphasis for each chapter-two case', () => {
    let state: GameState = {
      ...createInitialState(),
      screen: 'game',
      chapter: 'chapter2',
      phase: 'mainline',
      mainlineNode: 'chapter2.rain-night-transfer',
    }

    state = completeChapter2CaseOne(state)
    expect(state.flags).toMatchObject({ slip_chain_1: true, c2_01_responsibility_chain: true })
    expect(state.flags.c2_01_route_chain).not.toBe(true)
    expect(state.chapter2Investigation.materialIds).toEqual(expect.arrayContaining(['unforced-lock', 'separate-guard-statements']))

    state = (advanceMainline(state) as { ok: true; state: GameState }).state
    state = confirmMainlineChoice(state, 'protect-witness-and-deed')
    expect(state.flags).toMatchObject({ slip_chain_2: true, c2_02_witness_deed: true })
    expect(state.flags.c2_02_receipt_chain).not.toBe(true)

    state = (advanceMainline(state) as { ok: true; state: GameState }).state
    state = confirmMainlineChoice(state, 'preserve-altered-record-chain')
    expect(state.flags).toMatchObject({ slip_chain_3: true, c2_03_record_chain: true })
    expect(state.flags.c2_03_death_chain).not.toBe(true)
    expect(state.mainlineNode).toBe('chapter2.case3-closed')
  })

  it('requires the exact three register materials for chapter-two verification', () => {
    const state: GameState = {
      ...createInitialState(),
      screen: 'game',
      chapter: 'chapter2',
      phase: 'mainline',
      mainlineNode: 'chapter2.register-review',
      flags: { slip_chain_1: true, slip_chain_2: true, slip_chain_3: true },
      chapter2Investigation: {
        materialIds: ['wet-transfer-stub', 'inspection-credential', 'night-pass-counterfoil', 'unforced-lock'],
        completedCaseIds: ['rain-night-transfer', 'empty-dowry-house', 'before-the-watch-drum'],
        branchIds: ['c2_01_route_chain', 'c2_02_receipt_chain', 'c2_03_record_chain'],
        fixedFactIds: [],
        registerVerified: false,
      },
    }

    const overselected = submitChapter2RegisterVerification(state, ['wet-transfer-stub', 'inspection-credential', 'night-pass-counterfoil', 'unforced-lock'])
    expect(overselected.ok).toBe(true)
    if (!overselected.ok) return
    expect(overselected.state.chapter2Investigation.registerVerified).toBe(false)
    expect(overselected.state.currentNarrative.title).toBe('材料混入，暂不能封存')

    const verified = submitChapter2RegisterVerification(state, ['wet-transfer-stub', 'inspection-credential', 'night-pass-counterfoil'])
    expect(verified.ok).toBe(true)
    if (!verified.ok) return
    expect(verified.state.chapter2Investigation.registerVerified).toBe(true)
    expect(verified.state.flags).toMatchObject({
      c2_transfer_room_identified: true,
      c2_register_copy_preserved: true,
      c2_register_tampered: true,
    })
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

  it('enters chapter two from the completed first chapter and grants five silver once', () => {
    const completed = completeFirstChapter()
    const wealthBeforeReward = completed.wealth

    const entered = enterChapterTwo(completed)

    expect(entered).toMatchObject({
      ok: true,
      state: {
        chapter: 'chapter2',
        mainlineNode: 'chapter2.entry',
        phase: 'mainline',
        screen: 'game',
        wealth: wealthBeforeReward + 5,
      },
    })
    if (!entered.ok) return
    expect(entered.state.recentEvents[0]).toMatchObject({
      chapter: 'chapter2',
      title: '第一案结案补贴',
      effects: ['银两 +5'],
    })

    expect(enterChapterTwo(entered.state)).toEqual({ ok: false, reason: 'invalid_phase' })
  })

  it('refuses to enter chapter two before the first chapter is complete', () => {
    const state = startMainline(createInitialState())

    expect(enterChapterTwo(state)).toEqual({ ok: false, reason: 'invalid_phase' })
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
      mainlineNode: 'chapter2.rain-night-transfer',
    }
    const observedStages: string[] = []

    while (state.phase !== 'complete') {
      expect(state.phase).toBe('mainline')
      if (state.mainlineNode.includes('review') || state.mainlineNode.includes('sealed') || state.mainlineNode.includes('notice')) {
        observedStages.push(state.mainlineNode)
      }
      if (state.mainlineNode === 'chapter2.rain-night-transfer') { state = completeChapter2CaseOne(state); continue }
      else if (state.mainlineNode === 'chapter2.empty-dowry-house') state = confirmMainlineChoice(state, 'protect-witness-and-deed')
      else if (state.mainlineNode === 'chapter2.before-the-watch-drum') state = confirmMainlineChoice(state, 'preserve-death-timeline')
      else if (state.mainlineNode === 'chapter2.register-review') {
        const verified = submitChapter2RegisterVerification(state, ['wet-transfer-stub', 'inspection-credential', 'night-pass-counterfoil'])
        expect(verified.ok).toBe(true)
        if (!verified.ok) return
        const confirmed = confirmResult(verified.state)
        expect(confirmed.ok).toBe(true)
        if (!confirmed.ok) return
        state = confirmed.state
        continue
      }
      const advanced = advanceMainline(state)
      expect(advanced.ok).toBe(true)
      if (!advanced.ok) return
      state = advanced.state
    }
    expect(state.chapter).toBe('chapter5')
    expect(state.screen).toBe('complete')
    expect(observedStages).toEqual([
      'chapter2.register-review',
      'chapter2.register-sealed',
      'chapter3.case-file-sealed',
      'chapter4.warehouse-resealed',
      'chapter5.clan-materials-notice',
    ])
  })

})
