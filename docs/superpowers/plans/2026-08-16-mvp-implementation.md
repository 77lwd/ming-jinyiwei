# 《我在明朝当锦衣卫》MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an offline, responsive browser-playable MVP covering the prologue and months 1-3, including deterministic actions, the Zhou/Feng relationship event, local autosave, and a chapter-complete screen.

**Architecture:** A pure TypeScript game engine owns validation, state transitions, narrative results, and save serialization. Static MVP story data defines prologue scenes, actions, and the month-3 event. React renders the current engine state through focused panels; Zustand is the single UI-facing store and persists versioned snapshots to localStorage.

**Tech Stack:** React 18, TypeScript, Vite, Zustand, Vitest, Testing Library, vite-plugin-pwa, CSS.

---

### Task 1: Project Scaffold

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`
- Create: `src/main.tsx`, `src/App.tsx`, `src/vite-env.d.ts`, `src/test-setup.ts`
- Create: `public/icon.svg`
- Create: `.gitignore`

- [ ] Add the React/Vite package scripts and dependencies.
- [ ] Configure Vitest with jsdom and PWA generation.
- [ ] Add the app entry and a minimal renderable shell.
- [ ] Run `npm install`, `npm run build`, and `npm test`.

### Task 2: Domain Types and Pure Engine

**Files:**
- Create: `src/types/game.ts`, `src/types/index.ts`
- Create: `src/engine/conditions.ts`, `src/engine/effects.ts`, `src/engine/gameEngine.ts`
- Test: `src/engine/__tests__/gameEngine.test.ts`

- [ ] Write failing tests for initial state, action validation, clamping, month transitions, and structured failure results.
- [ ] Implement discriminated-union types for attributes, clues, actions, events, narrative blocks, and `GameState`.
- [ ] Implement pure action execution and month-end transitions with no randomness.
- [ ] Run the focused engine tests, then the full test suite and typecheck.

### Task 3: MVP Story Data

**Files:**
- Create: `src/content/prologue.ts`, `src/content/actions.ts`, `src/content/events.ts`
- Test: `src/content/__tests__/storyData.test.ts`

- [ ] Write tests for five prologue scenes, the month-1 token event, the month-3 Feng event, and the four required choices.
- [ ] Add actual Chinese narrative copy from the approved MVP specification.
- [ ] Encode action conditions/effects using the engine types and ensure every referenced flag/clue exists.
- [ ] Run content tests and typecheck.

### Task 4: Store and Versioned Save

**Files:**
- Create: `src/store/gameStore.ts`, `src/store/saveRepository.ts`
- Test: `src/store/__tests__/saveRepository.test.ts`, `src/store/__tests__/gameStore.test.ts`

- [ ] Write failing tests for new/continue/restart, autosave after a successful command, corrupted-save fallback, and version mismatch fallback.
- [ ] Implement a versioned localStorage repository that never throws corrupted data to the UI.
- [ ] Implement Zustand commands delegating all rules to the pure engine.
- [ ] Run store tests and typecheck.

### Task 5: Game UI

**Files:**
- Create: `src/components/TitleScreen.tsx`, `src/components/PrologueView.tsx`, `src/components/GameLayout.tsx`, `src/components/StatusRail.tsx`, `src/components/NarrativePanel.tsx`, `src/components/ActionGrid.tsx`, `src/components/EventChoice.tsx`, `src/components/RecentEvents.tsx`, `src/components/ChapterComplete.tsx`
- Create: `src/styles/app.css`
- Modify: `src/App.tsx`
- Test: `src/components/__tests__/GameFlow.test.tsx`

- [ ] Write failing UI tests for start, prologue advance/skip, action execution, event choice confirmation, and chapter completion.
- [ ] Implement a title screen with continue/restart/new-game states.
- [ ] Implement a mobile-first game shell with narrative-first layout, status rail, action controls, event choices, and recent-event history.
- [ ] Use accessible buttons, labels, focus states, and `aria-live` for outcome narratives.
- [ ] Run component tests and typecheck.

### Task 6: PWA and Runtime Polish

**Files:**
- Modify: `vite.config.ts`, `index.html`, `src/styles/app.css`
- Create: `public/manifest.webmanifest` only if generated manifest needs a static fallback.

- [ ] Configure installable standalone metadata and a minimal icon.
- [ ] Add responsive breakpoints for 320px, 768px, 1024px, and desktop widths.
- [ ] Add visible loading/error/empty states and prevent advancing with insufficient action points.
- [ ] Run `npm run build` and inspect the generated PWA assets.

### Task 7: End-to-End Verification

**Files:**
- Modify: only files required by verification fixes.

- [ ] Start the dev server with `npm run dev -- --host 127.0.0.1`.
- [ ] Use a real browser to verify title screen, prologue, month 1-3 flow, autosave/continue, responsive layout, and clean console.
- [ ] Run `npm test`, `npm run build`, and `npx tsc --noEmit` after all fixes.
- [ ] Confirm the first version opens at the local URL and report the URL, test results, and known MVP boundaries.
