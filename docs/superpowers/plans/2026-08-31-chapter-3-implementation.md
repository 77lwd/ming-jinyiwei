# 第三章“看见节点”实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在现有文字游戏引擎中接入第三章“看见节点”的四段固定流程、证据链、选择后果和章节结算，同时保留现有序章、第一章和第二章内容。

**Architecture:** 在现有 `GameState -> gameEngine -> GameEvent` 流程上增加显式章节进度，不把第三章伪装成普通月度事件。第三章事件独立放在 `src/data/chapterThreeEvents.ts`，由引擎按章节步骤和前置条件稳定推进；事件选择仍通过现有 `Effect`、线索和旗标机制产生可保存的后果。UI只增加章节标签、证据链状态和结果反馈，不重做现有布局。

**Tech Stack:** React 19, TypeScript, Vite, Zustand, Vitest, Testing Library, Playwright

**Spec:** `docs/superpowers/specs/2026-08-31-chapter-3-story-design.md` 及 `docs/superpowers/specs/2026-08-30-chapter-3-rule-baseline.md`

## Global Constraints

- 廖威达仍是北镇抚司校尉，不能自行越级调档、搜查、拘押、越辖或直呈御前。
- 第三章不新增有姓名的关键剧情人物；库吏、递运所经手人、地方执行人员和书吏均为职能性 NPC。
- 关键结论至少由两类独立材料互相印证，不能由单一 NPC 自白包办。
- 第三章只扳倒魏承恩，不在本章揭露景王、木牌来源或廖家灭门全部真相。
- 不删除或重写现有序章、第一章、第二章数据；旧存档缺少新字段时必须可继续读取。
- 代码修改使用测试驱动开发；每个任务完成后运行对应测试和 `npm run build`。

---

## 文件边界

- `src/types/game.ts`：章节标识、章节步骤和章节状态类型。
- `src/engine/gameEngine.ts`：章节入口、四段顺序、事件完成后的步骤推进和章节完成结算。
- `src/store/saveRepository.ts`：新字段校验、旧存档迁移和版本处理。
- `src/store/gameStore.ts`：注册第三章事件，保持存档和事件选择流程一致。
- `src/data/chapterThreeEvents.ts`：四段事件、选项、线索、旗标和资源效果。
- `src/data/monthlySchedule.ts`：只在确认章节入口仍需要月度调度时增加入口映射，不承载四段内部顺序。
- `src/data/__tests__/storyData.test.ts`：事件数据的完整性、证据和禁止信息检查。
- `src/engine/__tests__/gameEngine.test.ts`：章节推进、权限、选择后果和存档流程测试。
- `src/components/NarrativePanel.tsx`、`src/components/ResultPanel.tsx`、`src/components/StatusRail.tsx`、`src/styles/app.css`：章节标签、证据链和结果信息的玩家可见反馈。
- `src/components/__tests__/GameFlow.test.tsx`：从章节入口到魏承恩被扳倒的界面流程测试。
- `docs/playtest-feedback-round-2.md`：实现完成后追加本阶段状态，不改写原始反馈。

## Task 1: 建立章节进度和旧存档兼容

**Files:**
- Modify: `src/types/game.ts`
- Modify: `src/engine/gameEngine.ts`
- Modify: `src/store/saveRepository.ts`
- Test: `src/store/__tests__/saveRepository.test.ts`
- Test: `src/engine/__tests__/gameEngine.test.ts`

**Interfaces:**
- Produces `ChapterId = 'chapter1' | 'chapter2' | 'chapter3' | 'chapter4' | 'chapter5'`。
- Produces `Chapter3Step = 'unreceived' | 'route_search' | 'triplicate_records' | 'sealed_presentment' | 'complete'`。
- `GameState` 增加 `chapter: ChapterId` 与 `chapter3Step: Chapter3Step | null`。
- `createInitialState()` 返回 `chapter: 'chapter1'`、`chapter3Step: null`。

- [ ] **Step 1: 写失败测试**：在存档测试中构造不带 `chapter` 和 `chapter3Step` 的旧状态，断言 `loadSave()` 返回迁移后的 `chapter: 'chapter1'`、`chapter3Step: null`；构造 `chapter3Step: 'route_search'` 的状态，断言字段被保留。
- [ ] **Step 2: 运行测试确认失败**：运行 `npm test -- --run src/store/__tests__/saveRepository.test.ts src/engine/__tests__/gameEngine.test.ts`，预期因类型和校验缺少新字段而失败。
- [ ] **Step 3: 实现最小状态扩展**：增加类型、初始值和存档校验；将 `SAVE_VERSION` 升到 `2`，`loadSave()` 接受版本 1 并迁移到版本 2，迁移只补章节字段，不改变原有月份、属性、线索和旗标。
- [ ] **Step 4: 运行测试确认通过**：重复运行同一测试命令，并执行 `npm run build`。
- [ ] **Step 5: 提交**：`git add src/types/game.ts src/engine/gameEngine.ts src/store/saveRepository.ts src/store/__tests__/saveRepository.test.ts src/engine/__tests__/gameEngine.test.ts && git commit -m "feat: add chapter progress state with save migration"`

## Task 2: 编写第三章四段事件数据

**Files:**
- Create: `src/data/chapterThreeEvents.ts`
- Modify: `src/data/__tests__/storyData.test.ts`
- Test: `src/data/__tests__/storyData.test.ts`

**Interfaces:**
- Produces `chapterThreeEvents: Record<string, GameEvent>`，键固定为：
  `chapter3_unreceived`、`chapter3_route_search`、`chapter3_triplicate_records`、`chapter3_sealed_presentment`。
- 每个事件只使用现有 `Condition` 与 `Effect` 类型；不在事件数据中直接修改 `GameState`。
- 事件选择产生的旗标固定使用 `chapter3_` 前缀；证据线索固定使用 `chapter3_` 前缀。

- [ ] **Step 1: 写失败数据测试**：断言四个事件都存在；每个事件至少有两项选择；每个关键结论相关选项至少包含一条线索或旗标效果；文本不出现景王、木牌来源、廖家灭门完整真相等越界结论。
- [ ] **Step 2: 运行测试确认失败**：运行 `npm test -- --run src/data/__tests__/storyData.test.ts`，预期因文件不存在而失败。
- [ ] **Step 3: 写四段事件**：按剧情设计稿逐段写完整叙事、调查节点、选择和后果。第一段只产生未签收异常；第二段只产生两类线索合并后的留置地点与库吏事实；第三段产生命令内容、送达、执行和魏知情证据；第四段产生直呈、临时停签、魏被扳倒和章末接管旗标。每段至少提供一条低属性可走的程序路径。
- [ ] **Step 4: 运行数据测试**：运行 `npm test -- --run src/data/__tests__/storyData.test.ts` 和 `npm run build`。
- [ ] **Step 5: 提交**：`git add src/data/chapterThreeEvents.ts src/data/__tests__/storyData.test.ts && git commit -m "feat: add chapter three investigation events"`

## Task 3: 接入四段固定推进和证据条件

**Files:**
- Modify: `src/engine/gameEngine.ts`
- Modify: `src/store/gameStore.ts`
- Modify: `src/data/monthlySchedule.ts` only if the chapter-entry mapping requires it
- Test: `src/engine/__tests__/gameEngine.test.ts`
- Test: `src/store/__tests__/gameStore.test.ts`

**Interfaces:**
- `beginChapterThree(state: GameState): CommandResult`：仅在 `state.chapter === 'chapter3'` 且 `chapter3Step === 'unreceived'` 时打开第一段事件。
- `getChapterThreeNextEventId(state: GameState): string | null`：按 `chapter3Step` 返回唯一下一事件，不使用随机抽取。
- `GameStore` 增加 `beginChapterThree: () => void`，只调用引擎入口并通过现有 `persistAndSet` 保存结果；界面不得直接修改章节字段。
- `confirmResult()` 在四段事件完成后推进 `chapter3Step`；第四段确认后设置 `chapter: 'chapter4'`，保留 `chapter3_network_continues: true`。

- [ ] **Step 1: 写失败流程测试**：测试四段只能按 `unreceived -> route_search -> triplicate_records -> sealed_presentment -> complete` 顺序打开；未完成前置旗标时不能跳段；每段选择后进入结果页，确认后才推进。
- [ ] **Step 2: 写失败权限测试**：测试第三章事件不会绕过现有 `getActionLockReason`；玩家不能通过事件选择直接执行搜查、拘押或直呈，相关结果必须表现为请求当地协作、复核处发令或值掌岗位直呈。
- [ ] **Step 3: 实现事件注册和推进**：在 `gameStore.ts` 注册 `chapterThreeEvents`；在引擎中按章节步骤读取事件。选择效果只写入线索、旗标和资源变化；步骤推进集中在 `confirmResult()`，避免重复点击造成重复效果。
- [ ] **Step 4: 实现证据门槛**：第三段入口要求第二段已取得留置事实及至少一项路线/封套证据；第四段入口要求命令内容、实际执行和至少两类独立归责记录旗标。证据不足时保留补查路径，不生成魏被扳倒结果。
- [ ] **Step 5: 运行引擎和存储测试**：运行 `npm test -- --run src/engine/__tests__/gameEngine.test.ts src/store/__tests__/gameStore.test.ts` 和 `npm run build`。
- [ ] **Step 6: 提交**：`git add src/engine/gameEngine.ts src/store/gameStore.ts src/data/monthlySchedule.ts src/engine/__tests__/gameEngine.test.ts src/store/__tests__/gameStore.test.ts && git commit -m "feat: wire chapter three progression and evidence gates"`

## Task 4: 完善章节可见反馈

**Files:**
- Modify: `src/components/NarrativePanel.tsx`
- Modify: `src/components/ResultPanel.tsx`
- Modify: `src/components/StatusRail.tsx`
- Modify: `src/styles/app.css`
- Test: `src/components/__tests__/GameFlow.test.tsx`

**Interfaces:**
- 章节事件显示稳定的章节标签和当前调查目标；不把内部旗标名直接展示给玩家。
- 结果页显示本次新增证据、证据状态、资源变化和下一阶段目标。
- 状态栏显示第三章调查进度，不新增与现有设计冲突的复杂面板。

- [ ] **Step 1: 写失败界面测试**：进入第三章第一段时断言页面显示“第三章·看见节点”和“当前目标：核对未签收移交”；完成第三段后断言结果页显示已获得的命令/执行证据；第四段完成后断言显示“魏承恩已被解除指挥使职务”，而不是“已定罪”。
- [ ] **Step 2: 运行测试确认失败**：运行 `npm test -- --run src/components/__tests__/GameFlow.test.tsx`。
- [ ] **Step 3: 实现最小 UI 反馈**：从 `GameState.chapter` 与 `chapter3Step` 派生显示文案；复用现有结果效果列表和线索列表；为证据状态增加清晰的文字层级和移动端换行样式。
- [ ] **Step 4: 运行组件测试和构建**：运行 `npm test -- --run src/components/__tests__/GameFlow.test.tsx`、`npm run build`。
- [ ] **Step 5: 提交**：`git add src/components/NarrativePanel.tsx src/components/ResultPanel.tsx src/components/StatusRail.tsx src/styles/app.css src/components/__tests__/GameFlow.test.tsx && git commit -m "feat: surface chapter three investigation progress"`

## Task 5: 端到端验收与逻辑回归

**Files:**
- Modify: `docs/playtest-feedback-round-2.md`
- Test: `src/data/__tests__/storyData.test.ts`
- Test: `src/engine/__tests__/conditions.test.ts`
- Test: `src/engine/__tests__/effects.test.ts`
- Test: `src/engine/__tests__/gameEngine.test.ts`
- Test: `src/store/__tests__/saveRepository.test.ts`
- Test: `src/components/__tests__/GameFlow.test.tsx`
- Test: `e2e/mvp.spec.ts` only if existing selectors or full-flow assumptions change

- [ ] **Step 1: 写第三章回归断言**：增加一条完整流程测试，覆盖低武力、低口才、低健康和低财富状态仍能通过程序协作完成章节；增加一条失败代价测试，确认证据不足时不能扳倒魏承恩；增加一条重复确认测试，确认资源和旗标只应用一次。
- [ ] **Step 2: 运行全套验证**：运行 `npm test -- --run`、`npm run build` 和 `npm run lint`。
- [ ] **Step 3: 检查旧流程**：确认序章、第一章木牌事件、第二章已有事件、月份结算和旧存档迁移测试仍通过；不因章节字段导致旧内容直接跳入第三章。
- [ ] **Step 4: 更新反馈状态**：在 `docs/playtest-feedback-round-2.md` 末尾追加第三章实施状态、已验证范围和剩余历史制度名词核验项，不删除原始玩家反馈。
- [ ] **Step 5: 进行代码质量审查**：使用 `code-review-and-quality` 检查状态迁移、重复事件、存档兼容、UI回归和测试覆盖；发现问题先修复再提交。
- [ ] **Step 6: 提交验收版本**：`git add docs/playtest-feedback-round-2.md src e2e && git commit -m "test: verify chapter three end to end"`

## Checkpoints

### Checkpoint A: 状态和数据

- [ ] Task 1、Task 2 完成。
- [ ] 旧存档可读取，新存档包含章节字段。
- [ ] 四段事件数据通过越界信息和结构完整性测试。
- [ ] 用户审阅后才继续推进引擎接入。

### Checkpoint B: 流程和界面

- [ ] Task 3、Task 4 完成。
- [ ] 四段顺序固定，证据不足不能跳到扳倒结果。
- [ ] 玩家能看到当前目标、证据和阶段性胜利。
- [ ] 全套单元、组件和构建检查通过。

### Checkpoint C: 验收

- [ ] Task 5 完成。
- [ ] 旧流程和旧存档没有回归。
- [ ] 第三章低资源路线可完成但会承担时间、证据或证人状态代价。
- [ ] 代码质量审查通过后，才交玩家试玩。

## 不会改动的范围

- 不改序章图片、第一章和第二章已确认剧情文本。
- 不在本计划中设计第四、第五章具体剧情。
- 不接入外部生图、浏览器试玩或新音乐素材。
- 不用随机数替代第三章四段的固定证据顺序。
- 不增加魏承恩之外的新姓名高层，不让景王提前出场。

## 用户需要确认的内容

计划确认后，实施阶段默认采用当前四段事件 ID、章节字段和证据旗标命名。历史制度正式称谓仍作为文本核验项处理，只替换显示名，不改变事件条件和因果链。
