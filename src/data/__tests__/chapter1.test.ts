import { describe, expect, it } from 'vitest'
import { chapter1MainlineSteps, chapter1InvestigationBlueprint, createChapter1InvestigationState } from '../chapter1'
import { prologueScenes } from '../prologue'

const forbiddenEarlyNames = [
  '李慕尘',
  '景王',
  '魏承恩',
  '孙玉堂',
  '沈敬亭',
  '方正言',
  '杜文昭',
  '郑九',
  '柳如烟',
]

describe('序章与第一章内容数据', () => {
  it('defines a local investigation blueprint with three routes and three open questions', () => {
    expect(chapter1InvestigationBlueprint.openQuestions).toHaveLength(3)
    expect(chapter1InvestigationBlueprint.routes.map((route) => route.id)).toEqual([
      'sample-route',
      'fire-scene',
      'client-counterfoil',
    ])
    expect(chapter1InvestigationBlueprint.routes.every((route) => route.materialIds.length > 0)).toBe(true)
  })

  it('creates an empty chapter-one investigation state without revealing evidence', () => {
    const state = createChapter1InvestigationState()
    expect(state.completedRouteIds).toEqual([])
    expect(state.materialIds).toEqual([])
    expect(state.fixedFactIds).toEqual([])
    expect(state.openQuestionIds).toEqual(chapter1InvestigationBlueprint.openQuestions.map((question) => question.id))
    expect(state.petitionResultIds).toEqual([])
  })

  it('keeps five ordered prologue scenes with usable existing artwork metadata', () => {
    expect(prologueScenes).toHaveLength(5)
    expect(prologueScenes.map((scene) => scene.id)).toEqual([
      'warm-home',
      'night-attack',
      'mothers-last-stand',
      'swordsman',
      'fifteen-years',
    ])

    for (const scene of prologueScenes) {
      expect(scene.image?.src).toMatch(/^\/assets\/prologue\//)
      expect(scene.image?.alt.trim()).not.toBe('')
    }
  })

  it('does not reveal later characters, the rescuer identity, command source, or old-case truth', () => {
    const visibleText = [
      ...prologueScenes.flatMap((scene) => scene.paragraphs.map((paragraph) => paragraph.text)),
      ...Object.values(chapter1MainlineSteps).flatMap((step) => step.narrative.paragraphs.map((paragraph) => paragraph.text)),
    ].join('\n')

    for (const name of forbiddenEarlyNames) {
      expect(visibleText).not.toContain(name)
    }
    expect(visibleText).not.toContain('奉命')
    expect(visibleText).not.toContain('廖宅旧案')
  })

  it('preserves the charred-token and reunion artwork slots with alternative text', () => {
    expect(chapter1MainlineSteps['chapter1.charred-token'].image).toEqual({
      src: '/assets/chapter1/charred-token-detail-v2.png',
      alt: '一块边缘残留红漆、表面被火烧焦的木牌',
    })
    expect(chapter1MainlineSteps['chapter1.feng-reunion'].image).toEqual({
      src: '/assets/events/feng-reunion-event-v2.png',
      alt: '廖威达与成年冯天顺在案后重逢',
    })
  })

  it('records Feng Tianshun as a familiar contact when the reunion is reached', () => {
    expect(chapter1MainlineSteps['chapter1.feng-reunion'].effects).toContainEqual({
      type: 'relation_change',
      npcId: 'feng_tianshun',
      delta: 1,
    })
  })

  it('maps the approved chapter-one artwork to the investigation sequence', () => {
    expect(Object.fromEntries(Object.entries(chapter1MainlineSteps).map(([node, step]) => [node, step.image]))).toMatchObject({
      'chapter1.entry': {
        src: '/assets/chapter1/chapter1-entry-v1.png',
        alt: '雨后的锦衣卫署门廊下，覃保坤向前示意，廖威达手持记录随行',
      },
      'chapter1.paper-shop-fire': {
        src: '/assets/chapter1/paper-shop-fire-scene-v1.png',
        alt: '城南纸铺后库火灾后的现场，覃保坤与廖威达正在勘验',
      },
      'chapter1.day1-evidence': {
        src: '/assets/chapter1/paper-shop-evidence-v1.png',
        alt: '纸铺火案中待核对的凭条、工作包、散银与烧焦纸页',
      },
      'chapter1.night-preservation': {
        src: '/assets/chapter1/paper-shop-night-preservation-v1.png',
        alt: '夜间的失火纸铺内，覃保坤守在已封存的证物桌前，廖威达伏案记录',
      },
      'chapter1.day2-verify': {
        src: '/assets/chapter1/paper-shop-review-v1.png',
        alt: '覃保坤与廖威达在案桌上逐项核对纸铺火案材料',
      },
      'chapter1.case-closed': {
        src: '/assets/chapter1/paper-shop-closed-case-v1.png',
        alt: '火后纸铺外，覃保坤与廖威达带着已核实的材料离开，店内仍有人整理残局',
      },
    })
  })

  it('makes Qian Baokun a present-tense investigating superior, not a quest label', () => {
    const entry = chapter1MainlineSteps['chapter1.entry'].narrative.paragraphs.map((paragraph) => paragraph.text).join('\n')
    const scene = chapter1MainlineSteps['chapter1.paper-shop-fire'].narrative.paragraphs.map((paragraph) => paragraph.text).join('\n')
    expect(entry).toContain('看见的、听见的、能核的')
    expect(scene).toContain('看了贺掌柜一眼')
    expect(scene).toContain('先别动吴生')
  })

  it('frames chapter one as a chain of fieldwork, verification, and approved disposition', () => {
    const steps = Object.values(chapter1MainlineSteps)
    const text = steps.flatMap((step) => step.narrative.paragraphs.map((paragraph) => paragraph.text)).join('\n')
    expect(text).toContain('查访、勘验和笔录')
    expect(text).toContain('组成明确命题')
    expect(text).toContain('只能提出办案建议')
    expect(text).toContain('不能由你直接定罪')
  })

  it('gives each supported evidence question a concrete, case-specific resolution', () => {
    const narratives = chapter1InvestigationBlueprint.openQuestions.map((question) => question.supportedNarrative)
    const titles = narratives.map((narrative) => narrative.title)
    const text = narratives.flatMap((narrative) => narrative.paragraphs.map((paragraph) => paragraph.text)).join('\n')

    expect(titles).toEqual(['吴生是被支去后巷的', '火是从账架旁起的', '有一批印纸没有留在火里'])
    expect(text).toContain('这就能写进案卷了')
    expect(text).not.toContain('固定一项待证事实')
  })
})
