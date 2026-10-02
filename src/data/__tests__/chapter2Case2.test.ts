import { describe, expect, it } from 'vitest'
import {
  chapter2Case2Images,
  chapter2Case2InvestigationActions,
  chapter2Case2MainlineSteps,
  chapter2Case2MaterialDescriptions,
  chapter2Case2MaterialLabels,
  chapter2Case2MaterialProvenance,
  chapter2Case2InquiryReviews,
  chapter2Case2VerificationSets,
} from '../chapter2Case2'

describe('chapter two case two data contract', () => {
  it('defines three investigation lines with two concrete actions each', () => {
    expect(chapter2Case2InvestigationActions).toHaveLength(6)

    const lineIds = [
      ['c2-02-inspect-backdoor', 'c2-02-inspect-dyehouse'],
      ['c2-02-recover-deed', 'c2-02-check-debt-ledger'],
      ['c2-02-verify-credential', 'c2-02-trace-credential-handover'],
    ]

    for (const line of lineIds) {
      expect(line.every((id) => chapter2Case2InvestigationActions.some((action) => action.id === id))).toBe(true)
      for (const id of line) {
        const action = chapter2Case2InvestigationActions.find((item) => item.id === id)
        expect(action?.outcomeNarrative.paragraphs.length).toBeGreaterThan(0)
      }
    }
  })

  it('gives every second-case material a source, formation method, label and description', () => {
    const ids = Object.keys(chapter2Case2MaterialLabels)
    expect(ids.length).toBeGreaterThanOrEqual(8)
    expect(new Set(ids)).toEqual(new Set(Object.keys(chapter2Case2MaterialDescriptions)))
    expect(new Set(ids)).toEqual(new Set(Object.keys(chapter2Case2MaterialProvenance)))

    for (const id of ids) {
      expect(chapter2Case2MaterialLabels[id]).not.toBe('')
      expect(chapter2Case2MaterialDescriptions[id]).not.toBe('')
      expect(chapter2Case2MaterialProvenance[id].source).not.toBe('')
      expect(chapter2Case2MaterialProvenance[id].formation).not.toBe('')
    }
  })

  it('keeps the opening from granting the inheritance deed and future spoilers', () => {
    const opening = chapter2Case2MainlineSteps['chapter2.empty-dowry-house']
    const text = JSON.stringify(opening)

    expect(text).not.toContain('继承副契')
    expect(text).not.toContain('魏承恩')
    expect(text).not.toContain('景王')
    expect(text).not.toContain('廖家旧案')
    expect(text).not.toContain('烧焦木牌')
  })

  it('keeps the case-two scene bindings aligned with the supplied evidence images', () => {
    expect(chapter2Case2Images.emptyDowryHouse.src).toBe('/assets/chapter2/case2/empty-dowry-house.png')
    expect(chapter2Case2MainlineSteps['chapter2.empty-dowry-house'].narrative.image?.src).toBe('/assets/chapter2/case2/empty-dowry-house.png')
    expect(chapter2Case2Images.backdoorFootprints.src).toBe('/assets/chapter2/case2/backdoor-footprints.png')
    expect(chapter2Case2Images.dyehouseInterior.src).toBe('/assets/chapter2/case2/dyehouse-interior.png')
    expect(chapter2Case2MainlineSteps['chapter2.case2-route-backdoor'].narrative.image?.src).toBe('/assets/chapter2/case2/dyehouse-interior.png')
    expect(chapter2Case2Images.deedUnderBrick.src).toBe('/assets/chapter2/case2/inheritance-deed-under-brick.png')
    expect(chapter2Case2Images.deedClose.src).toBe('/assets/chapter2/case2/inheritance-deed-close.png')
    expect(chapter2Case2Images.credentialReviewDesk.src).toBe('/assets/chapter2/case2/credential-review-desk.png')

    const dyehouseAction = chapter2Case2InvestigationActions.find((action) => action.id === 'c2-02-inspect-dyehouse')
    expect(dyehouseAction?.outcomeNarrative.image?.src).toBe('/assets/chapter2/case2/dyehouse-interior.png')
  })

  it('defines four independent witness reviews and three exact verification propositions', () => {
    const reviewNodes = Object.keys(chapter2Case2InquiryReviews)
    expect(reviewNodes).toEqual(expect.arrayContaining([
      'chapter2.case2-inquiry.luxiaoling.review',
      'chapter2.case2-inquiry.lusheng.review',
      'chapter2.case2-inquiry.spouse.review',
      'chapter2.case2-inquiry.tea-clerk.review',
      'chapter2.case2-inquiry.family.compare',
      'chapter2.case2-inquiry.credential.compare',
    ]))
    expect(new Set(reviewNodes.map((node) => chapter2Case2InquiryReviews[node].materialId).filter(Boolean)).size).toBeGreaterThanOrEqual(4)

    expect(Object.keys(chapter2Case2VerificationSets)).toEqual([
      'voluntary-hiding-pressure',
      'debt-coercion',
      'credential-abuse-handover',
    ])
    expect(Object.values(chapter2Case2VerificationSets).every((set) => set.length === 4)).toBe(true)
  })
})
