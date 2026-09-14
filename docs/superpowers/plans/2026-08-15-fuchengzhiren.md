# 《复仇之刃》Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Ming Dynasty text RPG PWA — player controls 廖威达 through 120 months of monthly actions and branching story nodes, culminating in one of 12 endings.

**Architecture:** Zustand store holds all GameState; a pure engine layer (conditionEvaluator, effectApplier, nodeResolver, endingResolver) transforms state immutably; React components read from the store and dispatch actions. Story data (nodes, actions, endings) is static TypeScript data imported by the engine. Auto-save writes to localStorage after every state change.

**Tech Stack:** React 18, TypeScript, Vite 5, vite-plugin-pwa (Workbox), Zustand 5, CSS Modules, Vitest + React Testing Library

---

### Task 2: TypeScript Types

**Files:**
- Create: `src/types/game.ts`
- Create: `src/types/index.ts`
- Create: `src/types/__tests__/game.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/types/__tests__/game.test.ts`:
```typescript
import type { GameState, Attributes, NpcId } from '../game'

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

export type EffectType =
  | 'attribute_change' | 'wealth_change'
  | 'npc_relation_change' | 'risk_change'
  | 'set_flag' | 'add_clue'

export interface Effect {
  type: EffectType
  attribute?: keyof Attributes
  npcId?: NpcId
  flagKey?: string
  clue?: Clue
  value: number | boolean
}

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
Expected: PASS (1 test)

- [ ] **Step 6: Commit**

```bash
git add src/types/
git commit -m "feat: add core TypeScript type definitions"
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
        name: '复仇之刃',
        short_name: '复仇之刃',
        description: '明朝复仇文字RPG',
        theme_color: '#1a1a2e',
        background_color: '#1a1a2e',
        display: 'standalone',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    globals: true,
  },
})
```

- [ ] **Step 4: Create src/test-setup.ts**

```typescript
import '@testing-library/jest-dom'
```

- [ ] **Step 5: Add test scripts to package.json**

In the `"scripts"` section of package.json, add:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 6: Verify dev server starts**

```bash
npm run dev
```
Expected: Vite dev server starts on http://localhost:5173 with no TypeScript errors.

- [ ] **Step 7: Commit**

```bash
git init
git add .
git commit -m "feat: scaffold React18 + TypeScript + Vite + PWA"
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
import type { GameState, Attributes, NpcId } from '../game'

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

export type EffectType =
  | 'attribute_change' | 'wealth_change'
  | 'npc_relation_change' | 'risk_change'
  | 'set_flag' | 'add_clue'

export interface Effect {
  type: EffectType
  attribute?: keyof Attributes
  npcId?: NpcId
  flagKey?: string
  clue?: Clue
  value: number | boolean
}

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
Expected: PASS (1 test)

- [ ] **Step 6: Commit**

```bash
git add src/types/
git commit -m "feat: add core TypeScript type definitions"
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

## Task 4: Engine — Effect Applier (TDD)

**Files:** `src/engine/effectApplier.ts`, `src/engine/__tests__/effectApplier.test.ts`

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
test('set_flag sets boolean flag', () => {
  expect(applyEffect(s, { type: 'set_flag', flag: 'x', value: true }).flags['x']).toBe(true)
})
test('add_clue no duplicates', () => {
  const clue = { id: 'c1', text: '线索', clarity: 'vague' as const }
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
import { GameState, Effect } from '../types'

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
git commit -m "feat: add effect applier"
```

---

## Task 5: Engine — Node Resolver + Ending Resolver (TDD)

**Files:** `src/engine/nodeResolver.ts`, `src/engine/endingResolver.ts`, `src/engine/index.ts`, `src/engine/__tests__/nodeResolver.test.ts`, `src/engine/__tests__/endingResolver.test.ts`

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
    conditions: [{ type: 'attribute_gte', attribute: 'shengwang', value: 70 }, { type: 'flag_true', flagKey: 'flag_justice', value: true }],
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

## Task 6: Game Data — Initial State + NPCs

**Files:** `src/data/initialState.ts`, `src/data/npcs.ts`

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
    riskLevel: 1, flags: {}, currentNode: null,
    screen: 'prologue', endingId: null,
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
git commit -m "feat: add initial state and NPC data"
```

---

## Task 7: Game Data — Story Nodes 1-4 (Stage 1)

**Files:** `src/data/nodes/node01.ts`, `node02.ts`, `node03.ts`, `node04.ts`, `src/data/nodes/index.ts`

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

- [ ] **Step 2: Create node02.ts — 祥云商行案（第12月）**

```typescript
// src/data/nodes/node02.ts
import type { StoryNode } from '../../types'

export const node02: StoryNode = {
  id: 'node_02', month: 12, title: '祥云商行案',
  trigger: [{ type: 'month_gte', value: 12 }],
  narrative: `崇祯元年，十二月。

周寒川把一个卷宗扔在你桌上："祥云商行账房，死了，死状可疑，你去查。"

账房叫钱福，死在商行后院的仓库里，脖子上有勒痕，现场布置成意外失足的样子，但手法粗糙，骗不过锦衣卫的眼睛。

你在他床板下找到一张纸条，字迹潦草，像是仓皇中写就：

"十五年前，三十万两，景……"

*三十万两。十五年前。景。*

*父亲死于十五年前。父亲查的是商税贪腐。*

*这张纸条和父亲有关。*`,
  choices: [
    {
      id: 'node02_a', label: '如实上报周寒川，交出纸条',
      effects: [
        { type: 'npc_relation_change', npcId: 'zhou_hanchuan', delta: 10 },
        { type: 'add_clue', clue: { id: 'clue_xiangshang', label: '祥云商行纸条', clarity: 'vague', description: '十五年前，三十万两，景……' } },
      ],
      outcomeNarrative: '周寒川把案子压下去了，拍了拍你的肩："先站稳脚跟。"他开始暗中留意你，提供保护。',
    },
    {
      id: 'node02_b', label: '隐瞒纸条，自己留着调查',
      effects: [
        { type: 'add_clue', clue: { id: 'clue_xiangshang', label: '祥云商行纸条', clarity: 'vague', description: '十五年前，三十万两，景……' } },
        { type: 'set_flag', flag: 'independent_route', value: true },
      ],
      outcomeNarrative: '你把纸条藏好，上报时只字未提。这条线索只有你知道，更安全，但更孤独。',
    },
    {
      id: 'node02_c', label: '向魏承恩汇报，交出纸条',
      effects: [
        { type: 'npc_relation_change', npcId: 'wei_chengen', delta: 5 },
        { type: 'set_flag', flag: 'clue_lost_to_wei', value: true },
      ],
      outcomeNarrative: '魏承恩接过纸条，眼神一闪，随即笑道："好，我来处理。"纸条消失了，线索断了。',
    },
    {
      id: 'node02_d', label: '先独自深入调查，再决定上报对象',
      effects: [
        { type: 'add_clue', clue: { id: 'clue_xiangshang_detail', label: '祥云商行详细线索', clarity: 'clear', description: '三十万两，景王府，孙玉堂经手，天启六年' } },
        { type: 'risk_change', delta: 1 },
      ],
      outcomeNarrative: '你花了两个月暗中追查，把线索拼得更完整，但风险也随之上升。',
    },
  ],
}
```

- [ ] **Step 3: Create node03.ts — 第一次碰壁（第18月）**

```typescript
// src/data/nodes/node03.ts
import type { StoryNode } from '../../types'

export const node03: StoryNode = {
  id: 'node_03', month: 18, title: '第一次碰壁',
  trigger: [{ type: 'month_gte', value: 18 }],
  narrative: `崇祯二年，六月。

你跟踪那辆马车跟了半个月，今天它终于停在了孙府门口。

你刚想靠近，身后有人说："跟了多久了，廖百户？"

孙玉堂站在你身后，笑着，手里捧着一杯茶，像是早就在等你。

书房里，他慢悠悠地说："你父亲当年也很能干，就是……太认真了，认真的人走不远。"

然后你被送出去了。

当夜回到住处，桌上多了一个包裹——父亲的半截断刀，和一封信："查到这里为止。否则，下一个包裹里装的就是你的东西。"`,
  choices: [
    {
      id: 'node03_a', label: '暂时退步，蛰伏等待时机',
      effects: [{ type: 'risk_change', delta: -1 }],
      outcomeNarrative: '你装作受了威胁，停止明面上的调查。风险降低，但对方开始轻视你。',
    },
    {
      id: 'node03_b', label: '当面不动声色，暗中继续查（需武力≥40）',
      condition: { type: 'attribute_gte', attribute: 'wuli', value: 40 },
      effects: [
        { type: 'set_flag', flag: 'showed_no_fear_to_sun', value: true },
        { type: 'risk_change', delta: 1 },
      ],
      outcomeNarrative: '你走出孙府时背脊挺直，没有一丝退缩的样子。孙玉堂盯着你的背影，眼神复杂。',
    },
    {
      id: 'node03_c', label: '向周寒川汇报，请求保护',
      effects: [
        { type: 'npc_relation_change', npcId: 'zhou_hanchuan', delta: 10 },
        { type: 'set_flag', flag: 'zhou_knows_sun_threat', value: true },
      ],
      outcomeNarrative: '周寒川听完，沉默片刻，说："我知道了。你继续查，但要更小心。"他安排了人暗中护着你。',
    },
    {
      id: 'node03_d', label: '接受威胁，暗中谋划反制',
      effects: [
        { type: 'set_flag', flag: 'planning_counter_against_sun', value: true },
        { type: 'attribute_change', attribute: 'zhimou', delta: 2 },
      ],
      outcomeNarrative: '表面认怂，心里已经开始盘算如何反制。这条路更难，但胜算可能更大。',
    },
  ],
}
```

- [ ] **Step 4: Create node04.ts — 意外突破（第24月）**

```typescript
// src/data/nodes/node04.ts
import type { StoryNode } from '../../types'

export const node04: StoryNode = {
  id: 'node_04', month: 24, title: '意外突破',
  trigger: [{ type: 'month_gte', value: 24 }],
  narrative: `崇祯三年，十二月，冬夜。

你和冯天顺喝了一夜的酒，什么都没查到，什么话都说不出来，就这么喝着。

深夜回到住处，门槛边放着一个油纸包，没有署名，没有来路。

你打开来——是账册残页，记录着一笔款项：三十万两白银，由祥云商行经手，最终流入景王府别院。时间：天启六年。

附了一张纸条："你父亲就是因为查到这个被杀的。小心孙玉堂。——一个想弥补的人"

*天启六年。父亲死于天启六年。三十万两。景王府。孙玉堂经手。*`,
  choices: [
    {
      id: 'node04_a', label: '藏好线索，继续独自调查',
      effects: [
        { type: 'add_clue', clue: { id: 'clue_ledger', label: '账册残页', clarity: 'confirmed', description: '三十万两，景王府别院，天启六年，孙玉堂经手' } },
        { type: 'set_flag', flag: 'independent_route', value: true },
      ],
      outcomeNarrative: '你把账册残页和那张纸条都藏好，决定不告诉任何人，独自查清楚。',
    },
    {
      id: 'node04_b', label: '分享给周寒川，共同推进',
      effects: [
        { type: 'add_clue', clue: { id: 'clue_ledger', label: '账册残页', clarity: 'confirmed', description: '三十万两，景王府别院，天启六年，孙玉堂经手' } },
        { type: 'npc_relation_change', npcId: 'zhou_hanchuan', delta: 15 },
        { type: 'risk_change', delta: -1 },
      ],
      outcomeNarrative: '周寒川看完久久不语，说："这条路，比我们想的都深。但你不是一个人。"',
    },
    {
      id: 'node04_c', label: '立刻去找方正言，打算尽快弹劾',
      effects: [
        { type: 'add_clue', clue: { id: 'clue_ledger', label: '账册残页', clarity: 'confirmed', description: '三十万两，景王府别院，天启六年，孙玉堂经手' } },
        { type: 'set_flag', flag: 'fang_contact_early', value: true },
        { type: 'risk_change', delta: 1 },
      ],
      outcomeNarrative: '方正言说："证据还不够，但我已经开始写了。"动作太急，对方开始有所察觉，风险上升。',
    },
    {
      id: 'node04_d', label: '先去档案库核实这笔账的真实性',
      effects: [
        { type: 'add_clue', clue: { id: 'clue_ledger', label: '账册残页', clarity: 'confirmed', description: '三十万两，景王府别院，天启六年，孙玉堂经手' } },
        { type: 'add_clue', clue: { id: 'clue_tax_records', label: '商税档案', clarity: 'confirmed', description: '大规模商税贪腐记录，从天启年间至今' } },
        { type: 'attribute_change', attribute: 'zhimou', delta: 2 },
      ],
      outcomeNarrative: '你在档案库待了三天，找到了大量商税异常记录，把账册残页的内容坐实了。',
    },
  ],
}
```

- [ ] **Step 5: Create nodes/index.ts**

```typescript
// src/data/nodes/index.ts
export { node01 } from './node01'
export { node02 } from './node02'
export { node03 } from './node03'
export { node04 } from './node04'

import { node01 } from './node01'
import { node02 } from './node02'
import { node03 } from './node03'
import { node04 } from './node04'

export const ALL_NODES = [node01, node02, node03, node04]
```

- [ ] **Step 6: Commit**

```bash
git add src/data/nodes/
git commit -m "feat: add story nodes 1-4 (stage 1)"
```

---

## Task 8: Game Data — Story Nodes 5-8 (Stage 2)

**Files:** `src/data/nodes/node05.ts`, `node06.ts`, `node07.ts`, `node08.ts`

- [ ] **Step 1: Create node05.ts — 孙玉堂登门（第30月）**

```typescript
// src/data/nodes/node05.ts
import type { StoryNode } from '../../types'

export const node05: StoryNode = {
  id: 'node_05', month: 30, title: '孙玉堂登门',
  trigger: [{ type: 'month_gte', value: 30 }],
  narrative: `崇祯三年，九月，秋。

门房来报的时候，你正在磨刀。

刀是父亲留下的那半截——断口齐整，像被人一刀劈断，不像折的，是斩的。你每隔几天就磨一次，不是因为需要，是因为手在动的时候，脑子能停下来。

"百户大人，外头……来了位客人。孙……孙玉堂，说是景王府的管家，说是特来……"

你的手停住了。

孙玉堂走进院子的时候，你才明白什么叫"最危险的样子"。五十岁的男人，圆脸，微胖，梳着整齐的发髻，穿一件洗得发白的青色直裰，手里捧着个点心匣子，笑着走进来，步子不紧不慢，像走进自己家一样自然。

你们聊了半个时辰，聊京城秋天来得早，聊今年西北旱情，聊你前途无量。等待是一种折磨——你陪这个人喝茶，说废话，而这个人十五年前雇了刀客杀了你的父亲、杀了你的母亲、烧了你的家，今天坐在你面前，把茶喝得很香。

终于，第三盏茶的时候，他随口问："听说廖百户最近在查商税的事？"

"奉命查了几个走私的小商户，都是些不起眼的小案。"

他点了点头，站起身，叹了口气，语气里带着惋惜："当年有位廖千户，和我有过一段缘分，那是个了不起的人，查案的眼光，没得说。只可惜，太认真了。认真的人，有时候走不远。"

他转头看你。就那么看着你。那双眼睛里没有恶意，甚至没有威胁，只有一种很平静的、很温和的审视——像老匠人在看一件新出炉的器物，认真端详，心里已经在盘算，若是打碎了，可惜不可惜，值不值得留。

送他出门，他把那盒点心塞进你手里："带着吃，枣泥的，我家厨子做的，甜。"

然后他上了轿，轿子消失在街角。

*半截刀还在桌上。你坐下去，把刀拿起来，继续磨。你什么都没有想。你只是磨刀。*`,
  choices: [
    {
      id: 'node05_a', label: '压下去，继续查',
      effects: [{ type: 'risk_change', delta: 1 }],
      outcomeNarrative: '下月调查继续，风险上升一级。',
    },
    {
      id: 'node05_b', label: '找周寒川汇报',
      effects: [
        { type: 'npc_relation_change', npcId: 'zhou_hanchuan', delta: 10 },
        { type: 'set_flag', flag: 'zhou_warned_about_sun_visit', value: true },
      ],
      outcomeNarrative: '周寒川好感+10，获得新线索，但他开始担心你。',
    },
    {
      id: 'node05_c', label: '找冯天顺喝酒',
      effects: [
        { type: 'npc_relation_change', npcId: 'feng_tianshun', delta: 5 },
        { type: 'set_flag', flag: 'feng_knows_something_wrong', value: true },
      ],
      outcomeNarrative: '冯天顺察觉异常，主动问你出了什么事。',
    },
    {
      id: 'node05_d', label: '当夜潜入孙府附近踩点',
      effects: [
        { type: 'risk_change', delta: 2 },
        { type: 'add_clue', clue: { id: 'clue_sun_manor', label: '孙府布防情况', clarity: 'clear', description: '孙府防卫严密，有常驻护卫十余人，深夜有换岗' } },
      ],
      outcomeNarrative: '获得情报，但被发现概率大幅提升，风险+2。',
    },
  ],
}
```

- [ ] **Step 2: Create node06.ts — 棋子（第36月）**

```typescript
// src/data/nodes/node06.ts
import type { StoryNode } from '../../types'

export const node06: StoryNode = {
  id: 'node_06', month: 36, title: '棋子',
  trigger: [{ type: 'month_gte', value: 36 }],
  narrative: `崇祯四年，三月，春雨。

你在茶楼坐了三天。不是因为茶好，是因为祥云商行的账房每隔三天来这里谈一笔账，和同一个人，坐同一张桌，喝同一种茶。这人叫郑九，三十岁，祥云商行外账房，长一张苦瓜脸，烟瘾大，手指熏得发黄。

你查过他的底——父亲是落魄秀才，欠了高利贷，已经催上门了。妻子生了病，二两银子的汤药钱凑不出来。他替孙玉堂管账，月俸一两二钱，不够用，永远不够用。

第三天，你在他身边坐下去，叫了壶热茶，推到他面前。

"郑账房，你烟瘾很大，天气一湿就犯，对吧？"

他抬起头看你。那双眼睛里有恐慌，有戒备，有一种认出了锦衣卫飞鱼服的人才有的慌乱。

"你父亲的债，我替你还了。"

他沉默了很长时间。最后他拿起那碗茶，喝了一口。

从这一天起，你有了一颗棋子。郑九给你的第一条消息：账上有一笔对不上的数——三千两，进账走的是"布匹"，但收货方是景王府的一个别院。第二条消息：孙玉堂最近频繁接触一个叫卜成的人，东厂的人，崔公公身边的一条狗。

*商帮、王府、东厂——三根线，拧成一根。父亲当年查到的，就是这个。*`,
  choices: [
    {
      id: 'node06_a', label: '继续养着郑九，等更深的消息',
      effects: [
        { type: 'set_flag', flag: 'zheng_jiu_recruited', value: true },
        { type: 'wealth_change', delta: -5 },
      ],
      outcomeNarrative: '下个月情报+，但维护成本增加（每月5两）。郑九成为长期线人。',
    },
    {
      id: 'node06_b', label: '顺着卜成这条线往下查',
      effects: [
        { type: 'risk_change', delta: 2 },
        { type: 'set_flag', flag: 'dongchang_line_active', value: true },
      ],
      outcomeNarrative: '触发东厂支线，风险大幅上升。',
    },
    {
      id: 'node06_c', label: '把布匹账目线索交给周寒川',
      effects: [
        { type: 'npc_relation_change', npcId: 'zhou_hanchuan', delta: 10 },
        { type: 'add_clue', clue: { id: 'clue_bumu_account', label: '布匹账目', clarity: 'clear', description: '三千两以布匹名义流入景王府别院' } },
      ],
      outcomeNarrative: '周寒川好感+10，他帮你压下风险，但消息可能传出去。',
    },
    {
      id: 'node06_d', label: '拿着证据去找方正言',
      effects: [
        { type: 'set_flag', flag: 'fang_line_active', value: true },
        { type: 'risk_change', delta: 1 },
      ],
      outcomeNarrative: '御史线开启，弹劾可能性+，但动作太早，孙玉堂会察觉，风险+1。',
    },
  ],
}
```

- [ ] **Step 3: Create node07.ts — 方正言联盟（第42月）**

```typescript
// src/data/nodes/node07.ts
import type { StoryNode } from '../../types'

export const node07: StoryNode = {
  id: 'node_07', month: 42, title: '方正言联盟',
  trigger: [{ type: 'month_gte', value: 42 }],
  narrative: `崇祯四年，九月，初秋。

方正言找上你，不是你去找他的。

他派了个书童，送来一张帖子，说"偶有小叙之意，不知廖百户可有闲暇"。措辞文雅，像是寻常文人的应酬，但落款旁边加了一行小字："已知祥云商行事，亦知廖百户之意。"

你去赴约的时候，带了刀。

方正言住在一条僻静的胡同里，宅子不大，院子里种了几棵竹。书房里坐着个五十岁左右的男人，清瘦，胡须修整，穿一件半旧的青袍，正在磨墨，见你进来，放下墨锭，站起来行礼。

"祥云商行过账景王府的那笔布匹钱，三千两，是今年三月的事。我有一个学生，在户部行走，偶尔帮我留意一些账目往来。廖百户在查商税，我在查田税——殊途，但同归。"

"你想怎样，弹劾？"

"现在弹劾，没有用。我需要的是实证——账册，款项流向，具体的数字，经手人画押过的东西。我听说廖百户手里有线索。"

"你听说得不准，我手里有的是半个线索。"

"半个够了，再加上我这半个，可以拼出一个完整的账目脉络。"

你们谈了一个时辰。出门的时候，竹叶上的水珠已经落尽了，秋风吹干了，午后的日头斜斜照进来，把竹影打在地上，细细长长的。

*他是条直线，我是条弯路。直线快，弯路活。把这两条线绑在一起，不一定好走，但有些门，只有他能开。*

你往回走，走了半条街，停下来。身后有人在跟着。不是孙玉堂的人，步子太生，离得太远——是个生手，或者是个故意让你发现的熟手。`,
  choices: [
    {
      id: 'node07_a', label: '答应与方正言合作，共享现有线索',
      effects: [
        { type: 'npc_relation_change', npcId: 'fang_zhengyan', delta: 20 },
        { type: 'set_flag', flag: 'fang_alliance', value: true },
      ],
      outcomeNarrative: '御史线正式开启，弹劾力量+，但风险扩散。',
    },
    {
      id: 'node07_b', label: '缓着，只谈不给，保留底牌',
      effects: [{ type: 'npc_relation_change', npcId: 'fang_zhengyan', delta: -5 }],
      outcomeNarrative: '维持联系但保留底牌，方正言好感-5，但主动权在你。',
    },
    {
      id: 'node07_c', label: '回头抓住跟踪者',
      effects: [
        { type: 'add_clue', clue: { id: 'clue_shadow', label: '跟踪者线索', clarity: 'vague', description: '有人在监视你和方正言的接触' } },
      ],
      outcomeNarrative: '调查是谁在监视，可能得到新情报，也可能打草惊蛇。',
    },
    {
      id: 'node07_d', label: '去查方正言的背景，延迟一个月再决定',
      effects: [{ type: 'set_flag', flag: 'fang_background_checked', value: true }],
      outcomeNarrative: '先确认他的可靠性，延迟一个月再决定是否合作。',
    },
  ],
}
```

- [ ] **Step 4: Create node08.ts — 柳如烟（第48月）**

```typescript
// src/data/nodes/node08.ts
import type { StoryNode } from '../../types'

export const node08: StoryNode = {
  id: 'node_08', month: 48, title: '柳如烟',
  trigger: [{ type: 'month_gte', value: 48 }],
  narrative: `崇祯五年，三月，夜。

你第一次见柳如烟，是在一场不得不去的宴席上。

魏承恩请客，说是给几个千户百户接风，地点在教坊司附近最好的那家院子。你去了，坐在末席，端着酒杯，一口没喝。

然后她走进来。弹琵琶的，穿一件烟色的衣裳，发间只插了一支素簪。她落座之后，调了两下弦，抬眼扫了一圈座中人，目光在你脸上停了不到一息——只是那一下，不多，不少，精准得像一把刀在量你的尺寸。

宴散，她叫人给你递了个东西——一张纸条，折成小方块，裹在一片茶叶里，放在茶盏底下。

上面只有一行字："廖百户查的那条线，往西走，不往东。"

你把纸条烧掉。第二天，你按着那句话换了方向，去查孙玉堂在西城的一处货栈，在那里找到了一批不在账上的皮货——走私货，能证明祥云商行在内账之外另有一套账目体系。

*她给的消息是真的。但真消息未必出于真心。*

你花了三天查柳如烟的底——花魁，二十五岁，本名不详，四年前从扬州来京。和她来往的人里有东厂番役，有锦衣卫，有言官，有商贾。东厂的人。

*这条线是她给的，也可能是崔公公要她给的。引我往某个方向走，或者探我手里有什么。但消息是真的。真消息可以是陷阱，也可以是真心。*`,
  choices: [
    {
      id: 'node08_a', label: '主动接触柳如烟，摸清她的底牌',
      effects: [
        { type: 'npc_relation_change', npcId: 'liu_ruyan', delta: 10 },
        { type: 'risk_change', delta: 1 },
        { type: 'set_flag', flag: 'liu_ruyan_contact', value: true },
      ],
      outcomeNarrative: '情报线开启，但东厂警觉度+，风险上升。',
    },
    {
      id: 'node08_b', label: '暗中调查她的来历',
      effects: [
        { type: 'add_clue', clue: { id: 'clue_liu_background', label: '柳如烟背景', clarity: 'vague', description: '本名不详，扬州来京，与东厂有关联' } },
      ],
      outcomeNarrative: '延迟一个月，获得她背景线索，更了解她是否可信。',
    },
    {
      id: 'node08_c', label: '拒绝接触，保持距离',
      effects: [],
      outcomeNarrative: '安全，但放弃了这条情报渠道。',
    },
    {
      id: 'node08_d', label: '反过来利用她，故意传假消息（需智谋≥60）',
      condition: { type: 'attribute_gte', attribute: 'zhimou', value: 60 },
      effects: [
        { type: 'set_flag', flag: 'liu_ruyan_double_agent', value: true },
        { type: 'npc_relation_change', npcId: 'liu_ruyan', delta: 5 },
      ],
      outcomeNarrative: '高风险高回报——如果成功，东厂会被引入陷阱；如果失败，你完全暴露。',
    },
  ],
}
```

- [ ] **Step 5: Update nodes/index.ts**

```typescript
// src/data/nodes/index.ts
export { node01 } from './node01'
export { node02 } from './node02'
export { node03 } from './node03'
export { node04 } from './node04'
export { node05 } from './node05'
export { node06 } from './node06'
export { node07 } from './node07'
export { node08 } from './node08'

import { node01 } from './node01'
import { node02 } from './node02'
import { node03 } from './node03'
import { node04 } from './node04'
import { node05 } from './node05'
import { node06 } from './node06'
import { node07 } from './node07'
import { node08 } from './node08'

export const ALL_NODES = [node01, node02, node03, node04, node05, node06, node07, node08]
```

- [ ] **Step 6: Commit**

```bash
git add src/data/nodes/
git commit -m "feat: add story nodes 5-8 (stage 2)"
```

---

## Task 9: Game Data — Story Nodes 9-12 (Stage 3)

**Files:** `src/data/nodes/node09.ts`, `node10.ts`, `node11.ts`, `node12.ts`

- [ ] **Step 1: Create node09.ts — 魏承恩施压（第54月）**

```typescript
// src/data/nodes/node09.ts
import type { StoryNode } from '../../types'

export const node09: StoryNode = {
  id: 'node_09', month: 54, title: '魏承恩施压',
  trigger: [{ type: 'month_gte', value: 54 }],
  narrative: `崇祯五年，九月，秋末。

魏承恩把你叫进去，不是在公堂，在他的后院书房。

书房布置得很雅，字画、古玩、名家手迹。魏承恩坐在太师椅里，五十五岁，圆润，头发梳得一丝不乱，见你进来，让你坐，亲手倒了茶，递过来，脸上带着一种很熟练的温厚笑容。

"威达，坐了五年了，干得不错。我一直看着你，心里高兴。"

"就是有些事，我想跟你说说，当长辈的，也是个提醒。最近有人跟我说，你在查一些……范围有点广的事。商税、王府，这些，水太深。当年你父亲，"他叹了口气，"就是……唉，年轻人啊，忠心可嘉，但要懂得审时度势。"

*他提父亲。提父亲，是警告，也是炫耀——他知道当年发生了什么，他希望你知道他知道。*

"指挥使大人说的是，属下年轻，有时候不懂轻重。承蒙大人提点，定当谨记。"

他满意地点了点头，让你离开。

你出门，走了三步，听见身后书房的门合上了，隔着门传来一点细微的声音——不是说话，是翻东西。

回到住处，你发现桌上的东西被动过了——不多，只有一点点，摆放的位置偏了不到一指宽。那个小匣子还在，刀还在，但里面叠放纸张的顺序反了。

*有人来查过了。*`,
  choices: [
    {
      id: 'node09_a', label: '装作不知，继续暗中行动',
      effects: [{ type: 'risk_change', delta: 1 }],
      outcomeNarrative: '维持现状，但风险持续累积。',
    },
    {
      id: 'node09_b', label: '找周寒川商量对策',
      effects: [
        { type: 'npc_relation_change', npcId: 'zhou_hanchuan', delta: 10 },
        { type: 'set_flag', flag: 'zhou_counter_surveillance', value: true },
      ],
      outcomeNarrative: '周寒川好感+10，他帮你设了个反侦察的局。',
    },
    {
      id: 'node09_c', label: '把重要线索转移藏匿（消耗2行动点）',
      effects: [
        { type: 'set_flag', flag: 'clues_hidden', value: true },
      ],
      outcomeNarrative: '线索安全，但消耗了2个行动点，本月只剩1点可用。',
    },
    {
      id: 'node09_d', label: '主动去魏承恩那里示弱，递一个小把柄安抚他',
      effects: [
        { type: 'risk_change', delta: -1 },
        { type: 'set_flag', flag: 'owe_wei_favor', value: true },
      ],
      outcomeNarrative: '风险暂时降低，但欠了人情，日后会被要求回报。',
    },
  ],
}
```

- [ ] **Step 2: Create node10.ts — 第一次亮刀（第60月）**

```typescript
// src/data/nodes/node10.ts
import type { StoryNode } from '../../types'

export const node10: StoryNode = {
  id: 'node_10', month: 60, title: '第一次亮刀',
  trigger: [{ type: 'month_gte', value: 60 }],
  narrative: `崇祯六年，三月，深夜。

郑九死了。

消息是天亮前来的，说是喝酒失足落水，在积水潭边找到的，已经凉了。

*失足落水。三月，天还冷，他这半年滴酒不沾，我给的钱够他过日子，他父亲的债已经还了，他有理由活下去，没有理由去喝酒。*

你去看现场。积水潭边，只剩一块被踩乱了的泥地，还有水边一只落单的鞋。那只鞋放得太整齐，不像是落水前踢掉的，像是有人放上去的。

*他们知道郑九跟我有往来。他们杀人，是给我看的。下一个轮到谁，你想清楚。*

你在那里站了一会儿，看着水面。

然后你意识到——已经五年了。五年，你查到了多少？商帮的账，王府的线，东厂的影子，御史的盟友，一条条线都在你手里，但没有一条线够粗，够用来收网。

而另一边：孙玉堂知道你，魏承恩知道你，东厂开始盯你，你的线人死了。

*继续这样下去，早晚轮到我。要变了。*

你转身，走回北镇抚司，去找周寒川，把五年来收集的所有线索，第一次，完整地摊在了他面前。

周寒川听完，沉默了很长时间。最后他说："这条路，从你父亲的时候我就知道通向哪里。我拦过你，你没听。"他看着你，"现在，你准备走到哪一步？"

"我准备走到底。"

"好，那我陪你走。但威达，要走到底——就要做好失去一切的准备。"`,
  choices: [
    {
      id: 'node10_a', label: '先稳住，用三个月重新布局，找新线人',
      effects: [{ type: 'set_flag', flag: 'stage3_regroup', value: true }],
      outcomeNarrative: '稳健，但孙玉堂已开始下一步布局。',
    },
    {
      id: 'node10_b', label: '立刻联合方正言发起弹劾',
      effects: [
        { type: 'set_flag', flag: 'stage3_aggressive', value: true },
        { type: 'risk_change', delta: 2 },
      ],
      outcomeNarrative: '激进，可能触发提前摊牌，风险大幅上升。',
    },
    {
      id: 'node10_c', label: '去找李慕尘',
      effects: [{ type: 'set_flag', flag: 'seeking_li_muchen', value: true }],
      outcomeNarrative: '解锁隐藏线索，代价：必须面对当年真相。',
    },
    {
      id: 'node10_d', label: '去查柳如烟，确认她的立场',
      effects: [{ type: 'set_flag', flag: 'confirming_liu_ruyan', value: true }],
      outcomeNarrative: '可能获得东厂内线，也可能彻底暴露。',
    },
  ],
}
```

- [ ] **Step 3: Create node11.ts — 李慕尘（第66月）**

```typescript
// src/data/nodes/node11.ts
import type { StoryNode } from '../../types'

export const node11: StoryNode = {
  id: 'node_11', month: 66, title: '李慕尘',
  trigger: [{ type: 'month_gte', value: 66 }],
  narrative: `崇祯六年，九月，山野。

你找了他三个月。没有人知道李慕尘在哪里，或者说，知道的人不愿意开口。最后是一个卖草药的老头给了你一个地名，顺嘴说的，也许没想到你会去。

他住在山里，一间石屋，半亩菜地，门口放着一把剑。

你站在门口，等了一刻钟，没人来开门。

"李慕尘，我是廖承志的儿子。"

然后门开了。

他比你想象的要老。四十岁，但看起来像五十，头发半白，眼睛里有一种很深的、很久的疲倦。他看见你，看了很长时间，不说话，像是在你脸上找什么东西。

"进来。"

"我没杀你父亲，是另外两个人动的手。我当时的任务是……清理痕迹。你母亲，也不是我。"

"那你为什么救了我。"

"你那时候三岁。你坐在院子中间，地上全是血，你不哭，你就坐在那里，眼睛睁得很大，看着火，看着我。我没法动手，就是没法。"

他告诉你的，比你知道的多了一层。当年的案子，东厂是执行方，景王是金主，但有一个人是他们都不愿意提起的——有人在皇上面前进言，促成了那道密令，让锦衣卫内部"自行处理"廖承志的案子。那个人现在还在，职位已经不是当年那个了，但人还在。

"谁，"你问。

他说了一个名字。`,
  choices: [
    {
      id: 'node11_a', label: '先消化这个消息，暂不行动',
      effects: [{ type: 'set_flag', flag: 'knows_insider_name', value: true }],
      outcomeNarrative: '维持现状，下月解锁追查此人。',
    },
    {
      id: 'node11_b', label: '立刻去对质',
      effects: [
        { type: 'set_flag', flag: 'confronted_insider_early', value: true },
        { type: 'risk_change', delta: 3 },
      ],
      outcomeNarrative: '触发提前摊牌，风险极高。',
    },
    {
      id: 'node11_c', label: '请李慕尘出山相助',
      effects: [{ type: 'set_flag', flag: 'li_muchen_recruited', value: true }],
      outcomeNarrative: '他沉默了很久，最后说："我欠廖承志一条命。"李慕尘加入，武力+情报支援。',
    },
    {
      id: 'node11_d', label: '把这个名字告诉方正言',
      effects: [
        { type: 'npc_relation_change', npcId: 'fang_zhengyan', delta: 10 },
        { type: 'set_flag', flag: 'fang_knows_insider', value: true },
        { type: 'risk_change', delta: 1 },
      ],
      outcomeNarrative: '御史线加速，但消息扩散，风险+1。',
    },
  ],
}
```

- [ ] **Step 4: Create node12.ts — 周寒川之死（第72月）**

```typescript
// src/data/nodes/node12.ts
import type { StoryNode } from '../../types'

export const node12: StoryNode = {
  id: 'node_12', month: 72, title: '周寒川之死',
  trigger: [{ type: 'month_gte', value: 72 }],
  narrative: `崇祯七年，三月，夜雨。

周寒川死在一个普通的夜里。

不是被人暗杀，不是在街上，是在自己家里，说是突发急病，心疾。郎中来得太晚，已经回天乏术。你赶到的时候，他已经停了气，躺在床上，脸色很平静，像是睡着了。

*心疾。六十岁的人，确实会死于心疾。但六十岁的人也可以被人一碗汤送走，让郎中看不出来。*

你留下来帮着料理了三天，搜遍了他的书房——找到了一封没发出去的信，写给你的，墨迹还新，最后一句话没写完：

"威达，我一直知道你父亲的案子，我当年选择了沉默，是因为——"

后面空着。

*他死在那个破折号后面。*

你把那封信收好，走出周府，站在雨里。

冯天顺从后面追上来，撑着伞，把伞举到你头顶，什么话都没说。你们就那么站着，站了很长时间。

"下一步，"冯天顺最后说，"怎么走？"

"继续，"你说。

*我已经失去了父亲、母亲、郑九，现在是周寒川。每失去一个人，这条路就往前走了一段——用别人的命换的路，我没有资格回头。*`,
  choices: [
    {
      id: 'node12_a', label: '追查周寒川死因，寻找证据',
      effects: [
        { type: 'risk_change', delta: 2 },
        { type: 'set_flag', flag: 'investigating_zhou_death', value: true },
      ],
      outcomeNarrative: '可能证明他是被杀，风险++。',
    },
    {
      id: 'node12_b', label: '暂时按下，专注主线',
      effects: [{ type: 'npc_relation_change', npcId: 'feng_tianshun', delta: -5 }],
      outcomeNarrative: '不追查，冯天顺好感-5（他认为你不够重情义）。',
    },
    {
      id: 'node12_c', label: '把周寒川未完成的信带去给方正言看',
      effects: [
        { type: 'npc_relation_change', npcId: 'fang_zhengyan', delta: 15 },
        { type: 'set_flag', flag: 'fang_has_zhou_letter', value: true },
      ],
      outcomeNarrative: '御史线得到关键证词，方正言的弹章更加有力。',
    },
    {
      id: 'node12_d', label: '独自去找当年进言那个人对质',
      effects: [
        { type: 'risk_change', delta: 3 },
        { type: 'set_flag', flag: 'confronted_insider_after_zhou', value: true },
      ],
      outcomeNarrative: '高风险，可能触发提前终局。',
    },
  ],
}
```

- [ ] **Step 5: Update nodes/index.ts to include nodes 9-12**

```typescript
// src/data/nodes/index.ts  (full rewrite)
export { node01 } from './node01'
export { node02 } from './node02'
export { node03 } from './node03'
export { node04 } from './node04'
export { node05 } from './node05'
export { node06 } from './node06'
export { node07 } from './node07'
export { node08 } from './node08'
export { node09 } from './node09'
export { node10 } from './node10'
export { node11 } from './node11'
export { node12 } from './node12'

import { node01 } from './node01'
import { node02 } from './node02'
import { node03 } from './node03'
import { node04 } from './node04'
import { node05 } from './node05'
import { node06 } from './node06'
import { node07 } from './node07'
import { node08 } from './node08'
import { node09 } from './node09'
import { node10 } from './node10'
import { node11 } from './node11'
import { node12 } from './node12'

export const ALL_NODES = [
  node01, node02, node03, node04, node05, node06,
  node07, node08, node09, node10, node11, node12,
]
```

- [ ] **Step 6: Commit**

```bash
git add src/data/nodes/
git commit -m "feat: add story nodes 9-12 (stage 3)"
```

---

## Task 10: Game Data — Story Nodes 13-15 + Endings

**Files:** `src/data/nodes/node13.ts`, `node14.ts`, `node15.ts`, `src/data/endings.ts`, update `src/data/nodes/index.ts`

- [ ] **Step 1: Create node13.ts — 收网前夜（第90月）**

```typescript
// src/data/nodes/node13.ts
import type { StoryNode } from '../../types'

export const node13: StoryNode = {
  id: 'node_13', month: 90, title: '收网前夜',
  trigger: [{ type: 'month_gte', value: 90 }],
  narrative: `崇祯八年，九月。

你已经不是六年前那个百户了。

千户，锦衣卫北镇抚司实授千户，手底下有人，有档案权限，有可以合法查阅的东西。声望积累到能让某些人不得不递名片的程度，财富攒到不再为银子发愁的程度，方正言的弹章已经写好了三份，就等一个合适的时机。

你把所有的线拿出来，一条一条摆在桌上。

商税贪腐——有账目，有经手人郑九的遗书，有景王府收款的旁证。天刀门灭门案——有李慕尘的证词。当年进言的那个人——证据还不够，但够用来威胁。东厂——这条线最难，崔公公后面有皇权的影子，不能硬碰，只能围。

*七年。七年了，这些线终于够长了。*

冯天顺坐在对面，把刀放在腿上，听你说完，然后问："我要做什么。"

你告诉他。他想了想，点头："行，打架这事交给我，别的我不懂。"`,
  choices: [
    {
      id: 'node13_a', label: '先扳孙玉堂，再向上推',
      effects: [{ type: 'set_flag', flag: 'strategy_bottom_up', value: true }],
      outcomeNarrative: '稳扎稳打，但给景王和东厂时间反应。',
    },
    {
      id: 'node13_b', label: '三线并进：商帮+弹劾+御前告状',
      condition: { type: 'attribute_gte', attribute: 'shengwang', value: 70 },
      effects: [
        { type: 'set_flag', flag: 'strategy_all_fronts', value: true },
        { type: 'risk_change', delta: 2 },
      ],
      outcomeNarrative: '激进，需要极高的资源和人脉储备，风险大幅上升。',
    },
    {
      id: 'node13_c', label: '利用柳如烟，从内部瓦解东厂',
      condition: { type: 'flag_true', flagKey: 'liu_ruyan_allied', value: true },
      effects: [{ type: 'set_flag', flag: 'strategy_infiltrate', value: true }],
      outcomeNarrative: '利用已倒向你的柳如烟，从东厂内部制造混乱。',
    },
    {
      id: 'node13_d', label: '找皇帝，直接御前告状',
      condition: { type: 'attribute_gte', attribute: 'shengwang', value: 80 },
      effects: [
        { type: 'set_flag', flag: 'strategy_emperor', value: true },
        { type: 'risk_change', delta: 3 },
      ],
      outcomeNarrative: '险棋，需要确凿证据和极高声望（80+），成功则一击制敌。',
    },
  ],
}
```

- [ ] **Step 2: Create node14.ts — 孙玉堂落网（第102月）**

```typescript
// src/data/nodes/node14.ts
import type { StoryNode } from '../../types'

export const node14: StoryNode = {
  id: 'node_14', month: 102, title: '孙玉堂落网',
  trigger: [{ type: 'month_gte', value: 102 }],
  narrative: `崇祯九年，三月。

孙玉堂被捕的那天，你站在他家门口，看着他被带出来。

他还是那个样子，圆脸，微胖，穿着那件青色直裰，手被锁住了，但步子还是不紧不慢。他经过你身边的时候，抬头看了你一眼。

那双眼睛里没有恐惧，也没有仇恨。只有一种——你想了很久，才找到词——只有一种认可。像是见到了一件终于成型的器物，点了点头，说：好，可以了。

"廖千户，"他说，声音不大，"你父亲，当年也是这么站着的。"

你没有说话。

他被带走了。

*我等了十九年。他被带走的那一刻，我以为会感觉到什么——解脱，或者欢喜，或者泪水，什么都行。什么都没有。只是还有下面的人没动，这件事还没完。*

你转身，回到北镇抚司，继续写那份奏疏。`,
  choices: [
    {
      id: 'node14_a', label: '趁势弹劾魏承恩',
      effects: [
        { type: 'set_flag', flag: 'impeach_wei', value: true },
        { type: 'risk_change', delta: 1 },
      ],
      outcomeNarrative: '锦衣卫内部清洗，风险中，需要周寒川遗物作为证据。',
    },
    {
      id: 'node14_b', label: '转向景王，直接攻击最大目标',
      effects: [
        { type: 'set_flag', flag: 'target_jingwang', value: true },
        { type: 'risk_change', delta: 3 },
      ],
      outcomeNarrative: '直接攻击最大目标，风险极高，需要充分准备。',
    },
    {
      id: 'node14_c', label: '先稳住，等孙玉堂招供',
      effects: [{ type: 'set_flag', flag: 'waiting_sun_confession', value: true }],
      outcomeNarrative: '从孙玉堂口中得到指向景王和东厂的证词，更加稳健。',
    },
  ],
}
```

- [ ] **Step 3: Create node15.ts — 最终对决（第114月）**

```typescript
// src/data/nodes/node15.ts
import type { StoryNode } from '../../types'

export const node15: StoryNode = {
  id: 'node_15', month: 114, title: '最终对决',
  trigger: [{ type: 'month_gte', value: 114 }],
  narrative: `崇祯十年，九月。

景王被削藩，崔公公被下狱，魏承恩致仕，天刀门门主被捕——这些事情发生在一年之内，有些是你推动的，有些是被你的行动带起来的多米诺骨牌。

但最后一件事，只有你能做。

李慕尘找上你，说当年亲自杀死你父亲的那个人，现在就在京城，换了个名字，换了个身份，还活着。

你花了三天找到了他。

他住在一条普通的胡同里，是个普通的中年人，开着一个小铺子，过着普通的日子。

你站在他铺子外面，看着他在里面做生意，和顾客笑着说话，找零，道谢，送客。

*这就是杀死父亲的那双手。*`,
  choices: [
    {
      id: 'node15_a', label: '用法度解决——移交审讯，明正典刑',
      effects: [{ type: 'set_flag', flag: 'flag_justice', value: true }],
      outcomeNarrative: '移交审讯，走正式程序，父亲的案子将写入档案。',
    },
    {
      id: 'node15_b', label: '亲手了结',
      effects: [{ type: 'set_flag', flag: 'flag_revenge', value: true }],
      outcomeNarrative: '你走进去，完成了这件事。走出来的时候，这条路走完了。',
    },
    {
      id: 'node15_c', label: '放他走，因为已经够了',
      effects: [{ type: 'set_flag', flag: 'flag_release', value: true }],
      outcomeNarrative: '你站了很长时间，然后转身走了。没有人知道你去过那里。',
    },
    {
      id: 'node15_d', label: '用他作为最后一枚棋子，换取更大的清算',
      condition: { type: 'attribute_gte', attribute: 'zhimou', value: 70 },
      effects: [{ type: 'set_flag', flag: 'flag_stratagem', value: true }],
      outcomeNarrative: '你用那个人换了景王最后一批证据——他知道一些你不知道的事。',
    },
  ],
}
```

- [ ] **Step 4: Create endings.ts**

```typescript
// src/data/endings.ts
import type { Ending } from '../types'

export const ALL_ENDINGS: Ending[] = [
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
    id: 'ending_release', title: '放下', isHidden: false,
    conditions: [{ type: 'flag_true', flagKey: 'flag_release', value: true }],
    narrative: `你看着他在铺子里做生意，站了很长时间，然后转身走了。

没有人知道你去过那里，没有人知道你做了这个决定。

你回到北镇抚司，继续做你的千户，继续查案，继续活着。那个名字在你脑子里放了很多年，慢慢地，像一块石头被水泡久了，棱角磨掉了，还在，但不那么硌人了。

这不是原谅。你没有原谅任何人。

你只是决定，不让仇恨再花你更多的时间了。`,
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
    id: 'ending_pyrrhic', title: '未竟', isHidden: false,
    conditions: [
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
]
```

- [ ] **Step 5: Update nodes/index.ts with nodes 13-15**

```typescript
// Add to src/data/nodes/index.ts (append exports and update ALL_NODES array)
export { node13 } from './node13'
export { node14 } from './node14'
export { node15 } from './node15'
// ALL_NODES = [...existing, node13, node14, node15]
```

- [ ] **Step 6: Commit**

```bash
git add src/data/
git commit -m "feat: add story nodes 13-15 and all 9 endings"
```

---

## Task 11: Game Data — Monthly Actions

**Files:** `src/data/actions/phase1Actions.ts`, `phase2Actions.ts`, `phase3Actions.ts`, `phase4Actions.ts`, `src/data/actions/index.ts`

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

- [ ] **Step 2: Create phase2Actions.ts**

```typescript
// src/data/actions/phase2Actions.ts
import type { MonthlyAction } from '../../types'

export const phase2Actions: MonthlyAction[] = [
  {
    id: 'advanced_patrol', label: '带队巡查', category: 'duty', cost: 1, conditions: [],
    effects: [
      { type: 'attribute_change', attribute: 'shengwang', delta: 3 },
      { type: 'wealth_change', delta: 8 },
    ],
    narrative: '你带着几名手下巡查辖区，处置了一起斗殴，声望有所提升。',
  },
  {
    id: 'interrogate', label: '审讯嫌疑人', category: 'duty', cost: 1, conditions: [],
    effects: [
      { type: 'attribute_change', attribute: 'koucai', delta: 2 },
      { type: 'attribute_change', attribute: 'zhimou', delta: 1 },
    ],
    narrative: '你主导了一次审讯，通过细致的盘问突破了嫌疑人的防线，获得了口供。',
  },
  {
    id: 'train_with_limuchen', label: '向李慕尘求教（需已联系）', category: 'training', cost: 1,
    conditions: [{ type: 'flag_true', flagKey: 'li_muchen_recruited', value: true }],
    effects: [{ type: 'attribute_change', attribute: 'wuli', delta: 5 }],
    narrative: '李慕尘教了你几招天刀门的剑意，融入刀法之后，武力大幅提升。',
  },
  {
    id: 'study_law', label: '研习大明律', category: 'training', cost: 1, conditions: [],
    effects: [
      { type: 'attribute_change', attribute: 'zhimou', delta: 2 },
      { type: 'attribute_change', attribute: 'koucai', delta: 1 },
    ],
    narrative: '你借来大明律细读，对律法条文有了更深的理解，这对日后弹劾很有用。',
  },
  {
    id: 'maintain_zheng_jiu', label: '维护郑九关系', category: 'social', cost: 1,
    conditions: [{ type: 'flag_true', flagKey: 'zheng_jiu_recruited', value: true }],
    effects: [
      { type: 'wealth_change', delta: -5 },
      { type: 'add_clue', clue: { id: 'clue_zheng_jiu_intel', label: '郑九情报', clarity: 'clear', description: '祥云商行最近的账目异动' } },
    ],
    narrative: '你去看望了郑九，给他留了药钱，他悄悄告诉你商行近期的异动。',
  },
  {
    id: 'visit_fang', label: '拜访方正言', category: 'social', cost: 1,
    conditions: [{ type: 'flag_true', flagKey: 'fang_alliance', value: true }],
    effects: [{ type: 'npc_relation_change', npcId: 'fang_zhengyan', delta: 8 }],
    narrative: '你去方正言的书房坐了一个时辰，交流了最近的进展，彼此增进了信任。',
  },
  {
    id: 'tail_suspect', label: '跟踪可疑人物', category: 'investigation', cost: 2,
    conditions: [{ type: 'wealth_gte', value: 20 }],
    effects: [
      { type: 'risk_change', delta: 1 },
      { type: 'attribute_change', attribute: 'zhimou', delta: 2 },
    ],
    narrative: '你花了两天时间跟踪一名可疑的商人，记录了他的行踪，但也引起了对方的一些注意。',
  },
  {
    id: 'buy_good_intel', label: '购买高质量情报', category: 'investigation', cost: 1,
    conditions: [{ type: 'wealth_gte', value: 50 }],
    effects: [
      { type: 'wealth_change', delta: -30 },
      { type: 'add_clue', clue: { id: 'clue_purchased', label: '购买的情报', clarity: 'clear', description: '京城商界近期动向' } },
    ],
    narrative: '你花了三十两向一名消息灵通的掮客购买情报，得到了一些有用的线索。',
  },
  {
    id: 'side_job', label: '接私活赚钱', category: 'income', cost: 1, conditions: [],
    effects: [
      { type: 'wealth_change', delta: 20 },
      { type: 'risk_change', delta: 1 },
    ],
    narrative: '你接了一个商人的私活，帮他追回了一笔欠款，得了报酬，但此事有些出格。',
  },
]
```

- [ ] **Step 3: Create phase3Actions.ts and phase4Actions.ts (abbreviated — same pattern)**

```typescript
// src/data/actions/phase3Actions.ts
import type { MonthlyAction } from '../../types'

export const phase3Actions: MonthlyAction[] = [
  {
    id: 'command_subordinates', label: '指挥下属办案', category: 'duty', cost: 1, conditions: [],
    effects: [
      { type: 'attribute_change', attribute: 'shengwang', delta: 4 },
      { type: 'wealth_change', delta: 10 },
    ],
    narrative: '你派遣下属协同处理了几件要案，声望进一步提升。',
  },
  {
    id: 'review_archives', label: '调阅高级档案', category: 'investigation', cost: 1, conditions: [],
    effects: [{ type: 'attribute_change', attribute: 'zhimou', delta: 3 }],
    narrative: '你利用千户权限调阅了一批原来无权查看的档案，从中找到了一些有价值的线索。',
  },
  {
    id: 'recruit_informant', label: '发展新线人', category: 'investigation', cost: 2,
    conditions: [{ type: 'wealth_gte', value: 80 }],
    effects: [
      { type: 'wealth_change', delta: -50 },
      { type: 'set_flag', flag: 'new_informant', value: true },
    ],
    narrative: '你花了大量时间和金钱，在商界发展了一名新线人，弥补郑九死后的情报空缺。',
  },
  {
    id: 'ally_with_liu', label: '深化与柳如烟的关系', category: 'social', cost: 1,
    conditions: [{ type: 'flag_true', flagKey: 'liu_ruyan_contact', value: true }],
    effects: [
      { type: 'npc_relation_change', npcId: 'liu_ruyan', delta: 15 },
      { type: 'risk_change', delta: 1 },
    ],
    narrative: '你与柳如烟的接触更加频繁，她开始向你透露更多东厂的内部消息。',
  },
  {
    id: 'secure_liu_alliance', label: '策反柳如烟', category: 'social', cost: 2,
    conditions: [
      { type: 'npc_relation_gte', npcId: 'liu_ruyan', value: 60 },
      { type: 'attribute_gte', attribute: 'koucai', value: 40 },
    ],
    effects: [
      { type: 'set_flag', flag: 'liu_ruyan_allied', value: true },
      { type: 'npc_relation_change', npcId: 'liu_ruyan', delta: 20 },
    ],
    narrative: '在一次深谈之后，柳如烟告诉你她早就想脱离东厂——她愿意帮你。',
  },
  {
    id: 'bribe_official', label: '贿赂中层官员', category: 'income', cost: 1,
    conditions: [{ type: 'wealth_gte', value: 200 }],
    effects: [
      { type: 'wealth_change', delta: -150 },
      { type: 'attribute_change', attribute: 'shengwang', delta: 5 },
    ],
    narrative: '你花钱打通了一个关节，让某件事情顺利推进，也在官场积累了一些人情。',
  },
  {
    id: 'train_sword_advanced', label: '苦练武艺', category: 'training', cost: 1, conditions: [],
    effects: [{ type: 'attribute_change', attribute: 'wuli', delta: 3 }],
    narrative: '你把每天的训练时间延长到三个时辰，剑势更加犀利。',
  },
  {
    id: 'political_lobbying', label: '朝堂活动', category: 'social', cost: 1,
    conditions: [{ type: 'attribute_gte', attribute: 'koucai', value: 30 }],
    effects: [
      { type: 'attribute_change', attribute: 'shengwang', delta: 5 },
      { type: 'attribute_change', attribute: 'koucai', delta: 2 },
    ],
    narrative: '你参加了几次朝臣聚会，巧妙地宣扬了自己的立场，赢得了一些人的好感。',
  },
]

// src/data/actions/phase4Actions.ts
import type { MonthlyAction } from '../../types'

export const phase4Actions: MonthlyAction[] = [
  {
    id: 'prepare_impeachment', label: '准备弹劾材料', category: 'duty', cost: 2, conditions: [],
    effects: [
      { type: 'attribute_change', attribute: 'zhimou', delta: 3 },
      { type: 'set_flag', flag: 'impeachment_prepared', value: true },
    ],
    narrative: '你和方正言一起整理弹劾所需的证据链，把每一条罪状都落实到具体的文书上。',
  },
  {
    id: 'coordinate_allies', label: '协调各方盟友', category: 'social', cost: 1,
    conditions: [{ type: 'attribute_gte', attribute: 'shengwang', value: 60 }],
    effects: [
      { type: 'npc_relation_change', npcId: 'fang_zhengyan', delta: 5 },
      { type: 'npc_relation_change', npcId: 'feng_tianshun', delta: 5 },
    ],
    narrative: '你分头拜访了方正言和冯天顺，确认了最后阶段各人的分工。',
  },
  {
    id: 'secure_emperor_audience', label: '谋求御前面圣', category: 'social', cost: 2,
    conditions: [{ type: 'attribute_gte', attribute: 'shengwang', value: 75 }],
    effects: [
      { type: 'attribute_change', attribute: 'shengwang', delta: 8 },
      { type: 'set_flag', flag: 'emperor_audience_arranged', value: true },
    ],
    narrative: '通过多方斡旋，你获得了一次御前陈情的机会。',
  },
  {
    id: 'final_investigation', label: '最后的实地调查', category: 'investigation', cost: 2,
    conditions: [],
    effects: [
      { type: 'risk_change', delta: 1 },
      { type: 'attribute_change', attribute: 'zhimou', delta: 4 },
    ],
    narrative: '你亲自出马，对几个关键地点做了最后一轮勘察，把证据链补齐了最后一环。',
  },
  {
    id: 'military_preparation', label: '准备武力后备', category: 'duty', cost: 1,
    conditions: [{ type: 'npc_relation_gte', npcId: 'feng_tianshun', value: 60 }],
    effects: [{ type: 'set_flag', flag: 'military_backup_ready', value: true }],
    narrative: '冯天顺悄悄调动了一部分可信的京营兵力，以防最后关头出现变故。',
  },
  {
    id: 'manage_wealth', label: '打理财务，备好钱粮', category: 'income', cost: 1, conditions: [],
    effects: [{ type: 'wealth_change', delta: 30 }],
    narrative: '你盘点了名下的各项收入，把财务整理得井井有条，确保最后阶段不缺银子。',
  },
]
```

- [ ] **Step 4: Create actions/index.ts**

```typescript
// src/data/actions/index.ts
export { phase1Actions } from './phase1Actions'
export { phase2Actions } from './phase2Actions'
export { phase3Actions } from './phase3Actions'
export { phase4Actions } from './phase4Actions'

import { phase1Actions } from './phase1Actions'
import { phase2Actions } from './phase2Actions'
import { phase3Actions } from './phase3Actions'
import { phase4Actions } from './phase4Actions'

export function getActionsForPhase(phase: 1 | 2 | 3 | 4) {
  switch (phase) {
    case 1: return phase1Actions
    case 2: return phase2Actions
    case 3: return phase3Actions
    case 4: return phase4Actions
  }
}
```

- [ ] **Step 5: Commit**

```bash
git add src/data/actions/
git commit -m "feat: add monthly actions for all 4 phases"
```

---

## Task 12: Zustand Store + Auto-save

**Files:** `src/store/gameStore.ts`, `src/store/index.ts`, `src/store/__tests__/gameStore.test.ts`

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
        ...next,
        currentNode: null,
        screen: 'game',
        flags: { ...next.flags, [`visited_${node.id}`]: true },
      })
    },

    dismissNode() {
      const state = get()
      if (!state.currentNode) return
      set({
        currentNode: null,
        screen: 'game',
        flags: { ...state.flags, [`visited_${state.currentNode}`]: true },
      })
    },

    advanceToNextMonth() {
      const state = get()
      const newMonth = state.month + 1
      const newPhase = computePhase(newMonth)
      const newState: GameState = { ...state, month: newMonth, phase: newPhase, actionPoints: 3 }
      const triggeredNode = findTriggeredNode(ALL_NODES, newState)
      const ending = resolveEnding(ALL_ENDINGS, newState)
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
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/store/
git commit -m "feat: add Zustand game store with auto-save"
```

---

## Task 13: StatusPanel Component

**Files:** `src/components/layout/StatusPanel.tsx`, `src/components/layout/StatusPanel.module.css`, `src/components/game/AttributeBar.tsx`, `src/components/game/AttributeBar.module.css`

- [ ] **Step 1: Create AttributeBar.tsx**

```typescript
// src/components/game/AttributeBar.tsx
import styles from './AttributeBar.module.css'

interface Props {
  label: string
  value: number
  max?: number
}

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

- [ ] **Step 2: Create AttributeBar.module.css**

```css
/* src/components/game/AttributeBar.module.css */
.root { margin-bottom: 8px; }
.labelRow { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 2px; }
.label { color: var(--color-text); font-family: var(--font-serif); }
.value { color: var(--color-accent); font-weight: bold; }
.track { height: 6px; background: rgba(0,0,0,0.15); border-radius: 3px; overflow: hidden; }
.fill { height: 100%; border-radius: 3px; transition: width 0.3s ease; }
.high { background: #4a7c59; }
.mid  { background: #c9a227; }
.low  { background: var(--color-accent); }
```

- [ ] **Step 3: Create StatusPanel.tsx**

```typescript
// src/components/layout/StatusPanel.tsx
import { useGameStore } from '../../store'
import { AttributeBar } from '../game/AttributeBar'
import styles from './StatusPanel.module.css'

const ATTR_LABELS: Record<string, string> = {
  wuli: '武力', zhimou: '智谋', koucai: '口才', shengwang: '声望',
}

const RISK_LABELS = ['', '安全', '留意', '危险', '高危', '极危']

export function StatusPanel() {
  const { month, phase, attributes, wealth, actionPoints, riskLevel, clues } = useGameStore()
  const chongzhenYear = Math.ceil(month / 12)
  const monthInYear = ((month - 1) % 12) + 1
  const MONTHS = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊']

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

- [ ] **Step 4: Create StatusPanel.module.css**

```css
/* src/components/layout/StatusPanel.module.css */
.panel {
  background: var(--color-paper);
  border-right: 1px solid var(--color-paper-dark);
  padding: 16px 12px;
  overflow-y: auto;
  font-family: var(--font-serif);
  color: var(--color-text);
}
.timeBlock { text-align: center; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid var(--color-paper-dark); }
.timeMain { font-size: 18px; font-weight: bold; color: var(--color-accent); }
.phase { font-size: 12px; color: #888; margin-top: 2px; }
.section { margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid var(--color-paper-dark); }
.statRow { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px; }
.risk1 { color: #4a7c59; } .risk2 { color: #c9a227; } .risk3 { color: #e07b39; }
.risk4 { color: #c0392b; } .risk5 { color: #8b0000; font-weight: bold; }
```

- [ ] **Step 5: Commit**

```bash
git add src/components/
git commit -m "feat: add StatusPanel and AttributeBar components"
```

---

## Task 14: NarrativePanel Component

**Files:** `src/components/layout/NarrativePanel.tsx`, `src/components/layout/NarrativePanel.module.css`

- [ ] **Step 1: Create NarrativePanel.tsx**

```typescript
// src/components/layout/NarrativePanel.tsx
import styles from './NarrativePanel.module.css'

interface Props {
  text: string
}

function renderParagraph(line: string, idx: number) {
  const isMonologue = line.startsWith('*') && line.endsWith('*')
  const content = isMonologue ? line.slice(1, -1) : line
  return (
    <p key={idx} className={isMonologue ? styles.monologue : styles.paragraph}>
      {content}
    </p>
  )
}

export function NarrativePanel({ text }: Props) {
  const paragraphs = text.split('\n\n').filter(Boolean)
  return (
    <main className={styles.panel}>
      <div className={styles.scroll}>
        {paragraphs.map((para, i) => renderParagraph(para, i))}
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Create NarrativePanel.module.css**

```css
/* src/components/layout/NarrativePanel.module.css */
.panel {
  background: var(--color-paper);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border-left: 1px solid var(--color-paper-dark);
  border-right: 1px solid var(--color-paper-dark);
}
.scroll {
  flex: 1;
  overflow-y: auto;
  padding: 24px 28px;
  font-family: var(--font-serif);
  color: var(--color-text);
  line-height: 1.9;
}
.paragraph {
  margin-bottom: 16px;
  font-size: 15px;
  text-indent: 2em;
}
.monologue {
  margin-bottom: 16px;
  font-size: 14px;
  font-style: italic;
  color: #6b5a4e;
  text-indent: 2em;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/NarrativePanel.tsx src/components/layout/NarrativePanel.module.css
git commit -m "feat: add NarrativePanel component"
```

---

## Task 15: ActionPanel + Action/Choice Buttons

**Files:** `src/components/layout/ActionPanel.tsx`, `src/components/game/ActionButton.tsx`, `src/components/game/ChoiceButton.tsx`, CSS modules for each

- [ ] **Step 1: Create ActionButton.tsx**

```typescript
// src/components/game/ActionButton.tsx
import styles from './ActionButton.module.css'
import type { MonthlyAction } from '../../types'

const CATEGORY_ICONS: Record<string, string> = {
  duty: '⚔', training: '📖', social: '🍵', investigation: '🔍', income: '💰',
}

interface Props {
  action: MonthlyAction
  disabled?: boolean
  onClick: () => void
}

export function ActionButton({ action, disabled, onClick }: Props) {
  return (
    <button className={styles.btn} disabled={disabled} onClick={onClick}>
      <span className={styles.icon}>{CATEGORY_ICONS[action.category]}</span>
      <span className={styles.label}>{action.label}</span>
      <span className={styles.cost}>{'●'.repeat(action.cost)}</span>
    </button>
  )
}
```

- [ ] **Step 2: Create ActionButton.module.css**

```css
/* src/components/game/ActionButton.module.css */
.btn {
  display: flex; align-items: center; gap: 6px;
  width: 100%; padding: 8px 10px; margin-bottom: 6px;
  background: var(--color-paper-dark); border: 1px solid #d0c8b8;
  border-radius: 4px; cursor: pointer; text-align: left;
  font-family: var(--font-serif); color: var(--color-text);
  transition: background 0.15s;
}
.btn:hover:not(:disabled) { background: #e8dfd0; }
.btn:disabled { opacity: 0.45; cursor: not-allowed; }
.icon { font-size: 14px; flex-shrink: 0; }
.label { flex: 1; font-size: 13px; }
.cost { font-size: 11px; color: var(--color-accent); letter-spacing: 1px; }
```

- [ ] **Step 3: Create ChoiceButton.tsx**

```typescript
// src/components/game/ChoiceButton.tsx
import styles from './ChoiceButton.module.css'
import type { Choice } from '../../types'

interface Props {
  choice: Choice
  locked?: boolean
  onClick: () => void
}

export function ChoiceButton({ choice, locked, onClick }: Props) {
  return (
    <button className={styles.btn} disabled={locked} onClick={onClick}>
      <span className={styles.label}>{choice.label}</span>
      {locked && <span className={styles.lock}>🔒</span>}
    </button>
  )
}
```

- [ ] **Step 4: Create ChoiceButton.module.css**

```css
/* src/components/game/ChoiceButton.module.css */
.btn {
  display: flex; justify-content: space-between; align-items: center;
  width: 100%; padding: 10px 14px; margin-bottom: 8px;
  background: transparent; border: 1px solid var(--color-accent);
  border-radius: 4px; cursor: pointer; text-align: left;
  font-family: var(--font-serif); color: var(--color-text);
  transition: background 0.15s, color 0.15s;
}
.btn:hover:not(:disabled) { background: var(--color-accent); color: var(--color-paper); }
.btn:disabled { opacity: 0.4; cursor: not-allowed; }
.label { font-size: 14px; }
.lock { font-size: 12px; }
```

- [ ] **Step 5: Create ActionPanel.tsx**

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
  const { screen, phase, actionPoints, currentNode, performAction, makeChoice, advanceToNextMonth } = useGameStore()
  const state = useGameStore()

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
        <button className={styles.advanceBtn} onClick={advanceToNextMonth}>
          结束本月 →
        </button>
      )}
    </aside>
  )
}
```

- [ ] **Step 6: Create ActionPanel.module.css**

```css
/* src/components/layout/ActionPanel.module.css */
.panel {
  background: var(--color-paper);
  border-left: 1px solid var(--color-paper-dark);
  padding: 16px 12px;
  overflow-y: auto;
  font-family: var(--font-serif);
}
.header { font-size: 13px; color: #888; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid var(--color-paper-dark); }
.nodeTitle { font-size: 15px; font-weight: bold; color: var(--color-accent); margin-bottom: 14px; text-align: center; }
.advanceBtn {
  width: 100%; padding: 10px; margin-top: 12px;
  background: var(--color-accent); color: var(--color-paper);
  border: none; border-radius: 4px; cursor: pointer;
  font-family: var(--font-serif); font-size: 14px;
}
.advanceBtn:hover { opacity: 0.85; }
```

- [ ] **Step 7: Commit**

```bash
git add src/components/
git commit -m "feat: add ActionPanel, ActionButton, ChoiceButton"
```

---

## Task 16: NodeOverlay Component

**Files:** `src/components/story/NodeOverlay.tsx`, `src/components/story/NodeOverlay.module.css`

- [ ] **Step 1: Create NodeOverlay.tsx**

```typescript
// src/components/story/NodeOverlay.tsx
import { useGameStore } from '../../store'
import { ALL_NODES } from '../../data/nodes'
import { evaluateAll } from '../../engine/conditionEvaluator'
import { ChoiceButton } from '../game/ChoiceButton'
import styles from './NodeOverlay.module.css'

export function NodeOverlay() {
  const { currentNode, screen, makeChoice } = useGameStore()
  const state = useGameStore()

  if (screen !== 'node' || !currentNode) return null
  const node = ALL_NODES.find(n => n.id === currentNode)
  if (!node) return null

  const paragraphs = node.narrative.split('\n\n').filter(Boolean)

  return (
    <div className={styles.backdrop}>
      <div className={styles.card}>
        <h2 className={styles.title}>{node.title}</h2>
        <div className={styles.narrative}>
          {paragraphs.map((p, i) => {
            const isMonologue = p.startsWith('*') && p.endsWith('*')
            return (
              <p key={i} className={isMonologue ? styles.monologue : styles.para}>
                {isMonologue ? p.slice(1, -1) : p}
              </p>
            )
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

- [ ] **Step 2: Create NodeOverlay.module.css**

```css
/* src/components/story/NodeOverlay.module.css */
.backdrop {
  position: fixed; inset: 0;
  background: rgba(10, 8, 6, 0.75);
  display: flex; align-items: center; justify-content: center;
  z-index: 100; padding: 20px;
}
.card {
  background: var(--color-paper);
  border: 1px solid var(--color-paper-dark);
  border-radius: 6px;
  max-width: 680px; width: 100%;
  max-height: 85vh; overflow-y: auto;
  padding: 28px 32px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.4);
}
.title {
  font-family: var(--font-serif);
  font-size: 20px; color: var(--color-accent);
  text-align: center; margin-bottom: 20px;
}
.narrative { margin-bottom: 24px; }
.para { font-family: var(--font-serif); font-size: 14px; line-height: 1.9; margin-bottom: 12px; text-indent: 2em; color: var(--color-text); }
.monologue { font-style: italic; color: #7a6558; font-size: 14px; line-height: 1.8; margin-bottom: 12px; text-indent: 2em; }
.choices { border-top: 1px solid var(--color-paper-dark); padding-top: 16px; }
```

- [ ] **Step 3: Commit**

```bash
git add src/components/story/
git commit -m "feat: add NodeOverlay component"
```

---

## Task 17: PrologueScreen Component

**Files:** `src/components/story/PrologueScreen.tsx`, `src/components/story/PrologueScreen.module.css`

- [ ] **Step 1: Create PrologueScreen.tsx**

```typescript
// src/components/story/PrologueScreen.tsx
import { useState } from 'react'
import { useGameStore } from '../../store'
import styles from './PrologueScreen.module.css'

const SCENES = [
  {
    title: '天启六年·家',
    text: `大明天启六年，京郊廖府。\n\n3岁的廖威达坐在父亲肩膀上，院子里有桂花树，母亲在屋里笑着叫吃饭。\n\n*那是一个普通的夜晚。后来他才知道，普通的夜晚是多么珍贵的东西。*`,
  },
  {
    title: '突变',
    text: `黑衣人突袭廖府。\n\n父亲廖承志（锦衣卫千户）奋力抵抗，被大量黑衣人围攻。\n\n母亲将廖威达推入暗室，低声说："不管听到什么，不要出声。"`,
  },
  {
    title: '绝望',
    text: `火光。\n\n一个黑衣人停在门口，看了很久，然后转身走了，没有动手。\n\n他就是李慕尘——天刀门的杀手，在最后一刻选择了反水。\n\n整个宅院被烧毁。廖威达被人发现，收养。`,
  },
  {
    title: '十五年',
    text: `孤僻。刻苦。心中只有一个念头。\n\n十五年，他把仇恨磨成了一把刀，也把自己磨成了一把刀。\n\n十八岁，考中武举，进入锦衣卫。`,
  },
  {
    title: '崇祯元年',
    text: `大明崇祯元年，北京，锦衣卫北镇抚司。\n\n廖威达，18岁，锦衣卫百户。\n\n今天是入职第一天，也是复仇之路的起点。\n\n*十五年了。我回来了。*`,
  },
]

export function PrologueScreen() {
  const [sceneIdx, setSceneIdx] = useState(0)
  const { startGame } = useGameStore()
  const scene = SCENES[sceneIdx]
  const isLast = sceneIdx === SCENES.length - 1

  return (
    <div className={styles.root}>
      <div className={styles.card}>
        <div className={styles.title}>{scene.title}</div>
        <div className={styles.text}>
          {scene.text.split('\n\n').map((p, i) => {
            const isMono = p.startsWith('*') && p.endsWith('*')
            return (
              <p key={i} className={isMono ? styles.monologue : styles.para}>
                {isMono ? p.slice(1, -1) : p}
              </p>
            )
          })}
        </div>
        <div className={styles.btnRow}>
          {isLast
            ? <button className={styles.startBtn} onClick={startGame}>开始游戏 →</button>
            : <button className={styles.nextBtn} onClick={() => setSceneIdx(i => i + 1)}>下一幕 →</button>
          }
        </div>
        <div className={styles.dots}>
          {SCENES.map((_, i) => <span key={i} className={i === sceneIdx ? styles.dotActive : styles.dot} />)}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create PrologueScreen.module.css**

```css
/* src/components/story/PrologueScreen.module.css */
.root {
  min-height: 100vh; display: flex; align-items: center; justify-content: center;
  background: var(--color-ink); padding: 20px;
}
.card {
  background: var(--color-paper); border-radius: 6px;
  max-width: 600px; width: 100%; padding: 40px 48px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.5);
  animation: fadeIn 0.6s ease;
}
@keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
.title { font-family: var(--font-serif); font-size: 22px; color: var(--color-accent); text-align: center; margin-bottom: 24px; }
.para { font-family: var(--font-serif); font-size: 15px; line-height: 1.9; margin-bottom: 14px; text-indent: 2em; color: var(--color-text); }
.monologue { font-style: italic; color: #7a6558; font-size: 14px; line-height: 1.8; margin-bottom: 14px; text-indent: 2em; }
.btnRow { text-align: right; margin-top: 24px; }
.nextBtn, .startBtn {
  padding: 10px 24px; border: none; border-radius: 4px; cursor: pointer;
  font-family: var(--font-serif); font-size: 14px; transition: opacity 0.15s;
}
.nextBtn { background: var(--color-paper-dark); color: var(--color-text); border: 1px solid #c8bfb0; }
.startBtn { background: var(--color-accent); color: var(--color-paper); }
.nextBtn:hover, .startBtn:hover { opacity: 0.85; }
.dots { text-align: center; margin-top: 16px; }
.dot, .dotActive { display: inline-block; width: 6px; height: 6px; border-radius: 50%; margin: 0 3px; }
.dot { background: #c8bfb0; } .dotActive { background: var(--color-accent); }
```

- [ ] **Step 3: Commit**

```bash
git add src/components/story/
git commit -m "feat: add PrologueScreen with 5-scene sequence"
```

---

## Task 18: EndingScreen Component

**Files:** `src/components/story/EndingScreen.tsx`, `src/components/story/EndingScreen.module.css`

- [ ] **Step 1: Create EndingScreen.tsx**

```typescript
// src/components/story/EndingScreen.tsx
import { useGameStore } from '../../store'
import { ALL_ENDINGS } from '../../data/endings'
import styles from './EndingScreen.module.css'

export function EndingScreen() {
  const { endingId } = useGameStore()
  const ending = ALL_ENDINGS.find(e => e.id === endingId)

  function handleRestart() {
    localStorage.removeItem('fuchengzhiren_save')
    window.location.reload()
  }

  if (!ending) return null

  return (
    <div className={styles.root}>
      <div className={styles.card}>
        <div className={styles.badge}>{ending.isHidden ? '隐藏结局' : '结局'}</div>
        <h1 className={styles.title}>{ending.title}</h1>
        <div className={styles.narrative}>
          {ending.narrative.split('\n\n').map((p, i) => (
            <p key={i} className={styles.para}>{p}</p>
          ))}
        </div>
        <button className={styles.restartBtn} onClick={handleRestart}>
          重新开始
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create EndingScreen.module.css**

```css
/* src/components/story/EndingScreen.module.css */
.root {
  min-height: 100vh; display: flex; align-items: center; justify-content: center;
  background: var(--color-ink); padding: 20px;
}
.card {
  background: var(--color-paper); border-radius: 6px;
  max-width: 640px; width: 100%; padding: 40px 48px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.5);
  text-align: center;
}
.badge { font-size: 12px; color: #888; letter-spacing: 2px; margin-bottom: 8px; }
.title { font-family: var(--font-serif); font-size: 28px; color: var(--color-accent); margin-bottom: 28px; }
.narrative { text-align: left; margin-bottom: 32px; }
.para { font-family: var(--font-serif); font-size: 15px; line-height: 1.9; margin-bottom: 14px; text-indent: 2em; color: var(--color-text); }
.restartBtn {
  padding: 12px 36px; background: var(--color-accent); color: var(--color-paper);
  border: none; border-radius: 4px; cursor: pointer;
  font-family: var(--font-serif); font-size: 15px;
}
.restartBtn:hover { opacity: 0.85; }
```

- [ ] **Step 3: Commit**

```bash
git add src/components/story/
git commit -m "feat: add EndingScreen component"
```

---

## Task 19: GameLayout + App Assembly

**Files:** `src/components/layout/GameLayout.tsx`, `src/components/layout/GameLayout.module.css`, `src/App.tsx`, `src/main.tsx`

- [ ] **Step 1: Create GameLayout.tsx**

```typescript
// src/components/layout/GameLayout.tsx
import { StatusPanel } from './StatusPanel'
import { NarrativePanel } from './NarrativePanel'
import { ActionPanel } from './ActionPanel'
import { NodeOverlay } from '../story/NodeOverlay'
import { useGameStore } from '../../store'
import styles from './GameLayout.module.css'

export function GameLayout() {
  const { screen } = useGameStore()
  const narrativeText = screen === 'game'
    ? '崇祯元年，北京，锦衣卫北镇抚司。\n\n廖威达，18岁，锦衣卫百户。今天是入职第一天，也是复仇之路的起点。\n\n*我回来了。十五年，足够长了。*'
    : ''

  return (
    <div className={styles.layout}>
      <StatusPanel />
      <NarrativePanel text={narrativeText} />
      <ActionPanel />
      <NodeOverlay />
    </div>
  )
}
```

- [ ] **Step 2: Create GameLayout.module.css**

```css
/* src/components/layout/GameLayout.module.css */
.layout {
  display: grid;
  grid-template-columns: 250px 1fr 280px;
  height: 100vh;
  overflow: hidden;
  background: var(--color-paper-dark);
  position: relative;
}
```

- [ ] **Step 3: Create src/App.tsx**

```typescript
// src/App.tsx
import { useGameStore } from './store'
import { PrologueScreen } from './components/story/PrologueScreen'
import { GameLayout } from './components/layout/GameLayout'
import { EndingScreen } from './components/story/EndingScreen'

export default function App() {
  const { screen } = useGameStore()

  if (screen === 'prologue') return <PrologueScreen />
  if (screen === 'ending') return <EndingScreen />
  return <GameLayout />
}
```

- [ ] **Step 4: Create src/main.tsx**

```typescript
// src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'
import './styles/theme.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
```

- [ ] **Step 5: Commit**

```bash
git add src/
git commit -m "feat: add GameLayout and wire up App.tsx"
```

---

## Task 20: CSS Theme + Ink Transition

**Files:** `src/styles/global.css`, `src/styles/theme.css`, `src/components/ui/InkTransition.tsx`, `src/components/ui/InkTransition.module.css`

- [ ] **Step 1: Create theme.css**

```css
/* src/styles/theme.css */
:root {
  --color-ink:        #1a1a2e;
  --color-paper:      #f5f0e8;
  --color-paper-dark: #e8e0d0;
  --color-accent:     #8b1a1a;
  --color-text:       #2c1810;
  --font-serif: 'Noto Serif SC', 'Source Han Serif CN', 'SimSun', serif;
}
```

- [ ] **Step 2: Create global.css**

```css
/* src/styles/global.css */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html, body {
  height: 100%;
  background: var(--color-ink);
  color: var(--color-text);
  font-family: var(--font-serif);
  -webkit-font-smoothing: antialiased;
}

#root { height: 100%; }

/* Scrollbar */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--color-paper-dark); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: #c8bfb0; }

button { font-family: inherit; }
```

- [ ] **Step 3: Create InkTransition.tsx**

```typescript
// src/components/ui/InkTransition.tsx
import { useEffect, useState } from 'react'
import styles from './InkTransition.module.css'

interface Props {
  active: boolean
  onDone?: () => void
}

export function InkTransition({ active, onDone }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (active) {
      setVisible(true)
      const t = setTimeout(() => { setVisible(false); onDone?.() }, 800)
      return () => clearTimeout(t)
    }
  }, [active, onDone])

  if (!visible) return null
  return <div className={styles.ink} />
}
```

- [ ] **Step 4: Create InkTransition.module.css**

```css
/* src/components/ui/InkTransition.module.css */
.ink {
  position: fixed; inset: 0; z-index: 999;
  background: radial-gradient(circle at 50% 50%, #1a1a2e 0%, transparent 70%);
  animation: inkSpread 0.8s ease forwards;
  pointer-events: none;
}

@keyframes inkSpread {
  0%   { opacity: 0; transform: scale(0.1); }
  40%  { opacity: 1; transform: scale(1.2); }
  100% { opacity: 0; transform: scale(2); }
}
```

- [ ] **Step 5: Commit**

```bash
git add src/styles/ src/components/ui/
git commit -m "feat: add CSS theme variables and ink transition animation"
```

---

## Task 21: Final Integration + Smoke Test

**Files:** `src/App.tsx` (update), `public/icon-192.png`, `public/icon-512.png`

- [ ] **Step 1: Verify index.html links theme**

Ensure `index.html` loads `<link rel="preconnect" href="https://fonts.googleapis.com">` for Noto Serif SC, or that the Vite config handles font loading. The minimal viable approach: add a Google Fonts link in `index.html`:

```html
<!-- in index.html <head> -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&display=swap" rel="stylesheet">
```

- [ ] **Step 2: Create placeholder PWA icons**

```bash
# Create a minimal 192x192 PNG using Node canvas or ImageMagick
# Simplest approach: copy a placeholder from public/ or generate inline
node -e "
const { createCanvas } = require('canvas')
const fs = require('fs')
function makeIcon(size, file) {
  const c = createCanvas(size, size)
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#8b1a1a'
  ctx.fillRect(0, 0, size, size)
  ctx.fillStyle = '#f5f0e8'
  ctx.font = \`bold \${size/4}px serif\`
  ctx.textAlign = 'center'
  ctx.fillText('刃', size/2, size*0.65)
  fs.writeFileSync(file, c.toBuffer('image/png'))
}
makeIcon(192, 'public/icon-192.png')
makeIcon(512, 'public/icon-512.png')
console.log('Icons created')
"
```

If `canvas` is unavailable, create placeholder solid-color PNGs manually or copy any existing PNG and rename it.

- [ ] **Step 3: Run full test suite**

```bash
npm test
```
Expected: All tests pass (20+ tests across engine, store)

- [ ] **Step 4: TypeScript build check**

```bash
npm run build
```
Expected: Build succeeds with no TypeScript errors. Output in `dist/`.

- [ ] **Step 5: Smoke test in dev**

```bash
npm run dev
```

Manually verify:
1. Browser opens, prologue screen shows with 5-scene sequence
2. Clicking through all 5 scenes reaches "开始游戏" button
3. Clicking "开始游戏" transitions to game screen (3-column layout)
4. StatusPanel shows 崇祯1年正月, attributes, wealth=30, AP=3
5. ActionPanel lists phase 1 actions
6. Clicking an action decrements AP and updates StatusPanel values
7. When AP reaches 0, "结束本月" button appears
8. Clicking "结束本月" advances month; at month 3, node_01 (重逢故友) overlay appears
9. Making a choice in the node overlay applies effects and returns to game screen
10. localStorage key `fuchengzhiren_save` is present in browser devtools

- [ ] **Step 6: Final commit**

```bash
git add .
git commit -m "feat: complete 复仇之刃 game — all 21 tasks done

- Engine: conditionEvaluator, effectApplier, nodeResolver, endingResolver
- Data: 15 story nodes, 9 endings, monthly actions for all 4 phases
- Store: Zustand with auto-save to localStorage
- UI: PrologueScreen, GameLayout, StatusPanel, NarrativePanel, ActionPanel,
       NodeOverlay, EndingScreen, InkTransition
- Theme: water-ink color system with CSS custom properties
- Build: Vite + vite-plugin-pwa, TypeScript strict mode"
```

---

*Plan complete. Tasks 1–21 cover the full implementation from scaffold to smoke-tested PWA.*

