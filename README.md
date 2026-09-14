# 我在明朝当锦衣卫

![《我在明朝当锦衣卫》标题画面](public/assets/title/title-cover-desktop-v1.jpg)

一款桌面端优先的历史悬疑文字游戏。玩家扮演初入北镇抚司的锦衣卫校尉廖威达，在场景阅读、证据核验、权限请示与有限的办差选择中推进案件，并承担每一次行动带来的结果。

当前版本：`v0.1.0`

## 当前可玩内容

- 序章：廖威达进入北镇抚司前的往事与入署。
- 第一章《纸灰里的银子》：完整的查案循环，包括现场查访、材料核验、向覃保坤请示、夜间保全、烧焦木牌、冯天顺重逢、责任判断与结案反馈。
- 人脉、银两、健康与证据会随剧情以明确的叙事结果变化；它们服务于案件，而不是独立的数值养成循环。
- 游戏总体规划为序章加五章，第五章为固定终局；目前完整实现与试玩重点是序章和第一章。

## 游戏原则

- 案件优先：场景、已知事实与下一项有后果的行动比常驻系统面板更重要。
- 权限有边界：廖威达能查、能提议的事，与必须请示的事会在剧情中明确区分。
- 后果需要停顿：获得证据、人物交锋、资源代价与结案都会先落在叙事里，再交还选择权。
- 桌面端阅读：以键鼠操作与长文本阅读为目标，暂不做移动端、PWA 或商店适配。

## 本地运行

需要已安装 Node.js 与 npm。

```powershell
git clone git@github.com:77lwd/ming-jinyiwei-mvp.git
cd ming-jinyiwei-mvp
npm install
npm run dev
```

Vite 启动后会在终端显示本地访问地址。没有图片素材时，叙事与流程仍应可以继续；素材只增强场景表现，不阻断游戏。

## 常用命令

| 命令 | 用途 |
| --- | --- |
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 进行 TypeScript 构建检查并生成生产构建 |
| `npm test` | 运行 Vitest 单元与组件测试 |
| `npm run test:e2e` | 构建后运行 Playwright 桌面端流程测试 |
| `npm run typecheck` | 运行 TypeScript 类型检查 |
| `npm run lint` | 运行 ESLint |
| `npm run preview` | 预览生产构建 |

## 项目结构

```text
src/
  data/        剧情节点、章节内容与人脉数据
  engine/      游戏状态推进与效果结算
  store/       Zustand 状态与本地存档
  components/  序章、案件工作台、档案抽屉与结案界面
  styles/      案牍式桌面端视觉样式
public/assets/ 场景、人物、事件与音频素材
docs/          产品原则、设计基线、实施记录与架构决策
e2e/           Playwright 桌面端流程测试
```

## 开发约定

- 第一章是后续章节的实现样板：以查案节奏、证据反馈、权限边界和资源代价组织内容。
- 覃保坤在廖威达归入百户所后立即出现在人脉中；冯天顺只在第一章末重逢后加入。
- 夜间保全火场残料消耗 `5` 两银子，不减少健康。
- 已废弃旧的月份、风险与自由行动系统，后续功能不应恢复它们。
- 图片由外部生成或补充时，保持桌面端横幅构图，并确保缺图不会阻断流程。

## 文档入口

- [产品说明](PRODUCT.md)
- [开发流程](docs/development-workflow.md)
- [桌面端章节循环决策](docs/decisions/ADR-001-desktop-chapter-loop.md)
- [废弃自由行动循环决策](docs/decisions/ADR-002-retire-free-action-loop.md)
- [完整游戏内容基线](docs/superpowers/specs/2026-09-04-full-game-content-baseline.md)
- [跨章节状态基线](docs/superpowers/specs/2026-09-05-cross-chapter-state-baseline.md)

## 版本

`v0.1.0` 是序章与第一章的可试玩基线版本。后续章节会沿用第一章已建立的案件结构与视觉方向继续实现。
