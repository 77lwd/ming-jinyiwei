# I Am a Jinyiwei in Ming China

[中文](README.md)

![Title artwork for I Am a Jinyiwei in Ming China](public/assets/title/title-cover-desktop-v1.jpg)

A desktop-first historical mystery interactive fiction game. You play Liao Weida, a junior Jinyiwei officer newly assigned to the Northern Garrison. Read people and places, inspect physical facts, verify materials, request authority when it is needed, and live with the consequences of every bounded decision.

Current version: `v0.2.2`

Version highlights and release history are maintained in Chinese: [中文更新说明](CHANGELOG.md).

## Project Status

| Area | Current status |
| --- | --- |
| Playable content | Prologue, Chapter 1, and the first two cases of Chapter 2 |
| Narrative plan | A prologue and five chapters, with Chapter 5 as the fixed ending |
| Current implementation focus | Chapter 2 case flows, evidence verification, artwork, and playtest fixes |
| Target platform | Desktop browsers with keyboard and mouse input |
| Not in scope | Mobile support, PWA work, store releases, and a standalone free-action loop |

`v0.2.2` keeps the playable content from the second case of Chapter 2, *The Dowry in the Empty House*, and adds a detailed Chinese installation and launch guide to the main README. The remaining Chapter 2 content and later chapters are still being developed.

## Playable Content

- **Prologue:** Liao Weida's past and his entry into the Northern Garrison.
- **Chapter 1, *Silver in the Paper Ashes*:** A complete investigation loop involving field visits, material verification, reporting to Qian Baokun, overnight preservation, the charred wooden token, Feng Tianshun's reunion, a responsibility judgment, and formal case closure.
- **Chapter 2:** The first two cases, *Rain-Night Transfer* and *The Dowry in the Empty House*, with a limited interlude after the first case.
- **Narrative state:** Evidence, silver, health, and connections change through explicit story outcomes. They serve the case rather than a separate progression grind.

## How a Case Moves

Chapter 1 begins with a burned paper shop. Ledgers, fire debris, a missing person, and a charred wooden token turn what appears to be an ordinary accident into a deeper investigation.

A case normally moves through this rhythm:

1. **Enter a scene.** Read the location, people, and known facts to identify the immediate problem.
2. **Choose a line of inquiry.** Visit the scene, verify materials, question relevant people, or seek approval when Liao lacks authority.
3. **Receive traceable feedback.** New evidence records its source and how it was obtained; denied actions explain the procedural boundary.
4. **Take the immediate consequence.** Changes to silver, health, connections, or evidence land in the narrative before the casework view returns.
5. **Submit a judgment and close the case.** Responsibility must rest on established facts, and closure provides a memorial, a ruling, and relationship changes.

Chapter 1 is the implementation model for later chapters. The aim is not to accumulate options, but to make case progression, evidence feedback, procedural limits, and resource costs reinforce one another.

## Design Principles

- **The case is the primary interface.** The current scene, concrete facts, and the next consequential decision matter more than permanent system chrome.
- **Narrative needs room.** Long-form reading, dialogue rhythm, and scene art are core interactions rather than filler between buttons.
- **Authority must feel real.** The story and interface distinguish what Liao can inspect or propose from what requires an officer's approval.
- **Consequences deserve a pause.** Evidence gains, confrontations, costs, and case closure appear as results before control returns to the player.
- **State appears when relevant.** Health, silver, evidence, and connections serve the case instead of becoming an isolated optimization loop.
- **Dossier structure, cinematic focus.** A Northern Garrison case dossier organizes the workbench, while key characters and story beats let the scene take visual priority.

## State and Saves

The game tracks a small set of states directly tied to the case:

| State | Purpose |
| --- | --- |
| Evidence | Supports verification, responsibility judgments, and later narrative feedback |
| Silver | Represents the real cost of certain assignments and preservation actions |
| Health | Changes only when the narrative clearly establishes a physical cost |
| Connections | Records story-established relationships that can affect later feedback |

Saves are stored in the current browser's `localStorage` under the key `ming_jinyiwei.save.v3`. Clearing site data, changing browsers, or moving to another device does not carry a save across automatically.

Established Chapter 1 rules include:

- Qian Baokun appears in the connection record as soon as Liao joins his hundred-household office.
- Feng Tianshun joins the connection record only after their reunion at the end of Chapter 1.
- Hiring people to guard the fire-scene material overnight costs `5` taels of silver and does not reduce health.
- The former month, risk, and free-action systems have been retired and must not be reintroduced.

## Run Locally

Install Node.js and npm first. The repository is currently private, so clone it with a GitHub account that has access.

```powershell
git clone https://github.com/77lwd/ming-jinyiwei.git
cd ming-jinyiwei
npm install
npm run dev
```

Vite will print a local URL in the terminal. Images and audio deepen the scene, but missing media must never block reading or the mainline flow.

### Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Run the TypeScript build check and create a production build |
| `npm test` | Run Vitest unit and component tests |
| `npm run test:e2e` | Build the project, then run the Playwright desktop flow test |
| `npm run typecheck` | Run the TypeScript type check |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview the production build |

Before the first end-to-end run, install Playwright browsers if they are not already available on the machine:

```powershell
npx playwright install
```

## Project Layout

```text
src/
  data/        Prologue, chapter nodes, connections, and scene data
  engine/      State progression, conditions, and effect resolution
  store/       Zustand state and browser-local saves
  components/  Prologue, case workbench, archive drawer, status rail, and closure views
  styles/      Northern Garrison dossier-style desktop presentation
public/assets/ Scene, character, event, title, and audio assets
docs/          Product principles, content baselines, implementation notes, and ADRs
e2e/           Playwright desktop main-flow test
```

## Visual Direction and Assets

Chapter 1 uses a “Northern Garrison dossier plus cinematic scene” direction. Dossiers, evidence, memorials, and sealing organize the workbench; confrontations, scene entrances, and closure let the image become the visual center. New or replacement art should favor desktop-friendly landscape compositions.

The project must always retain media fallbacks: missing, failed, or replaced images cannot block text, choices, or mainline progress.

## Development Agreements

- Chapter 1 is the reference implementation for future chapters: structure them around investigation rhythm, evidence feedback, procedural limits, and meaningful resource costs.
- Qian Baokun is visible in the connections record immediately after Liao joins his office. Feng Tianshun is visible only after their Chapter 1 reunion.
- The overnight fire-scene preservation action costs `5` silver and does not reduce health.
- Do not restore the retired month, risk, or free-action systems.
- External images should be desktop-friendly landscape compositions, and missing media must never block progress.

## Documentation

- [Product brief](PRODUCT.md)
- [Development workflow](docs/development-workflow.md)
- [Desktop chapter-loop decision](docs/decisions/ADR-001-desktop-chapter-loop.md)
- [Retired free-action-loop decision](docs/decisions/ADR-002-retire-free-action-loop.md)
- [Full-game content baseline](docs/superpowers/specs/2026-09-04-full-game-content-baseline.md)
- [Cross-chapter state baseline](docs/superpowers/specs/2026-09-05-cross-chapter-state-baseline.md)

## Version

`v0.2.2` covers the prologue, Chapter 1, and the first two cases of Chapter 2. Each GitHub update increments the final version number; Chapter 3 starts at `v0.3.0`. See the [Chinese changelog](CHANGELOG.md) for version-by-version details.
