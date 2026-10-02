# 第二章第二案《空屋里的嫁妆》实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将第二章第二案实现为与《雨夜失押》一致的完整调查、闻讯、证物核验和封结流程。

**Architecture:** 以现有第二章引擎和第一案组件为行为基线，新增第二案专属数据、节点和核验工作台。第一案组件保留原有输入和结果；需要扩展的对话渲染采用向后兼容配置，不改变第一案默认路径。

**Tech Stack:** React、TypeScript、Zustand、Vitest、Testing Library、Vite。

**Spec:** `docs/superpowers/specs/2026-09-29-chapter2-case2-redesign.md`

## Global Constraints

- 不修改第一章剧情和系统。
- 不修改第一案已经确认的调查、闻讯、核验和结案逻辑。
- 不修改第一案后的自由行动窗口。
- 不恢复月份、风险、旧自由行动菜单或随机事件。
- 不新增属性、资源、关系字段或机构状态。
- 廖威达只能查访、勘验、闻讯、记录、核验和执行获批行动。
- 图片只记录外部素材需求，不在项目内生成。
- 缺图和缺音乐不得阻断主线。

---

### Task 1: 建立第二案内容数据边界

**Files:**
- Create: `src/data/chapter2Case2.ts`
- Modify: `src/data/chapter2.ts`
- Test: `src/data/__tests__/chapter2Case2.test.ts`

**Interfaces:**
- Produces `chapter2Case2MaterialLabels`
- Produces `chapter2Case2MaterialDescriptions`
- Produces `chapter2Case2MaterialProvenance`
- Produces `chapter2Case2InvestigationActions`
- Produces `chapter2Case2InquiryReviews`
- Produces `chapter2Case2VerificationSets`
- Produces `chapter2Case2MainlineSteps`

- [ ] **Step 1: Write failing data tests**

Test that:

- the case has three investigation lines;
- every line has two investigation actions;
- every action has a concrete outcome narrative;
- every material has a label, description, source and formation text;
- no opening narrative directly grants the inheritance deed;
- case text does not contain `魏承恩`, `景王`, `廖家旧案` or `烧焦木牌`.

- [ ] **Step 2: Run the focused test**

Run: `npm test -- --run src/data/__tests__/chapter2Case2.test.ts`

Expected: FAIL because the second-case data module and tests do not yet exist.

- [ ] **Step 3: Add the second-case data module**

Define the three lines:

- back door and dyehouse;
- inheritance deed and debt pressure;
- credential scope and intermediary handover.

Define the seven material sources specified by the spec and the associated narrative formation text.

- [ ] **Step 4: Add case-node assembly**

Export the new data through the chapter-two data assembly without changing the existing first-case entries.

- [ ] **Step 5: Run focused data tests**

Run: `npm test -- --run src/data/__tests__/chapter2Case2.test.ts`

Expected: PASS.

### Task 2: Add investigation progression and gates

**Files:**
- Modify: `src/engine/gameEngine.ts`
- Modify: `src/types/game.ts` only if a type is required by the existing interfaces
- Test: `src/engine/__tests__/gameEngine.test.ts`

**Interfaces:**
- Produces second-case investigation routing through `chapter2Case2InvestigationActions`.
- Keeps `Chapter2InvestigationState` fields unchanged unless an existing optional field cannot represent the required progress.

- [ ] **Step 1: Write failing engine tests**

Cover:

- entering the second case sets `activeCaseId` to `empty-dowry-house`;
- only the current case’s materials appear in `caseMaterialIds`;
- all three lines remain available until their actions are complete;
- repeated completed actions do not duplicate materials;
- the inquiry node is unavailable before all six actions complete;
- no health, wealth, attribute or relation changes occur from unpriced investigative actions.

- [ ] **Step 2: Run focused engine tests**

Run: `npm test -- --run src/engine/__tests__/gameEngine.test.ts`

Expected: FAIL in the new second-case assertions.

- [ ] **Step 3: Implement case-entry reset**

When entering `chapter2.empty-dowry-house`, set `activeCaseId` and reset only the temporary current-case material list. Preserve chapter-wide `materialIds`, completed first-case state and free-action state.

- [ ] **Step 4: Implement investigation choices**

Add the six actions and their return nodes. The final investigation action exposes a dedicated “结束调查，进入分开闻讯” choice only when all six action IDs are complete.

- [ ] **Step 5: Run focused engine tests**

Run: `npm test -- --run src/engine/__tests__/gameEngine.test.ts`

Expected: PASS for investigation gate and state assertions.

### Task 3: Implement second-case dialogue and testimony sorting

**Files:**
- Modify: `src/components/Chapter2InquiryDialogue.tsx`
- Modify: `src/data/chapter2Case2.ts`
- Modify: `src/engine/gameEngine.ts`
- Test: `src/components/Chapter2InquiryDialogue.test.tsx`
- Test: `src/components/Chapter2InquiryReviewWorkbench.test.tsx`
- Test: `src/engine/__tests__/gameEngine.test.ts`

**Interfaces:**
- Existing first-case dialogue props and behavior remain valid.
- Second-case dialogue nodes use the same line-by-line reveal contract.
- `submitChapter2InquiryReview` accepts second-case review records through the existing data map.

- [ ] **Step 1: Add failing dialogue tests**

Cover:

- each second-case witness has an independent opening question;
- the first click reveals only the first response;
- later clicks reveal later responses;
- the final dialogue step routes to testimony sorting;
- no full testimony appears before the player advances.

- [ ] **Step 2: Add failing review tests**

Cover:

- all four witnesses have three categories;
- each statement must be classified;
- incorrect classifications do not create signed materials;
- correct classifications create only that witness’s signed material;
- comparison records require both prerequisite signed materials.

- [ ] **Step 3: Add second-case dialogue configuration**

Keep first-case speaker, prompt and round-note defaults intact. Add second-case speakers, question prompts and final restatement summaries through additive configuration.

- [ ] **Step 4: Add testimony review data**

Define distinct classification patterns for:

- Lu Xiaoling;
- Lu Sheng;
- the spouse-side witness;
- the tea-stall clerk;
- family-pressure comparison;
- credential-handover comparison.

- [ ] **Step 5: Connect witness selection**

Expose each unfinished witness from the second-case inquiry-select node. After one witness is signed, explicitly seal it before opening the next witness.

- [ ] **Step 6: Run focused component and engine tests**

Run:

`npm test -- --run src/components/Chapter2InquiryDialogue.test.tsx src/components/Chapter2InquiryReviewWorkbench.test.tsx src/engine/__tests__/gameEngine.test.ts`

Expected: PASS, with existing first-case tests unchanged.

### Task 4: Implement exact second-case material verification

**Files:**
- Create: `src/components/Chapter2Case2VerificationWorkbench.tsx`
- Create: `src/components/Chapter2Case2VerificationWorkbench.test.tsx`
- Modify: `src/engine/gameEngine.ts`
- Modify: `src/data/chapter2Case2.ts`
- Test: `src/engine/__tests__/gameEngine.test.ts`

**Interfaces:**
- Component accepts `materialIds`, `fixedFactIds` and `onVerify`.
- Engine exposes a second-case verification submit path without weakening the existing first-case exact-set validator.

- [ ] **Step 1: Write failing component tests**

Cover:

- three propositions are visible;
- each proposition displays its required material count;
- material provenance is visible;
- selected materials are retained when switching propositions;
- submit remains disabled below the required count;
- all materials cannot be submitted as a shortcut.

- [ ] **Step 2: Write failing engine tests**

Cover:

- exact combinations pass;
- missing materials fail;
- extra irrelevant materials fail;
- all materials fail;
- each successful proposition adds one fixed fact;
- the case cannot reach authority review until all three propositions are fixed.

- [ ] **Step 3: Implement the dedicated workbench**

Use the existing verification visual language and material grouping, while keeping the first-case verification component untouched.

- [ ] **Step 4: Implement the exact-set validator**

Validate:

```ts
selected.length === expected.length &&
selected.every((id) => held.includes(id)) &&
sameMembers(selected, expected)
```

Do not use subset matching or “at least these materials” logic.

- [ ] **Step 5: Add player-facing rejection results**

Explain that the submitted materials are individually real but do not prove the selected proposition together.

- [ ] **Step 6: Run focused verification tests**

Run:

`npm test -- --run src/components/Chapter2Case2VerificationWorkbench.test.tsx src/engine/__tests__/gameEngine.test.ts`

Expected: PASS.

### Task 5: Implement branch choice and case closure

**Files:**
- Modify: `src/data/chapter2Case2.ts`
- Modify: `src/engine/gameEngine.ts`
- Modify: `src/components/Chapter2CaseWorkbench.tsx`
- Modify: `src/components/ResultPanel.tsx`
- Test: `src/components/Chapter2CaseWorkbench.test.tsx`
- Test: `src/components/ResultPanel.test.tsx`
- Test: `src/engine/__tests__/gameEngine.test.ts`

**Interfaces:**
- Produces exactly one of `c2_02_witness_deed` and `c2_02_receipt_chain`.
- Produces `slip_chain_2`.
- Sends the player to `chapter2.before-the-watch-drum`.

- [ ] **Step 1: Write failing closure tests**

Cover:

- the closure node shows three confirmed propositions before branch choice;
- both branch choices are available only after all propositions pass;
- selecting one branch prevents the other branch from being written;
- repeated submission does not duplicate flags or branch IDs;
- the next node is the existing third-case entry.

- [ ] **Step 2: Write failing result-panel tests**

Cover:

- receipt label is `案件封结回执`;
- title is `空屋里的嫁妆 · 已正式封结`;
- confirmed facts, responsibility results and unresolved questions are separate;
- branch-specific preservation text is visible;
- no “绑架已确认” wording appears.

- [ ] **Step 3: Add closure narrative**

Use the existing case-closure visual hierarchy and覃保坤’s procedural voice. The conclusion must explicitly state why the case can close even though the intermediary’s upstream remains unresolved.

- [ ] **Step 4: Add case-record display**

Show current case, investigation-line progress, formed materials, witness status, fixed propositions and selected preservation branch. Do not reveal the third case early.

- [ ] **Step 5: Run focused closure tests**

Run:

`npm test -- --run src/components/Chapter2CaseWorkbench.test.tsx src/components/ResultPanel.test.tsx src/engine/__tests__/gameEngine.test.ts`

Expected: PASS.

### Task 6: Connect desktop routing and audio stages

**Files:**
- Modify: `src/components/GameLayout.tsx`
- Modify: `src/components/GameLayout.test.tsx`
- Modify: `src/components/Chapter2CaseWorkbench.tsx`
- Modify: `src/audio/audioEngine.ts` only if an existing stage selector cannot express the new nodes

- [ ] **Step 1: Write failing layout tests**

Cover:

- second-case investigation uses the investigation workbench;
- second-case inquiry uses the dialogue UI;
- second-case review uses the sorting workbench;
- second-case verification uses the new verification workbench;
- second-case closure uses the result receipt;
- existing first-case stage routing remains unchanged.

- [ ] **Step 2: Add node routing**

Route only second-case nodes to new behavior. Do not alter the first-case node predicates except where an additive prefix check is required.

- [ ] **Step 3: Verify music stage selection**

Investigation uses the existing chapter-two investigation track. Inquiry, sorting, comparison and verification use the existing inquiry track. Missing audio continues to fall back without blocking.

- [ ] **Step 4: Run focused layout tests**

Run: `npm test -- --run src/components/GameLayout.test.tsx`

Expected: PASS.

### Task 7: Repair save and restore for the complete second case

**Files:**
- Modify: `src/store/saveRepository.ts`
- Modify: `src/store/__tests__/saveRepository.test.ts`
- Test: `src/engine/__tests__/gameEngine.test.ts`

- [ ] **Step 1: Write failing save tests**

Cover saves taken:

- after one investigation action;
- after all investigation actions;
- during each witness sequence;
- after one testimony review;
- after a comparison material is formed;
- after one verification proposition;
- after branch closure.

- [ ] **Step 2: Preserve `inquiryReviewAttempts`**

Validate and persist the existing optional review-attempt map instead of silently dropping it during save normalization.

- [ ] **Step 3: Make material reconstruction data-driven**

Restore second-case action materials, signed testimony prerequisites and comparison prerequisites from the second-case data definitions. Do not hard-code only the first-case material list.

- [ ] **Step 4: Keep first-case restoration behavior**

Run existing first-case save tests and confirm the twelve first-case materials are still restored at the same checkpoints.

- [ ] **Step 5: Run save tests**

Run: `npm test -- --run src/store/__tests__/saveRepository.test.ts`

Expected: PASS.

### Task 8: Add developer checkpoints and external asset brief

**Files:**
- Modify: `src/engine/gameEngine.ts`
- Modify: `src/components/DeveloperMenu.tsx`
- Modify: `src/components/DeveloperMenu.test.tsx`
- Create: `docs/assets/chapter2-case2-external-image-brief.md`

- [ ] **Step 1: Add second-case checkpoints**

Add checkpoints for:

- investigation start;
- inquiry start;
- verification start;
- closure result.

Checkpoints must preload only the materials appropriate to the selected stage and must not alter player-facing normal progression.

- [ ] **Step 2: Add developer-menu tests**

Verify labels and checkpoint IDs without adding any new player-visible system.

- [ ] **Step 3: Write external image brief**

Record prompt, aspect ratio, no-text requirement, alternative text and spoiler boundary for each proposed image. Do not generate or import images.

### Task 9: Full regression and review

**Files:**
- No new production files unless earlier tests expose a required correction.

- [ ] **Step 1: Run all automated tests**

Run: `npm test -- --run`

Expected: all existing and new tests pass.

- [ ] **Step 2: Run type checking**

Run: `npm run typecheck`

Expected: PASS.

- [ ] **Step 3: Run lint and production build**

Run:

`npm run lint`

`npm run build`

Expected: both PASS.

- [ ] **Step 4: Run desktop browser verification**

Use the existing browser-testing workflow to verify:

- first chapter remains unchanged;
- first case remains unchanged;
- the free-action window remains reachable and one-time;
- second case cannot skip investigation or inquiry;
- every dialogue advances one step at a time;
- incorrect verification submissions return to the workbench;
- successful closure reaches the third case;
- missing image/audio assets do not block progression.

- [ ] **Step 5: Review the final diff**

Check specifically for:

- accidental changes to first-chapter data;
- accidental changes to first-case exact material sets;
- reintroduced month/risk/free-action-loop code;
- new global flags outside the approved baseline;
- premature references to魏承恩、景王、廖家旧案或烧焦木牌.
