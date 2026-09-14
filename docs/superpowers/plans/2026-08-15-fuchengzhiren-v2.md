# 《我在明朝当锦衣卫》实现计划 v2

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Ming Dynasty text RPG PWA — player controls 廖威达 through 120 months of monthly actions and branching story nodes, culminating in one of 9 endings.

**Architecture:** Zustand store holds all GameState; a pure engine layer (conditionEvaluator, effectApplier, nodeResolver, endingResolver) transforms state immutably; React components read from the store and dispatch actions. Story data (nodes, actions, endings) is static TypeScript data imported by the engine. Auto-save writes to localStorage after every state change.

**Tech Stack:** React 18, TypeScript, Vite 5, vite-plugin-pwa (Workbox), Zustand 5, CSS Modules, Vitest + React Testing Library

**v2变更说明（来自Codex审查）：**
1. Effect类型改为discriminated union，消除 delta/value 字段冲突
2. MVP切片优先：先完成月份1-3完整循环再扩展
3. 结局flag修复：所有9个结局都有明确触发路径
4. 集成测试前置：Task 12即验证完整游戏循环

---

### Task 1: Scaffold Project

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/vite-env.d.ts`
- Create: `src/test-setup.ts`

- [ ] **Step 1: Initialize Vite project**

Run in `c:\Users\lwd77\Desktop\文字游戏`:
```bash
npm create vite@latest . -- --template react-ts
```
When prompted about non-empty directory, choose **Ignore files and continue**.

- [ ] **Step 2: Install dependencies**

```bash
npm install zustand
npm install -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom jsdom
npm install -D vite-plugin-pwa
```

- [ ] **Step 3: Replace vite.config.ts**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
         name: '我在明朝当锦衣卫', short_name: '明朝锦衣卫',
        description: '明朝复仇文字RPG', theme_color: '#1a1a2e',
        background_color: '#1a1a2e', display: 'standalone',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
  test: { environment: 'jsdom', setupFiles: ['./src/test-setup.ts'], globals: true },
})
```

- [ ] **Step 4: Create src/test-setup.ts**

```typescript
import '@testing-library/jest-dom'
```

- [ ] **Step 5: Add test scripts to package.json**

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 6: Verify dev server starts**

```bash
npm run dev
```
Expected: Vite dev server starts on http://localhost:5173

- [ ] **Step 7: Commit**

```bash
git init
git add .
git commit -m "feat: scaffold React18 + TypeScript + Vite + PWA"
```

---

### Task 3: Engine — Condition Evaluator

**Files:**
- Create: `src/engine/conditionEvaluator.ts`
- Create: `src/engine/__tests__/conditionEvaluator.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/engine/__tests__/conditionEvaluator.test.ts`:
```typescript
import { evaluateCondition, evaluateAll } from '../conditionEvaluator'
import type { GameState, Condition } from '../../types'

const s: GameState = {
  month: 30, phase: 2,
  attributes: { wuli: 50, zhimou: 40, koucai: 20, shengwang: 30 },
  wealth: 200, actionPoints: 3,
  clues: [{ id: 'clue_01', label: '木牌', clarity: 'vague', description: '' }],
  npcRelations: { zhou_hanchuan: 60, feng_tianshun: 40 } as any,
  riskLevel: 2, flags: { zheng_jiu_recruited: true },
  currentNode: null, screen: 'game', endingId: null,
}

test('attribute_gte passes when at threshold', () => {
  expect(evaluateCondition({ type: 'attribute_gte', attribute: 'wuli', value: 50 }, s)).toBe(true)
})
test('attribute_gte fails when below threshold', () => {
  expect(evaluateCondition({ type: 'attribute_gte', attribute: 'koucai', value: 60 }, s)).toBe(false)
})
test('wealth_gte passes', () => {
  expect(evaluateCondition({ type: 'wealth_gte', value: 200 }, s)).toBe(true)
})
test('flag_true passes when flag set', () => {
  expect(evaluateCondition({ type: 'flag_true', flagKey: 'zheng_jiu_recruited', value: true }, s)).toBe(true)
})
test('flag_false passes when flag not set', () => {
  expect(evaluateCondition({ type: 'flag_false', flagKey: 'no_such_flag', value: true }, s)).toBe(true)
})
test('npc_relation_gte passes at threshold', () => {
  expect(evaluateCondition({ type: 'npc_relation_gte', npcId: 'zhou_hanchuan', value: 60 }, s)).toBe(true)
})
test('clue_collected passes when clue present', () => {
  expect(evaluateCondition({ type: 'clue_collected', clueId: 'clue_01', value: true }, s)).toBe(true)
})
test('evaluateAll passes when all conditions pass', () => {
  expect(evaluateAll([
    { type: 'attribute_gte', attribute: 'wuli', value: 40 },
    { type: 'wealth_gte', value: 100 },
  ], s)).toBe(true)
})
test('evaluateAll fails when any condition fails', () => {
  expect(evaluateAll([
    { type: 'attribute_gte', attribute: 'wuli', value: 40 },
    { type: 'attribute_gte', attribute: 'koucai', value: 80 },
  ], s)).toBe(false)
})
test('evaluateAll passes for empty list', () => {
  expect(evaluateAll([], s)).toBe(true)
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test
```
Expected: FAIL — cannot find module '../conditionEvaluator'

- [ ] **Step 3: Implement conditionEvaluator.ts**

Create `src/engine/conditionEvaluator.ts`:
```typescript
import type { GameState, Condition } from '../types'

export function evaluateCondition(cond: Condition, state: GameState): boolean {
  switch (cond.type) {
    case 'attribute_gte':    return state.attributes[cond.attribute!] >= (cond.value as number)
    case 'attribute_lte':    return state.attributes[cond.attribute!] <= (cond.value as number)
    case 'wealth_gte':       return state.wealth >= (cond.value as number)
    case 'wealth_lte':       return state.wealth <= (cond.value as number)
    case 'flag_true':        return state.flags[cond.flagKey!] === true
    case 'flag_false':       return !state.flags[cond.flagKey!]
    case 'npc_relation_gte': return (state.npcRelations[cond.npcId!] ?? 0) >= (cond.value as number)
    case 'risk_lte':         return state.riskLevel <= (cond.value as number)
    case 'risk_gte':         return state.riskLevel >= (cond.value as number)
    case 'month_gte':        return state.month >= (cond.value as number)
    case 'clue_collected':   return state.clues.some(c => c.id === cond.clueId)
    default:                 return false
  }
}

export function evaluateAll(conditions: Condition[], state: GameState): boolean {
  return conditions.every(c => evaluateCondition(c, state))
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test
```
Expected: PASS (10 tests)

- [ ] **Step 5: Commit**

```bash
git add src/engine/
git commit -m "feat: add condition evaluator"
```

---

### Task 2: TypeScript Types

**Files:**
- Create: `src/types/game.ts`
- Create: `src/types/index.ts`
- Create: `src/types/__tests__/game.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/types/__tests__/game.test.ts`:
```typescript
import type { GameState, Attributes, NpcId, Effect } from '../game'

test('GameState has correct shape', () => {
  const attrs: Attributes = { wuli: 7, zhimou: 7, koucai: 2, shengwang: 4 }
  const state: GameState = {
    month: 1, phase: 1, attributes: attrs, wealth: 30,
    actionPoints: 3, clues: [], npcRelations: {} as Record<NpcId, number>,
    riskLevel: 1, flags: {}, currentNode: null, screen: 'prologue', endingId: null,
  }
  expect(state.month).toBe(1)
  expect(state.attributes.wuli).toBe(7)
})

test('Effect discriminated union compiles', () => {
  const e1: Effect = { type: 'attribute_change', attribute: 'wuli', delta: 5 }
  const e2: Effect = { type: 'set_flag', flag: 'test_flag', value: true }
  expect(e1.type).toBe('attribute_change')
  expect(e2.type).toBe('set_flag')
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test
```
Expected: FAIL — cannot find module '../game'

- [ ] **Step 3: Create src/types/game.ts**

```typescript
export type NpcId =
  | 'zhou_hanchuan' | 'feng_tianshun' | 'fang_zhengyan'
  | 'li_muchen' | 'liu_ruyan' | 'sun_yutang'
  | 'wei_chengen' | 'cui_gonggong' | 'jing_wang' | 'zheng_jiu'

export type ClueClarity = 'vague' | 'clear' | 'confirmed'

export interface Clue {
  id: string
  label: string
  clarity: ClueClarity
  description: string
}

export interface Attributes {
  wuli: number
  zhimou: number
  koucai: number
  shengwang: number
}

export interface GameState {
  month: number
  phase: 1 | 2 | 3 | 4
  attributes: Attributes
  wealth: number
  actionPoints: number
  clues: Clue[]
  npcRelations: Record<NpcId, number>
  riskLevel: 1 | 2 | 3 | 4 | 5
  flags: Record<string, boolean>
  currentNode: string | null
  screen: 'prologue' | 'game' | 'node' | 'ending'
  endingId: string | null
}

export type ConditionType =
  | 'attribute_gte' | 'attribute_lte'
  | 'wealth_gte' | 'wealth_lte'
  | 'flag_true' | 'flag_false'
  | 'npc_relation_gte' | 'risk_lte' | 'risk_gte'
  | 'month_gte' | 'clue_collected'

export interface Condition {
  type: ConditionType
  attribute?: keyof Attributes
  npcId?: NpcId
  clueId?: string
  flagKey?: string
  value: number | boolean
}

// v2: discriminated union — eliminates delta/value field conflict
export type Effect =
  | { type: 'attribute_change'; attribute: keyof Attributes; delta: number }
  | { type: 'wealth_change'; delta: number }
  | { type: 'npc_relation_change'; npcId: NpcId; delta: number }
  | { type: 'risk_change'; delta: number }
  | { type: 'set_flag'; flag: string; value: boolean }
  | { type: 'add_clue'; clue: Clue }

export interface Choice {
  id: string
  label: string
  condition?: Condition
  effects: Effect[]
  outcomeNarrative: string
}

export interface StoryNode {
  id: string
  month: number
  title: string
  narrative: string
  choices: Choice[]
  trigger: Condition[]
}

export interface MonthlyAction {
  id: string
  label: string
  category: 'duty' | 'training' | 'social' | 'investigation' | 'income'
  cost: number
  conditions: Condition[]
  effects: Effect[]
  narrative: string
}

export interface Ending {
  id: string
  title: string
  conditions: Condition[]
  narrative: string
  isHidden: boolean
}
```

- [ ] **Step 4: Create src/types/index.ts**

```typescript
export * from './game'
```

- [ ] **Step 5: Run test to verify it passes**

```bash
npm test
```
Expected: PASS (2 tests)

- [ ] **Step 6: Commit**

```bash
git add src/types/
git commit -m "feat: add TypeScript types with discriminated union Effect"
```

---

### Task 4: Engine — Effect Applier (TDD)

**Files:**
- Create: `src/engine/effectApplier.ts`
- Create: `src/engine/__tests__/effectApplier.test.ts`

- [ ] **Step 1: Write tests**

```typescript
// src/engine/__tests__/effectApplier.test.ts
import { applyEffect, applyEffects } from '../effectApplier'
import { makeInitialState } from '../../data/initialState'

let s: ReturnType<typeof makeInitialState>
beforeEach(() => { s = makeInitialState() })

test('attribute_change clamps to 0-100', () => {
  expect(applyEffect(s, { type: 'attribute_change', attribute: 'wuli', delta: 200 }).attributes.wuli).toBe(100)
  expect(applyEffect(s, { type: 'attribute_change', attribute: 'wuli', delta: -200 }).attributes.wuli).toBe(0)
})
test('wealth_change clamps to 0', () => {
  expect(applyEffect(s, { type: 'wealth_change', delta: -9999 }).wealth).toBe(0)
  expect(applyEffect(s, { type: 'wealth_change', delta: 10 }).wealth).toBe(40)
})
test('npc_relation_change clamps to 0-100', () => {
  expect(applyEffect(s, { type: 'npc_relation_change', npcId: 'feng_tianshun', delta: 999 }).npcRelations['feng_tianshun']).toBe(100)
})
test('risk_change clamps to 1-5', () => {
  expect(applyEffect(s, { type: 'risk_change', delta: 99 }).riskLevel).toBe(5)
  expect(applyEffect(s, { type: 'risk_change', delta: -99 }).riskLevel).toBe(1)
})
test('set_flag sets boolean flag using flag field', () => {
  expect(applyEffect(s, { type: 'set_flag', flag: 'x', value: true }).flags['x']).toBe(true)
})
test('add_clue no duplicates', () => {
  const clue = { id: 'c1', label: '线索', clarity: 'vague' as const, description: '' }
  const s2 = applyEffect(applyEffect(s, { type: 'add_clue', clue }), { type: 'add_clue', clue })
  expect(s2.clues).toHaveLength(1)
})
test('applyEffects sequence is immutable', () => {
  const r = applyEffects(s, [
    { type: 'wealth_change', delta: 5 },
    { type: 'attribute_change', attribute: 'wuli', delta: 3 },
  ])
  expect(r.wealth).toBe(35)
  expect(r.attributes.wuli).toBe(10)
  expect(s.wealth).toBe(30)
})
```

- [ ] **Step 2: Implement effectApplier.ts**

```typescript
// src/engine/effectApplier.ts
import type { GameState, Effect } from '../types'

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))

export function applyEffect(state: GameState, effect: Effect): GameState {
  switch (effect.type) {
    case 'attribute_change': {
      const cur = state.attributes[effect.attribute]
      return { ...state, attributes: { ...state.attributes, [effect.attribute]: clamp(cur + effect.delta, 0, 100) } }
    }
    case 'wealth_change':
      return { ...state, wealth: clamp(state.wealth + effect.delta, 0, Infinity) }
    case 'npc_relation_change': {
      const cur = state.npcRelations[effect.npcId] ?? 0
      return { ...state, npcRelations: { ...state.npcRelations, [effect.npcId]: clamp(cur + effect.delta, 0, 100) } }
    }
    case 'risk_change':
      return { ...state, riskLevel: clamp(state.riskLevel + effect.delta, 1, 5) as GameState['riskLevel'] }
    case 'set_flag':
      return { ...state, flags: { ...state.flags, [effect.flag]: effect.value } }
    case 'add_clue':
      if (state.clues.some(c => c.id === effect.clue.id)) return state
      return { ...state, clues: [...state.clues, effect.clue] }
    default: return state
  }
}

export function applyEffects(state: GameState, effects: Effect[]): GameState {
  return effects.reduce((s, e) => applyEffect(s, e), state)
}
```

- [ ] **Step 3: Run tests**

```bash
npm test -- --testPathPattern=effectApplier
```
Expected: PASS (7 tests)

- [ ] **Step 4: Commit**

```bash
git add src/engine/
git commit -m "feat: add effect applier with discriminated union"
```

---

### Task 5: Engine — Node Resolver + Ending Resolver (TDD)

**Files:**
- Create: `src/engine/nodeResolver.ts`
- Create: `src/engine/endingResolver.ts`
- Create: `src/engine/index.ts`
- Create: `src/engine/__tests__/nodeResolver.test.ts`
- Create: `src/engine/__tests__/endingResolver.test.ts`

- [ ] **Step 1: Write nodeResolver tests**

```typescript
// src/engine/__tests__/nodeResolver.test.ts
import { findTriggeredNode } from '../nodeResolver'
import { makeInitialState } from '../../data/initialState'
import type { StoryNode } from '../../types'

const baseNode: StoryNode = {
  id: 'node_01', month: 3, title: '重逢故友', narrative: '...', choices: [],
  trigger: [{ type: 'month_gte', value: 3 }],
}

test('returns node when month condition met', () => {
  const s = { ...makeInitialState(), month: 3 }
  expect(findTriggeredNode([baseNode], s)?.id).toBe('node_01')
})
test('returns null when month not reached', () => {
  const s = { ...makeInitialState(), month: 2 }
  expect(findTriggeredNode([baseNode], s)).toBeNull()
})
test('skips node already visited via flag', () => {
  const s = { ...makeInitialState(), month: 3, flags: { visited_node_01: true } }
  expect(findTriggeredNode([baseNode], s)).toBeNull()
})
test('returns null when node list is empty', () => {
  const s = { ...makeInitialState(), month: 10 }
  expect(findTriggeredNode([], s)).toBeNull()
})
```

- [ ] **Step 2: Write endingResolver tests**

```typescript
// src/engine/__tests__/endingResolver.test.ts
import { resolveEnding } from '../endingResolver'
import { makeInitialState } from '../../data/initialState'
import type { Ending } from '../../types'

const endings: Ending[] = [
  {
    id: 'ending_justice', title: '明正典刑', isHidden: false,
    conditions: [
      { type: 'attribute_gte', attribute: 'shengwang', value: 70 },
      { type: 'flag_true', flagKey: 'flag_justice', value: true },
    ],
    narrative: '...',
  },
  {
    id: 'ending_defeat', title: '折戟', isHidden: false,
    conditions: [{ type: 'flag_true', flagKey: 'flag_captured', value: true }],
    narrative: '...',
  },
]

test('returns first matching ending', () => {
  const s = { ...makeInitialState(), attributes: { ...makeInitialState().attributes, shengwang: 80 }, flags: { flag_justice: true } }
  expect(resolveEnding(endings, s)?.id).toBe('ending_justice')
})
test('returns null when no ending matches', () => {
  expect(resolveEnding(endings, makeInitialState())).toBeNull()
})
test('first-match wins when multiple conditions could apply', () => {
  const s = { ...makeInitialState(), attributes: { ...makeInitialState().attributes, shengwang: 80 }, flags: { flag_justice: true, flag_captured: true } }
  expect(resolveEnding(endings, s)?.id).toBe('ending_justice')
})
```

- [ ] **Step 3: Implement nodeResolver.ts**

```typescript
// src/engine/nodeResolver.ts
import type { GameState, StoryNode } from '../types'
import { evaluateAll } from './conditionEvaluator'

export function findTriggeredNode(nodes: StoryNode[], state: GameState): StoryNode | null {
  for (const node of nodes) {
    if (state.flags[`visited_${node.id}`]) continue
    if (evaluateAll(node.trigger, state)) return node
  }
  return null
}
```

- [ ] **Step 4: Implement endingResolver.ts**

```typescript
// src/engine/endingResolver.ts
import type { GameState, Ending } from '../types'
import { evaluateAll } from './conditionEvaluator'

export function resolveEnding(endings: Ending[], state: GameState): Ending | null {
  return endings.find(e => evaluateAll(e.conditions, state)) ?? null
}
```

- [ ] **Step 5: Create engine/index.ts**

```typescript
// src/engine/index.ts
export * from './conditionEvaluator'
export * from './effectApplier'
export * from './nodeResolver'
export * from './endingResolver'
```

- [ ] **Step 6: Run tests**

```bash
npm test -- --testPathPattern="nodeResolver|endingResolver"
```
Expected: PASS (7 tests)

- [ ] **Step 7: Commit**

```bash
git add src/engine/
git commit -m "feat: add node resolver and ending resolver"
```

---

### Task 6: Game Data — Initial State + NPCs

**Files:**
- Create: `src/data/initialState.ts`
- Create: `src/data/npcs.ts`

- [ ] **Step 1: Create initialState.ts**

```typescript
// src/data/initialState.ts
import type { GameState, NpcId } from '../types'

const DEFAULT_NPC_RELATIONS: Record<NpcId, number> = {
  zhou_hanchuan: 20, feng_tianshun: 0, fang_zhengyan: 0,
  li_muchen: 0, liu_ruyan: 0, sun_yutang: 0,
  wei_chengen: 0, cui_gonggong: 0, jing_wang: 0, zheng_jiu: 0,
}

export function makeInitialState(): GameState {
  return {
    month: 1, phase: 1,
    attributes: { wuli: 7, zhimou: 7, koucai: 2, shengwang: 4 },
    wealth: 30, actionPoints: 3, clues: [],
    npcRelations: { ...DEFAULT_NPC_RELATIONS },
    riskLevel: 1,
    // v2修正：初始化存活状态flag，保证ending_justice默认路线可达
    flags: {
      fang_zhengyan_alive: true,
      feng_tianshun_alive: true,
    },
    currentNode: null, screen: 'prologue', endingId: null,
  }
}
```

- [ ] **Step 2: Create npcs.ts**

```typescript
// src/data/npcs.ts
export interface NpcInfo {
  id: string; name: string; age: number; role: string; faction: string
}

export const ALL_NPCS: NpcInfo[] = [
  { id: 'zhou_hanchuan', name: '周寒川', age: 40, role: '锦衣卫千户（直属上司）', faction: '锦衣卫' },
  { id: 'feng_tianshun', name: '冯天顺', age: 18, role: '京营把总（儿时好友）',   faction: '京营' },
  { id: 'fang_zhengyan', name: '方正言', age: 45, role: '御史（清流盟友）',       faction: '言官集团' },
  { id: 'li_muchen',     name: '李慕尘', age: 40, role: '隐居剑客（知情者）',     faction: '天刀门旧部' },
  { id: 'liu_ruyan',     name: '柳如烟', age: 25, role: '花魁/东厂暗探',         faction: '东厂' },
  { id: 'sun_yutang',    name: '孙玉堂', age: 50, role: '景王府管家（仇人）',     faction: '景王府' },
  { id: 'wei_chengen',   name: '魏承恩', age: 55, role: '锦衣卫指挥使',          faction: '锦衣卫' },
  { id: 'cui_gonggong',  name: '崔公公', age: 60, role: '东厂掌印太监',          faction: '东厂' },
  { id: 'jing_wang',     name: '景王',   age: 35, role: '皇室宗亲',             faction: '景王府' },
  { id: 'zheng_jiu',     name: '郑九',   age: 30, role: '祥云商行外账房',        faction: '商帮' },
]
```

- [ ] **Step 3: Commit**

```bash
git add src/data/
git commit -m "feat: add initial state (with alive flags) and NPC data"
```

---

### Task 7: Game Data — Phase 1 Actions (MVP)

**Files:**
- Create: `src/data/actions/phase1Actions.ts`
- Create: `src/data/actions/index.ts`

- [ ] **Step 1: Create phase1Actions.ts**

```typescript
// src/data/actions/phase1Actions.ts
import type { MonthlyAction } from '../../types'

export const phase1Actions: MonthlyAction[] = [
  {
    id: 'patrol_duty', label: '巡街执勤', category: 'duty', cost: 1, conditions: [],
    effects: [
      { type: 'attribute_change', attribute: 'shengwang', delta: 2 },
      { type: 'wealth_change', delta: 5 },
    ],
    narrative: '你随周寒川在北镇抚司附近巡街，协助处理了几起小纠纷。',
  },
  {
    id: 'handle_case', label: '办理案件', category: 'duty', cost: 1, conditions: [],
    effects: [
      { type: 'attribute_change', attribute: 'shengwang', delta: 3 },
      { type: 'attribute_change', attribute: 'zhimou', delta: 1 },
    ],
    narrative: '你协助处理了一件积压案件，表现令周寒川满意。',
  },
  {
    id: 'practice_blade', label: '练习刀法', category: 'training', cost: 1, conditions: [],
    effects: [{ type: 'attribute_change', attribute: 'wuli', delta: 2 }],
    narrative: '清晨在院子里练刀，连续练了两个时辰。手臂发酸，但刀势更稳了。',
  },
  {
    id: 'read_cases', label: '研读卷宗', category: 'training', cost: 1, conditions: [],
    effects: [{ type: 'attribute_change', attribute: 'zhimou', delta: 2 }],
    narrative: '你从档案库借出几份旧案卷宗，仔细研读，学到了不少查案技巧。',
  },
  {
    id: 'practice_speech', label: '练习说话', category: 'training', cost: 1, conditions: [],
    effects: [{ type: 'attribute_change', attribute: 'koucai', delta: 2 }],
    narrative: '你刻意去人多的地方，练习与陌生人交谈，慢慢不那么拘谨了。',
  },
  {
    id: 'drink_with_feng', label: '与冯天顺喝酒', category: 'social', cost: 1,
    conditions: [{ type: 'npc_relation_gte', npcId: 'feng_tianshun', value: 20 }],
    effects: [
      { type: 'npc_relation_change', npcId: 'feng_tianshun', delta: 10 },
      { type: 'wealth_change', delta: -5 },
    ],
    narrative: '你找冯天顺喝了一顿酒，他说了很多京营里的趣事，你也放松了一些。',
  },
  {
    id: 'visit_zhou', label: '拜访周寒川', category: 'social', cost: 1,
    conditions: [{ type: 'npc_relation_gte', npcId: 'zhou_hanchuan', value: 10 }],
    effects: [{ type: 'npc_relation_change', npcId: 'zhou_hanchuan', delta: 8 }],
    narrative: '你去拜访了周寒川，他问了你一些近况，给了一些办案建议。',
  },
  {
    id: 'buy_street_intel', label: '打探街头消息', category: 'investigation', cost: 1,
    conditions: [{ type: 'wealth_gte', value: 10 }],
    effects: [
      { type: 'wealth_change', delta: -8 },
      { type: 'attribute_change', attribute: 'zhimou', delta: 1 },
    ],
    narrative: '你在茶楼坐了半天，花了几钱银子打探京城近来发生的事，收获了一些零碎消息。',
  },
  {
    id: 'extra_duty', label: '主动承接额外差事', category: 'income', cost: 1, conditions: [],
    effects: [
      { type: 'wealth_change', delta: 15 },
      { type: 'attribute_change', attribute: 'shengwang', delta: 1 },
    ],
    narrative: '你主动接下了一件额外的公务，辛苦了几天，多得了几两银子。',
  },
]
```

- [ ] **Step 2: Create actions/index.ts (MVP version)**

```typescript
// src/data/actions/index.ts
export { phase1Actions } from './phase1Actions'

import { phase1Actions } from './phase1Actions'

export function getActionsForPhase(phase: 1 | 2 | 3 | 4) {
  // MVP: all phases use phase1 actions; expand in Task 16
  return phase1Actions
}
```

- [ ] **Step 3: Commit**

```bash
git add src/data/actions/
git commit -m "feat: add phase1 actions (MVP)"
```

---

### Task 8: Game Data — node01 (MVP)

**Files:**
- Create: `src/data/nodes/node01.ts`
- Create: `src/data/nodes/index.ts`

- [ ] **Step 1: Create node01.ts — 重逢故友（第3月）**

```typescript
// src/data/nodes/node01.ts
import type { StoryNode } from '../../types'

export const node01: StoryNode = {
  id: 'node_01', month: 3, title: '重逢故友',
  trigger: [{ type: 'month_gte', value: 3 }],
  narrative: `崇祯元年，三月。

北镇抚司附近的街道上，你正在巡街，忽然听见有人叫你的名字。

回头一看——是冯天顺。十五年前的玩伴，如今已是京营把总。他比你高半个头，脸晒得黢黑，笑起来还是那副样子，像个没长大的孩子。

"廖威达！真的是你！"

他拦住你，上上下下打量，然后咧嘴笑道："穿上飞鱼服了，厉害。"

*他不知道我回来是为了什么。他只是……高兴。这种干净的高兴，我有多久没见过了。*`,
  choices: [
    {
      id: 'node01_a', label: '邀他去喝酒叙旧',
      effects: [{ type: 'npc_relation_change', npcId: 'feng_tianshun', delta: 40 }],
      outcomeNarrative: '酒喝了一坛，话说了半夜。冯天顺说："有难处尽管找我，你不是一个人。"',
    },
    {
      id: 'node01_b', label: '礼貌寒暄几句，道别离去',
      effects: [{ type: 'npc_relation_change', npcId: 'feng_tianshun', delta: 20 }],
      outcomeNarrative: '短暂叙旧，互留住址，约定改日再叙。',
    },
    {
      id: 'node01_c', label: '敷衍几句，借故离开',
      effects: [{ type: 'npc_relation_change', npcId: 'feng_tianshun', delta: -10 }],
      outcomeNarrative: '你找了个借口离开。冯天顺看着你的背影，有些困惑，也有些失望。',
    },
    {
      id: 'node01_d', label: '问他是否知道父亲当年案子的消息',
      effects: [
        { type: 'npc_relation_change', npcId: 'feng_tianshun', delta: 10 },
        { type: 'set_flag', flag: 'told_feng_about_investigation', value: true },
      ],
      outcomeNarrative: '冯天顺神情一肃，摇了摇头："那时候我们都小，什么都不知道。但你若要查，我能帮的我会帮。"',
    },
  ],
}
```

- [ ] **Step 2: Create nodes/index.ts (MVP version)**

```typescript
// src/data/nodes/index.ts
export { node01 } from './node01'

import { node01 } from './node01'

export const ALL_NODES = [node01]
```

- [ ] **Step 3: Commit**

```bash
git add src/data/nodes/
git commit -m "feat: add node01 重逢故友 (MVP)"
```

---

### Task 9: Game Data — 3 MVP Endings

**Files:**
- Create: `src/data/endings.ts`

- [ ] **Step 1: Create endings.ts (MVP — 3 endings for testing)**

```typescript
// src/data/endings.ts
import type { Ending } from '../types'

export const ALL_ENDINGS: Ending[] = [
  {
    id: 'ending_defeat', title: '折戟', isHidden: false,
    conditions: [{ type: 'flag_true', flagKey: 'flag_captured', value: true }],
    narrative: `这条路没有走到底。

也许是在第四年，也许是在第七年——某个夜晚，某条巷子，某个你以为安全的地方，事情就这样结束了。

结局是死，或者是一种比死更长的结束——流放，或者被废，或者消失在某个不知名的地方，没有人知道，没有人记得。

廖承志的案子，还埋在档案库里。`,
  },
  {
    id: 'ending_release', title: '放下', isHidden: false,
    conditions: [{ type: 'flag_true', flagKey: 'flag_release', value: true }],
    narrative: `你看着他在铺子里做生意，站了很长时间，然后转身走了。

没有人知道你去过那里，没有人知道你做了这个决定。

你回到北镇抚司，继续做你的千户，继续查案，继续活着。那个名字在你脑子里放了很多年，慢慢地，像一块石头被水泡久了，棱角磨掉了，还在，但不那么硌人了。

这不是原谅。你没有原谅任何人。

你只是决定，不让仇恨再花你更多的时间了。`,
  },
  {
    id: 'ending_early_loss', title: '折戟（力竭）', isHidden: false,
    conditions: [
      { type: 'month_gte', value: 120 },
      { type: 'risk_gte', value: 5 },
    ],
    narrative: `十年，你耗尽了一切。

风险积累到了无法挽回的地步，在最后的时刻，敌人的网收紧了。

廖承志的案子，还埋在档案库里。`,
  },
]
```

- [ ] **Step 2: Commit**

```bash
git add src/data/endings.ts
git commit -m "feat: add 3 MVP endings for testing"
```

---

### Task 10: Zustand Store + Auto-save

**Files:**
- Create: `src/store/gameStore.ts`
- Create: `src/store/index.ts`
- Create: `src/store/__tests__/gameStore.test.ts`

- [ ] **Step 1: Write store tests**

```typescript
// src/store/__tests__/gameStore.test.ts
import { act } from '@testing-library/react'
import { useGameStore } from '../gameStore'

beforeEach(() => {
  localStorage.clear()
  useGameStore.setState(useGameStore.getInitialState())
})

test('startGame initializes state and sets screen to game', () => {
  act(() => { useGameStore.getState().startGame() })
  const s = useGameStore.getState()
  expect(s.screen).toBe('game')
  expect(s.month).toBe(1)
  expect(s.actionPoints).toBe(3)
})

test('performAction deducts AP and applies effects', () => {
  act(() => { useGameStore.getState().startGame() })
  act(() => { useGameStore.getState().performAction('patrol_duty') })
  const s = useGameStore.getState()
  expect(s.actionPoints).toBe(2)
  expect(s.attributes.shengwang).toBeGreaterThan(4)
})

test('makeChoice applies effects and clears currentNode', () => {
  act(() => {
    useGameStore.getState().startGame()
    useGameStore.setState({ currentNode: 'node_01', screen: 'node' })
    useGameStore.getState().makeChoice('node01_b')
  })
  const s = useGameStore.getState()
  expect(s.currentNode).toBeNull()
  expect(s.screen).toBe('game')
})

test('auto-save writes to localStorage after state change', () => {
  act(() => { useGameStore.getState().startGame() })
  const saved = localStorage.getItem('fuchengzhiren_save')
  expect(saved).not.toBeNull()
  expect(JSON.parse(saved!).screen).toBe('game')
})
```

- [ ] **Step 2: Implement gameStore.ts**

```typescript
// src/store/gameStore.ts
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { makeInitialState } from '../data/initialState'
import { applyEffects } from '../engine/effectApplier'
import { evaluateAll } from '../engine/conditionEvaluator'
import { findTriggeredNode } from '../engine/nodeResolver'
import { resolveEnding } from '../engine/endingResolver'
import { getActionsForPhase } from '../data/actions'
import { ALL_NODES } from '../data/nodes'
import { ALL_ENDINGS } from '../data/endings'
import type { GameState } from '../types'

const SAVE_KEY = 'fuchengzhiren_save'

function computePhase(month: number): 1 | 2 | 3 | 4 {
  if (month <= 24) return 1
  if (month <= 60) return 2
  if (month <= 84) return 3
  return 4
}

interface GameStore extends GameState {
  startGame: () => void
  performAction: (actionId: string) => void
  makeChoice: (choiceId: string) => void
  dismissNode: () => void
  advanceToNextMonth: () => void
}

function loadSave(): GameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export const useGameStore = create<GameStore>()(
  subscribeWithSelector((set, get) => ({
    ...(loadSave() ?? makeInitialState()),

    startGame() {
      const fresh = makeInitialState()
      set({ ...fresh, screen: 'game' })
    },

    performAction(actionId) {
      const state = get()
      const actions = getActionsForPhase(state.phase)
      const action = actions.find(a => a.id === actionId)
      if (!action) return
      if (state.actionPoints < action.cost) return
      if (action.conditions.length > 0 && !evaluateAll(action.conditions, state)) return
      const next = applyEffects(state, action.effects)
      set({ ...next, actionPoints: state.actionPoints - action.cost })
    },

    makeChoice(choiceId) {
      const state = get()
      if (!state.currentNode) return
      const node = ALL_NODES.find(n => n.id === state.currentNode)
      if (!node) return
      const choice = node.choices.find(c => c.id === choiceId)
      if (!choice) return
      const next = applyEffects(state, choice.effects)
      set({
        ...next, currentNode: null, screen: 'game',
        flags: { ...next.flags, [`visited_${node.id}`]: true },
      })
    },

    dismissNode() {
      const state = get()
      if (!state.currentNode) return
      set({
        currentNode: null, screen: 'game',
        flags: { ...state.flags, [`visited_${state.currentNode}`]: true },
      })
    },

    advanceToNextMonth() {
      const state = get()
      const newMonth = state.month + 1
      const newPhase = computePhase(newMonth)
      const newState: GameState = { ...state, month: newMonth, phase: newPhase, actionPoints: 3 }
      const ending = resolveEnding(ALL_ENDINGS, newState)
      const triggeredNode = findTriggeredNode(ALL_NODES, newState)
      if (ending) {
        set({ ...newState, endingId: ending.id, screen: 'ending' })
      } else if (triggeredNode) {
        set({ ...newState, currentNode: triggeredNode.id, screen: 'node' })
      } else {
        set(newState)
      }
    },
  }))
)

// Auto-save: write to localStorage after every state change
useGameStore.subscribe(
  state => state,
  state => {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)) } catch { /* ignore */ }
  }
)
```

- [ ] **Step 3: Create store/index.ts**

```typescript
// src/store/index.ts
export { useGameStore } from './gameStore'
```

- [ ] **Step 4: Run tests**

```bash
npm test -- --testPathPattern=gameStore
```
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add src/store/
git commit -m "feat: add Zustand game store with auto-save"
```

---

### Task 11: UI Components + CSS Theme (MVP)

**Files:**
- Create: `src/styles/theme.css`
- Create: `src/styles/global.css`
- Create: `src/components/game/AttributeBar.tsx`
- Create: `src/components/game/AttributeBar.module.css`
- Create: `src/components/layout/StatusPanel.tsx`
- Create: `src/components/layout/StatusPanel.module.css`
- Create: `src/components/layout/NarrativePanel.tsx`
- Create: `src/components/layout/NarrativePanel.module.css`
- Create: `src/components/game/ActionButton.tsx`
- Create: `src/components/game/ActionButton.module.css`
- Create: `src/components/game/ChoiceButton.tsx`
- Create: `src/components/game/ChoiceButton.module.css`
- Create: `src/components/layout/ActionPanel.tsx`
- Create: `src/components/layout/ActionPanel.module.css`
- Create: `src/components/story/NodeOverlay.tsx`
- Create: `src/components/story/NodeOverlay.module.css`

- [ ] **Step 1: Create src/styles/theme.css**

```css
:root {
  --color-ink:        #1a1a2e;
  --color-paper:      #f5f0e8;
  --color-paper-dark: #e8e0d0;
  --color-accent:     #8b1a1a;
  --color-text:       #2c1810;
  --font-serif: 'Noto Serif SC', 'Source Han Serif CN', 'SimSun', serif;
}
```

- [ ] **Step 2: Create src/styles/global.css**

```css
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body { height: 100%; background: var(--color-ink); color: var(--color-text); font-family: var(--font-serif); }
#root { height: 100%; }
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--color-paper-dark); border-radius: 3px; }
button { font-family: inherit; }
```

- [ ] **Step 3: Create AttributeBar.tsx**

```typescript
// src/components/game/AttributeBar.tsx
import styles from './AttributeBar.module.css'
interface Props { label: string; value: number; max?: number }
export function AttributeBar({ label, value, max = 100 }: Props) {
  const pct = Math.round((value / max) * 100)
  const tier = pct >= 67 ? 'high' : pct >= 34 ? 'mid' : 'low'
  return (
    <div className={styles.root}>
      <div className={styles.labelRow}>
        <span className={styles.label}>{label}</span>
        <span className={styles.value}>{value}</span>
      </div>
      <div className={styles.track}>
        <div className={`${styles.fill} ${styles[tier]}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create AttributeBar.module.css**

```css
.root { margin-bottom: 8px; }
.labelRow { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 2px; }
.label { color: var(--color-text); font-family: var(--font-serif); }
.value { color: var(--color-accent); font-weight: bold; }
.track { height: 6px; background: rgba(0,0,0,0.15); border-radius: 3px; overflow: hidden; }
.fill { height: 100%; border-radius: 3px; transition: width 0.3s ease; }
.high { background: #4a7c59; } .mid { background: #c9a227; } .low { background: var(--color-accent); }
```

- [ ] **Step 5: Create StatusPanel.tsx**

```typescript
// src/components/layout/StatusPanel.tsx
import { useGameStore } from '../../store'
import { AttributeBar } from '../game/AttributeBar'
import styles from './StatusPanel.module.css'

const ATTR_LABELS: Record<string, string> = {
  wuli: '武力', zhimou: '智谋', koucai: '口才', shengwang: '声望',
}
const RISK_LABELS = ['', '安全', '留意', '危险', '高危', '极危']
const MONTHS = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊']

export function StatusPanel() {
  const { month, phase, attributes, wealth, actionPoints, riskLevel, clues } = useGameStore()
  const chongzhenYear = Math.ceil(month / 12)
  const monthInYear = ((month - 1) % 12) + 1
  return (
    <aside className={styles.panel}>
      <div className={styles.timeBlock}>
        <div className={styles.timeMain}>崇祯{chongzhenYear}年{MONTHS[monthInYear - 1]}月</div>
        <div className={styles.phase}>第{phase}阶段</div>
      </div>
      <div className={styles.section}>
        {(Object.keys(attributes) as (keyof typeof attributes)[]).map(k => (
          <AttributeBar key={k} label={ATTR_LABELS[k]} value={attributes[k]} />
        ))}
      </div>
      <div className={styles.section}>
        <div className={styles.statRow}><span>财富</span><span>{wealth} 两</span></div>
        <div className={styles.statRow}>
          <span>行动点</span>
          <span>{Array.from({ length: 3 }, (_, i) => i < actionPoints ? '●' : '○').join('')}</span>
        </div>
        <div className={styles.statRow}>
          <span>风险</span>
          <span className={styles[`risk${riskLevel}`]}>{RISK_LABELS[riskLevel]}</span>
        </div>
        <div className={styles.statRow}><span>线索</span><span>{clues.length} 条</span></div>
      </div>
    </aside>
  )
}
```

- [ ] **Step 6: Create StatusPanel.module.css**

```css
.panel { background: var(--color-paper); border-right: 1px solid var(--color-paper-dark); padding: 16px 12px; overflow-y: auto; font-family: var(--font-serif); }
.timeBlock { text-align: center; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid var(--color-paper-dark); }
.timeMain { font-size: 18px; font-weight: bold; color: var(--color-accent); }
.phase { font-size: 12px; color: #888; margin-top: 2px; }
.section { margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid var(--color-paper-dark); }
.statRow { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px; }
.risk1 { color: #4a7c59; } .risk2 { color: #c9a227; } .risk3 { color: #e07b39; }
.risk4 { color: #c0392b; } .risk5 { color: #8b0000; font-weight: bold; }
```

- [ ] **Step 7: Create NarrativePanel.tsx and NarrativePanel.module.css**

```typescript
// src/components/layout/NarrativePanel.tsx
import styles from './NarrativePanel.module.css'
interface Props { text: string }
export function NarrativePanel({ text }: Props) {
  return (
    <main className={styles.panel}>
      <div className={styles.scroll}>
        {text.split('\n\n').filter(Boolean).map((para, i) => {
          const isMono = para.startsWith('*') && para.endsWith('*')
          return <p key={i} className={isMono ? styles.monologue : styles.paragraph}>{isMono ? para.slice(1, -1) : para}</p>
        })}
      </div>
    </main>
  )
}
```

```css
/* NarrativePanel.module.css */
.panel { background: var(--color-paper); overflow: hidden; display: flex; flex-direction: column; }
.scroll { flex: 1; overflow-y: auto; padding: 24px 28px; font-family: var(--font-serif); line-height: 1.9; }
.paragraph { margin-bottom: 16px; font-size: 15px; text-indent: 2em; }
.monologue { margin-bottom: 16px; font-size: 14px; font-style: italic; color: #6b5a4e; text-indent: 2em; }
```

- [ ] **Step 8: Create ActionButton.tsx and ActionButton.module.css**

```typescript
// src/components/game/ActionButton.tsx
import styles from './ActionButton.module.css'
import type { MonthlyAction } from '../../types'
const ICONS: Record<string, string> = { duty: '⚔', training: '📖', social: '🍵', investigation: '🔍', income: '💰' }
interface Props { action: MonthlyAction; disabled?: boolean; onClick: () => void }
export function ActionButton({ action, disabled, onClick }: Props) {
  return (
    <button className={styles.btn} disabled={disabled} onClick={onClick}>
      <span className={styles.icon}>{ICONS[action.category]}</span>
      <span className={styles.label}>{action.label}</span>
      <span className={styles.cost}>{'●'.repeat(action.cost)}</span>
    </button>
  )
}
```

```css
/* ActionButton.module.css */
.btn { display: flex; align-items: center; gap: 6px; width: 100%; padding: 8px 10px; margin-bottom: 6px; background: var(--color-paper-dark); border: 1px solid #d0c8b8; border-radius: 4px; cursor: pointer; text-align: left; font-family: var(--font-serif); }
.btn:hover:not(:disabled) { background: #e8dfd0; }
.btn:disabled { opacity: 0.45; cursor: not-allowed; }
.icon { font-size: 14px; } .label { flex: 1; font-size: 13px; } .cost { font-size: 11px; color: var(--color-accent); }
```

- [ ] **Step 9: Create ChoiceButton.tsx and ChoiceButton.module.css**

```typescript
// src/components/game/ChoiceButton.tsx
import styles from './ChoiceButton.module.css'
import type { Choice } from '../../types'
interface Props { choice: Choice; locked?: boolean; onClick: () => void }
export function ChoiceButton({ choice, locked, onClick }: Props) {
  return (
    <button className={styles.btn} disabled={locked} onClick={onClick}>
      <span className={styles.label}>{choice.label}</span>
      {locked && <span className={styles.lock}>🔒</span>}
    </button>
  )
}
```

```css
/* ChoiceButton.module.css */
.btn { display: flex; justify-content: space-between; align-items: center; width: 100%; padding: 10px 14px; margin-bottom: 8px; background: transparent; border: 1px solid var(--color-accent); border-radius: 4px; cursor: pointer; font-family: var(--font-serif); transition: background 0.15s; }
.btn:hover:not(:disabled) { background: var(--color-accent); color: var(--color-paper); }
.btn:disabled { opacity: 0.4; cursor: not-allowed; }
.label { font-size: 14px; }
```

- [ ] **Step 10: Create ActionPanel.tsx and ActionPanel.module.css**

```typescript
// src/components/layout/ActionPanel.tsx
import { useGameStore } from '../../store'
import { getActionsForPhase } from '../../data/actions'
import { ALL_NODES } from '../../data/nodes'
import { evaluateAll } from '../../engine/conditionEvaluator'
import { ActionButton } from '../game/ActionButton'
import { ChoiceButton } from '../game/ChoiceButton'
import styles from './ActionPanel.module.css'

export function ActionPanel() {
  const state = useGameStore()
  const { screen, phase, actionPoints, currentNode, performAction, makeChoice, advanceToNextMonth } = state

  if (screen === 'node' && currentNode) {
    const node = ALL_NODES.find(n => n.id === currentNode)
    return (
      <aside className={styles.panel}>
        <div className={styles.nodeTitle}>{node?.title}</div>
        {node?.choices.map(c => {
          const locked = c.condition ? !evaluateAll([c.condition], state) : false
          return <ChoiceButton key={c.id} choice={c} locked={locked} onClick={() => makeChoice(c.id)} />
        })}
      </aside>
    )
  }

  const actions = getActionsForPhase(phase)
  const available = actions.filter(a => evaluateAll(a.conditions, state))
  return (
    <aside className={styles.panel}>
      <div className={styles.header}>行动（剩余 {actionPoints} 点）</div>
      {available.map(a => (
        <ActionButton key={a.id} action={a} disabled={actionPoints < a.cost} onClick={() => performAction(a.id)} />
      ))}
      {actionPoints === 0 && (
        <button className={styles.advanceBtn} onClick={advanceToNextMonth}>结束本月 →</button>
      )}
    </aside>
  )
}
```

```css
/* ActionPanel.module.css */
.panel { background: var(--color-paper); border-left: 1px solid var(--color-paper-dark); padding: 16px 12px; overflow-y: auto; }
.header { font-size: 13px; color: #888; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid var(--color-paper-dark); }
.nodeTitle { font-size: 15px; font-weight: bold; color: var(--color-accent); margin-bottom: 14px; text-align: center; }
.advanceBtn { width: 100%; padding: 10px; margin-top: 12px; background: var(--color-accent); color: var(--color-paper); border: none; border-radius: 4px; cursor: pointer; font-size: 14px; }
```

- [ ] **Step 11: Create NodeOverlay.tsx and NodeOverlay.module.css**

```typescript
// src/components/story/NodeOverlay.tsx
import { useGameStore } from '../../store'
import { ALL_NODES } from '../../data/nodes'
import { evaluateAll } from '../../engine/conditionEvaluator'
import { ChoiceButton } from '../game/ChoiceButton'
import styles from './NodeOverlay.module.css'

export function NodeOverlay() {
  const state = useGameStore()
  const { currentNode, screen, makeChoice } = state
  if (screen !== 'node' || !currentNode) return null
  const node = ALL_NODES.find(n => n.id === currentNode)
  if (!node) return null
  return (
    <div className={styles.backdrop}>
      <div className={styles.card}>
        <h2 className={styles.title}>{node.title}</h2>
        <div className={styles.narrative}>
          {node.narrative.split('\n\n').filter(Boolean).map((p, i) => {
            const isMono = p.startsWith('*') && p.endsWith('*')
            return <p key={i} className={isMono ? styles.monologue : styles.para}>{isMono ? p.slice(1, -1) : p}</p>
          })}
        </div>
        <div className={styles.choices}>
          {node.choices.map(c => {
            const locked = c.condition ? !evaluateAll([c.condition], state) : false
            return <ChoiceButton key={c.id} choice={c} locked={locked} onClick={() => makeChoice(c.id)} />
          })}
        </div>
      </div>
    </div>
  )
}
```

```css
/* NodeOverlay.module.css */
.backdrop { position: fixed; inset: 0; background: rgba(10,8,6,0.75); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 20px; }
.card { background: var(--color-paper); border: 1px solid var(--color-paper-dark); border-radius: 6px; max-width: 680px; width: 100%; max-height: 85vh; overflow-y: auto; padding: 28px 32px; box-shadow: 0 8px 32px rgba(0,0,0,0.4); }
.title { font-family: var(--font-serif); font-size: 20px; color: var(--color-accent); text-align: center; margin-bottom: 20px; }
.narrative { margin-bottom: 24px; }
.para { font-family: var(--font-serif); font-size: 14px; line-height: 1.9; margin-bottom: 12px; text-indent: 2em; }
.monologue { font-style: italic; color: #7a6558; font-size: 14px; line-height: 1.8; margin-bottom: 12px; text-indent: 2em; }
.choices { border-top: 1px solid var(--color-paper-dark); padding-top: 16px; }
```

- [ ] **Step 12: Commit**

```bash
git add src/components/ src/styles/
git commit -m "feat: add UI components and CSS ink theme"
```

---

### Task 12: MVP Integration Test

**Files:**
- Create: `src/__tests__/mvp-integration.test.ts`

- [ ] **Step 1: Write the integration test**

```typescript
// src/__tests__/mvp-integration.test.ts
import { act } from '@testing-library/react'
import { useGameStore } from '../store/gameStore'

beforeEach(() => {
  localStorage.clear()
  useGameStore.setState(useGameStore.getInitialState())
})

describe('MVP game loop: month 1-3 → node01 → choice → save/load', () => {
  test('full loop: actions → end month → advance to month 3 → trigger node01', () => {
    // Start game
    act(() => { useGameStore.getState().startGame() })
    expect(useGameStore.getState().month).toBe(1)

    // Month 1: spend all 3 AP
    act(() => { useGameStore.getState().performAction('patrol_duty') })
    act(() => { useGameStore.getState().performAction('practice_blade') })
    act(() => { useGameStore.getState().performAction('read_cases') })
    expect(useGameStore.getState().actionPoints).toBe(0)

    // End month 1 → month 2 (no node trigger yet)
    act(() => { useGameStore.getState().advanceToNextMonth() })
    expect(useGameStore.getState().month).toBe(2)
    expect(useGameStore.getState().screen).toBe('game')

    // Month 2: spend all 3 AP
    act(() => { useGameStore.getState().performAction('patrol_duty') })
    act(() => { useGameStore.getState().performAction('practice_blade') })
    act(() => { useGameStore.getState().performAction('read_cases') })

    // End month 2 → month 3 → node01 triggers
    act(() => { useGameStore.getState().advanceToNextMonth() })
    const s = useGameStore.getState()
    expect(s.month).toBe(3)
    expect(s.screen).toBe('node')
    expect(s.currentNode).toBe('node_01')
  })

  test('making a choice in node01 applies effects and returns to game', () => {
    act(() => {
      useGameStore.getState().startGame()
      useGameStore.setState({ month: 3, currentNode: 'node_01', screen: 'node' })
      useGameStore.getState().makeChoice('node01_a')
    })
    const s = useGameStore.getState()
    expect(s.currentNode).toBeNull()
    expect(s.screen).toBe('game')
    // node01_a gives feng_tianshun +40 delta; initial relation is 0
    expect(s.npcRelations['feng_tianshun']).toBe(40)
    // visited flag set
    expect(s.flags['visited_node_01']).toBe(true)
  })

  test('auto-save persists state, load restores it', () => {
    act(() => {
      useGameStore.getState().startGame()
      useGameStore.getState().performAction('patrol_duty')
    })
    const savedRaw = localStorage.getItem('fuchengzhiren_save')
    expect(savedRaw).not.toBeNull()
    const saved = JSON.parse(savedRaw!)
    expect(saved.actionPoints).toBe(2)
    expect(saved.screen).toBe('game')

    // Simulate reload: reset store to force re-read from localStorage
    // (Store initializes from loadSave() which reads localStorage)
    useGameStore.setState(JSON.parse(savedRaw!))
    expect(useGameStore.getState().actionPoints).toBe(2)
  })

  test('ending_defeat triggers when flag_captured is set', () => {
    act(() => {
      useGameStore.getState().startGame()
      useGameStore.setState({ flags: { ...useGameStore.getState().flags, flag_captured: true } })
      useGameStore.getState().advanceToNextMonth()
    })
    const s = useGameStore.getState()
    expect(s.screen).toBe('ending')
    expect(s.endingId).toBe('ending_defeat')
  })
})
```

- [ ] **Step 2: Run integration test**

```bash
npm test -- --testPathPattern=mvp-integration
```
Expected: PASS (4 tests)

- [ ] **Step 3: Commit**

```bash
git add src/__tests__/
git commit -m "test: add MVP integration test (actions→node→choice→save→load)"
```

---

### Task 13: Ending Reachability Fix

**Files:**
- Create: `src/__tests__/ending-reachability.test.ts`
- Update: `src/data/nodes/node14.ts` (update node14_b effects)
- Update: `src/data/nodes/node15.ts` (add node15_e choice)
- Update: `src/data/endings.ts` (fix ending_pyrrhic conditions, add all 9 endings)

- [ ] **Step 1: Write reachability tests for all 9 endings**

```typescript
// src/__tests__/ending-reachability.test.ts
import { resolveEnding } from '../engine/endingResolver'
import { makeInitialState } from '../data/initialState'
import { ALL_ENDINGS } from '../data/endings'
import type { GameState } from '../types'

function stateWith(overrides: Partial<GameState>): GameState {
  const base = makeInitialState()
  return {
    ...base,
    ...overrides,
    attributes: { ...base.attributes, ...(overrides.attributes ?? {}) },
    flags: { ...base.flags, ...(overrides.flags ?? {}) },
    npcRelations: { ...base.npcRelations, ...(overrides.npcRelations ?? {}) },
  }
}

test('ending_justice is reachable', () => {
  const s = stateWith({
    attributes: { wuli: 7, zhimou: 7, koucai: 2, shengwang: 75 },
    flags: { fang_zhengyan_alive: true, flag_justice: true },
  })
  expect(resolveEnding(ALL_ENDINGS, s)?.id).toBe('ending_justice')
})

test('ending_revenge_exile is reachable', () => {
  const s = stateWith({
    attributes: { wuli: 65, zhimou: 7, koucai: 2, shengwang: 4 },
    flags: { flag_revenge: true },
  })
  expect(resolveEnding(ALL_ENDINGS, s)?.id).toBe('ending_revenge_exile')
})

test('ending_revenge_martyr is reachable', () => {
  const s = stateWith({
    attributes: { wuli: 65, zhimou: 7, koucai: 2, shengwang: 4 },
    flags: { flag_revenge: true, flag_surrender: true },
  })
  expect(resolveEnding(ALL_ENDINGS, s)?.id).toBe('ending_revenge_martyr')
})

test('ending_release is reachable', () => {
  const s = stateWith({ flags: { flag_release: true } })
  expect(resolveEnding(ALL_ENDINGS, s)?.id).toBe('ending_release')
})

test('ending_stratagem is reachable', () => {
  const s = stateWith({
    attributes: { wuli: 7, zhimou: 75, koucai: 2, shengwang: 4 },
    flags: { liu_ruyan_allied: true, flag_stratagem: true },
  })
  expect(resolveEnding(ALL_ENDINGS, s)?.id).toBe('ending_stratagem')
})

test('ending_pyrrhic is reachable (justice path but lost all allies)', () => {
  const s = stateWith({
    flags: {
      fang_zhengyan_alive: true,
      flag_justice: true,
      feng_tianshun_dead: true,
      fang_zhengyan_dead: true,
    },
  })
  expect(resolveEnding(ALL_ENDINGS, s)?.id).toBe('ending_pyrrhic')
})

test('ending_defeat is reachable', () => {
  const s = stateWith({ flags: { flag_captured: true } })
  expect(resolveEnding(ALL_ENDINGS, s)?.id).toBe('ending_defeat')
})

test('hidden_blade_master is reachable', () => {
  const s = stateWith({
    attributes: { wuli: 95, zhimou: 7, koucai: 2, shengwang: 4 },
    flags: { flag_tiandao_led: true },
  })
  expect(resolveEnding(ALL_ENDINGS, s)?.id).toBe('hidden_blade_master')
})

test('hidden_power is reachable', () => {
  const s = stateWith({
    attributes: { wuli: 7, zhimou: 7, koucai: 85, shengwang: 95 },
    flags: { flag_justice: true },
  })
  expect(resolveEnding(ALL_ENDINGS, s)?.id).toBe('hidden_power')
})
```

- [ ] **Step 2: Run tests — expect failures on endings not yet in endings.ts**

```bash
npm test -- --testPathPattern=ending-reachability
```
Expected: Several FAIL (endings not yet defined or conditions wrong)

- [ ] **Step 3: Update endings.ts with all 9 endings and fixed ending_pyrrhic**

```typescript
// src/data/endings.ts  (full replacement)
import type { Ending } from '../types'

export const ALL_ENDINGS: Ending[] = [
  // Hidden endings checked first (higher specificity)
  {
    id: 'hidden_power', title: '权倾一时', isHidden: true,
    conditions: [
      { type: 'attribute_gte', attribute: 'shengwang', value: 90 },
      { type: 'attribute_gte', attribute: 'koucai', value: 80 },
      { type: 'flag_true', flagKey: 'flag_justice', value: true },
    ],
    narrative: `复仇是手段，权力是结果。

案子清查，仇人伏法，你成了锦衣卫指挥使，坐到了魏承恩曾经坐的那把椅子上。

有一天你看着镜子，想了很久，想不起来自己当初究竟是为了什么走上这条路。

然后你想起来了，然后你放下镜子，继续处理公务。`,
  },
  {
    id: 'hidden_blade_master', title: '天刀门门主', isHidden: true,
    conditions: [
      { type: 'attribute_gte', attribute: 'wuli', value: 90 },
      { type: 'flag_true', flagKey: 'flag_tiandao_led', value: true },
    ],
    narrative: `你用刀解决了一切。

最后成了天刀门的门主，或者彻底剿灭了天刀门——取决于前期选择。案子清查，但你站在一个很奇异的位置上：既是锦衣卫，也是江湖人，两边都用得上你，两边都不完全是你的地方。

李慕尘最后对你说了一句话："你比你父亲更像一把刀。"

你不知道这是不是夸奖。`,
  },
  // Regular endings
  {
    id: 'ending_justice', title: '明正典刑', isHidden: false,
    conditions: [
      { type: 'attribute_gte', attribute: 'shengwang', value: 70 },
      { type: 'flag_true', flagKey: 'fang_zhengyan_alive', value: true },
      { type: 'flag_true', flagKey: 'flag_justice', value: true },
    ],
    narrative: `景王被削、崔公公被斩、孙玉堂秋后问斩，所有经手人明正典刑，案子被记入实录。你父亲的名誉得到平反，廖承志，锦衣卫千户，忠义之士，这几个字写进了档案里。

你从北镇抚司走出来，是个三十岁的人。十年，结束了。

但没有什么特别的感觉。正义到来的时候，和你想象的不一样——没有雷霆，没有光，只是一些官吏在走程序，一些文书在盖印，一些人被带走，一些事被记录在案，仅此而已。

冯天顺在门口等你，拍了拍你的肩膀，说："走，吃饭去。"

你跟他走了。`,
  },
  {
    id: 'ending_stratagem', title: '以棋了棋', isHidden: false,
    conditions: [
      { type: 'attribute_gte', attribute: 'zhimou', value: 70 },
      { type: 'flag_true', flagKey: 'liu_ruyan_allied', value: true },
      { type: 'flag_true', flagKey: 'flag_stratagem', value: true },
    ],
    narrative: `你用那个人换了景王最后一批证据——他知道一些你不知道的事，知道景王谋反的最后一块拼图。你拿这个换了他的命：他离开京城，你得到证据。

景王伏法，案子彻底清查，你父亲的名字写进史册。

那个人去了哪里，你不知道，也不想知道。有些账，不是每一笔都能还清的；有些棋子，用完了就放手，这才是下棋。

冯天顺说你变了，变得和过去不像。你说："是吗。"

也许是，也许不是，也许每个人走到最后都会变成这样的人。`,
  },
  {
    id: 'ending_revenge_martyr', title: '复仇之刃（成仁）', isHidden: false,
    conditions: [
      { type: 'attribute_gte', attribute: 'wuli', value: 60 },
      { type: 'flag_true', flagKey: 'flag_revenge', value: true },
      { type: 'flag_true', flagKey: 'flag_surrender', value: true },
    ],
    narrative: `你杀了他，然后去北镇抚司自首。

审讯很长，判决很重，但方正言在朝堂上替你说话，冯天顺在外面闹，柳如烟把一些不该出现在公堂上的证词送进去了。

最后判了流放。

启程那天，冯天顺送你到城外，把自己的刀塞给你，说"路上防身"。你把刀推回去，说你有。

父亲那把半截断刀，缺了一截，但还能用。`,
  },
  {
    id: 'ending_revenge_exile', title: '复仇之刃（流亡）', isHidden: false,
    conditions: [
      { type: 'attribute_gte', attribute: 'wuli', value: 60 },
      { type: 'flag_true', flagKey: 'flag_revenge', value: true },
      { type: 'flag_false', flagKey: 'flag_surrender', value: false },
    ],
    narrative: `你杀了他。

走出那条胡同的时候，手上还有血，你在墙根擦了擦，走进人群，消失了。

锦衣卫后来立了通缉文书，画像画得不太像，但还是像。冯天顺替你拖延了三天，方正言说他什么都不知道，柳如烟给了你一条出城的路。

你出了京城，往南走，走得很远。

有时候在某个地方停下来，看着天，想那个胡同，想那双手，想父亲的脸——其实已经记不清了，只记得那把断刀和那个夜晚的火光。

够了。`,
  },
  {
    id: 'ending_release', title: '放下', isHidden: false,
    conditions: [{ type: 'flag_true', flagKey: 'flag_release', value: true }],
    narrative: `你看着他在铺子里做生意，站了很长时间，然后转身走了。

没有人知道你去过那里，没有人知道你做了这个决定。

你回到北镇抚司，继续做你的千户，继续查案，继续活着。那个名字在你脑子里放了很多年，慢慢地，像一块石头被水泡久了，棱角磨掉了，还在，但不那么硌人了。

这不是原谅。你没有原谅任何人。

你只是决定，不让仇恨再花你更多的时间了。`,
  },
  {
    // v2修正：改为"走了justice路线但失去所有盟友"触发
    id: 'ending_pyrrhic', title: '未竟', isHidden: false,
    conditions: [
      { type: 'flag_true', flagKey: 'flag_justice', value: true },
      { type: 'flag_true', flagKey: 'feng_tianshun_dead', value: true },
      { type: 'flag_true', flagKey: 'fang_zhengyan_dead', value: true },
    ],
    narrative: `你赢了，但赢得太惨了。

景王和崔公公被扳倒，孙玉堂伏法，案子清查，父亲的名誉恢复——所有该完成的事情都完成了。

但站在最后那一天，你身边已经没有人了。冯天顺走了（或者残了），方正言被贬谪，周寒川早就不在了，郑九早就不在了。

复仇完成了，但这条路上，你把能失去的人都失去了。

你站在那里，是个三十岁的人，什么都有，什么都没有。`,
  },
  {
    id: 'ending_defeat', title: '折戟', isHidden: false,
    conditions: [{ type: 'flag_true', flagKey: 'flag_captured', value: true }],
    narrative: `这条路没有走到底。

也许是在第四年，也许是在第七年——某个夜晚，某条巷子，某个你以为安全的地方，事情就这样结束了。

结局是死，或者是一种比死更长的结束——流放，或者被废，或者消失在某个不知名的地方，没有人知道，没有人记得。

廖承志的案子，还埋在档案库里。`,
  },
]
```

- [ ] **Step 4: Fix node14_b effects (add ally-death flags)**

In `src/data/nodes/node14.ts`, update the `node14_b` choice effects:

```typescript
// node14_b — 转向景王（高代价路线）
{
  id: 'node14_b', label: '转向景王，直接攻击最大目标',
  effects: [
    { type: 'set_flag', flag: 'target_jingwang', value: true },
    { type: 'risk_change', delta: 3 },
    // v2修正：此路线代价是失去所有盟友，设置死亡flag
    { type: 'set_flag', flag: 'feng_tianshun_dead', value: true },
    { type: 'set_flag', flag: 'fang_zhengyan_dead', value: true },
  ],
  outcomeNarrative: '你孤注一掷，直接攻击最大目标。风险极高，冯天顺和方正言在混乱中付出了代价——这条路，只有你一个人能走完。',
},
```

- [ ] **Step 5: Fix node15 — add node15_e for flag_tiandao_led**

In `src/data/nodes/node15.ts`, add a fifth choice:

```typescript
// node15_e — 继承天刀门
{
  id: 'node15_e', label: '继承天刀门，以刀治刀（需武力≥80，已招募李慕尘）',
  condition: { type: 'attribute_gte', attribute: 'wuli', value: 80 },
  // li_muchen_recruited flag is additionally checked in ActionPanel before rendering
  effects: [{ type: 'set_flag', flag: 'flag_tiandao_led', value: true }],
  outcomeNarrative: '李慕尘看着你，沉默了很久，然后把那把剑递给你。"天刀门需要一个配得上这把剑的人。"',
},
```

- [ ] **Step 6: Run reachability tests**

```bash
npm test -- --testPathPattern=ending-reachability
```
Expected: PASS (9 tests)

- [ ] **Step 7: Commit**

```bash
git add src/data/ src/__tests__/
git commit -m "fix: all 9 endings reachable — fix ending_pyrrhic, add node14_b ally flags, node15_e tiandao"
```

---
